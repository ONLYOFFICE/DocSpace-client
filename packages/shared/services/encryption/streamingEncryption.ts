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

import { ENCRYPTION_CONSTANTS } from "./types";
import { getCrypto } from "./keyManagement";

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

const DSE2_MAGIC = ENCRYPTION_CONSTANTS.CHUNKED_MAGIC;
const CHUNK_PLAINTEXT_SIZE = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
const CHUNK_OVERHEAD = ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE + 16; // IV + auth tag
const DSE2_HEADER_SIZE = ENCRYPTION_CONSTANTS.CHUNKED_HEADER_SIZE;

export function isChunkedFormat(data: ArrayBuffer): boolean {
  if (data.byteLength < DSE2_HEADER_SIZE) return false;
  const view = new Uint8Array(data, 0, 4);
  return (
    view[0] === DSE2_MAGIC[0] &&
    view[1] === DSE2_MAGIC[1] &&
    view[2] === DSE2_MAGIC[2] &&
    view[3] === DSE2_MAGIC[3]
  );
}

export function parseChunkedHeader(data: ArrayBuffer): {
  chunkSize: number;
  chunkCount: number;
} {
  if (data.byteLength < DSE2_HEADER_SIZE) {
    throw new Error("Invalid DSE2 data - too short for header");
  }
  const view = new DataView(data, 0, DSE2_HEADER_SIZE);
  const magic = new Uint8Array(data, 0, 4);
  if (
    magic[0] !== DSE2_MAGIC[0] ||
    magic[1] !== DSE2_MAGIC[1] ||
    magic[2] !== DSE2_MAGIC[2] ||
    magic[3] !== DSE2_MAGIC[3]
  ) {
    throw new Error("Invalid DSE2 magic bytes");
  }
  const chunkSize = view.getUint32(4, false);
  const chunkCount = view.getUint32(8, false);
  return { chunkSize, chunkCount };
}

function buildAAD(chunkIndex: number): Uint8Array {
  const aad = new ArrayBuffer(4);
  new DataView(aad).setUint32(0, chunkIndex, false);
  return new Uint8Array(aad);
}

export async function encryptFileChunked(
  file: File,
  aesKeyRaw: Uint8Array,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const subtle = getCrypto();
  const fileSize = file.size;
  const chunkCount = Math.max(1, Math.ceil(fileSize / CHUNK_PLAINTEXT_SIZE));

  const aesKey = await subtle.importKey(
    "raw",
    aesKeyRaw as BufferSource,
    { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
    false,
    ["encrypt"],
  );

  // Build 12-byte header
  const header = new ArrayBuffer(DSE2_HEADER_SIZE);
  const headerView = new DataView(header);
  const headerBytes = new Uint8Array(header);
  headerBytes.set(DSE2_MAGIC, 0);
  headerView.setUint32(4, CHUNK_PLAINTEXT_SIZE, false);
  headerView.setUint32(8, chunkCount, false);

  const parts: BlobPart[] = [header];

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * CHUNK_PLAINTEXT_SIZE;
    const end = Math.min(offset + CHUNK_PLAINTEXT_SIZE, fileSize);
    const chunkBlob = file.slice(offset, end);
    const plaintext = await readBlobAsArrayBuffer(chunkBlob);

    const iv = crypto.getRandomValues(
      new Uint8Array(ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE),
    );
    const aad = buildAAD(i);

    const ciphertext = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: aad as BufferSource,
      },
      aesKey,
      plaintext,
    );

    // Append [IV][ciphertext+tag]
    parts.push(iv, ciphertext);

    onProgress?.((i + 1) / chunkCount);
  }

  return new Blob(parts, { type: "application/octet-stream" });
}

export async function decryptChunked(
  data: ArrayBuffer,
  aesKeyRaw: Uint8Array,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const { chunkSize, chunkCount } = parseChunkedHeader(data);
  const subtle = getCrypto();

  const aesKey = await subtle.importKey(
    "raw",
    aesKeyRaw as BufferSource,
    { name: "AES-GCM", length: ENCRYPTION_CONSTANTS.AES_KEY_SIZE },
    false,
    ["decrypt"],
  );

  const parts: ArrayBuffer[] = [];
  let cursor = DSE2_HEADER_SIZE;

  for (let i = 0; i < chunkCount; i++) {
    const ivSize = ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE;
    if (cursor + ivSize > data.byteLength) {
      throw new Error("Invalid DSE2 data - unexpected end of data reading IV");
    }
    const iv = new Uint8Array(data, cursor, ivSize);
    cursor += ivSize;

    // For full chunks: chunkSize + 16 (auth tag). For last chunk: remainder.
    let ciphertextSize: number;
    if (i < chunkCount - 1) {
      ciphertextSize = chunkSize + 16;
    } else {
      ciphertextSize = data.byteLength - cursor;
    }

    if (cursor + ciphertextSize > data.byteLength) {
      throw new Error(
        "Invalid DSE2 data - unexpected end of data reading ciphertext",
      );
    }

    // Create a copy of the ciphertext slice since SubtleCrypto may need ownership
    const ciphertext = new Uint8Array(
      data.slice(cursor, cursor + ciphertextSize),
    );
    cursor += ciphertextSize;

    const aad = buildAAD(i);

    let plaintext: ArrayBuffer;
    try {
      plaintext = await subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv as BufferSource,
          additionalData: aad as BufferSource,
        },
        aesKey,
        ciphertext,
      );
    } catch {
      throw new Error(
        `Failed to decrypt chunk ${i} - data may be corrupted or tampered`,
      );
    }

    parts.push(plaintext);

    onProgress?.((i + 1) / chunkCount);
  }

  return new Blob(parts);
}

export function estimateChunkedEncryptedSize(originalSize: number): number {
  const chunkCount = Math.max(1, Math.ceil(originalSize / CHUNK_PLAINTEXT_SIZE));
  return DSE2_HEADER_SIZE + chunkCount * CHUNK_OVERHEAD + originalSize;
}

export function shouldUseChunkedEncryption(fileSize: number): boolean {
  return fileSize >= ENCRYPTION_CONSTANTS.CHUNKED_ENCRYPTION_THRESHOLD;
}
