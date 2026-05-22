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

import { unzipSync } from "fflate";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  canUserDecrypt,
  createZipFromBuffers,
  decryptDownloadedFile,
  deduplicateFileNames,
  downloadAndDecryptFile,
  downloadAndDecryptFileToBuffer,
} from "../encrypted-download";
import type { IdentityKeyPair } from "../../encryption/types";

vi.mock("../../encryption/file-keys", () => ({
  decryptFile: vi.fn(),
  decryptFileFromBlob: vi.fn(),
}));
vi.mock("../../encryption/room-file-access", () => ({
  unwrapDekForCurrentUser: vi.fn(),
}));

import {
  decryptFile,
  decryptFileFromBlob,
} from "../../encryption/file-keys";
import { unwrapDekForCurrentUser } from "../../encryption/room-file-access";

const dummyIdentity: IdentityKeyPair = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
} as IdentityKeyPair;

const baseConfig = {
  fileId: 1,
  fileKeys: [],
  roomMemberKeys: [],
  userId: "u1",
  identity: dummyIdentity,
  originalFileName: "report.docx",
  originalFileType: "application/x-doc",
};

const okResponse = (body: Uint8Array, contentLength?: number): Response => {
  // TS lib.dom rejects Uint8Array<ArrayBufferLike> as BodyInit on some lib
  // versions; Response accepts it at runtime in jsdom + browsers.
  return new Response(body as unknown as BodyInit, {
    status: 200,
    headers: contentLength
      ? { "content-length": String(contentLength) }
      : undefined,
  });
};

