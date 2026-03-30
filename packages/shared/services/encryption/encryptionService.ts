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

import type { EncryptFileResult, DecryptFileResult, ProgressCallback } from "./types";
import { ENCRYPTION_CONSTANTS } from "./types";
import { DecryptionError } from "./errors";
import { getCrypto, getRandomBytes, arrayBufferToBase64, base64ToArrayBuffer } from "./utils";
import { generateDEK } from "./keyManagement";
import {
  encryptChunked,
  decryptChunked,
  isDSE3Format,
  parseDSE3Header,
  getDSE3HeaderSize,
} from "./streamingEncryption";

const C = ENCRYPTION_CONSTANTS;

// ============================================================================
// File Encryption
//
// Produces a self-describing DSE3 blob. All info needed for decryption
// (except the DEK) is in the file header. The DEK is wrapped separately
// per-recipient and stored on the server via files_file_keys API.
// ============================================================================

export async function encryptFile(
  data: File | Blob | ArrayBuffer | Uint8Array,
  options?: {
    dek?: Uint8Array;
    fileName?: string;
    onProgress?: ProgressCallback;
  },
): Promise<EncryptFileResult> {
  const dek = options?.dek ?? generateDEK();

  // Encrypt file name if provided
  let encryptedName: Uint8Array | null = null;
  if (options?.fileName) {
    encryptedName = await encryptFileNameRaw(options.fileName, dek);
  }

  const encryptedBlob = await encryptChunked(
    data,
    dek,
    encryptedName,
    options?.onProgress,
  );

  return { encryptedBlob, dek };
}

// ============================================================================
// File Decryption
//
// Reads DSE3 header from the blob, decrypts all chunks, optionally
// decrypts the file name from the header.
// ============================================================================

export async function decryptFile(
  encryptedData: ArrayBuffer | Uint8Array,
  dek: Uint8Array,
  options?: {
    onProgress?: ProgressCallback;
  },
): Promise<DecryptFileResult> {
  const bytes =
    encryptedData instanceof Uint8Array
      ? encryptedData
      : new Uint8Array(encryptedData);

  if (!isDSE3Format(bytes)) {
    throw new DecryptionError("not a DSE3 file");
  }

  const header = parseDSE3Header(bytes);
  const headerSize = getDSE3HeaderSize(header);

  // Decrypt file name if present in header
  let fileName: string | null = null;
  if (header.encryptedName) {
    fileName = await decryptFileNameRaw(header.encryptedName, dek);
  }

  const data = await decryptChunked(
    bytes,
    dek,
    header,
    headerSize,
    options?.onProgress,
  );

  return { data, fileName };
}

// ============================================================================
// File Name Encryption (AES-256-GCM with the file's DEK)
// ============================================================================

async function encryptFileNameRaw(
  name: string,
  dek: Uint8Array,
): Promise<Uint8Array> {
  const subtle = getCrypto();
  const aesKey = await subtle.importKey(
    "raw",
    dek as BufferSource,
    { name: "AES-GCM", length: C.AES_KEY_SIZE },
    false,
    ["encrypt"],
  );

  const iv = getRandomBytes(C.AES_GCM_IV_SIZE);
  const plaintext = new TextEncoder().encode(name);

  const FILENAME_AAD = new TextEncoder().encode("docspace-filename-v1");
  const ciphertext = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: FILENAME_AAD as BufferSource,
      tagLength: C.AES_GCM_TAG_BITS,
    },
    aesKey,
    plaintext as BufferSource,
  );

  // Format: [iv 12B][ciphertext + tag]
  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), iv.length);
  return result;
}

async function decryptFileNameRaw(
  encrypted: Uint8Array,
  dek: Uint8Array,
): Promise<string> {
  const subtle = getCrypto();
  const aesKey = await subtle.importKey(
    "raw",
    dek as BufferSource,
    { name: "AES-GCM", length: C.AES_KEY_SIZE },
    false,
    ["decrypt"],
  );

  const iv = encrypted.slice(0, C.AES_GCM_IV_SIZE);
  const ciphertext = encrypted.slice(C.AES_GCM_IV_SIZE);

  try {
    const FILENAME_AAD = new TextEncoder().encode("docspace-filename-v1");
    const plaintext = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: FILENAME_AAD as BufferSource,
        tagLength: C.AES_GCM_TAG_BITS,
      },
      aesKey,
      ciphertext as BufferSource,
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new DecryptionError("file name decryption failed");
  }
}

export async function encryptFileName(
  name: string,
  dek: Uint8Array,
): Promise<string> {
  const encrypted = await encryptFileNameRaw(name, dek);
  return arrayBufferToBase64(encrypted.buffer as ArrayBuffer);
}

export async function decryptFileName(
  encryptedBase64: string,
  dek: Uint8Array,
): Promise<string> {
  const encrypted = new Uint8Array(base64ToArrayBuffer(encryptedBase64));
  return decryptFileNameRaw(encrypted, dek);
}
