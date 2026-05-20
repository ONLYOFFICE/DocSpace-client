/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { argon2id as argon2idWasm } from "hash-wasm";
import { X25519 as HpkeX25519 } from "@hpke/dhkem-x25519";

import {
  ARGON2ID_DEFAULT_M_KIB,
  ARGON2ID_DEFAULT_P,
  ARGON2ID_DEFAULT_T,
  ARGON2ID_DK_LEN,
  AAD_IDENTITY_PASSPHRASE_PREFIX,
  AAD_IDENTITY_RECOVERY_PREFIX,
  AES_GCM_IV_SIZE,
  AES_GCM_TAG_SIZE,
  AES_KEY_SIZE_BYTES,
  KDF_ID_ARGON2ID,
  MAGIC_IDENTITY,
  SALT_SIZE,
  SUITE_X25519_HKDF_AES256GCM,
  VERSION_IDENTITY,
  X25519_PRIVATE_KEY_SIZE,
  X25519_PUBLIC_KEY_SIZE,
  type Argon2idParams,
  type IdentityKeyPair,
  type SerializedIdentity,
} from "./types";
import {
  InvalidFormatError,
  InvalidPassphraseError,
  InvalidRecoveryPhraseError,
  UnsupportedSuiteError,
  UnsupportedVersionError,
} from "./errors";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  base64UrlEncode,
  concatBuffers,
  getCrypto,
  getRandomBytes,
  readUint32BE,
  uint32BE,
  utf8,
  zeroBuffer,
} from "./utils";

const FLAG_HAS_RECOVERY = 0x01;

// kdfId(1) + t(1) + p(1) + m_KiB(4) + salt + iv + (private key + GCM tag)
const PASSPHRASE_SLOT_SIZE =
  3 + 4 + SALT_SIZE + AES_GCM_IV_SIZE + X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE;

// salt + iv + (private key + GCM tag)
const RECOVERY_SLOT_SIZE =
  SALT_SIZE + AES_GCM_IV_SIZE + X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE;

// magic(4) + version(1) + suite(1) + flags(1) + pubkey
const HEADER_SIZE = 4 + 1 + 1 + 1 + X25519_PUBLIC_KEY_SIZE;

let x25519Singleton: HpkeX25519 | null = null;

async function getX25519(): Promise<HpkeX25519> {
  if (!x25519Singleton) {
    const { HkdfSha256 } = await import("@hpke/core");
    x25519Singleton = new HpkeX25519(new HkdfSha256());
  }
  return x25519Singleton;
}

export async function generateIdentityKeyPair(): Promise<IdentityKeyPair> {
  const x = await getX25519();
  const cryptoKp = await x.generateKeyPair();

  const rawPub = new Uint8Array(await x.serializePublicKey(cryptoKp.publicKey));
  const rawPriv = new Uint8Array(
    await x.serializePrivateKey(cryptoKp.privateKey),
  );

  if (rawPub.byteLength !== X25519_PUBLIC_KEY_SIZE) {
    throw new InvalidFormatError(
      `unexpected X25519 public key size: ${rawPub.byteLength}`,
    );
  }
  if (rawPriv.byteLength !== X25519_PRIVATE_KEY_SIZE) {
    throw new InvalidFormatError(
      `unexpected X25519 private key size: ${rawPriv.byteLength}`,
    );
  }
  return { publicKey: rawPub, privateKey: rawPriv };
}

async function deriveKek(
  password: Uint8Array,
  salt: Uint8Array,
  params: Argon2idParams,
): Promise<Uint8Array> {
  return argon2idWasm({
    password,
    salt,
    iterations: params.t,
    parallelism: params.p,
    memorySize: params.m_KiB,
    hashLength: ARGON2ID_DK_LEN,
    outputType: "binary",
  });
}

