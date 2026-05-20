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

// DSE3 v2 streaming AEAD: chunked AES-256-GCM with per-chunk AAD that
// binds suite, fileNonce, chunkCount, chunkIndex, and lastFlag.

import {
  AAD_DSE3_CHUNK_PREFIX,
  AAD_DSE3_FILENAME_PREFIX,
  AES_GCM_IV_SIZE,
  AES_GCM_TAG_SIZE,
  AES_KEY_SIZE_BYTES,
  CHUNKED_ENCRYPTION_THRESHOLD,
  DSE3_CHUNK_OVERHEAD,
  DSE3_CHUNK_PLAINTEXT_SIZE,
  DSE3_FILE_NONCE_SIZE,
  DSE3_FIXED_HEADER_SIZE,
  DSE3_FLAG_HAS_ENCRYPTED_NAME,
  DSE3_MAX_CHUNK_COUNT,
  DSE3_MAX_CHUNK_SIZE,
  MAGIC_DSE3_FILE,
  SUITE_X25519_HKDF_AES256GCM,
  VERSION_DSE3_FILE,
  type DSE3Header,
  type ProgressCallback,
} from "./types";
import {
  DecryptionError,
  InvalidFormatError,
  UnsupportedSuiteError,
  UnsupportedVersionError,
} from "./errors";
import {
  concatBuffers,
  fromUtf8,
  getCrypto,
  getRandomBytes,
  readUint16BE,
  readUint32BE,
  uint16BE,
  uint32BE,
  utf8,
} from "./utils";

export function writeDSE3Header(
  chunkCount: number,
  fileNonce: Uint8Array,
  encryptedName: Uint8Array | null,
): Uint8Array {
  if (chunkCount < 1 || chunkCount > DSE3_MAX_CHUNK_COUNT) {
    throw new InvalidFormatError(`invalid chunkCount: ${chunkCount}`);
  }
  if (fileNonce.byteLength !== DSE3_FILE_NONCE_SIZE) {
    throw new InvalidFormatError(
      `fileNonce must be ${DSE3_FILE_NONCE_SIZE} bytes`,
    );
  }
  const nameLen = encryptedName?.byteLength ?? 0;
  if (nameLen > 0xffff) {
    throw new InvalidFormatError("encryptedName length exceeds u16");
  }
  const flags = encryptedName ? DSE3_FLAG_HAS_ENCRYPTED_NAME : 0;

  return concatBuffers(
    MAGIC_DSE3_FILE,
    new Uint8Array([VERSION_DSE3_FILE, SUITE_X25519_HKDF_AES256GCM, flags]),
    uint32BE(DSE3_CHUNK_PLAINTEXT_SIZE),
    uint32BE(chunkCount),
    fileNonce,
    uint16BE(nameLen),
    ...(encryptedName ? [encryptedName] : []),
  );
}

export function parseDSE3Header(
  data: ArrayBuffer | Uint8Array,
): DSE3Header {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  if (bytes.byteLength < DSE3_FIXED_HEADER_SIZE) {
    throw new InvalidFormatError("data too short for DSE3 header");
  }
  for (let i = 0; i < MAGIC_DSE3_FILE.length; i++) {
    if (bytes[i] !== MAGIC_DSE3_FILE[i]) {
      throw new InvalidFormatError("invalid DSE3 magic bytes");
    }
  }
  const version = bytes[4];
  if (version !== VERSION_DSE3_FILE) {
    throw new UnsupportedVersionError(version, VERSION_DSE3_FILE);
  }
  const suite = bytes[5];
  if (suite !== SUITE_X25519_HKDF_AES256GCM) {
    throw new UnsupportedSuiteError(suite);
  }
  const flags = bytes[6];
  const chunkPlaintextSize = readUint32BE(bytes, 7);
  if (chunkPlaintextSize === 0 || chunkPlaintextSize > DSE3_MAX_CHUNK_SIZE) {
    throw new InvalidFormatError(
      `invalid chunkPlaintextSize: ${chunkPlaintextSize}`,
    );
  }
  const chunkCount = readUint32BE(bytes, 11);
  if (chunkCount === 0 || chunkCount > DSE3_MAX_CHUNK_COUNT) {
    throw new InvalidFormatError(`invalid chunkCount: ${chunkCount}`);
  }
  const fileNonce = bytes.slice(15, 15 + DSE3_FILE_NONCE_SIZE);
  const nameLen = readUint16BE(bytes, 15 + DSE3_FILE_NONCE_SIZE);

  let encryptedName: Uint8Array | null = null;
  if (nameLen > 0) {
    const nameStart = DSE3_FIXED_HEADER_SIZE;
    if (bytes.byteLength < nameStart + nameLen) {
      throw new InvalidFormatError("data too short for encrypted name");
    }
    encryptedName = bytes.slice(nameStart, nameStart + nameLen);
  }
  if (encryptedName === null && (flags & DSE3_FLAG_HAS_ENCRYPTED_NAME) !== 0) {
    throw new InvalidFormatError("flag claims name but nameLen is 0");
  }
  if (encryptedName !== null && (flags & DSE3_FLAG_HAS_ENCRYPTED_NAME) === 0) {
    throw new InvalidFormatError("nameLen non-zero but flag not set");
  }

  return {
    version,
    suite,
    flags,
    chunkPlaintextSize,
    chunkCount,
    fileNonce,
    encryptedName,
  };
}

