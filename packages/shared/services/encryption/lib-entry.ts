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

// IIFE bundle entry - exposes window.OnlyofficeCrypto for DocEditor.
// Excludes secretStorage and any React/MobX/api dependencies.

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

export {
  CryptoError,
  InvalidPassphraseError,
  InvalidRecoveryPhraseError,
  DecryptionError,
  NoAccessError,
  InvalidFormatError,
  UnsupportedVersionError,
  UnsupportedSuiteError,
  AuthenticationError,
  WebCryptoUnavailableError,
  KeyNotFoundError,
} from "./errors";

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
  DEFAULT_ARGON2_PARAMS,
} from "./identity";

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
