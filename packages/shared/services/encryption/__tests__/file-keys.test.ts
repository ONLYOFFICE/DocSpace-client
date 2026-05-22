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

import { describe, it, expect } from "vitest";

import { generateDEK, encryptFile, decryptFile } from "../file-keys";
import { DecryptionError } from "../errors";
import { AES_KEY_SIZE_BYTES } from "../types";

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

describe("fileKeys", () => {
  describe("generateDEK", () => {
    it("returns 32 random bytes", () => {
      const a = generateDEK();
      const b = generateDEK();
      expect(a.byteLength).toBe(AES_KEY_SIZE_BYTES);
      expect(b.byteLength).toBe(AES_KEY_SIZE_BYTES);
      expect(a).not.toEqual(b);
    });
  });

  describe("encryptFile / decryptFile", () => {
    it("round-trips a small Uint8Array without filename", async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const { encryptedBlob, dek } = await encryptFile(data);
      expect(dek.byteLength).toBe(AES_KEY_SIZE_BYTES);

      const encBytes = await blobToUint8Array(encryptedBlob);
      const result = await decryptFile(encBytes, dek);
      const back = await blobToUint8Array(result.data);

      expect(back).toEqual(data);
      expect(result.fileName).toBeNull();
    });

    it("round-trips with filename in DSE3 header", async () => {
      const data = new Uint8Array(2_000).fill(0x42);
      const { encryptedBlob, dek } = await encryptFile(data, {
        fileName: "secret-report.pdf",
      });

      const encBytes = await blobToUint8Array(encryptedBlob);
      const result = await decryptFile(encBytes, dek);

      expect(result.fileName).toBe("secret-report.pdf");
      const back = await blobToUint8Array(result.data);
      expect(back).toEqual(data);
    });

    it("round-trips a Unicode filename (NFC-normalized)", async () => {
      const data = new Uint8Array(64).fill(0xab);
      const fname = "Отчёт-2026.docx";
      const { encryptedBlob, dek } = await encryptFile(data, {
        fileName: fname,
      });
      const encBytes = await blobToUint8Array(encryptedBlob);
      const result = await decryptFile(encBytes, dek);
      expect(result.fileName).toBe(fname.normalize("NFC"));
    });

    it("rejects decryption with wrong DEK", async () => {
      const data = new Uint8Array(128);
      const { encryptedBlob } = await encryptFile(data, {
        fileName: "x.txt",
      });
      const wrongDek = generateDEK();
      const encBytes = await blobToUint8Array(encryptedBlob);
      await expect(decryptFile(encBytes, wrongDek)).rejects.toBeInstanceOf(
        DecryptionError,
      );
    });

    it("rejects decryption when ciphertext is tampered", async () => {
      const data = new Uint8Array(256).fill(0xcc);
      const { encryptedBlob, dek } = await encryptFile(data);
      const encBytes = await blobToUint8Array(encryptedBlob);
      // Flip a byte well past the header in the ciphertext region.
      encBytes[100] ^= 0xff;
      await expect(decryptFile(encBytes, dek)).rejects.toBeInstanceOf(
        DecryptionError,
      );
    });

    it("rejects when the input is not DSE3", async () => {
      const not_dse3 = new Uint8Array(64).fill(0xaa);
      const dek = generateDEK();
      await expect(decryptFile(not_dse3, dek)).rejects.toBeInstanceOf(
        DecryptionError,
      );
    });

    it("filename-only-tamper fails (filename AAD binding to fileNonce)", async () => {
      const data = new Uint8Array(64).fill(0x11);
      const { encryptedBlob, dek } = await encryptFile(data, {
        fileName: "a.txt",
      });
      const encBytes = await blobToUint8Array(encryptedBlob);

      // Find a byte inside the encryptedName field (between fixed header
      // and first chunk IV) and flip it. The exact offset depends on the
      // header layout, but it's somewhere after offset 33 and before the
      // first chunk IV (which starts after the encryptedName).
      // Header layout: [33-byte fixed header][encryptedName(?)][chunks].
      // We flip byte 35 - inside encryptedName for non-empty names.
      encBytes[35] ^= 0x80;
      await expect(decryptFile(encBytes, dek)).rejects.toBeInstanceOf(
        DecryptionError,
      );
    });
  });
});
