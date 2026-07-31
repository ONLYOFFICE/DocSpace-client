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

// IIFE bundle entry for the standalone `onlyoffice-crypto.js` script consumed
// by the document editor. Builds to `window.OnlyofficeCrypto`.
//
// This file has two layers:
//
//   1. NATIVE v2 API — the current X25519 / Argon2id / HPKE core, exported
//      under its real names. This is the target the editor should migrate to.
//
//   2. LEGACY COMPAT API — the pre-v2 function names (`generateKeyPair`,
//      `encryptPrivateKey`, ...) re-implemented as thin `@deprecated` adapters
//      over the v2 core, so the existing editor prototype keeps working during
//      migration. NO old crypto lives here: every alias delegates to the v2
//      core, so bytes produced are always v2. There is no wire-compatibility
//      with the pre-v2 (ECDH P-256 / PBKDF2 / AES-KW) format.
//
// The one call whose SHAPE could not be preserved is `wrapDEK`/`unwrapDEK`:
// the v2 core is HPKE-Auth and structurally requires sender identity + fileId,
// which the old 2-argument form never provided. The old names now carry the
// new object signature — this is the single mandatory editor change (see the
// integration guide's migration section).

import {
  generateIdentityKeyPair,
  serializeIdentity,
  unlockWithPassphrase,
  unlockWithRecoveryPhrase,
  changePassphrase,
  getPublicKeyFingerprint,
  exportIdentityToBlob,
  importIdentityFromFile,
  readEnvelopePublicKey,
  DEFAULT_ARGON2_PARAMS,
} from "./identity";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  getRandomBytes,
} from "./utils";
import {
  encryptFileNameRaw,
  decryptFileNameRaw,
} from "./streaming-encryption";
import { InvalidFormatError } from "./errors";
import {
  DSE3_FILE_NONCE_SIZE,
  AES_GCM_IV_SIZE,
  DSE3_FIXED_HEADER_SIZE,
  DSE3_CHUNK_PLAINTEXT_SIZE,
  CHUNKED_ENCRYPTION_THRESHOLD,
  X25519_PUBLIC_KEY_SIZE,
  SUITE_X25519_HKDF_AES256GCM,
  VERSION_DSE3_FILE,
  VERSION_IDENTITY,
  VERSION_HPKE_WRAP,
} from "./types";
import type { IdentityKeyPair, SerializedIdentity } from "./types";

// ---------------------------------------------------------------------------
// Native v2 API (migration target)
// ---------------------------------------------------------------------------

export type {
  Argon2idParams,
  IdentityKeyPair,
  SerializedIdentity,
  ServerAccessKeyDto,
  DSE3Header,
  EncryptFileResult,
  DecryptFileResult,
  ProgressCallback,
  KeyStatus,
  SuiteId,
} from "./types";

export {
  SUITE_X25519_HKDF_AES256GCM,
  ARGON2ID_DEFAULT_M_KIB,
  ARGON2ID_DEFAULT_T,
  ARGON2ID_DEFAULT_P,
  DSE3_CHUNK_PLAINTEXT_SIZE,
  DSE3_FIXED_HEADER_SIZE,
  DSE3_FILE_NONCE_SIZE,
  DSE3_FLAG_HAS_ENCRYPTED_NAME,
  CHUNKED_ENCRYPTION_THRESHOLD,
  X25519_PUBLIC_KEY_SIZE,
  X25519_PRIVATE_KEY_SIZE,
  AES_KEY_SIZE_BYTES,
  VERSION_IDENTITY,
  VERSION_HPKE_WRAP,
  VERSION_DSE3_FILE,
} from "./types";

export * from "./errors";

export {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  base64ToUint8Array,
  uuidToBytes,
  bytesToUuid,
} from "./utils";

export {
  generateIdentityKeyPair,
  serializeIdentity,
  unlockWithPassphrase,
  unlockWithRecoveryPhrase,
  changePassphrase,
  getPublicKeyFingerprint,
  exportIdentityToBlob,
  importIdentityFromFile,
  readEnvelopePublicKey,
  DEFAULT_ARGON2_PARAMS,
} from "./identity";

// HPKE-Auth wrap/unwrap. The editor MUST migrate its old 2-arg calls to these
// object-signature forms (see integration guide).
export { wrapDEK, unwrapDEK, inspectWrap } from "./hpke";

export { generateDEK, encryptFile, decryptFile, wipeDek } from "./file-keys";

export {
  isDSE3Format,
  parseDSE3Header,
  estimateEncryptedSize,
  shouldUseChunkedEncryption,
} from "./streaming-encryption";

