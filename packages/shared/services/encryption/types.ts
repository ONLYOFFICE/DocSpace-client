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

export const SUITE_X25519_HKDF_AES256GCM = 0x01;
export type SuiteId = typeof SUITE_X25519_HKDF_AES256GCM;

export const MAGIC_IDENTITY = new Uint8Array([0x44, 0x53, 0x45, 0x4b]); // "DSEK"
export const MAGIC_HPKE_WRAP = new Uint8Array([0x48, 0x50, 0x4b, 0x45]); // "HPKE"
export const MAGIC_DSE3_FILE = new Uint8Array([0x44, 0x53, 0x45, 0x33]); // "DSE3"

export const VERSION_IDENTITY = 0x02;
export const VERSION_HPKE_WRAP = 0x02;
export const VERSION_DSE3_FILE = 0x02;

export const X25519_PUBLIC_KEY_SIZE = 32;
export const X25519_PRIVATE_KEY_SIZE = 32;

export const AES_KEY_SIZE_BYTES = 32;
export const AES_GCM_IV_SIZE = 12;
export const AES_GCM_TAG_SIZE = 16;

export const KDF_ID_ARGON2ID = 0x01;
export const ARGON2ID_DEFAULT_M_KIB = 65536;
export const ARGON2ID_DEFAULT_T = 3;
export const ARGON2ID_DEFAULT_P = 4;
export const ARGON2ID_DK_LEN = 32;
export const SALT_SIZE = 16;

export const DSE3_CHUNK_PLAINTEXT_SIZE = 1_048_576;
export const DSE3_MAX_CHUNK_SIZE = 16_777_216;
export const DSE3_FIXED_HEADER_SIZE = 33;
export const DSE3_FILE_NONCE_SIZE = 16;
export const DSE3_CHUNK_OVERHEAD = AES_GCM_IV_SIZE + AES_GCM_TAG_SIZE;
export const DSE3_MAX_CHUNK_COUNT = 0x40000000;
export const DSE3_FLAG_HAS_ENCRYPTED_NAME = 0x01;
export const CHUNKED_ENCRYPTION_THRESHOLD = 5 * 1024 * 1024;

export const USER_ID_BYTES = 16;
export const FILE_ID_BYTES = 8;

export const AAD_IDENTITY_PASSPHRASE_PREFIX = "docspace-identity-v2|passphrase|";
export const AAD_IDENTITY_RECOVERY_PREFIX = "docspace-identity-v2|recovery|";
export const HPKE_INFO_DEK_WRAP = "docspace-dek-wrap-v2";
export const AAD_DSE3_CHUNK_PREFIX = "docspace-chunk-v2";
export const AAD_DSE3_FILENAME_PREFIX = "docspace-filename-v2";

export const SESSION_CACHE_DURATION_MS = 30 * 60 * 1000;

export type Argon2idParams = {
  m_KiB: number;
  t: number;
  p: number;
};

export type IdentityKeyPair = {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
};

export type SerializedIdentity = {
  privateKeyEnc: string;
  publicKey: string;
};

export type ServerAccessKeyDto = {
  userId: string;
  publicKeyId: string;
  privateKeyEnc: string;
};

export type DSE3Header = {
  version: number;
  suite: number;
  flags: number;
  chunkPlaintextSize: number;
  chunkCount: number;
  fileNonce: Uint8Array;
  encryptedName: Uint8Array | null;
};

export type EncryptFileResult = {
  encryptedBlob: Blob;
  dek: Uint8Array;
};

export type DecryptFileResult = {
  data: Blob;
  fileName: string | null;
};

export type ProgressCallback = (progress: number) => void;

export type KeyStatus = {
  hasKey: boolean;
  publicKeyFingerprint?: string;
  algorithm?: string;
};
