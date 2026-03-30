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

// Public API entry point for the standalone onlyoffice-crypto bundle.
//
// Intentionally excludes:
//   - secretStorage.ts  (browser IndexedDB — consumers supply their own storage)
//   - keyRotation.ts    (re-exports keyManagement internals; nothing extra to surface)
//   - Any React / MobX dependencies
//   - Any @docspace/shared/api/* dependencies

// ============================================================================
// Types and constants
// ============================================================================
export type {
  ECDHKeyPair,
  SerializedKeyPair,
  KeyStatus,
  KeyExportFormat,
  WrappedDEK,
  ServerAccessKeyDto,
  DSE3Header,
  EncryptFileResult,
  DecryptFileResult,
  ProgressCallback,
  RecoveryBackup,
} from "./types";

export {
  DSE3_CIPHER_AES_256_GCM,
  DSE3_FLAG_HAS_ENCRYPTED_NAME,
  ENCRYPTION_CONSTANTS,
} from "./types";

// ============================================================================
// Error classes
// ============================================================================
export {
  CryptoError,
  InvalidPassphraseError,
  DecryptionError,
  NoAccessError,
  InvalidFormatError,
  WebCryptoUnavailableError,
  KeyNotFoundError,
} from "./errors";

// ============================================================================
// Buffer utilities (useful for consumers handling raw key/ciphertext bytes)
// ============================================================================
export { arrayBufferToBase64, base64ToArrayBuffer } from "./utils";

// ============================================================================
// Key management
// ============================================================================
export {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  encryptPrivateKey,
  decryptPrivateKey,
  reEncryptPrivateKey,
  serializeKeyPair,
  exportKeyToFile,
  importKeyFromFile,
  generateDEK,
  wrapDEK,
  unwrapDEK,
  getPublicKeyFingerprint,
  getKeyStatus,
} from "./keyManagement";

// ============================================================================
// File encryption / decryption
// ============================================================================
export { encryptFile, decryptFile, encryptFileName, decryptFileName } from "./encryptionService";

// ============================================================================
// Streaming / DSE3 format helpers
// ============================================================================
export { isDSE3Format, parseDSE3Header, estimateEncryptedSize } from "./streamingEncryption";

// ============================================================================
// Recovery
// ============================================================================
export {
  generateRecoveryMnemonic,
  validateMnemonic,
  backupPrivateKey,
  restorePrivateKey,
} from "./recovery";