export {
  generateRecoveryMnemonic,
  validateMnemonic,
  splitMnemonicForDisplay,
  normalizeMnemonic,
} from "./recovery";

// ---------------------------------------------------------------------------
// Legacy compat API (deprecated aliases over the v2 core)
// ---------------------------------------------------------------------------

/**
 * Opaque key-pair handle returned by the legacy `generateKeyPair()`.
 * `publicKey` is the raw 32-byte X25519 public key; `privateKey` is the full
 * v2 identity key pair (it must carry the public key, since the v2 core needs
 * both to serialize — the old single-key `encryptPrivateKey` did not).
 */
export type LegacyKeyPair = {
  publicKey: Uint8Array;
  privateKey: IdentityKeyPair;
};

/** Legacy recovery backup blob shape (`backupPrivateKey`/`restorePrivateKey`). */
export type LegacyRecoveryBackup = {
  version: 1;
  type: "docspace-recovery-backup";
  data: string;
  /** v2 addition: public key needed to reconstruct the identity on restore. */
  publicKey: string;
};

function asIdentityKeyPair(x: unknown): IdentityKeyPair {
  const k = x as Partial<IdentityKeyPair> | undefined;
  if (
    k &&
    k.publicKey instanceof Uint8Array &&
    k.privateKey instanceof Uint8Array
  ) {
    return { publicKey: k.publicKey, privateKey: k.privateKey };
  }
  throw new InvalidFormatError(
    "expected a key-pair handle from generateKeyPair()/decryptPrivateKey()",
  );
}

/** @deprecated Use {@link generateIdentityKeyPair}. */
export async function generateKeyPair(): Promise<LegacyKeyPair> {
  const kp = await generateIdentityKeyPair();
  return { publicKey: kp.publicKey, privateKey: kp };
}

/** @deprecated Public keys are raw base64 in v2 — base64-encode directly. */
export async function exportPublicKey(
  publicKey: Uint8Array | IdentityKeyPair,
): Promise<string> {
  const raw =
    publicKey instanceof Uint8Array
      ? publicKey
      : asIdentityKeyPair(publicKey).publicKey;
  return arrayBufferToBase64(raw);
}

/** @deprecated Public keys are raw base64 in v2 — base64-decode directly. */
export async function importPublicKey(
  publicKeyBase64: string,
): Promise<Uint8Array> {
  return base64ToUint8Array(publicKeyBase64);
}

/** @deprecated Use {@link serializeIdentity} (returns `{ publicKey, privateKeyEnc }`). */
export async function encryptPrivateKey(
  privateKey: IdentityKeyPair,
  passphrase: string,
): Promise<string> {
  const env = await serializeIdentity(asIdentityKeyPair(privateKey), passphrase);
  return env.privateKeyEnc;
}

/** @deprecated Use {@link unlockWithPassphrase} (returns the full key pair). */
export async function decryptPrivateKey(
  privateKeyEnc: string,
  passphrase: string,
): Promise<IdentityKeyPair> {
  const publicKey = readEnvelopePublicKey(privateKeyEnc);
  return unlockWithPassphrase({ publicKey, privateKeyEnc }, passphrase);
}

/** @deprecated Use {@link changePassphrase}. */
export async function reEncryptPrivateKey(
  privateKeyEnc: string,
  oldPassphrase: string,
  newPassphrase: string,
): Promise<string> {
  const publicKey = readEnvelopePublicKey(privateKeyEnc);
  const result = await changePassphrase(
    { publicKey, privateKeyEnc },
    oldPassphrase,
    newPassphrase,
  );
  return result.privateKeyEnc;
}

/** @deprecated Use {@link serializeIdentity}. */
export async function serializeKeyPair(
  keyPair: LegacyKeyPair,
  passphrase: string,
): Promise<SerializedIdentity> {
  return serializeIdentity(asIdentityKeyPair(keyPair.privateKey), passphrase);
}

/** @deprecated Use {@link exportIdentityToBlob}. */
export function exportKeyToFile(serializedKey: SerializedIdentity): Blob {
  const exportData = {
    version: 2,
    type: "docspace-encryption-key",
    algorithm: "X25519-HKDF-AES256GCM",
    data: {
      publicKey: serializedKey.publicKey,
      privateKeyEnc: serializedKey.privateKeyEnc,
    },
  };
  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
}