export function getDSE3HeaderSize(header: DSE3Header): number {
  return DSE3_FIXED_HEADER_SIZE + (header.encryptedName?.byteLength ?? 0);
}

export function isDSE3Format(data: ArrayBuffer | Uint8Array): boolean {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.byteLength < 4) return false;
  for (let i = 0; i < MAGIC_DSE3_FILE.length; i++) {
    if (bytes[i] !== MAGIC_DSE3_FILE[i]) return false;
  }
  return true;
}

function buildChunkAad(
  fileNonce: Uint8Array,
  chunkCount: number,
  chunkIndex: number,
): Uint8Array {
  const lastFlag = chunkIndex === chunkCount - 1 ? 0x01 : 0x00;
  return concatBuffers(
    utf8(AAD_DSE3_CHUNK_PREFIX),
    new Uint8Array([SUITE_X25519_HKDF_AES256GCM]),
    fileNonce,
    uint32BE(chunkCount),
    uint32BE(chunkIndex),
    new Uint8Array([lastFlag]),
  );
}

function buildNameAad(fileNonce: Uint8Array): Uint8Array {
  return concatBuffers(
    utf8(AAD_DSE3_FILENAME_PREFIX),
    new Uint8Array([SUITE_X25519_HKDF_AES256GCM]),
    fileNonce,
  );
}

// AES-256-GCM key import (per-call, since DEK is consumed transiently)
async function importDek(
  raw: Uint8Array,
  usages: KeyUsage[],
): Promise<CryptoKey> {
  if (raw.byteLength !== AES_KEY_SIZE_BYTES) {
    throw new InvalidFormatError(`DEK must be ${AES_KEY_SIZE_BYTES} bytes`);
  }
  const subtle = getCrypto();
  return subtle.importKey(
    "raw",
    raw as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    usages,
  );
}

export async function encryptFileNameRaw(
  name: string,
  dek: Uint8Array,
  fileNonce: Uint8Array,
): Promise<Uint8Array> {
  const subtle = getCrypto();
  const aesKey = await importDek(dek, ["encrypt"]);
  const iv = getRandomBytes(AES_GCM_IV_SIZE);
  const aad = buildNameAad(fileNonce);
  const ct = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: aad as BufferSource,
      tagLength: AES_GCM_TAG_SIZE * 8,
    },
    aesKey,
    utf8(name.normalize("NFC")) as BufferSource,
  );
  return concatBuffers(iv, new Uint8Array(ct));
}

export async function decryptFileNameRaw(
  encrypted: Uint8Array,
  dek: Uint8Array,
  fileNonce: Uint8Array,
): Promise<string> {
  if (encrypted.byteLength < AES_GCM_IV_SIZE + AES_GCM_TAG_SIZE) {
    throw new InvalidFormatError("encrypted name too short");
  }
  const subtle = getCrypto();
  const aesKey = await importDek(dek, ["decrypt"]);
  const iv = encrypted.slice(0, AES_GCM_IV_SIZE);
  const ct = encrypted.slice(AES_GCM_IV_SIZE);
  const aad = buildNameAad(fileNonce);
  try {
    const pt = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: aad as BufferSource,
        tagLength: AES_GCM_TAG_SIZE * 8,
      },
      aesKey,
      ct as BufferSource,
    );
    return fromUtf8(new Uint8Array(pt));
  } catch {
    throw new DecryptionError("file name decryption failed");
  }
}

