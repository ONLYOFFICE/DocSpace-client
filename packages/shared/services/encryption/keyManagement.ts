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
  RSAKeyPair,
  SerializedKeyPair,
  KeyExportFormat,
  KeyStatus,
} from "./types";

import { ENCRYPTION_CONSTANTS } from "./types";

export function getCrypto(): SubtleCrypto {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error(
    "Web Crypto API is not available. This feature requires a secure context (HTTPS).",
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

export async function generateRSAKeyPair(): Promise<RSAKeyPair> {
  const subtle = getCrypto();
  const keyPair = await subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: ENCRYPTION_CONSTANTS.RSA_KEY_SIZE,
      publicExponent: ENCRYPTION_CONSTANTS.RSA_PUBLIC_EXPONENT,
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
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
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt", "wrapKey"],
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
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt", "unwrapKey"],
  );
}

async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const subtle = getCrypto();
  const encoder = new TextEncoder();
  const passphraseKey = await subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: ENCRYPTION_CONSTANTS.KDF_ITERATIONS,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-CBC", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
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

  const salt = crypto.getRandomValues(
    new Uint8Array(ENCRYPTION_CONSTANTS.SALT_SIZE),
  );
  const iv = crypto.getRandomValues(
    new Uint8Array(ENCRYPTION_CONSTANTS.AES_CBC_IV_SIZE),
  );

  const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);

  const encryptedData = await subtle.encrypt(
    { name: "AES-CBC", iv: toArrayBuffer(iv) },
    derivedKey,
    pkcs8,
  );

  const result = new Uint8Array(
    salt.length + iv.length + encryptedData.byteLength,
  );
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encryptedData), salt.length + iv.length);

  return arrayBufferToBase64(result.buffer as ArrayBuffer);
}

export async function decryptPrivateKey(
  encryptedKeyBase64: string,
  passphrase: string,
): Promise<CryptoKey> {
  const data = new Uint8Array(base64ToArrayBuffer(encryptedKeyBase64));

  const salt = data.slice(0, ENCRYPTION_CONSTANTS.SALT_SIZE);
  const iv = data.slice(
    ENCRYPTION_CONSTANTS.SALT_SIZE,
    ENCRYPTION_CONSTANTS.SALT_SIZE + ENCRYPTION_CONSTANTS.AES_CBC_IV_SIZE,
  );
  const encryptedData = data.slice(
    ENCRYPTION_CONSTANTS.SALT_SIZE + ENCRYPTION_CONSTANTS.AES_CBC_IV_SIZE,
  );

  const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);

  try {
    const subtle = getCrypto();
    const pkcs8 = await subtle.decrypt(
      { name: "AES-CBC", iv: toArrayBuffer(iv) },
      derivedKey,
      toArrayBuffer(encryptedData),
    );

    return subtle.importKey(
      "pkcs8",
      pkcs8,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt", "unwrapKey"],
    );
  } catch {
    throw new Error("Invalid passphrase");
  }
}

export async function serializeKeyPair(
  keyPair: RSAKeyPair,
  passphrase: string,
): Promise<SerializedKeyPair> {
  const publicKey = await exportPublicKey(keyPair.publicKey);
  const privateKeyEnc = await encryptPrivateKey(keyPair.privateKey, passphrase);

  return {
    publicKey,
    privateKeyEnc,
  };
}

export async function getPublicKeyFingerprint(
  publicKeyBase64: string,
): Promise<string> {
  const subtle = getCrypto();
  const publicKeyBytes = base64ToArrayBuffer(publicKeyBase64);
  const hash = await subtle.digest("SHA-256", publicKeyBytes);
  const hashArray = new Uint8Array(hash);

  return Array.from(hashArray.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function getKeyStatus(
  serializedKey: SerializedKeyPair | null,
): Promise<KeyStatus> {
  if (!serializedKey || !serializedKey.publicKey) {
    return { hasKey: false };
  }

  const fingerprint = await getPublicKeyFingerprint(serializedKey.publicKey);

  return {
    hasKey: true,
    publicKeyFingerprint: fingerprint,
    algorithm: "RSA-2048",
  };
}

export function exportKeyToFile(serializedKey: SerializedKeyPair): Blob {
  const exportData: KeyExportFormat = {
    version: 1,
    type: "docspace-encryption-key",
    data: {
      publicKey: serializedKey.publicKey,
      privateKeyEnc: serializedKey.privateKeyEnc,
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  return new Blob([json], { type: "application/json" });
}

export async function importKeyFromFile(
  file: File,
): Promise<SerializedKeyPair> {
  const text = await file.text();

  try {
    const parsed = JSON.parse(text) as KeyExportFormat;

    if (parsed.type !== "docspace-encryption-key") {
      throw new Error("Invalid key file format");
    }

    if (parsed.version !== 1) {
      throw new Error("Unsupported key file version");
    }

    const { data } = parsed;
    if (!data.publicKey || !data.privateKeyEnc) {
      throw new Error("Key file is missing required fields");
    }

    return {
      publicKey: data.publicKey,
      privateKeyEnc: data.privateKeyEnc,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON in key file");
    }
    throw error;
  }
}

export async function encryptAESKeyWithRSA(
  aesKey: Uint8Array,
  publicKey: CryptoKey,
): Promise<string> {
  const subtle = getCrypto();
  const encrypted = await subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    toArrayBuffer(aesKey),
  );
  return arrayBufferToBase64(encrypted);
}

export async function decryptAESKeyWithRSA(
  encryptedKeyBase64: string,
  privateKey: CryptoKey,
): Promise<Uint8Array> {
  const subtle = getCrypto();
  const encryptedKey = base64ToArrayBuffer(encryptedKeyBase64);
  const decrypted = await subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKey,
  );
  return new Uint8Array(decrypted);
}

export function generateAESKey(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}
