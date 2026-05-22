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

import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsType } from "../../../enums";
import {
  assertEncryptedUploadName,
  createEncryptedFormData,
  estimateEncryptedUploadSize,
  isEncryptableRoomType,
  prepareEncryptedUpload,
  prepareMultipleEncryptedUploads,
  shouldEncryptUpload,
} from "../encrypted-upload";
import { AES_KEY_SIZE_BYTES } from "../../encryption/types";

// Mocked to bypass jsdom's broken Blob.slice().arrayBuffer().
vi.mock("../../encryption/file-keys", () => ({
  encryptFile: vi.fn(
    async (
      _data: File | Blob | Uint8Array,
      opts: { onProgress?: (p: number) => void } = {},
    ) => {
      opts.onProgress?.(0.5);
      opts.onProgress?.(1);
      return {
        encryptedBlob: new Blob([new Uint8Array(64)]),
        dek: new Uint8Array(AES_KEY_SIZE_BYTES),
      };
    },
  ),
}));

const makeFile = (
  name: string,
  bytes: number,
  type: string = "application/octet-stream",
): File => {
  return new File([new Uint8Array(bytes).fill(0x42)], name, { type });
};

describe("encryptedUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isEncryptableRoomType / shouldEncryptUpload", () => {
    const allTypes: Array<{ name: keyof typeof RoomsType; value: RoomsType }> =
      [
        { name: "AIRoom", value: RoomsType.AIRoom },
        { name: "PublicRoom", value: RoomsType.PublicRoom },
        { name: "FormRoom", value: RoomsType.FormRoom },
        { name: "EditingRoom", value: RoomsType.EditingRoom },
        { name: "VirtualDataRoom", value: RoomsType.VirtualDataRoom },
        { name: "CustomRoom", value: RoomsType.CustomRoom },
      ];

    it("treats only CustomRoom as encryptable", () => {
      for (const t of allTypes) {
        expect(isEncryptableRoomType(t.value)).toBe(t.name === "CustomRoom");
      }
    });

    it("shouldEncryptUpload requires BOTH CustomRoom AND isPrivate", () => {
      for (const t of allTypes) {
        expect(shouldEncryptUpload(t.value, false)).toBe(false);
        expect(shouldEncryptUpload(t.value, true)).toBe(
          t.name === "CustomRoom",
        );
      }
    });

    it("shouldEncryptUpload defaults isPrivate to false", () => {
      expect(shouldEncryptUpload(RoomsType.CustomRoom)).toBe(false);
    });
  });

  describe("prepareEncryptedUpload — passthrough branch", () => {
    it("returns the original file unchanged for non-encryptable rooms", async () => {
      const file = makeFile("doc.pdf", 16, "application/pdf");
      const result = await prepareEncryptedUpload({
        file,
        folderId: 0,
        roomType: RoomsType.PublicRoom,
        isPrivate: true,
      });

      expect(result.encrypted).toBe(false);
      expect(result.dek).toBeNull();
      expect(result.uploadFileName).toBe("doc.pdf");
      expect(result.data).toBe(file);
      expect(result.originalFileName).toBe("doc.pdf");
      expect(result.originalFileType).toBe("application/pdf");
      expect(result.originalFileSize).toBe(16);
    });

    it("returns passthrough for CustomRoom without isPrivate", async () => {
      const file = makeFile("doc.pdf", 8);
      const result = await prepareEncryptedUpload({
        file,
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: false,
      });
      expect(result.encrypted).toBe(false);
      expect(result.dek).toBeNull();
      expect(result.data).toBe(file);
    });

    it("falls back originalFileType to octet-stream when MIME is missing", async () => {
      const file = makeFile("doc.unknown", 8, "");
      const result = await prepareEncryptedUpload({
        file,
        folderId: 0,
        roomType: RoomsType.PublicRoom,
      });
      expect(result.originalFileType).toBe("application/octet-stream");
    });
  });

  describe("prepareEncryptedUpload — encrypted branch", () => {
    it("encrypts in CustomRoom + isPrivate and obfuscates the upload name", async () => {
      const file = makeFile("Q4-Report.docx", 2048);
      const result = await prepareEncryptedUpload({
        file,
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      });

      expect(result.encrypted).toBe(true);
      expect(result.dek).not.toBeNull();
      expect(result.dek?.byteLength).toBe(AES_KEY_SIZE_BYTES);
      expect(result.uploadFileName).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.docx$/i,
      );
      expect(result.originalFileName).toBe("Q4-Report.docx");
      expect(result.originalFileSize).toBe(2048);
      expect(result.data).not.toBe(file);
    });

    it("preserves the extension exactly (including case via getFileExtension)", async () => {
      const file = makeFile("report.PDF", 512);
      const result = await prepareEncryptedUpload({
        file,
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      });
      expect(result.uploadFileName.endsWith(".pdf")).toBe(true);
    });

    it("emits a different UUID each call (no fixed seed leak)", async () => {
      const f1 = makeFile("a.txt", 8);
      const f2 = makeFile("b.txt", 8);
      const r1 = await prepareEncryptedUpload({
        file: f1,
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      });
      const r2 = await prepareEncryptedUpload({
        file: f2,
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      });
      expect(r1.uploadFileName).not.toBe(r2.uploadFileName);
    });

    it("handles files without an extension", async () => {
      const file = makeFile("Makefile", 16);
      const result = await prepareEncryptedUpload({
        file,
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      });
      expect(result.uploadFileName).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("forwards onProgress through to encryptFile", async () => {
      const progress: number[] = [];
      await prepareEncryptedUpload({
        file: makeFile("a.txt", 16),
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
        onProgress: (p) => progress.push(p),
      });
      expect(progress).toEqual([0.5, 1]);
    });
  });

  describe("assertEncryptedUploadName", () => {
    it("accepts uuid + lowercase extension", () => {
      expect(() =>
        assertEncryptedUploadName(
          "12345678-1234-1234-1234-123456789abc.docx",
        ),
      ).not.toThrow();
    });

    it("accepts uuid with no extension", () => {
      expect(() =>
        assertEncryptedUploadName("12345678-1234-1234-1234-123456789abc"),
      ).not.toThrow();
    });

    it("accepts alphanumeric extensions like .mp4 / .7z", () => {
      expect(() =>
        assertEncryptedUploadName(
          "12345678-1234-1234-1234-123456789abc.mp4",
        ),
      ).not.toThrow();
      expect(() =>
        assertEncryptedUploadName(
          "12345678-1234-1234-1234-123456789abc.7z",
        ),
      ).not.toThrow();
    });

    it("rejects plaintext filenames", () => {
      expect(() => assertEncryptedUploadName("Q4-Report.docx")).toThrow(
        /UUID format/,
      );
    });

    it("rejects uppercase hex in the uuid", () => {
      expect(() =>
        assertEncryptedUploadName(
          "12345678-1234-1234-1234-123456789ABC.docx",
        ),
      ).toThrow();
    });

    it("rejects uppercase extensions (getFileExtension lowercases — uppercase indicates a regression)", () => {
      expect(() =>
        assertEncryptedUploadName(
          "12345678-1234-1234-1234-123456789abc.DOCX",
        ),
      ).toThrow();
    });

    it("rejects extra path segments / directory traversal", () => {
      expect(() =>
        assertEncryptedUploadName(
          "../12345678-1234-1234-1234-123456789abc.docx",
        ),
      ).toThrow();
      expect(() =>
        assertEncryptedUploadName(
          "12345678-1234-1234-1234-123456789abc/file.docx",
        ),
      ).toThrow();
    });

    it("rejects empty string", () => {
      expect(() => assertEncryptedUploadName("")).toThrow();
    });

    it("is wired into prepareEncryptedUpload (smoke)", async () => {
      const file = makeFile("normal.txt", 4);
      const result = await prepareEncryptedUpload({
        file,
        folderId: 0,
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      });
      expect(() =>
        assertEncryptedUploadName(result.uploadFileName),
      ).not.toThrow();
    });
  });

  describe("createEncryptedFormData", () => {
    it("sets `encrypted=true` ONLY when the prepared upload is encrypted", () => {
      const enc = createEncryptedFormData({
        data: new Blob(["x"]),
        encrypted: true,
        dek: new Uint8Array(32),
        uploadFileName: "abc.docx",
        originalFileType: "application/x-doc",
        originalFileSize: 1,
        originalFileName: "real.docx",
      });
      expect(enc.get("encrypted")).toBe("true");
      const blob = enc.get("file") as File;
      expect(blob.name).toBe("abc.docx");

      const plain = createEncryptedFormData({
        data: new Blob(["x"]),
        encrypted: false,
        dek: null,
        uploadFileName: "real.txt",
        originalFileType: "text/plain",
        originalFileSize: 1,
        originalFileName: "real.txt",
      });
      expect(plain.get("encrypted")).toBeNull();
    });

    it("appends additional form fields verbatim", () => {
      const fd = createEncryptedFormData(
        {
          data: new Blob(["x"]),
          encrypted: true,
          dek: new Uint8Array(32),
          uploadFileName: "u.txt",
          originalFileType: "text/plain",
          originalFileSize: 1,
          originalFileName: "u.txt",
        },
        { folderId: "42", relativePath: "sub/" },
      );
      expect(fd.get("folderId")).toBe("42");
      expect(fd.get("relativePath")).toBe("sub/");
    });
  });

  describe("prepareMultipleEncryptedUploads", () => {
    it("calls onFileProgress with the correct file index per file", async () => {
      const files = [
        makeFile("a.txt", 128),
        makeFile("b.txt", 128),
        makeFile("c.txt", 128),
      ];
      const calls: Array<[number, number]> = [];
      await prepareMultipleEncryptedUploads(
        files,
        RoomsType.CustomRoom,
        true,
        (idx, progress) => {
          calls.push([idx, progress]);
        },
      );

      expect(calls).toHaveLength(6);
      const indices = new Set(calls.map(([i]) => i));
      expect(indices).toEqual(new Set([0, 1, 2]));
      for (const [idx] of calls) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(files.length);
      }
    });

    it("produces a PreparedUpload per input file, in order", async () => {
      const files = [makeFile("a.txt", 8), makeFile("b.txt", 8)];
      const results = await prepareMultipleEncryptedUploads(
        files,
        RoomsType.PublicRoom,
        false,
      );
      expect(results).toHaveLength(2);
      expect(results[0].originalFileName).toBe("a.txt");
      expect(results[1].originalFileName).toBe("b.txt");
    });
  });

  describe("estimateEncryptedUploadSize", () => {
    it("returns the sum of per-file estimates", () => {
      const files = [
        makeFile("a", 1000),
        makeFile("b", 2000),
        makeFile("c", 3000),
      ];
      const total = estimateEncryptedUploadSize(files);
      expect(total).toBeGreaterThan(6000);
    });

    it("returns 0 for an empty list", () => {
      expect(estimateEncryptedUploadSize([])).toBe(0);
    });
  });
});