async function aesGcmEncrypt(
  key: Uint8Array,
  iv: Uint8Array,
  plaintext: Uint8Array,
  aad: Uint8Array,
): Promise<Uint8Array> {
  const subtle = getCrypto();
  const aesKey = await subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ct = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: aad as BufferSource,
      tagLength: AES_GCM_TAG_SIZE * 8,
    },
    aesKey,
    plaintext as BufferSource,
  );
  return new Uint8Array(ct);
}

async function aesGcmDecrypt(
  key: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array,
  aad: Uint8Array,
): Promise<Uint8Array> {
  const subtle = getCrypto();
  const aesKey = await subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const pt = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: aad as BufferSource,
      tagLength: AES_GCM_TAG_SIZE * 8,
    },
    aesKey,
    ciphertext as BufferSource,
  );
  return new Uint8Array(pt);
}

function buildAad(
  prefix: typeof AAD_IDENTITY_PASSPHRASE_PREFIX | typeof AAD_IDENTITY_RECOVERY_PREFIX,
  publicKey: Uint8Array,
): Uint8Array {
  return utf8(prefix + base64UrlEncode(publicKey));
}

function encodePassphraseSlot(
  params: Argon2idParams,
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Uint8Array {
  if (salt.byteLength !== SALT_SIZE) {
    throw new InvalidFormatError("identity slot: salt must be 16 bytes");
  }
  if (iv.byteLength !== AES_GCM_IV_SIZE) {
    throw new InvalidFormatError("identity slot: iv must be 12 bytes");
  }
  if (ciphertext.byteLength !== X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE) {
    throw new InvalidFormatError("identity slot: ct must be 48 bytes");
  }
  if (params.t > 0xff || params.p > 0xff) {
    throw new InvalidFormatError("Argon2 t/p must fit in u8");
  }
  return concatBuffers(
    new Uint8Array([KDF_ID_ARGON2ID, params.t, params.p]),
    uint32BE(params.m_KiB),
    salt,
    iv,
    ciphertext,
  );
}

function decodePassphraseSlot(
  buf: Uint8Array,
  offset: number,
): {
  params: Argon2idParams;
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
  end: number;
} {
  if (buf.byteLength < offset + PASSPHRASE_SLOT_SIZE) {
    throw new InvalidFormatError("identity envelope: passphrase slot truncated");
  }
  const kdfId = buf[offset];
  if (kdfId !== KDF_ID_ARGON2ID) {
    throw new InvalidFormatError(
      `unsupported KDF id: 0x${kdfId.toString(16)}`,
    );
  }
  const t = buf[offset + 1];
  const p = buf[offset + 2];
  const m_KiB = readUint32BE(buf, offset + 3);
  if (t === 0 || p === 0 || m_KiB === 0) {
    throw new InvalidFormatError("Argon2 params must be non-zero");
  }
  let cur = offset + 7;
  const salt = buf.slice(cur, cur + SALT_SIZE);
  cur += SALT_SIZE;
  const iv = buf.slice(cur, cur + AES_GCM_IV_SIZE);
  cur += AES_GCM_IV_SIZE;
  const ciphertext = buf.slice(
    cur,
    cur + X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE,
  );
  cur += X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE;
  return { params: { t, p, m_KiB }, salt, iv, ciphertext, end: cur };
}

function encodeRecoverySlot(
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Uint8Array {
  if (salt.byteLength !== SALT_SIZE) {
    throw new InvalidFormatError("recovery slot: salt must be 16 bytes");
  }
  if (iv.byteLength !== AES_GCM_IV_SIZE) {
    throw new InvalidFormatError("recovery slot: iv must be 12 bytes");
  }
  if (ciphertext.byteLength !== X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE) {
    throw new InvalidFormatError("recovery slot: ct must be 48 bytes");
  }
  return concatBuffers(salt, iv, ciphertext);
}

function decodeRecoverySlot(
  buf: Uint8Array,
  offset: number,
): {
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
  end: number;
} {
  if (buf.byteLength < offset + RECOVERY_SLOT_SIZE) {
    throw new InvalidFormatError("identity envelope: recovery slot truncated");
  }
  let cur = offset;
  const salt = buf.slice(cur, cur + SALT_SIZE);
  cur += SALT_SIZE;
  const iv = buf.slice(cur, cur + AES_GCM_IV_SIZE);
  cur += AES_GCM_IV_SIZE;
  const ciphertext = buf.slice(
    cur,
    cur + X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE,
  );
  cur += X25519_PRIVATE_KEY_SIZE + AES_GCM_TAG_SIZE;
  return { salt, iv, ciphertext, end: cur };
}

export type SerializeOptions = {
  argon2Params?: Argon2idParams;
  /** Optional NFKD-normalized recovery mnemonic (BIP-39 24 words). */
  recoveryMnemonic?: string;
};

export const DEFAULT_ARGON2_PARAMS: Argon2idParams = {
  m_KiB: ARGON2ID_DEFAULT_M_KIB,
  t: ARGON2ID_DEFAULT_T,
  p: ARGON2ID_DEFAULT_P,
};

export async function serializeIdentity(
  keyPair: IdentityKeyPair,
  passphrase: string,
  options: SerializeOptions = {},
): Promise<SerializedIdentity> {
  const params = options.argon2Params ?? DEFAULT_ARGON2_PARAMS;
  const { publicKey, privateKey } = keyPair;

  if (publicKey.byteLength !== X25519_PUBLIC_KEY_SIZE) {
    throw new InvalidFormatError("publicKey must be 32 bytes");
  }
  if (privateKey.byteLength !== X25519_PRIVATE_KEY_SIZE) {
    throw new InvalidFormatError("privateKey must be 32 bytes");
  }

  const saltPp = getRandomBytes(SALT_SIZE);
  const ivPp = getRandomBytes(AES_GCM_IV_SIZE);
  const kekPp = await deriveKek(
    utf8(passphrase.normalize("NFKC")),
    saltPp,
    params,
  );
  const aadPp = buildAad(AAD_IDENTITY_PASSPHRASE_PREFIX, publicKey);
  const ctPp = await aesGcmEncrypt(kekPp, ivPp, privateKey, aadPp);
  zeroBuffer(kekPp);

  let flags = 0;
  let recoveryEncoded: Uint8Array = new Uint8Array(0);
  if (options.recoveryMnemonic) {
    flags |= FLAG_HAS_RECOVERY;
    const saltRec = getRandomBytes(SALT_SIZE);
    const ivRec = getRandomBytes(AES_GCM_IV_SIZE);
    const kekRec = await deriveKek(
      utf8(options.recoveryMnemonic.normalize("NFKD")),
      saltRec,
      params,
    );
    const aadRec = buildAad(AAD_IDENTITY_RECOVERY_PREFIX, publicKey);
    const ctRec = await aesGcmEncrypt(kekRec, ivRec, privateKey, aadRec);
    zeroBuffer(kekRec);
    recoveryEncoded = encodeRecoverySlot(saltRec, ivRec, ctRec);
  }

  const envelope = concatBuffers(
    MAGIC_IDENTITY,
    new Uint8Array([VERSION_IDENTITY, SUITE_X25519_HKDF_AES256GCM, flags]),
    publicKey,
    encodePassphraseSlot(params, saltPp, ivPp, ctPp),
    recoveryEncoded,
  );

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKeyEnc: arrayBufferToBase64(envelope),
  };
}

type ParsedEnvelope = {
  publicKey: Uint8Array;
  flags: number;
  passphraseSlot: ReturnType<typeof decodePassphraseSlot>;
  recoverySlot: ReturnType<typeof decodeRecoverySlot> | null;
};

function parseEnvelope(envelopeBase64: string): ParsedEnvelope {
  const buf = base64ToUint8Array(envelopeBase64);
  if (buf.byteLength < HEADER_SIZE + PASSPHRASE_SLOT_SIZE) {
    throw new InvalidFormatError("identity envelope too short");
  }
  for (let i = 0; i < MAGIC_IDENTITY.length; i++) {
    if (buf[i] !== MAGIC_IDENTITY[i]) {
      throw new InvalidFormatError("identity envelope: invalid magic");
    }
  }
  const version = buf[4];
  if (version !== VERSION_IDENTITY) {
    throw new UnsupportedVersionError(version, VERSION_IDENTITY);
  }
  const suite = buf[5];
  if (suite !== SUITE_X25519_HKDF_AES256GCM) {
    throw new UnsupportedSuiteError(suite);
  }
  const flags = buf[6];
  const publicKey = buf.slice(7, 7 + X25519_PUBLIC_KEY_SIZE);
  const passphraseSlot = decodePassphraseSlot(buf, HEADER_SIZE);

  let recoverySlot: ReturnType<typeof decodeRecoverySlot> | null = null;
  if (flags & FLAG_HAS_RECOVERY) {
    recoverySlot = decodeRecoverySlot(buf, passphraseSlot.end);
  }
  return { publicKey, flags, passphraseSlot, recoverySlot };
}

export async function unlockWithPassphrase(
  serialized: SerializedIdentity,
  passphrase: string,
): Promise<IdentityKeyPair> {
  const env = parseEnvelope(serialized.privateKeyEnc);

  // Sanity: the publicKey field at the API level must match the one inside
  // the envelope. Catch server-side substitution attacks early.
  const publicKeyFromField = base64ToUint8Array(serialized.publicKey);
  if (!constantTimeEqual(publicKeyFromField, env.publicKey)) {
    throw new InvalidFormatError(
      "identity envelope: publicKey field does not match envelope",
    );
  }

  const kek = await deriveKek(
    utf8(passphrase.normalize("NFKC")),
    env.passphraseSlot.salt,
    env.passphraseSlot.params,
  );
  const aad = buildAad(AAD_IDENTITY_PASSPHRASE_PREFIX, env.publicKey);
  let privateKey: Uint8Array;
  try {
    privateKey = await aesGcmDecrypt(
      kek,
      env.passphraseSlot.iv,
      env.passphraseSlot.ciphertext,
      aad,
    );
  } catch {
    throw new InvalidPassphraseError();
  } finally {
    zeroBuffer(kek);
  }

  if (privateKey.byteLength !== X25519_PRIVATE_KEY_SIZE) {
    throw new InvalidFormatError(
      `decrypted private key has wrong size: ${privateKey.byteLength}`,
    );
  }
  return { publicKey: env.publicKey, privateKey };
}

export async function unlockWithRecoveryPhrase(
  serialized: SerializedIdentity,
  mnemonic: string,
): Promise<IdentityKeyPair> {
  const env = parseEnvelope(serialized.privateKeyEnc);
  if (!env.recoverySlot) {
    throw new InvalidRecoveryPhraseError();
  }

  const publicKeyFromField = base64ToUint8Array(serialized.publicKey);
  if (!constantTimeEqual(publicKeyFromField, env.publicKey)) {
    throw new InvalidFormatError(
      "identity envelope: publicKey field does not match envelope",
    );
  }

  const kek = await deriveKek(
    utf8(mnemonic.normalize("NFKD")),
    env.recoverySlot.salt,
    env.passphraseSlot.params,
  );
  const aad = buildAad(AAD_IDENTITY_RECOVERY_PREFIX, env.publicKey);
  let privateKey: Uint8Array;
  try {
    privateKey = await aesGcmDecrypt(
      kek,
      env.recoverySlot.iv,
      env.recoverySlot.ciphertext,
      aad,
    );
  } catch {
    throw new InvalidRecoveryPhraseError();
  } finally {
    zeroBuffer(kek);
  }

  if (privateKey.byteLength !== X25519_PRIVATE_KEY_SIZE) {
    throw new InvalidFormatError(
      `decrypted private key has wrong size: ${privateKey.byteLength}`,
    );
  }
  return { publicKey: env.publicKey, privateKey };
}

/**
 * Re-encrypt an existing identity envelope with a new passphrase, preserving
 * the public key and (if present) recovery slot. Used for "Change passphrase"
 * UX without rotating the key pair.
 */
export async function changePassphrase(
  serialized: SerializedIdentity,
  oldPassphrase: string,
  newPassphrase: string,
): Promise<SerializedIdentity> {
  const kp = await unlockWithPassphrase(serialized, oldPassphrase);
  const env = parseEnvelope(serialized.privateKeyEnc);

  // If the original envelope had a recovery slot, we cannot regenerate it
  // here without the original mnemonic. Preserve the existing recovery slot
  // bytes verbatim (they encrypt the same private key under the same
  // mnemonic, which the user still knows).
  let result: SerializedIdentity;
  if (env.recoverySlot) {
    const params = env.passphraseSlot.params;
    const saltPp = getRandomBytes(SALT_SIZE);
    const ivPp = getRandomBytes(AES_GCM_IV_SIZE);
    const kekPp = await deriveKek(
      utf8(newPassphrase.normalize("NFKC")),
      saltPp,
      params,
    );
    const aadPp = buildAad(AAD_IDENTITY_PASSPHRASE_PREFIX, kp.publicKey);
    const ctPp = await aesGcmEncrypt(kekPp, ivPp, kp.privateKey, aadPp);
    zeroBuffer(kekPp);

    const envelope = concatBuffers(
      MAGIC_IDENTITY,
      new Uint8Array([
        VERSION_IDENTITY,
        SUITE_X25519_HKDF_AES256GCM,
        FLAG_HAS_RECOVERY,
      ]),
      kp.publicKey,
      encodePassphraseSlot(params, saltPp, ivPp, ctPp),
      encodeRecoverySlot(
        env.recoverySlot.salt,
        env.recoverySlot.iv,
        env.recoverySlot.ciphertext,
      ),
    );
    result = {
      publicKey: arrayBufferToBase64(kp.publicKey),
      privateKeyEnc: arrayBufferToBase64(envelope),
    };
  } else {
    result = await serializeIdentity(kp, newPassphrase);
  }

  zeroBuffer(kp.privateKey);
  return result;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function getPublicKeyFingerprint(
  publicKeyBase64: string,
): Promise<string> {
  const subtle = getCrypto();
  const keyBytes = base64ToUint8Array(publicKeyBase64);
  const hash = await subtle.digest("SHA-256", keyBytes as BufferSource);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export type IdentityExportFile = {
  version: number;
  type: "docspace-identity-v2";
  data: SerializedIdentity;
};

export function exportIdentityToBlob(
  serialized: SerializedIdentity,
): Blob {
  const payload: IdentityExportFile = {
    version: 2,
    type: "docspace-identity-v2",
    data: serialized,
  };
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
}

export async function importIdentityFromFile(
  file: File,
): Promise<SerializedIdentity> {
  // Use FileReader for compatibility with environments where Blob.text() is
  // not implemented (e.g. jsdom 27).
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

  let parsed: IdentityExportFile;
  try {
    parsed = JSON.parse(text) as IdentityExportFile;
  } catch {
    throw new InvalidFormatError("identity import: file is not valid JSON");
  }
  if (parsed.type !== "docspace-identity-v2" || parsed.version !== 2) {
    throw new InvalidFormatError(
      "identity import: not a v2 DocSpace identity file",
    );
  }
  if (!parsed.data?.publicKey || !parsed.data?.privateKeyEnc) {
    throw new InvalidFormatError("identity import: missing required fields");
  }
  parseEnvelope(parsed.data.privateKeyEnc);
  return parsed.data;
}
