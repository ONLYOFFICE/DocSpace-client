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

import { describe, it, expect } from "vitest";

import {
  writeDSE3Header,
  parseDSE3Header,
  isDSE3Format,
  encryptChunked,
  decryptChunked,
  getDSE3HeaderSize,
  estimateEncryptedSize,
} from "../streamingEncryption";
import { ENCRYPTION_CONSTANTS } from "../types";
import { InvalidFormatError, DecryptionError } from "../errors";
import { generateDEK } from "../keyManagement";

const C = ENCRYPTION_CONSTANTS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function freshNonce(): Uint8Array {
  // FILE_NONCE_SIZE is 16 bytes — well within jsdom's 65536-byte limit
  return globalThis.crypto.getRandomValues(
    new Uint8Array(C.FILE_NONCE_SIZE),
  );
}

/**
 * Read a Blob's contents as a Uint8Array.
 * Uses FileReader because jsdom's Blob does not implement .arrayBuffer().
 */
function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Fill a Uint8Array with pseudo-random bytes, working around jsdom's
 * 65536-byte limit on crypto.getRandomValues by iterating in 64 KB chunks.
 */
function fillRandom(bytes: Uint8Array): Uint8Array {
  const CHUNK = 65536;
  for (let offset = 0; offset < bytes.byteLength; offset += CHUNK) {
    const slice = bytes.subarray(
      offset,
      Math.min(offset + CHUNK, bytes.byteLength),
    );
    globalThis.crypto.getRandomValues(slice);
  }
  return bytes;
}

