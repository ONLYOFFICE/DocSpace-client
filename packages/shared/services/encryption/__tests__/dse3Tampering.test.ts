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

// Per-chunk AAD covers suite byte, fileNonce, chunkCount, chunkIndex, and
// lastFlag. Tampering with any of those must fail AEAD authentication.
import { describe, it, expect } from "vitest";

import {
  encryptChunked,
  decryptChunked,
  parseDSE3Header,
  getDSE3HeaderSize,
} from "../streamingEncryption";
import { encryptFile, decryptFile, generateDEK } from "../fileKeys";
import { DecryptionError, InvalidFormatError } from "../errors";
import {
  AES_GCM_IV_SIZE,
  AES_GCM_TAG_SIZE,
  DSE3_CHUNK_PLAINTEXT_SIZE,
  DSE3_FIXED_HEADER_SIZE,
} from "../types";

const CHUNK_OVERHEAD = AES_GCM_IV_SIZE + AES_GCM_TAG_SIZE;
const CHUNK_TOTAL_SIZE = DSE3_CHUNK_PLAINTEXT_SIZE + CHUNK_OVERHEAD;

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

function fillRandom(bytes: Uint8Array): Uint8Array {
  const CHUNK = 65536;
  for (let off = 0; off < bytes.byteLength; off += CHUNK) {
    const slice = bytes.subarray(off, Math.min(off + CHUNK, bytes.byteLength));
    globalThis.crypto.getRandomValues(slice);
  }
  return bytes;
}

async function encryptN(
  dek: Uint8Array,
  chunkCount: number,
): Promise<Uint8Array> {
  const data = fillRandom(
    new Uint8Array(DSE3_CHUNK_PLAINTEXT_SIZE * chunkCount),
  );
  const blob = await encryptChunked(data, dek, null);
  return blobToUint8Array(blob);
}

