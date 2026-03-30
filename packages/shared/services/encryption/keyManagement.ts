// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import type {
  ECDHKeyPair,
  SerializedKeyPair,
  KeyExportFormat,
  KeyStatus,
} from "./types";
import { ENCRYPTION_CONSTANTS } from "./types";
import { InvalidPassphraseError, InvalidFormatError } from "./errors";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  getCrypto,
  getRandomBytes,
  concatBuffers,
} from "./utils";

// ============================================================================
// ECDH P-256 Key Pair
// ============================================================================

export async function generateKeyPair(): Promise<ECDHKeyPair> {
  const subtle = getCrypto();
  const keyPair = await subtle.generateKey(
    { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
    true,
    ["deriveKey", "deriveBits"],
  );
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function exportPublicKey(
  publicKey: CryptoKey,
): Promise<string> {
  const subtle = getCrypto();
  const spki = await subtle.exportKey("spki", publicKey);
  return arrayBufferToBase64(spki);
}

export async function importPublicKey(
  publicKeyBase64: string,
): Promise<CryptoKey> {
  const subtle = getCrypto();
  const spki = base64ToArrayBuffer(publicKeyBase64);
  return subtle.importKey(
    "spki",
    spki,
    { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
    true,
    [],
  );
}

export async function exportPrivateKeyRaw(
  privateKey: CryptoKey,
): Promise<string> {
  const subtle = getCrypto();
  const pkcs8 = await subtle.exportKey("pkcs8", privateKey);
  return arrayBufferToBase64(pkcs8);
}

export async function importPrivateKeyRaw(
  privateKeyBase64: string,
): Promise<CryptoKey> {
  const subtle = getCrypto();
  const pkcs8 = base64ToArrayBuffer(privateKeyBase64);
  return subtle.importKey(
    "pkcs8",
    pkcs8,
    { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
    true,
    ["deriveKey", "deriveBits"],
  );
}

// ============================================================================
// Passphrase → Private Key Protection (PBKDF2 600k + AES-256-GCM)
// ============================================================================

async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const subtle = getCrypto();
  const passphraseKey = await subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ENCRYPTION_CONSTANTS.KDF_ITERATIONS,
      hash: ENCRYPTION_CONSTANTS.KDF_HASH,
    },
    passphraseKey,
    { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPrivateKey(
  privateKey: CryptoKey,
  passphrase: string,
): Promise<string> {
  const subtle = getCrypto();
  const pkcs8 = await subtle.exportKey("pkcs8", privateKey);

  const salt = getRandomBytes(ENCRYPTION_CONSTANTS.SALT_SIZE);
  const iv = getRandomBytes(ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE);
  const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);

  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource, tagLength: ENCRYPTION_CONSTANTS.AES_GCM_TAG_BITS },
    derivedKey,
    pkcs8,
  );

  // Format: [salt 16B][iv 12B][ciphertext + GCM tag]
  return arrayBufferToBase64(
    concatBuffers(salt, iv, ciphertext).buffer as ArrayBuffer,
  );
}

export async function decryptPrivateKey(
  encryptedKeyBase64: string,
  passphrase: string,
): Promise<CryptoKey> {
  const data = new Uint8Array(base64ToArrayBuffer(encryptedKeyBase64));
  const saltEnd = ENCRYPTION_CONSTANTS.SALT_SIZE;
  const ivEnd = saltEnd + ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE;
  const minSize = ivEnd + 16; // salt + IV + at least GCM tag

  if (data.byteLength < minSize) {
    throw new InvalidFormatError("encrypted key data too short");
  }

  const salt = data.slice(0, saltEnd);
  const iv = data.slice(saltEnd, ivEnd);
  const ciphertext = data.slice(ivEnd);

  const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);

  try {
    const subtle = getCrypto();
    const pkcs8 = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        tagLength: ENCRYPTION_CONSTANTS.AES_GCM_TAG_BITS,
      },
      derivedKey,
      ciphertext as BufferSource,
    );

    return subtle.importKey(
      "pkcs8",
      pkcs8,
      { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
      false, // non-extractable for runtime use (ECDH derivation only)
      ["deriveKey", "deriveBits"],
    );
  } catch {
    throw new InvalidPassphraseError();
  }
}

