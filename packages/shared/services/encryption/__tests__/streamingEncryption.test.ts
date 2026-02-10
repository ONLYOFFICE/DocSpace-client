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

import { describe, it, expect, vi } from "vitest";

import {
  isChunkedFormat,
  parseChunkedHeader,
  encryptFileChunked,
  decryptChunked,
  estimateChunkedEncryptedSize,
  shouldUseChunkedEncryption,
} from "../streamingEncryption";
import { ENCRYPTION_CONSTANTS } from "../types";

const createMockFile = (
  content: Uint8Array,
  name: string,
  type = "application/octet-stream",
): File => {
  const buffer = content.buffer.slice(
    content.byteOffset,
    content.byteOffset + content.byteLength,
  ) as ArrayBuffer;
  return new File([new Blob([buffer], { type })], name, { type });
};

const createRandomBytes = (size: number): Uint8Array => {
  const result = new Uint8Array(size);
  for (let i = 0; i < size; i += 65536) {
    crypto.getRandomValues(result.subarray(i, Math.min(i + 65536, size)));
  }
  return result;
};

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

const generateTestAESKey = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(32));
};

describe("streamingEncryption", () => {
  describe("isChunkedFormat", () => {
    it("should detect DSE2 magic bytes", () => {
      const header = new ArrayBuffer(12);
      const view = new Uint8Array(header);
      view.set([0x44, 0x53, 0x45, 0x32], 0);
      expect(isChunkedFormat(header)).toBe(true);
    });

    it("should return false for v1 format data", () => {
      const data = new ArrayBuffer(100);
      const view = new Uint8Array(data);
      // Random IV bytes that don't match magic
      crypto.getRandomValues(view);
      // Ensure first 4 bytes are not DSE2
      view[0] = 0x00;
      expect(isChunkedFormat(data)).toBe(false);
    });

    it("should return false for data too short for header", () => {
      expect(isChunkedFormat(new ArrayBuffer(3))).toBe(false);
      expect(isChunkedFormat(new ArrayBuffer(0))).toBe(false);
    });
  });

  describe("parseChunkedHeader", () => {
    it("should extract correct chunk size and count", () => {
      const header = new ArrayBuffer(12);
      const bytes = new Uint8Array(header);
      const view = new DataView(header);
      bytes.set([0x44, 0x53, 0x45, 0x32], 0);
      view.setUint32(4, 1048576, false); // 1 MB chunk size
      view.setUint32(8, 5, false); // 5 chunks

      const result = parseChunkedHeader(header);
      expect(result.chunkSize).toBe(1048576);
      expect(result.chunkCount).toBe(5);
    });

    it("should throw for data too short", () => {
      expect(() => parseChunkedHeader(new ArrayBuffer(8))).toThrow(
        "too short for header",
      );
    });

    it("should throw for invalid magic bytes", () => {
      const header = new ArrayBuffer(12);
      expect(() => parseChunkedHeader(header)).toThrow("Invalid DSE2 magic");
    });
  });

  describe("encryptFileChunked / decryptChunked round-trip", () => {
    it("should round-trip small file (single chunk)", async () => {
      const content = new TextEncoder().encode("Hello, chunked encryption!");
      const file = createMockFile(content, "small.txt", "text/plain");
      const key = generateTestAESKey();

      const encryptedBlob = await encryptFileChunked(file, key);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      expect(isChunkedFormat(encryptedData)).toBe(true);
      const { chunkCount } = parseChunkedHeader(encryptedData);
      expect(chunkCount).toBe(1);

      const decryptedBlob = await decryptChunked(encryptedData, key);
      const decryptedData = new Uint8Array(
        await blobToArrayBuffer(decryptedBlob),
      );
      expect(Array.from(decryptedData)).toEqual(Array.from(content));
    });

    it("should round-trip multi-chunk file", async () => {
      // 3 MB file with 1 MB chunks = 3 chunks
      const chunkSize = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
      const content = createRandomBytes(3 * chunkSize);
      const file = createMockFile(content, "large.bin");
      const key = generateTestAESKey();

      const encryptedBlob = await encryptFileChunked(file, key);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      expect(isChunkedFormat(encryptedData)).toBe(true);
      const { chunkCount } = parseChunkedHeader(encryptedData);
      expect(chunkCount).toBe(3);

      const decryptedBlob = await decryptChunked(encryptedData, key);
      const decryptedData = new Uint8Array(
        await blobToArrayBuffer(decryptedBlob),
      );
      expect(decryptedData).toEqual(content);
    });

    it("should round-trip file with non-aligned size", async () => {
      // 1.5 MB file = 2 chunks (1 MB + 0.5 MB)
      const chunkSize = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
      const content = createRandomBytes(chunkSize + chunkSize / 2);
      const file = createMockFile(content, "partial.bin");
      const key = generateTestAESKey();

      const encryptedBlob = await encryptFileChunked(file, key);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      const { chunkCount } = parseChunkedHeader(encryptedData);
      expect(chunkCount).toBe(2);

      const decryptedBlob = await decryptChunked(encryptedData, key);
      const decryptedData = new Uint8Array(
        await blobToArrayBuffer(decryptedBlob),
      );
      expect(decryptedData).toEqual(content);
    });

    it("should handle empty file", async () => {
      const content = new Uint8Array(0);
      const file = createMockFile(content, "empty.bin");
      const key = generateTestAESKey();

      const encryptedBlob = await encryptFileChunked(file, key);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      expect(isChunkedFormat(encryptedData)).toBe(true);
      const { chunkCount } = parseChunkedHeader(encryptedData);
      expect(chunkCount).toBe(1);

      const decryptedBlob = await decryptChunked(encryptedData, key);
      const decryptedData = new Uint8Array(
        await blobToArrayBuffer(decryptedBlob),
      );
      expect(decryptedData).toEqual(content);
    });
  });

  describe("chunk index AAD", () => {
    it("should fail decryption if chunks are reordered", async () => {
      // Create 2-chunk file
      const chunkSize = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
      const content = createRandomBytes(2 * chunkSize);
      const file = createMockFile(content, "two-chunks.bin");
      const key = generateTestAESKey();

      const encryptedBlob = await encryptFileChunked(file, key);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);
      const headerSize = ENCRYPTION_CONSTANTS.CHUNKED_HEADER_SIZE;
      const ivSize = ENCRYPTION_CONSTANTS.AES_GCM_IV_SIZE;
      const encChunkSize = ivSize + chunkSize + 16; // IV + ciphertext + tag

      // Swap chunk 0 and chunk 1
      const tampered = new ArrayBuffer(encryptedData.byteLength);
      const tamperedView = new Uint8Array(tampered);
      const originalView = new Uint8Array(encryptedData);

      // Copy header
      tamperedView.set(originalView.subarray(0, headerSize), 0);
      // Swap: put chunk 1 at chunk 0 position and vice versa
      tamperedView.set(
        originalView.subarray(
          headerSize + encChunkSize,
          headerSize + 2 * encChunkSize,
        ),
        headerSize,
      );
      tamperedView.set(
        originalView.subarray(headerSize, headerSize + encChunkSize),
        headerSize + encChunkSize,
      );

      await expect(decryptChunked(tampered, key)).rejects.toThrow(
        "Failed to decrypt chunk",
      );
    });
  });

  describe("progress callback", () => {
    it("should fire with increasing values during encryption", async () => {
      const chunkSize = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
      const content = createRandomBytes(3 * chunkSize);
      const file = createMockFile(content, "progress.bin");
      const key = generateTestAESKey();

      const progressValues: number[] = [];
      await encryptFileChunked(file, key, (p) => progressValues.push(p));

      expect(progressValues).toHaveLength(3);
      expect(progressValues[0]).toBeCloseTo(1 / 3);
      expect(progressValues[1]).toBeCloseTo(2 / 3);
      expect(progressValues[2]).toBeCloseTo(1);
      // Verify monotonically increasing
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThan(progressValues[i - 1]);
      }
    });

    it("should fire with increasing values during decryption", async () => {
      const chunkSize = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
      const content = createRandomBytes(2 * chunkSize);
      const file = createMockFile(content, "progress.bin");
      const key = generateTestAESKey();

      const encryptedBlob = await encryptFileChunked(file, key);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      const progressValues: number[] = [];
      await decryptChunked(encryptedData, key, (p) => progressValues.push(p));

      expect(progressValues).toHaveLength(2);
      expect(progressValues[0]).toBeCloseTo(0.5);
      expect(progressValues[1]).toBeCloseTo(1);
    });
  });

  describe("estimateChunkedEncryptedSize", () => {
    it("should return correct size for single-chunk file", () => {
      const size = 100;
      // 12 (header) + 1 * 28 (overhead) + 100 = 140
      expect(estimateChunkedEncryptedSize(size)).toBe(12 + 28 + 100);
    });

    it("should return correct size for multi-chunk file", () => {
      const chunkSize = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
      const size = 3 * chunkSize;
      // 12 (header) + 3 * 28 (overhead) + 3 * chunkSize
      expect(estimateChunkedEncryptedSize(size)).toBe(12 + 3 * 28 + size);
    });

    it("should return correct size for non-aligned file", () => {
      const chunkSize = ENCRYPTION_CONSTANTS.CHUNK_PLAINTEXT_SIZE;
      const size = chunkSize + 100; // 2 chunks
      expect(estimateChunkedEncryptedSize(size)).toBe(12 + 2 * 28 + size);
    });

    it("should handle zero-length file", () => {
      // 1 chunk minimum
      expect(estimateChunkedEncryptedSize(0)).toBe(12 + 28 + 0);
    });
  });

  describe("shouldUseChunkedEncryption", () => {
    it("should return false for small files", () => {
      expect(shouldUseChunkedEncryption(0)).toBe(false);
      expect(shouldUseChunkedEncryption(1024)).toBe(false);
      expect(shouldUseChunkedEncryption(5 * 1024 * 1024 - 1)).toBe(false);
    });

    it("should return true at threshold", () => {
      expect(shouldUseChunkedEncryption(5 * 1024 * 1024)).toBe(true);
    });

    it("should return true for large files", () => {
      expect(shouldUseChunkedEncryption(10 * 1024 * 1024)).toBe(true);
      expect(shouldUseChunkedEncryption(500 * 1024 * 1024)).toBe(true);
    });
  });

  describe("wrong key", () => {
    it("should fail decryption with wrong AES key", async () => {
      const content = new TextEncoder().encode("Secret data");
      const file = createMockFile(content, "secret.txt");
      const correctKey = generateTestAESKey();
      const wrongKey = generateTestAESKey();

      const encryptedBlob = await encryptFileChunked(file, correctKey);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      await expect(decryptChunked(encryptedData, wrongKey)).rejects.toThrow(
        "Failed to decrypt chunk",
      );
    });
  });
});
