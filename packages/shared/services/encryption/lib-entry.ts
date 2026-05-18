// (c) Copyright Ascensio System SIA 2009-2026
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