async function decryptPrivateKeyExtractable(
  encryptedKeyBase64: string,
  passphrase: string,
): Promise<CryptoKey> {
  const data = new Uint8Array(base64ToArrayBuffer(encryptedKeyBase64));
  const saltEnd = ENCRYPTION_CONSTANTS.SALT_SIZE;
  const ivEnd = saltEnd + ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE;

  const salt = data.slice(0, saltEnd);
  const iv = data.slice(saltEnd, ivEnd);
  const ciphertext = data.slice(ivEnd);

  const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);

  try {
    const subtle = getCrypto();
    const pkcs8 = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        tagLength: ENCRYPTION_CONSTANTS.AES_GCM_TAG_BITS,
      },
      derivedKey,
      ciphertext as BufferSource,
    );

    return subtle.importKey(
      "pkcs8",
      pkcs8,
      { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
      true, // extractable — needed for re-encryption
      ["deriveKey", "deriveBits"],
    );
  } catch {
    throw new InvalidPassphraseError();
  }
}

export async function reEncryptPrivateKey(
  encryptedKeyBase64: string,
  oldPassphrase: string,
  newPassphrase: string,
): Promise<string> {
  const privateKey = await decryptPrivateKeyExtractable(
    encryptedKeyBase64,
    oldPassphrase,
  );
  return encryptPrivateKey(privateKey, newPassphrase);
}

// ============================================================================
// Key Serialization
// ============================================================================

export async function serializeKeyPair(
  keyPair: ECDHKeyPair,
  passphrase: string,
): Promise<SerializedKeyPair> {
  const publicKey = await exportPublicKey(keyPair.publicKey);
  const privateKeyEnc = await encryptPrivateKey(
    keyPair.privateKey,
    passphrase,
  );
  return { publicKey, privateKeyEnc };
}

export function exportKeyToFile(
  serializedKey: SerializedKeyPair,
): Blob {
  const exportData: KeyExportFormat = {
    version: 2,
    type: "docspace-encryption-key",
    algorithm: "ECDH-P256",
    data: {
      publicKey: serializedKey.publicKey,
      privateKeyEnc: serializedKey.privateKeyEnc,
    },
  };
  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
}

export async function importKeyFromFile(
  file: File,
): Promise<SerializedKeyPair> {
  const text = await file.text();
  const parsed = JSON.parse(text) as KeyExportFormat;

  if (parsed.type !== "docspace-encryption-key") {
    throw new Error("Invalid key file format");
  }
  if (parsed.version !== 2) {
    throw new Error(`Unsupported key file version: ${parsed.version}`);
  }
  if (!parsed.data.publicKey || !parsed.data.privateKeyEnc) {
    throw new Error("Key file is missing required fields");
  }

  return {
    publicKey: parsed.data.publicKey,
    privateKeyEnc: parsed.data.privateKeyEnc,
  };
}

// ============================================================================
// DEK Generation
// ============================================================================

export function generateDEK(): Uint8Array {
  return getRandomBytes(ENCRYPTION_CONSTANTS.AES_KEY_SIZE / 8);
}

// ============================================================================
// DEK Wrapping (ECDH ephemeral + HKDF + AES-KW)
//
// wrapDEK: generates an ephemeral ECDH keypair, derives a shared secret
// with the recipient's public key via HKDF, and wraps the DEK with AES-KW.
// Output: [ephemeral public key 65 bytes][wrapped DEK 40 bytes] → base64
//
// unwrapDEK: extracts the ephemeral public key, derives the same shared
// secret using the recipient's private key, and unwraps the DEK.
// ============================================================================

