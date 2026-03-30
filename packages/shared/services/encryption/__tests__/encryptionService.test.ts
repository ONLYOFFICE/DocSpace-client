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
  encryptFile,
  decryptFile,
  encryptFileName,
  decryptFileName,
} from "../encryptionService";
import { generateDEK } from "../keyManagement";
import { DecryptionError } from "../errors";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/** Compare two byte arrays for equality. */
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

// NOTE: encryptFile accepts File | Blob | ArrayBuffer | Uint8Array.
// jsdom's Blob.slice() does not implement .arrayBuffer(), so we pass
// Uint8Array directly in all tests to exercise the Uint8Array code path
// and avoid hitting that jsdom limitation.

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("encryptionService", () => {
  // -------------------------------------------------------------------------
  // encryptFile / decryptFile — round-trips
  // -------------------------------------------------------------------------

  describe("encryptFile / decryptFile", () => {
    it("round-trips a small file (100 bytes)", async () => {
      const plaintext = globalThis.crypto.getRandomValues(new Uint8Array(100));
      const dek = generateDEK();

      const { encryptedBlob } = await encryptFile(plaintext, { dek });
      const encryptedBytes = await blobToUint8Array(encryptedBlob);
      const { data } = await decryptFile(encryptedBytes, dek);
      const decryptedBytes = await blobToUint8Array(data);

      expect(bytesEqual(decryptedBytes, plaintext)).toBe(true);
    });

    it("encrypted blob is larger than the original plaintext", async () => {
      const plaintext = new Uint8Array(100).fill(0xab);
      const dek = generateDEK();

      const { encryptedBlob } = await encryptFile(plaintext, { dek });
      expect(encryptedBlob.size).toBeGreaterThan(plaintext.byteLength);
    });

    it("round-trips a larger file (2 MB — spans multiple 1 MB chunks)", async () => {
      const plaintext = fillRandom(new Uint8Array(2 * 1024 * 1024));
      const dek = generateDEK();

      const { encryptedBlob } = await encryptFile(plaintext, { dek });
      const encryptedBytes = await blobToUint8Array(encryptedBlob);
      const { data } = await decryptFile(encryptedBytes, dek);
      const decryptedBytes = await blobToUint8Array(data);

      expect(bytesEqual(decryptedBytes, plaintext)).toBe(true);
    });

    it("encryptFile with fileName option — decryptFile recovers the file name", async () => {
      const dek = generateDEK();
      const plaintext = new Uint8Array(50).fill(0x01);

      const { encryptedBlob } = await encryptFile(plaintext, {
        dek,
        fileName: "document.pdf",
      });
      const encryptedBytes = await blobToUint8Array(encryptedBlob);
      const { fileName } = await decryptFile(encryptedBytes, dek);

      expect(fileName).toBe("document.pdf");
    });

    it("encryptFile without fileName option — decryptFile returns null fileName", async () => {
      const dek = generateDEK();
      const plaintext = new Uint8Array(50).fill(0x02);

      const { encryptedBlob } = await encryptFile(plaintext, { dek });
      const encryptedBytes = await blobToUint8Array(encryptedBlob);
      const { fileName } = await decryptFile(encryptedBytes, dek);

      expect(fileName).toBeNull();
    });

    it("decryptFile with the wrong DEK throws DecryptionError", async () => {
      const dek = generateDEK();
      const wrongDek = generateDEK();
      const plaintext = new Uint8Array(100).fill(0x03);

      const { encryptedBlob } = await encryptFile(plaintext, { dek });
      const encryptedBytes = await blobToUint8Array(encryptedBlob);

      await expect(decryptFile(encryptedBytes, wrongDek)).rejects.toThrow(
        DecryptionError,
      );
    });

    it("round-trips an empty file (0 bytes)", async () => {
      const dek = generateDEK();
      const plaintext = new Uint8Array(0);

      const { encryptedBlob } = await encryptFile(plaintext, { dek });
      const encryptedBytes = await blobToUint8Array(encryptedBlob);
      const { data } = await decryptFile(encryptedBytes, dek);
      const decryptedBytes = await blobToUint8Array(data);

      expect(decryptedBytes.byteLength).toBe(0);
    });

    it("decryptFile rejects data that does not start with DSE3 magic", async () => {
      const dek = generateDEK();
      // Guaranteed not-DSE3: first byte is 0x00, not 0x44 ('D')
      const notDse3 = new Uint8Array(200).fill(0xaa);
      notDse3[0] = 0x00;

      await expect(decryptFile(notDse3, dek)).rejects.toThrow(DecryptionError);
    });

    it("generates a fresh DEK when none is supplied via options", async () => {
      const plaintext = new Uint8Array(64).fill(0xcc);

      const r1 = await encryptFile(plaintext);
      const r2 = await encryptFile(plaintext);

      // Two independent DEKs must differ
      expect(Array.from(r1.dek)).not.toEqual(Array.from(r2.dek));
    });

    it("returns the same DEK that was passed in via options", async () => {
      const dek = generateDEK();
      const plaintext = new Uint8Array(32).fill(0x01);

      const { dek: returnedDek } = await encryptFile(plaintext, { dek });

      expect(Array.from(returnedDek)).toEqual(Array.from(dek));
    });

    it("progress callback receives values that reach 1.0 in monotone order", async () => {
      const dek = generateDEK();
      // 2.5 MB — spans 3 chunks (1 MB each), so progress fires 3 times
      const plaintext = fillRandom(
        new Uint8Array(Math.floor(2.5 * 1024 * 1024)),
      );
      const progressValues: number[] = [];

      const { encryptedBlob } = await encryptFile(plaintext, {
        dek,
        onProgress: (p) => progressValues.push(p),
      });

      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[progressValues.length - 1]).toBe(1);
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }

      // Sanity check: decryption still recovers original data
      const encryptedBytes = await blobToUint8Array(encryptedBlob);
      const { data } = await decryptFile(encryptedBytes, dek);
      const decryptedBytes = await blobToUint8Array(data);
      expect(bytesEqual(decryptedBytes, plaintext)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // encryptFileName / decryptFileName
  // -------------------------------------------------------------------------

  describe("encryptFileName / decryptFileName", () => {
    it("round-trips a typical file name", async () => {
      const dek = generateDEK();
      const name = "quarterly-report-2025.xlsx";

      const enc = await encryptFileName(name, dek);
      const dec = await decryptFileName(enc, dek);

      expect(dec).toBe(name);
    });

    it("round-trips a file name with unicode characters", async () => {
      const dek = generateDEK();
      const name = "отчёт-Q4-документ.docx";

      const enc = await encryptFileName(name, dek);
      const dec = await decryptFileName(enc, dek);

      expect(dec).toBe(name);
    });

    it("round-trips an empty file name string", async () => {
      const dek = generateDEK();

      const enc = await encryptFileName("", dek);
      const dec = await decryptFileName(enc, dek);

      expect(dec).toBe("");
    });

    it("produces a base64 string (no whitespace, valid alphabet)", async () => {
      const dek = generateDEK();
      const enc = await encryptFileName("test.txt", dek);

      // Standard base64: A-Z, a-z, 0-9, +, /, optional = padding
      expect(enc).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it("produces different ciphertext on each call due to random IV", async () => {
      const dek = generateDEK();
      const enc1 = await encryptFileName("same.txt", dek);
      const enc2 = await encryptFileName("same.txt", dek);
      expect(enc1).not.toBe(enc2);
    });

    it("decryptFileName with the wrong DEK throws DecryptionError", async () => {
      const dek = generateDEK();
      const wrongDek = generateDEK();

      const enc = await encryptFileName("secret.txt", dek);

      await expect(decryptFileName(enc, wrongDek)).rejects.toThrow(
        DecryptionError,
      );
    });
  });
});