export async function encryptChunked(
  data: File | Blob | ArrayBuffer | Uint8Array,
  dek: Uint8Array,
  encryptedName: Uint8Array | null,
  onProgress?: ProgressCallback,
  /** If provided, used as the fileNonce; otherwise a fresh one is generated.
   * Callers that need to encrypt the filename under the same nonce should
   * supply it here. */
  fileNonceIn?: Uint8Array,
): Promise<Blob> {
  const subtle = getCrypto();
  const aesKey = await importDek(dek, ["encrypt"]);

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
    Math.ceil(totalSize / DSE3_CHUNK_PLAINTEXT_SIZE),
  );
  if (chunkCount > DSE3_MAX_CHUNK_COUNT) {
    throw new InvalidFormatError(
      `file too large: would require ${chunkCount} chunks (max ${DSE3_MAX_CHUNK_COUNT})`,
    );
  }

  const fileNonce =
    fileNonceIn && fileNonceIn.byteLength === DSE3_FILE_NONCE_SIZE
      ? fileNonceIn
      : getRandomBytes(DSE3_FILE_NONCE_SIZE);
  if (fileNonceIn && fileNonceIn.byteLength !== DSE3_FILE_NONCE_SIZE) {
    throw new InvalidFormatError(
      `fileNonce must be ${DSE3_FILE_NONCE_SIZE} bytes`,
    );
  }
  const header = writeDSE3Header(chunkCount, fileNonce, encryptedName);
  const parts: BlobPart[] = [header as BlobPart];

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * DSE3_CHUNK_PLAINTEXT_SIZE;
    const end = Math.min(offset + DSE3_CHUNK_PLAINTEXT_SIZE, totalSize);

    let plaintext: ArrayBuffer;
    if (data instanceof File || data instanceof Blob) {
      plaintext = await data.slice(offset, end).arrayBuffer();
    } else if (data instanceof Uint8Array) {
      plaintext = data.slice(offset, end).buffer as ArrayBuffer;
    } else {
      plaintext = data.slice(offset, end);
    }

    const iv = getRandomBytes(AES_GCM_IV_SIZE);
    const aad = buildChunkAad(fileNonce, chunkCount, i);

    const ct = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: aad as BufferSource,
        tagLength: AES_GCM_TAG_SIZE * 8,
      },
      aesKey,
      plaintext,
    );
    parts.push(iv as BlobPart, ct);
    onProgress?.((i + 1) / chunkCount);
  }

  return new Blob(parts, { type: "application/octet-stream" });
}

export async function parseDSE3HeaderFromBlob(
  blob: Blob,
): Promise<{ header: DSE3Header; headerSize: number }> {
  if (blob.size < DSE3_FIXED_HEADER_SIZE) {
    throw new InvalidFormatError("data too short for DSE3 header");
  }
  const fixed = new Uint8Array(
    await blob.slice(0, DSE3_FIXED_HEADER_SIZE).arrayBuffer(),
  );
  const nameLen = readUint16BE(fixed, 15 + DSE3_FILE_NONCE_SIZE);
  const totalHeaderSize = DSE3_FIXED_HEADER_SIZE + nameLen;
  if (blob.size < totalHeaderSize) {
    throw new InvalidFormatError("data too short for encrypted name");
  }
  const headerBytes =
    nameLen === 0
      ? fixed
      : new Uint8Array(
          await blob.slice(0, totalHeaderSize).arrayBuffer(),
        );
  const header = parseDSE3Header(headerBytes);
  return { header, headerSize: totalHeaderSize };
}