// NOTE: encryptChunked accepts File | Blob | ArrayBuffer | Uint8Array.
// jsdom's Blob.slice() does not implement .arrayBuffer(), so all tests use
// Uint8Array directly to exercise that code path without hitting the jsdom
// limitation. The "File input" test is an exception — it passes a tiny file
// whose single slice never exceeds the Blob.slice() limitation because we
// only test with small data sizes there.

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("streamingEncryption", () => {
  // -------------------------------------------------------------------------
  // writeDSE3Header / parseDSE3Header round-trip
  // -------------------------------------------------------------------------

  describe("writeDSE3Header / parseDSE3Header", () => {
    it("round-trips a header without an encrypted name", () => {
      const nonce = freshNonce();
      const headerBytes = writeDSE3Header(7, nonce, null);
      const parsed = parseDSE3Header(headerBytes);

      expect(parsed.version).toBe(C.DSE3_HEADER_VERSION);
      expect(parsed.chunkCount).toBe(7);
      expect(parsed.chunkPlaintextSize).toBe(C.CHUNK_PLAINTEXT_SIZE);
      expect(Array.from(parsed.fileNonce)).toEqual(Array.from(nonce));
      expect(parsed.encryptedName).toBeNull();
    });

    it("round-trips a header with an encrypted name", () => {
      const nonce = freshNonce();
      const fakeName = new Uint8Array([10, 20, 30, 40, 50]);
      const headerBytes = writeDSE3Header(3, nonce, fakeName);
      const parsed = parseDSE3Header(headerBytes);

      expect(parsed.encryptedName).not.toBeNull();
      expect(Array.from(parsed.encryptedName!)).toEqual(Array.from(fakeName));
    });

    it("sets the HAS_ENCRYPTED_NAME flag when name is present", () => {
      const nonce = freshNonce();
      const fakeName = new Uint8Array(12).fill(0xff);
      const headerBytes = writeDSE3Header(1, nonce, fakeName);
      const parsed = parseDSE3Header(headerBytes);

      // DSE3_FLAG_HAS_ENCRYPTED_NAME = 0x01
      expect(parsed.flags & 0x01).toBe(1);
    });

    it("clears the HAS_ENCRYPTED_NAME flag when name is absent", () => {
      const nonce = freshNonce();
      const headerBytes = writeDSE3Header(1, nonce, null);
      const parsed = parseDSE3Header(headerBytes);

      expect(parsed.flags & 0x01).toBe(0);
    });

    it("throws InvalidFormatError when magic bytes are wrong", () => {
      const nonce = freshNonce();
      const good = writeDSE3Header(1, nonce, null);
      // Corrupt first byte so it no longer reads 'DSE3'
      good[0] = 0x00;

      expect(() => parseDSE3Header(good)).toThrow(InvalidFormatError);
      expect(() => parseDSE3Header(good)).toThrow(/magic/);
    });

    it("throws InvalidFormatError when version byte is unsupported", () => {
      const nonce = freshNonce();
      const good = writeDSE3Header(1, nonce, null);
      // Version byte is at index 4
      good[4] = 0x99;

      expect(() => parseDSE3Header(good)).toThrow(InvalidFormatError);
      expect(() => parseDSE3Header(good)).toThrow(/version/);
    });

    it("throws InvalidFormatError when the data is too short for the fixed header", () => {
      const tooShort = new Uint8Array(C.DSE3_FIXED_HEADER_SIZE - 1);
      expect(() => parseDSE3Header(tooShort)).toThrow(InvalidFormatError);
    });

    it("throws InvalidFormatError when chunk size field is zero", () => {
      const nonce = freshNonce();
      const good = writeDSE3Header(1, nonce, null);
      // chunkPlaintextSize is a uint32BE starting at offset 7 — zero it out
      good[7] = 0;
      good[8] = 0;
      good[9] = 0;
      good[10] = 0;

      expect(() => parseDSE3Header(good)).toThrow(InvalidFormatError);
      expect(() => parseDSE3Header(good)).toThrow(/chunk size/);
    });

    it("getDSE3HeaderSize returns DSE3_FIXED_HEADER_SIZE when there is no encrypted name", () => {
      const nonce = freshNonce();
      const headerBytes = writeDSE3Header(2, nonce, null);
      const parsed = parseDSE3Header(headerBytes);

      expect(getDSE3HeaderSize(parsed)).toBe(C.DSE3_FIXED_HEADER_SIZE);
    });

    it("getDSE3HeaderSize adds the encrypted name length on top of the fixed part", () => {
      const nonce = freshNonce();
      const fakeName = new Uint8Array(37).fill(0x55);
      const headerBytes = writeDSE3Header(2, nonce, fakeName);
      const parsed = parseDSE3Header(headerBytes);

      expect(getDSE3HeaderSize(parsed)).toBe(C.DSE3_FIXED_HEADER_SIZE + 37);
    });
  });

  // -------------------------------------------------------------------------
  // isDSE3Format
  // -------------------------------------------------------------------------

  describe("isDSE3Format", () => {
    it("returns true for a valid DSE3 header blob", () => {
      const nonce = freshNonce();
      const headerBytes = writeDSE3Header(1, nonce, null);
      expect(isDSE3Format(headerBytes)).toBe(true);
    });

    it("returns true for a full encrypted blob produced by encryptChunked", async () => {
      const dek = generateDEK();
      const data = new Uint8Array(64).fill(0x42);
      const blob = await encryptChunked(data, dek, null);
      const bytes = await blobToUint8Array(blob);
      expect(isDSE3Format(bytes)).toBe(true);
    });

    it("returns false for random bytes whose first byte is not 0x44", () => {
      const random = globalThis.crypto.getRandomValues(new Uint8Array(64));
      // 0x44 = 'D' — force it away
      random[0] = 0x00;
      expect(isDSE3Format(random)).toBe(false);
    });

    it("returns false for data shorter than 4 bytes", () => {
      expect(isDSE3Format(new Uint8Array(3))).toBe(false);
      expect(isDSE3Format(new Uint8Array(0))).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // encryptChunked / decryptChunked round-trips
  // -------------------------------------------------------------------------

  describe("encryptChunked / decryptChunked", () => {
    it("round-trips 0 bytes (empty input)", async () => {
      const dek = generateDEK();
      const data = new Uint8Array(0);

      const encBlob = await encryptChunked(data, dek, null);
      const encBytes = await blobToUint8Array(encBlob);
      const header = parseDSE3Header(encBytes);
      const decBlob = await decryptChunked(
        encBytes,
        dek,
        header,
        getDSE3HeaderSize(header),
      );

      expect((await blobToUint8Array(decBlob)).byteLength).toBe(0);
    });

    it("round-trips a small buffer (1 KB, single chunk)", async () => {
      const dek = generateDEK();
      const plaintext = globalThis.crypto.getRandomValues(
        new Uint8Array(1_024),
      );

      const encBlob = await encryptChunked(plaintext, dek, null);
      const encBytes = await blobToUint8Array(encBlob);
      const header = parseDSE3Header(encBytes);

      expect(header.chunkCount).toBe(1);

      const decBlob = await decryptChunked(
        encBytes,
        dek,
        header,
        getDSE3HeaderSize(header),
      );

      expect(bytesEqual(await blobToUint8Array(decBlob), plaintext)).toBe(true);
    });

    it("round-trips exactly 1 MB (single boundary chunk)", async () => {
      const dek = generateDEK();
      const plaintext = fillRandom(new Uint8Array(C.CHUNK_PLAINTEXT_SIZE));

      const encBlob = await encryptChunked(plaintext, dek, null);
      const encBytes = await blobToUint8Array(encBlob);
      const header = parseDSE3Header(encBytes);

      expect(header.chunkCount).toBe(1);

      const decBlob = await decryptChunked(
        encBytes,
        dek,
        header,
        getDSE3HeaderSize(header),
      );
      expect(bytesEqual(await blobToUint8Array(decBlob), plaintext)).toBe(true);
    });

    it("round-trips 1.5 MB (two chunks — one full and one partial)", async () => {
      const dek = generateDEK();
      const plaintext = fillRandom(
        new Uint8Array(Math.floor(C.CHUNK_PLAINTEXT_SIZE * 1.5)),
      );

      const encBlob = await encryptChunked(plaintext, dek, null);
      const encBytes = await blobToUint8Array(encBlob);
      const header = parseDSE3Header(encBytes);

      expect(header.chunkCount).toBe(2);

      const decBlob = await decryptChunked(
        encBytes,
        dek,
        header,
        getDSE3HeaderSize(header),
      );
      expect(bytesEqual(await blobToUint8Array(decBlob), plaintext)).toBe(true);
    });

    it("round-trips an ArrayBuffer input", async () => {
      const dek = generateDEK();
      const plaintext = globalThis.crypto.getRandomValues(
        new Uint8Array(512),
      );
      // Pass the underlying ArrayBuffer directly
      const input: ArrayBuffer = plaintext.buffer.slice(
        plaintext.byteOffset,
        plaintext.byteOffset + plaintext.byteLength,
      ) as ArrayBuffer;

      const encBlob = await encryptChunked(input, dek, null);
      const encBytes = await blobToUint8Array(encBlob);
      const header = parseDSE3Header(encBytes);

      const decBlob = await decryptChunked(
        encBytes,
        dek,
        header,
        getDSE3HeaderSize(header),
      );
      expect(bytesEqual(await blobToUint8Array(decBlob), plaintext)).toBe(true);
    });

    it("throws DecryptionError when a byte inside the ciphertext is tampered", async () => {
      const dek = generateDEK();
      const plaintext = globalThis.crypto.getRandomValues(
        new Uint8Array(2_048),
      );

      const encBlob = await encryptChunked(plaintext, dek, null);
      const tampered = (await blobToUint8Array(encBlob)).slice();

      // Flip a byte in the ciphertext area of chunk 0
      // (after DSE3 fixed header + chunk IV, well before the GCM tag)
      const chunkDataStart = C.DSE3_FIXED_HEADER_SIZE + C.AES_GCM_IV_SIZE + 4;
      tampered[chunkDataStart] ^= 0xff;

      const header = parseDSE3Header(tampered);

      await expect(
        decryptChunked(tampered, dek, header, getDSE3HeaderSize(header)),
      ).rejects.toThrow(DecryptionError);
    });

    it("throws DecryptionError when the wrong DEK is supplied", async () => {
      const dek = generateDEK();
      const wrongDek = generateDEK();
      const data = new Uint8Array(256).fill(0xab);

      const encBlob = await encryptChunked(data, dek, null);
      const encBytes = await blobToUint8Array(encBlob);
      const header = parseDSE3Header(encBytes);

      await expect(
        decryptChunked(encBytes, wrongDek, header, getDSE3HeaderSize(header)),
      ).rejects.toThrow(DecryptionError);
    });

    it("fires the progress callback monotonically and ends at 1.0", async () => {
      const dek = generateDEK();
      // 3 full chunks
      const data = fillRandom(new Uint8Array(3 * C.CHUNK_PLAINTEXT_SIZE));

      const encProgress: number[] = [];
      const encBlob = await encryptChunked(data, dek, null, (p) =>
        encProgress.push(p),
      );

      expect(encProgress).toHaveLength(3);
      expect(encProgress[encProgress.length - 1]).toBe(1);
      for (let i = 1; i < encProgress.length; i++) {
        expect(encProgress[i]).toBeGreaterThan(encProgress[i - 1]);
      }

      const encBytes = await blobToUint8Array(encBlob);
      const header = parseDSE3Header(encBytes);

      const decProgress: number[] = [];
      await decryptChunked(
        encBytes,
        dek,
        header,
        getDSE3HeaderSize(header),
        (p) => decProgress.push(p),
      );

      expect(decProgress).toHaveLength(3);
      expect(decProgress[decProgress.length - 1]).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // estimateEncryptedSize
  // -------------------------------------------------------------------------

  describe("estimateEncryptedSize", () => {
    it("always returns a value larger than the original size", () => {
      expect(estimateEncryptedSize(100)).toBeGreaterThan(100);
      expect(estimateEncryptedSize(0)).toBeGreaterThan(0);
      expect(estimateEncryptedSize(5 * 1024 * 1024)).toBeGreaterThan(
        5 * 1024 * 1024,
      );
    });

    it("single-chunk estimate = DSE3_FIXED_HEADER_SIZE + CHUNK_OVERHEAD + originalSize", () => {
      const CHUNK_OVERHEAD = C.AES_GCM_IV_SIZE + 16; // IV (12) + GCM tag (16)
      const originalSize = 100;
      expect(estimateEncryptedSize(originalSize)).toBe(
        C.DSE3_FIXED_HEADER_SIZE + CHUNK_OVERHEAD + originalSize,
      );
    });

    it("multi-chunk estimate adds one CHUNK_OVERHEAD per chunk", () => {
      const CHUNK_OVERHEAD = C.AES_GCM_IV_SIZE + 16;
      // 2 * CHUNK_PLAINTEXT_SIZE + 1 byte → 3 chunks
      const originalSize = 2 * C.CHUNK_PLAINTEXT_SIZE + 1;
      expect(estimateEncryptedSize(originalSize)).toBe(
        C.DSE3_FIXED_HEADER_SIZE + 3 * CHUNK_OVERHEAD + originalSize,
      );
    });

    it("zero-byte input still allocates one chunk slot", () => {
      const CHUNK_OVERHEAD = C.AES_GCM_IV_SIZE + 16;
      expect(estimateEncryptedSize(0)).toBe(
        C.DSE3_FIXED_HEADER_SIZE + CHUNK_OVERHEAD,
      );
    });
  });
});