describe("DSE3 v2 tamper tests — AAD binding", () => {
  it("rejects swapped chunks (chunkIndex mismatch in AAD)", async () => {
    const dek = generateDEK();
    const encBytes = await encryptN(dek, 2);
    const header = parseDSE3Header(encBytes);
    expect(header.chunkCount).toBe(2);

    const headerSize = getDSE3HeaderSize(header);
    // Swap chunk 0 with chunk 1 - each chunk owns its IV and tag in place.
    const tampered = new Uint8Array(encBytes);
    const c0 = tampered.slice(headerSize, headerSize + CHUNK_TOTAL_SIZE);
    const c1 = tampered.slice(
      headerSize + CHUNK_TOTAL_SIZE,
      headerSize + 2 * CHUNK_TOTAL_SIZE,
    );
    tampered.set(c1, headerSize);
    tampered.set(c0, headerSize + CHUNK_TOTAL_SIZE);

    await expect(
      decryptChunked(tampered, dek, header, headerSize),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it("rejects replay of a chunk from a different file (fileNonce mismatch)", async () => {
    const dek = generateDEK();

    // Same DEK, two encryptions → different fileNonce per file.
    const encA = await encryptN(dek, 1);
    const encB = await encryptN(dek, 1);
    const headerA = parseDSE3Header(encA);
    const headerSize = getDSE3HeaderSize(headerA);

    // Replace chunk 0 of A with chunk 0 of B. AAD includes fileNonce
    // (still A's, taken from the header), so authentication must fail.
    const tampered = new Uint8Array(encA);
    const chunkB0 = encB.slice(headerSize, headerSize + CHUNK_TOTAL_SIZE);
    tampered.set(chunkB0, headerSize);

    await expect(
      decryptChunked(tampered, dek, headerA, headerSize),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it("rejects header-side chunkCount tampering", async () => {
    const dek = generateDEK();
    const encBytes = await encryptN(dek, 2);
    const tampered = new Uint8Array(encBytes);

    // chunkCount lives at offset 11..14 (big-endian u32) - see writeDSE3Header.
    // Bumping it to 3 makes the AAD claim 3 chunks while the encryption
    // used 2; lastFlag for chunk 1 would also flip, so the second chunk
    // must fail to decrypt.
    tampered[11] = 0;
    tampered[12] = 0;
    tampered[13] = 0;
    tampered[14] = 3;

    const tamperedHeader = parseDSE3Header(tampered);
    const headerSize = getDSE3HeaderSize(tamperedHeader);

    await expect(
      decryptChunked(tampered, dek, tamperedHeader, headerSize),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it("rejects fileNonce tampering in the header", async () => {
    const dek = generateDEK();
    const encBytes = await encryptN(dek, 1);
    const tampered = new Uint8Array(encBytes);

    // fileNonce starts at offset 15 in the fixed header - flip a byte.
    tampered[15] ^= 0xff;

    const tamperedHeader = parseDSE3Header(tampered);
    const headerSize = getDSE3HeaderSize(tamperedHeader);

    await expect(
      decryptChunked(tampered, dek, tamperedHeader, headerSize),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it("rejects tampered AES-GCM tag bytes (last 16 bytes of a chunk)", async () => {
    const dek = generateDEK();
    const encBytes = await encryptN(dek, 1);
    const header = parseDSE3Header(encBytes);
    const headerSize = getDSE3HeaderSize(header);

    const tampered = new Uint8Array(encBytes);
    // The tag is the final AES_GCM_TAG_SIZE bytes of the chunk.
    const tagOffset = tampered.byteLength - 1;
    tampered[tagOffset] ^= 0x01;

    await expect(
      decryptChunked(tampered, dek, header, headerSize),
    ).rejects.toBeInstanceOf(DecryptionError);
  });

  it("rejects truncated ciphertext (final chunk dropped)", async () => {
    const dek = generateDEK();
    const encBytes = await encryptN(dek, 2);
    const header = parseDSE3Header(encBytes);
    const headerSize = getDSE3HeaderSize(header);

    // Drop the last full chunk. chunkCount in the header still says 2,
    // so decryptChunked tries to read past the end (or the second
    // chunk's IV/tag bytes are missing) → must fail.
    const truncated = encBytes.slice(0, headerSize + CHUNK_TOTAL_SIZE);

    await expect(
      decryptChunked(truncated, dek, header, headerSize),
    ).rejects.toThrow();
  });

  it("rejects tampered encrypted filename (header bit flip)", async () => {
    const dek = generateDEK();
    // Pass Uint8Array (not File) so we don't trip over jsdom's missing
    // Blob.slice().arrayBuffer() - see streamingEncryption.test.ts header.
    const { encryptedBlob } = await encryptFile(new Uint8Array([1, 2, 3]), {
      dek,
      fileName: "report.docx",
    });
    const encBytes = await blobToUint8Array(encryptedBlob);

    // Flip a byte in the encryptedName region (right after fixed header).
    const tampered = new Uint8Array(encBytes);
    tampered[DSE3_FIXED_HEADER_SIZE] ^= 0x01;

    await expect(decryptFile(tampered, dek)).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it("rejects nameLen mismatch — claim a name that isn't there", async () => {
    const dek = generateDEK();
    // Encrypt without a name.
    const encBlob = await encryptChunked(new Uint8Array(64), dek, null);
    const encBytes = new Uint8Array(await blobToUint8Array(encBlob));
    const tampered = new Uint8Array(encBytes);

    // nameLen lives at offset 15 + DSE3_FILE_NONCE_SIZE (= 31), big-endian u16.
    tampered[31] = 0;
    tampered[32] = 16; // pretend there are 16 bytes of encrypted name

    // The flag-vs-nameLen consistency check in parseDSE3Header should reject.
    expect(() => parseDSE3Header(tampered)).toThrow(InvalidFormatError);
  });

  it("rejects nameLen claimed but truncated body (data too short)", async () => {
    const dek = generateDEK();
    const { encryptedBlob } = await encryptFile(new Uint8Array([1, 2]), {
      dek,
      fileName: "x.txt",
    });
    const encBytes = await blobToUint8Array(encryptedBlob);

    // Real nameLen lives at offset 31 (big-endian u16). Bump it well past
    // the actual encrypted-name field so the parser tries to read past
    // the end of the buffer.
    const tampered = new Uint8Array(encBytes);
    tampered[31] = 0xff;
    tampered[32] = 0xff;

    expect(() => parseDSE3Header(tampered)).toThrow(InvalidFormatError);
  });
});