export async function decryptChunkedFromBlob(
  blob: Blob,
  dek: Uint8Array,
  header: DSE3Header,
  headerSize: number,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  const subtle = getCrypto();
  const aesKey = await importDek(dek, ["decrypt"]);

  const parts: ArrayBuffer[] = [];
  let cursor = headerSize;

  for (let i = 0; i < header.chunkCount; i++) {
    if (cursor + AES_GCM_IV_SIZE > blob.size) {
      throw new InvalidFormatError(`chunk ${i}: unexpected end reading IV`);
    }
    const iv = new Uint8Array(
      await blob.slice(cursor, cursor + AES_GCM_IV_SIZE).arrayBuffer(),
    );
    cursor += AES_GCM_IV_SIZE;

    let ciphertextSize: number;
    if (i < header.chunkCount - 1) {
      ciphertextSize = header.chunkPlaintextSize + AES_GCM_TAG_SIZE;
    } else {
      ciphertextSize = blob.size - cursor;
      if (ciphertextSize < AES_GCM_TAG_SIZE) {
        throw new InvalidFormatError(
          `chunk ${i}: final ciphertext too short for tag`,
        );
      }
      const maxFinal = header.chunkPlaintextSize + AES_GCM_TAG_SIZE;
      if (ciphertextSize > maxFinal) {
        throw new InvalidFormatError(
          `chunk ${i}: trailing bytes after final chunk`,
        );
      }
    }

    if (cursor + ciphertextSize > blob.size) {
      throw new InvalidFormatError(
        `chunk ${i}: unexpected end reading ciphertext`,
      );
    }

    const ciphertext = await blob
      .slice(cursor, cursor + ciphertextSize)
      .arrayBuffer();
    cursor += ciphertextSize;

    const aad = buildChunkAad(header.fileNonce, header.chunkCount, i);
    try {
      const pt = await subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv as BufferSource,
          additionalData: aad as BufferSource,
          tagLength: AES_GCM_TAG_SIZE * 8,
        },
        aesKey,
        ciphertext,
      );
      parts.push(pt);
    } catch {
      throw new DecryptionError(
        `chunk ${i} failed — data may be corrupted or tampered`,
      );
    }
    onProgress?.((i + 1) / header.chunkCount);
  }

  if (cursor !== blob.size) {
    throw new InvalidFormatError("trailing bytes after last chunk");
  }
  return new Blob(parts);
}

export async function decryptChunked(
  data: ArrayBuffer | Uint8Array,
  dek: Uint8Array,
  header: DSE3Header,
  headerSize: number,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  const subtle = getCrypto();
  const aesKey = await importDek(dek, ["decrypt"]);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  const parts: ArrayBuffer[] = [];
  let cursor = headerSize;

  for (let i = 0; i < header.chunkCount; i++) {
    if (cursor + AES_GCM_IV_SIZE > bytes.byteLength) {
      throw new InvalidFormatError(`chunk ${i}: unexpected end reading IV`);
    }
    const iv = bytes.slice(cursor, cursor + AES_GCM_IV_SIZE);
    cursor += AES_GCM_IV_SIZE;

    let ciphertextSize: number;
    if (i < header.chunkCount - 1) {
      ciphertextSize = header.chunkPlaintextSize + AES_GCM_TAG_SIZE;
    } else {
      // Final chunk: remaining bytes minus expected tag - reject if there's
      // extra trailing data that would otherwise be silently ignored.
      ciphertextSize = bytes.byteLength - cursor;
      if (ciphertextSize < AES_GCM_TAG_SIZE) {
        throw new InvalidFormatError(
          `chunk ${i}: final ciphertext too short for tag`,
        );
      }
      const maxFinal = header.chunkPlaintextSize + AES_GCM_TAG_SIZE;
      if (ciphertextSize > maxFinal) {
        throw new InvalidFormatError(
          `chunk ${i}: trailing bytes after final chunk`,
        );
      }
    }

    if (cursor + ciphertextSize > bytes.byteLength) {
      throw new InvalidFormatError(
        `chunk ${i}: unexpected end reading ciphertext`,
      );
    }

    const ciphertext = bytes.slice(cursor, cursor + ciphertextSize);
    cursor += ciphertextSize;

    const aad = buildChunkAad(header.fileNonce, header.chunkCount, i);
    try {
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
      parts.push(pt);
    } catch {
      throw new DecryptionError(
        `chunk ${i} failed — data may be corrupted or tampered`,
      );
    }
    onProgress?.((i + 1) / header.chunkCount);
  }

  if (cursor !== bytes.byteLength) {
    throw new InvalidFormatError("trailing bytes after last chunk");
  }
  return new Blob(parts);
}

export function shouldUseChunkedEncryption(fileSize: number): boolean {
  return fileSize >= CHUNKED_ENCRYPTION_THRESHOLD;
}

export function estimateEncryptedSize(originalSize: number): number {
  const chunkCount = Math.max(
    1,
    Math.ceil(originalSize / DSE3_CHUNK_PLAINTEXT_SIZE),
  );
  return DSE3_FIXED_HEADER_SIZE + chunkCount * DSE3_CHUNK_OVERHEAD + originalSize;
}
