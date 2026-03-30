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

import type { DSE3Header, ProgressCallback } from "./types";
import {
  ENCRYPTION_CONSTANTS,
  DSE3_CIPHER_AES_256_GCM,
  DSE3_FLAG_HAS_ENCRYPTED_NAME,
} from "./types";
import { InvalidFormatError, DecryptionError } from "./errors";
import {
  getCrypto,
  getRandomBytes,
  concatBuffers,
  uint32BE,
  uint16BE,
  readUint32BE,
  readUint16BE,
} from "./utils";

const C = ENCRYPTION_CONSTANTS;
const CHUNK_OVERHEAD = C.AES_GCM_IV_SIZE + 16; // IV + GCM tag

// ============================================================================
// DSE3 Header
// ============================================================================

function buildAAD(fileNonce: Uint8Array, chunkIndex: number): Uint8Array {
  return concatBuffers(fileNonce, uint32BE(chunkIndex));
}

export function writeDSE3Header(
  chunkCount: number,
  fileNonce: Uint8Array,
  encryptedName: Uint8Array | null,
): Uint8Array {
  const nameLen = encryptedName?.byteLength ?? 0;
  const flags = encryptedName ? DSE3_FLAG_HAS_ENCRYPTED_NAME : 0;

  const header = concatBuffers(
    C.DSE3_MAGIC,
    new Uint8Array([C.DSE3_HEADER_VERSION]),
    new Uint8Array([flags]),
    new Uint8Array([DSE3_CIPHER_AES_256_GCM]),
    uint32BE(C.CHUNK_PLAINTEXT_SIZE),
    uint32BE(chunkCount),
    fileNonce,
    uint16BE(nameLen),
    ...(encryptedName ? [encryptedName] : []),
  );

  return header;
}

export function parseDSE3Header(data: ArrayBuffer | Uint8Array): DSE3Header {
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(data);

  if (bytes.byteLength < C.DSE3_FIXED_HEADER_SIZE) {
    throw new InvalidFormatError("data too short for DSE3 header");
  }

  const magic = bytes.slice(0, 4);
  if (
    magic[0] !== C.DSE3_MAGIC[0] ||
    magic[1] !== C.DSE3_MAGIC[1] ||
    magic[2] !== C.DSE3_MAGIC[2] ||
    magic[3] !== C.DSE3_MAGIC[3]
  ) {
    throw new InvalidFormatError("invalid DSE3 magic bytes");
  }

  const version = bytes[4];
  if (version !== C.DSE3_HEADER_VERSION) {
    throw new InvalidFormatError(`unsupported DSE3 version: ${version}`);
  }

  const flags = bytes[5];
  const cipher = bytes[6];
  if (cipher !== DSE3_CIPHER_AES_256_GCM) {
    throw new InvalidFormatError(`unsupported cipher: ${cipher}`);
  }

  const chunkPlaintextSize = readUint32BE(bytes, 7);
  if (chunkPlaintextSize === 0) {
    throw new InvalidFormatError("chunk size cannot be zero");
  }

  const chunkCount = readUint32BE(bytes, 11);
  const fileNonce = bytes.slice(15, 15 + C.FILE_NONCE_SIZE);
  const nameLen = readUint16BE(bytes, 15 + C.FILE_NONCE_SIZE);

  let encryptedName: Uint8Array | null = null;
  if (nameLen > 0) {
    const nameStart = C.DSE3_FIXED_HEADER_SIZE;
    if (bytes.byteLength < nameStart + nameLen) {
      throw new InvalidFormatError("data too short for encrypted name");
    }
    encryptedName = bytes.slice(nameStart, nameStart + nameLen);
  }

  return {
    version,
    flags,
    cipher,
    chunkPlaintextSize,
    chunkCount,
    fileNonce,
    encryptedName,
  };
}

export function getDSE3HeaderSize(header: DSE3Header): number {
  return C.DSE3_FIXED_HEADER_SIZE + (header.encryptedName?.byteLength ?? 0);
}

export function isDSE3Format(data: ArrayBuffer | Uint8Array): boolean {
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.byteLength < 4) return false;
  return (
    bytes[0] === C.DSE3_MAGIC[0] &&
    bytes[1] === C.DSE3_MAGIC[1] &&
    bytes[2] === C.DSE3_MAGIC[2] &&
    bytes[3] === C.DSE3_MAGIC[3]
  );
}

// ============================================================================
// Chunked Encryption (DSE3)
// ============================================================================