/** @deprecated Use {@link importIdentityFromFile}. */
export async function importKeyFromFile(
  file: File,
): Promise<SerializedIdentity> {
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

  let parsed: {
    type?: string;
    version?: number;
    data?: { publicKey?: string; privateKeyEnc?: string };
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new InvalidFormatError("key file is not valid JSON");
  }
  if (parsed.type !== "docspace-encryption-key") {
    throw new InvalidFormatError("invalid key file format");
  }
  if (parsed.version !== 2) {
    throw new InvalidFormatError(
      `unsupported key file version: ${parsed.version}`,
    );
  }
  if (!parsed.data?.publicKey || !parsed.data?.privateKeyEnc) {
    throw new InvalidFormatError("key file is missing required fields");
  }
  return {
    publicKey: parsed.data.publicKey,
    privateKeyEnc: parsed.data.privateKeyEnc,
  };
}

/**
 * @deprecated Recovery is a slot inside the v2 identity envelope
 * (`serializeIdentity({ recoveryMnemonic })` + `unlockWithRecoveryPhrase`).
 * This shim treats the mnemonic as the passphrase of a standalone envelope so
 * the old `{ version, type, data }` blob shape keeps round-tripping.
 */
export async function backupPrivateKey(
  privateKey: IdentityKeyPair,
  mnemonic: string,
): Promise<LegacyRecoveryBackup> {
  const env = await serializeIdentity(asIdentityKeyPair(privateKey), mnemonic);
  return {
    version: 1,
    type: "docspace-recovery-backup",
    data: env.privateKeyEnc,
    publicKey: env.publicKey,
  };
}

/** @deprecated See {@link backupPrivateKey}. */
export async function restorePrivateKey(
  backup: LegacyRecoveryBackup,
  mnemonic: string,
): Promise<IdentityKeyPair> {
  if (backup?.version !== 1 || backup?.type !== "docspace-recovery-backup") {
    throw new InvalidFormatError("invalid recovery backup format");
  }
  const publicKey = backup.publicKey ?? readEnvelopePublicKey(backup.data);
  return unlockWithPassphrase(
    { publicKey, privateKeyEnc: backup.data },
    mnemonic,
  );
}

/**
 * @deprecated Standalone filename encryption. In v2 the filename is normally
 * encrypted inside the DSE3 header by {@link encryptFile}. This self-contained
 * helper (random fileNonce prefixed to the ciphertext) is kept for callers that
 * encrypt a name independently of a file.
 */
export async function encryptFileName(
  name: string,
  dek: Uint8Array,
): Promise<string> {
  const fileNonce = getRandomBytes(DSE3_FILE_NONCE_SIZE);
  const raw = await encryptFileNameRaw(name, dek, fileNonce);
  const out = new Uint8Array(fileNonce.byteLength + raw.byteLength);
  out.set(fileNonce, 0);
  out.set(raw, fileNonce.byteLength);
  return arrayBufferToBase64(out);
}

/** @deprecated See {@link encryptFileName}. */
export async function decryptFileName(
  encryptedBase64: string,
  dek: Uint8Array,
): Promise<string> {
  const buf = base64ToUint8Array(encryptedBase64);
  if (buf.byteLength <= DSE3_FILE_NONCE_SIZE) {
    throw new InvalidFormatError("encrypted file name too short");
  }
  const fileNonce = buf.slice(0, DSE3_FILE_NONCE_SIZE);
  const raw = buf.slice(DSE3_FILE_NONCE_SIZE);
  return decryptFileNameRaw(raw, dek, fileNonce);
}

/**
 * @deprecated The single `ENCRYPTION_CONSTANTS` object from the v1 API. Values
 * reflect the v2 core; v1-only fields (`ECDH_CURVE`, `KDF_ITERATIONS`, ...) are
 * gone. Prefer the individually exported `SUITE_*` / `VERSION_*` / `DSE3_*`
 * constants.
 */
export const ENCRYPTION_CONSTANTS = {
  AES_KEY_SIZE: 256,
  AES_GCM_IV_SIZE,
  AES_GCM_TAG_BITS: 128,
  FILE_NONCE_SIZE: DSE3_FILE_NONCE_SIZE,
  DSE3_FIXED_HEADER_SIZE,
  CHUNK_PLAINTEXT_SIZE: DSE3_CHUNK_PLAINTEXT_SIZE,
  CHUNKED_ENCRYPTION_THRESHOLD,
  PUBLIC_KEY_SIZE: X25519_PUBLIC_KEY_SIZE,
  SUITE: SUITE_X25519_HKDF_AES256GCM,
  VERSION_IDENTITY,
  VERSION_HPKE_WRAP,
  VERSION_DSE3_FILE,
} as const;