describe("encryptedDownload", () => {
  beforeAll(() => {
    // jsdom v27 doesn't implement File.arrayBuffer().
    if (!File.prototype.arrayBuffer) {
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (File.prototype as any).arrayBuffer = function arrayBuffer() {
        return new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(this);
        });
      };
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("canUserDecrypt", () => {
    it("matches when both sides are strings", () => {
      expect(
        canUserDecrypt([{ userId: "123" }, { userId: "456" }], "123"),
      ).toBe(true);
    });

    it("matches when keys[].userId is numeric and userId is a string", () => {
      expect(
        canUserDecrypt(
          [{ userId: 123 as unknown as string }],
          "123",
        ),
      ).toBe(true);
    });

    it("matches when keys[].userId is a string and userId is numeric", () => {
      expect(
        canUserDecrypt(
          [{ userId: "123" }],
          123 as unknown as string,
        ),
      ).toBe(true);
    });

    it("returns false for empty / null / missing inputs", () => {
      expect(canUserDecrypt([], "123")).toBe(false);
      expect(canUserDecrypt(null, "123")).toBe(false);
      expect(canUserDecrypt(undefined, "123")).toBe(false);
      expect(canUserDecrypt([{ userId: "123" }], null)).toBe(false);
      expect(canUserDecrypt([{ userId: "123" }], undefined)).toBe(false);
      expect(canUserDecrypt([{ userId: "123" }], "")).toBe(false);
    });

    it("returns false when no entry matches", () => {
      expect(
        canUserDecrypt([{ userId: "1" }, { userId: "2" }], "3"),
      ).toBe(false);
    });
  });

  describe("deduplicateFileNames", () => {
    it("returns input unchanged when all names are unique", () => {
      expect(deduplicateFileNames(["a.txt", "b.txt", "c.txt"])).toEqual([
        "a.txt",
        "b.txt",
        "c.txt",
      ]);
    });

    it("numbers duplicates starting from (1) and inserts the suffix before the extension", () => {
      expect(
        deduplicateFileNames(["doc.pdf", "doc.pdf", "doc.pdf"]),
      ).toEqual(["doc.pdf", "doc (1).pdf", "doc (2).pdf"]);
    });

    it("splits on the LAST dot for multi-dot names", () => {
      expect(deduplicateFileNames(["a.b.c", "a.b.c"])).toEqual([
        "a.b.c",
        "a.b (1).c",
      ]);
    });

    it("treats names with no extension correctly", () => {
      expect(deduplicateFileNames(["Makefile", "Makefile"])).toEqual([
        "Makefile",
        "Makefile (1)",
      ]);
    });

    it("treats dotfiles (no base name) as ext-less for suffixing", () => {
      expect(deduplicateFileNames([".env", ".env"])).toEqual([
        ".env",
        ".env (1)",
      ]);
    });

    it("counts each unique name independently and preserves order", () => {
      expect(
        deduplicateFileNames(["x.txt", "y.txt", "x.txt", "y.txt"]),
      ).toEqual(["x.txt", "y.txt", "x (1).txt", "y (1).txt"]);
    });
  });

  describe("createZipFromBuffers", () => {
    it("round-trips file names and contents via fflate", () => {
      const a = new TextEncoder().encode("hello");
      const b = new TextEncoder().encode("world");
      const zipped = createZipFromBuffers([
        { name: "a.txt", data: a },
        { name: "sub/b.txt", data: b },
      ]);

      const unzipped = unzipSync(zipped);
      expect(Object.keys(unzipped).sort()).toEqual(["a.txt", "sub/b.txt"]);
      expect(new TextDecoder().decode(unzipped["a.txt"])).toBe("hello");
      expect(new TextDecoder().decode(unzipped["sub/b.txt"])).toBe("world");
    });

    it("produces a non-empty buffer even for a single small entry", () => {
      const zipped = createZipFromBuffers([
        { name: "x", data: new Uint8Array([1, 2, 3]) },
      ]);
      expect(zipped.byteLength).toBeGreaterThan(0);
      // ZIP magic bytes: PK\x03\x04
      expect(zipped[0]).toBe(0x50);
      expect(zipped[1]).toBe(0x4b);
    });
  });

  describe("decryptDownloadedFile", () => {
    it("returns success:true with a File built from the decrypted blob and name", async () => {
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([1, 2, 3])]),
        fileName: "real-name.docx",
      });

      const result = await decryptDownloadedFile({
        ...baseConfig,
        encryptedData: new ArrayBuffer(8),
      });

      expect(result.success).toBe(true);
      expect(result.file).toBeInstanceOf(File);
      expect(result.file?.name).toBe("real-name.docx");
      expect(result.file?.type).toBe("application/x-doc");
    });

    it("falls back to originalFileName when the DSE3 header has no encryptedName", async () => {
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([1])]),
        fileName: null,
      });

      const result = await decryptDownloadedFile({
        ...baseConfig,
        encryptedData: new ArrayBuffer(8),
      });
      expect(result.success).toBe(true);
      expect(result.file?.name).toBe("report.docx");
    });

    it("returns success:false (never throws) when unwrap throws", async () => {
      vi.mocked(unwrapDekForCurrentUser).mockRejectedValueOnce(
        new Error("no key for user"),
      );

      const result = await decryptDownloadedFile({
        ...baseConfig,
        encryptedData: new ArrayBuffer(8),
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("no key for user");
      expect(result.file).toBeUndefined();
    });

    it("returns success:false when decryptFile throws", async () => {
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockRejectedValueOnce(
        new Error("auth tag mismatch"),
      );

      const result = await decryptDownloadedFile({
        ...baseConfig,
        encryptedData: new ArrayBuffer(8),
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("auth tag mismatch");
    });

    it("returns a generic message when a non-Error is thrown", async () => {
      vi.mocked(unwrapDekForCurrentUser).mockRejectedValueOnce("nope");
      const result = await decryptDownloadedFile({
        ...baseConfig,
        encryptedData: new ArrayBuffer(8),
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Decryption failed");
    });
  });

  describe("downloadAndDecryptFile", () => {
    it("returns success:false with HTTP status when the fetch is not ok", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(null, { status: 404, statusText: "Not Found" }),
        ),
      );

      const result = await downloadAndDecryptFile({
        ...baseConfig,
        downloadUrl: "https://x/y",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to download file: 404 Not Found");
      expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
      expect(decryptFile).not.toHaveBeenCalled();
    });

    it("returns success:false (never throws) on network error", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
      );

      const result = await downloadAndDecryptFile({
        ...baseConfig,
        downloadUrl: "https://x/y",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("ECONNREFUSED");
    });

    it("decrypts on success and reports download progress when content-length is known", async () => {
      const payload = new Uint8Array(100).fill(0xaa);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(okResponse(payload, payload.byteLength)),
      );
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFileFromBlob).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([9])]),
        fileName: "ok.docx",
      });

      const progress: number[] = [];
      const result = await downloadAndDecryptFile({
        ...baseConfig,
        downloadUrl: "https://x/y",
        onDownloadProgress: (p) => progress.push(p),
      });

      expect(result.success).toBe(true);
      expect(result.file?.name).toBe("ok.docx");
      expect(progress.length).toBeGreaterThan(0);
      expect(progress[progress.length - 1]).toBeCloseTo(1);
    });

    it("returns success:false when unwrap throws after a successful download", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(okResponse(new Uint8Array(10))),
      );
      vi.mocked(unwrapDekForCurrentUser).mockRejectedValueOnce(
        new Error("no key"),
      );

      const result = await downloadAndDecryptFile({
        ...baseConfig,
        downloadUrl: "https://x/y",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("no key");
    });
  });

  describe("downloadAndDecryptFileToBuffer", () => {
    it("returns Uint8Array data and the decrypted file name on success", async () => {
      const payload = new Uint8Array([1, 2, 3]);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(okResponse(payload, payload.byteLength)),
      );
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFileFromBlob).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([42, 43])]),
        fileName: "decrypted.bin",
      });

      const result = await downloadAndDecryptFileToBuffer({
        ...baseConfig,
        downloadUrl: "https://x/y",
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe("decrypted.bin");
      expect(Array.from(result.data ?? [])).toEqual([42, 43]);
    });

    it("propagates errors with originalFileName as fallback", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(null, { status: 500, statusText: "Internal" }),
        ),
      );
      const result = await downloadAndDecryptFileToBuffer({
        ...baseConfig,
        downloadUrl: "https://x/y",
      });
      expect(result.success).toBe(false);
      expect(result.fileName).toBe("report.docx");
      expect(result.error).toContain("500");
    });
  });
});
