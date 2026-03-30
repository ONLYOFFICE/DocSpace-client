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

// ============================================================================
// Key types
// ============================================================================

export type ECDHKeyPair = {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
};

export type SerializedKeyPair = {
  publicKey: string; // base64 SPKI (raw ECDH P-256 public key)
  privateKeyEnc: string; // base64 [salt 16B][iv 12B][ciphertext+tag] (AES-GCM encrypted PKCS8)
  userId?: string;
};

export type KeyStatus = {
  hasKey: boolean;
  publicKeyFingerprint?: string;
  createdAt?: Date;
  algorithm?: string;
};

export type KeyExportFormat = {
  version: 2;
  type: "docspace-encryption-key";
  algorithm: "ECDH-P256";
  data: {
    publicKey: string;
    privateKeyEnc: string;
  };
};

// ============================================================================
// DEK wrapping types (stored in server's files_file_keys table)
// ============================================================================

export type WrappedDEK = {
  userId: string; // GUID — who can unwrap
  publicKeyId: string; // GUID — which public key was used
  wrappedKey: string; // base64 — [ephemeral pubkey 65B][wrapped DEK 40B]
};

// Matches server's AccessRequestKeyDto
export type ServerAccessKeyDto = {
  userId: string;
  publicKeyId: string;
  privateKeyEnc: string; // server field name for the wrapped DEK
};

// ============================================================================
// DSE3 file format types
// ============================================================================

export const DSE3_CIPHER_AES_256_GCM = 0x01;

export type DSE3Header = {
  version: number;
  flags: number;
  cipher: number;
  chunkPlaintextSize: number;
  chunkCount: number;
  fileNonce: Uint8Array; // random per-encryption, included in every chunk AAD
  encryptedName: Uint8Array | null;
};

export const DSE3_FLAG_HAS_ENCRYPTED_NAME = 0x01;

// ============================================================================
// Encryption operation types
// ============================================================================

export type EncryptFileResult = {
  encryptedBlob: Blob;
  dek: Uint8Array; // raw AES-256 key — caller wraps it for recipients
};

export type DecryptFileResult = {
  data: Blob;
  fileName: string | null; // decrypted from header if present
};

export type ProgressCallback = (progress: number) => void;

// ============================================================================
// Recovery types
// ============================================================================

export type RecoveryBackup = {
  version: 1;
  type: "docspace-recovery-backup";
  data: string; // base64 [salt 16B][iv 12B][ciphertext+tag]
};

// ============================================================================
// Constants
// ============================================================================

export const ENCRYPTION_CONSTANTS = {
  // ECDH P-256
  ECDH_CURVE: "P-256" as const,
  ECDH_PUBLIC_KEY_SIZE: 65, // uncompressed point

  // AES-256-GCM
  AES_KEY_SIZE: 256,
  AES_GCM_IV_SIZE: 12,
  AES_GCM_TAG_BITS: 128,

  // AES-KW (Key Wrap) output overhead: 8 bytes for 256-bit key
  AES_KW_OVERHEAD: 8,

  // PBKDF2
  KDF_ITERATIONS: 600_000,
  KDF_HASH: "SHA-256" as const,
  SALT_SIZE: 16,

  // HKDF
  HKDF_HASH: "SHA-256" as const,
  HKDF_INFO: new TextEncoder().encode("docspace-dek-wrap-v1"),

  // Session cache
  SESSION_CACHE_DURATION_MS: 30 * 60 * 1000, // 30 minutes

  // DSE3 format
  DSE3_MAGIC: new Uint8Array([0x44, 0x53, 0x45, 0x33]), // "DSE3"
  DSE3_HEADER_VERSION: 0x01,
  FILE_NONCE_SIZE: 16, // random per-encryption, included in chunk AAD
  DSE3_FIXED_HEADER_SIZE: 33, // magic(4)+ver(1)+flags(1)+cipher(1)+chunkSize(4)+chunkCount(4)+nonce(16)+nameLen(2)

  // Chunking
  CHUNK_PLAINTEXT_SIZE: 1 * 1024 * 1024, // 1 MB
  CHUNKED_ENCRYPTION_THRESHOLD: 5 * 1024 * 1024, // 5 MB

  // Fingerprint
  FINGERPRINT_BYTES: 32, // full SHA-256
} as const;