async function importAESKey(
  rawKey: Uint8Array,
  usages: KeyUsage[],
): Promise<CryptoKey> {
  const subtle = getCrypto();
  return subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM", length: C.AES_KEY_SIZE },
    false,
    usages,
  );
}

export async function encryptChunked(
  data: File | Blob | ArrayBuffer | Uint8Array,
  dek: Uint8Array,
  encryptedName: Uint8Array | null,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  const subtle = getCrypto();
  const aesKey = await importAESKey(dek, ["encrypt"]);

  // Get total size
  let totalSize: number;
  if (data instanceof File || data instanceof Blob) {
    totalSize = data.size;
  } else if (data instanceof Uint8Array) {
    totalSize = data.byteLength;
  } else {
    totalSize = data.byteLength;
  }

  const chunkCount = Math.max(
    1,
    Math.ceil(totalSize / C.CHUNK_PLAINTEXT_SIZE),
  );

  // Per-file random nonce — included in every chunk's AAD to prevent
  // cross-file chunk substitution when files share the same DEK
  const fileNonce = getRandomBytes(C.FILE_NONCE_SIZE);

  const header = writeDSE3Header(chunkCount, fileNonce, encryptedName);
  const parts: BlobPart[] = [header as BlobPart];

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * C.CHUNK_PLAINTEXT_SIZE;
    const end = Math.min(offset + C.CHUNK_PLAINTEXT_SIZE, totalSize);

    let plaintext: ArrayBuffer;
    if (data instanceof File || data instanceof Blob) {
      plaintext = await data.slice(offset, end).arrayBuffer();
    } else if (data instanceof Uint8Array) {
      plaintext = data.slice(offset, end).buffer as ArrayBuffer;
    } else {
      plaintext = data.slice(offset, end);
    }

    const iv = getRandomBytes(C.AES_GCM_IV_SIZE);
    const aad = buildAAD(fileNonce, i);

    const ciphertext = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: aad as BufferSource,
        tagLength: C.AES_GCM_TAG_BITS,
      },
      aesKey,
      plaintext,
    );

    parts.push(iv as BlobPart, ciphertext);
    onProgress?.((i + 1) / chunkCount);
  }

  return new Blob(parts, { type: "application/octet-stream" });
}

export async function decryptChunked(
  data: ArrayBuffer | Uint8Array,
  dek: Uint8Array,
  header: DSE3Header,
  headerSize: number,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  const subtle = getCrypto();
  const aesKey = await importAESKey(dek, ["decrypt"]);
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(data);

  const parts: ArrayBuffer[] = [];
  let cursor = headerSize;

  for (let i = 0; i < header.chunkCount; i++) {
    if (cursor + C.AES_GCM_IV_SIZE > bytes.byteLength) {
      throw new InvalidFormatError(
        `chunk ${i}: unexpected end reading IV`,
      );
    }

    const iv = bytes.slice(cursor, cursor + C.AES_GCM_IV_SIZE);
    cursor += C.AES_GCM_IV_SIZE;

    let ciphertextSize: number;
    if (i < header.chunkCount - 1) {
      ciphertextSize = header.chunkPlaintextSize + 16; // GCM tag
    } else {
      ciphertextSize = bytes.byteLength - cursor;
    }

    if (cursor + ciphertextSize > bytes.byteLength) {
      throw new InvalidFormatError(
        `chunk ${i}: unexpected end reading ciphertext`,
      );
    }

    const ciphertext = bytes.slice(cursor, cursor + ciphertextSize);
    cursor += ciphertextSize;

    const aad = buildAAD(header.fileNonce, i);

    try {
      const plaintext = await subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv as BufferSource,
          additionalData: aad as BufferSource,
          tagLength: C.AES_GCM_TAG_BITS,
        },
        aesKey,
        ciphertext as BufferSource,
      );
      parts.push(plaintext);
    } catch {
      throw new DecryptionError(
        `chunk ${i} failed — data may be corrupted or tampered`,
      );
    }

    onProgress?.((i + 1) / header.chunkCount);
  }

  return new Blob(parts);
}

// ============================================================================
// Helpers
// ============================================================================

export function shouldUseChunkedEncryption(fileSize: number): boolean {
  return fileSize >= C.CHUNKED_ENCRYPTION_THRESHOLD;
}

export function estimateEncryptedSize(originalSize: number): number {
  const chunkCount = Math.max(
    1,
    Math.ceil(originalSize / C.CHUNK_PLAINTEXT_SIZE),
  );
  return C.DSE3_FIXED_HEADER_SIZE + chunkCount * CHUNK_OVERHEAD + originalSize;
}