export async function wrapDEK(
  dek: Uint8Array,
  recipientPublicKey: CryptoKey,
): Promise<string> {
  const subtle = getCrypto();

  // Generate ephemeral ECDH key pair for this wrapping operation
  const ephemeral = await subtle.generateKey(
    { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
    true,
    ["deriveBits"],
  );

  // Step 1: ECDH → raw shared secret bits
  const sharedBits = await subtle.deriveBits(
    { name: "ECDH", public: recipientPublicKey },
    ephemeral.privateKey,
    256,
  );

  // Step 2: HKDF with domain-separation info → AES-KW wrapping key
  const hkdfKey = await subtle.importKey(
    "raw",
    sharedBits,
    "HKDF",
    false,
    ["deriveKey"],
  );
  const wrappingKey = await subtle.deriveKey(
    {
      name: "HKDF",
      hash: ENCRYPTION_CONSTANTS.HKDF_HASH,
      salt: new Uint8Array(0),
      info: ENCRYPTION_CONSTANTS.HKDF_INFO,
    },
    hkdfKey,
    { name: "AES-KW", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
    false,
    ["wrapKey"],
  );

  // Import raw DEK as a CryptoKey so we can use wrapKey
  const dekKey = await subtle.importKey(
    "raw",
    dek as BufferSource,
    { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
    true,
    ["encrypt"],
  );

  // Wrap DEK with AES-KW
  const wrappedDEK = await subtle.wrapKey("raw", dekKey, wrappingKey, "AES-KW");

  // Export ephemeral public key (uncompressed point, 65 bytes for P-256)
  const ephemeralPub = await subtle.exportKey("raw", ephemeral.publicKey);

  // Output: [ephemeral pub 65B][wrapped DEK 40B]
  return arrayBufferToBase64(
    concatBuffers(ephemeralPub, wrappedDEK).buffer as ArrayBuffer,
  );
}

export async function unwrapDEK(
  wrappedBase64: string,
  recipientPrivateKey: CryptoKey,
): Promise<Uint8Array> {
  const subtle = getCrypto();
  const data = new Uint8Array(base64ToArrayBuffer(wrappedBase64));

  const ephPubSize = ENCRYPTION_CONSTANTS.ECDH_PUBLIC_KEY_SIZE;
  const expectedMinSize = ephPubSize + 32 + ENCRYPTION_CONSTANTS.AES_KW_OVERHEAD;
  if (data.byteLength < expectedMinSize) {
    throw new InvalidFormatError("wrapped DEK data too short");
  }

  const ephemeralPubBytes = data.slice(0, ephPubSize);
  const wrappedDEKBytes = data.slice(ephPubSize);

  // Import the ephemeral public key
  const ephemeralPubKey = await subtle.importKey(
    "raw",
    ephemeralPubBytes,
    { name: "ECDH", namedCurve: ENCRYPTION_CONSTANTS.ECDH_CURVE },
    false,
    [],
  );

  // Step 1: ECDH → raw shared secret bits
  const sharedBits = await subtle.deriveBits(
    { name: "ECDH", public: ephemeralPubKey },
    recipientPrivateKey,
    256,
  );

  // Step 2: HKDF with domain-separation info → AES-KW wrapping key
  const hkdfKey = await subtle.importKey(
    "raw",
    sharedBits,
    "HKDF",
    false,
    ["deriveKey"],
  );
  const wrappingKey = await subtle.deriveKey(
    {
      name: "HKDF",
      hash: ENCRYPTION_CONSTANTS.HKDF_HASH,
      salt: new Uint8Array(0),
      info: ENCRYPTION_CONSTANTS.HKDF_INFO,
    },
    hkdfKey,
    { name: "AES-KW", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
    false,
    ["unwrapKey"],
  );

  // Unwrap DEK
  const dekKey = await subtle.unwrapKey(
    "raw",
    wrappedDEKBytes,
    wrappingKey,
    "AES-KW",
    { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
    true,
    ["encrypt", "decrypt"],
  );

  // Export raw DEK bytes
  const rawDEK = await subtle.exportKey("raw", dekKey);
  return new Uint8Array(rawDEK);
}

// ============================================================================
// Fingerprint
// ============================================================================

export async function getPublicKeyFingerprint(
  publicKeyBase64: string,
): Promise<string> {
  const subtle = getCrypto();
  const keyBytes = base64ToArrayBuffer(publicKeyBase64);
  const hash = await subtle.digest("SHA-256", keyBytes);
  return Array.from(
    new Uint8Array(hash).slice(0, ENCRYPTION_CONSTANTS.FINGERPRINT_BYTES),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function getKeyStatus(
  serializedKey: SerializedKeyPair | null,
): Promise<KeyStatus> {
  if (!serializedKey?.publicKey) {
    return { hasKey: false };
  }
  const fingerprint = await getPublicKeyFingerprint(
    serializedKey.publicKey,
  );
  return {
    hasKey: true,
    publicKeyFingerprint: fingerprint,
    algorithm: "ECDH-P256",
  };
}
