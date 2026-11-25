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
  toArchiveEntries,
  triggerFileDownload,
  type ArchiveItem,
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
import { KeyReplacedError } from "../../encryption/errors";

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

    it("Decrypted names clash: skips a suffix that another name in the list already has", () => {
      expect(
        deduplicateFileNames([
          "New document (2).docx",
          "New document (1).docx",
          "New document.docx",
          "New document.docx",
        ]),
      ).toEqual([
        "New document (2).docx",
        "New document (1).docx",
        "New document.docx",
        "New document (3).docx",
      ]);
    });

    it("Decrypted names clash: never takes the name of a later entry", () => {
      expect(deduplicateFileNames(["a.txt", "a.txt", "a (1).txt"])).toEqual([
        "a.txt",
        "a (2).txt",
        "a (1).txt",
      ]);
    });

    it("Names that differ only in case", () => {
      expect(deduplicateFileNames(["Budget.xlsx", "budget.xlsx"])).toEqual([
        "Budget.xlsx",
        "budget (1).xlsx",
      ]);
      expect(
        deduplicateFileNames(["Report.docx", "report.docx", "REPORT (1).DOCX"]),
      ).toEqual(["Report.docx", "report (2).docx", "REPORT (1).DOCX"]);
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

  describe("toArchiveEntries", () => {
    let nextId = 100;
    const file = (
      name: string,
      folders: ArchiveItem["folders"] = [],
    ): ArchiveItem => ({
      data: new Uint8Array([1]),
      names: [name, "stored title", (nextId += 1)],
      folders,
    });
    const paths = (items: ArchiveItem[]) =>
      toArchiveEntries(items).map((e) => e.name);

    const root = { id: 1, title: "Root" };

    it("File name with a separator inside a folder archive", () => {
      const docs = { id: 10, title: "Docs" };
      const out = paths([
        file("../x/a.txt", [docs]),
        file("b.txt", [docs]),
      ]);

      expect(out).toEqual(["Docs/.._x_a.txt", "Docs/b.txt"]);
      expect(new Set(out.map((p) => p.split("/").length))).toEqual(
        new Set([2]),
      );
    });

    it("Folder title with a separator", () => {
      expect(paths([file("f.txt", [root, { id: 2, title: "a/b" }])])).toEqual(
        ["Root/a_b/f.txt"],
      );
    });

    it("Folder title of which nothing is left", () => {
      expect(paths([file("f.txt", [{ id: 7, title: ".." }])])).toEqual([
        "7/f.txt",
      ]);
    });

    it("Sibling folders that differ only in case", () => {
      expect(
        paths([
          file("f1.txt", [root, { id: 2, title: "Plans" }]),
          file("f2.txt", [root, { id: 3, title: "plans" }]),
          file("f3.txt", [root, { id: 2, title: "Plans" }]),
        ]),
      ).toEqual([
        "Root/Plans/f1.txt",
        "Root/plans (1)/f2.txt",
        "Root/Plans/f3.txt",
      ]);
    });

    it("File and folder of the same name", () => {
      const notes = { id: 2, title: "Notes" };
      expect(paths([file("x.txt", [root, notes]), file("notes", [root])]))
        .toEqual(["Root/Notes/x.txt", "Root/notes (1)"]);
      expect(paths([file("notes", [root]), file("x.txt", [root, notes])]))
        .toEqual(["Root/notes", "Root/Notes (1)/x.txt"]);
    });

    it("Names that differ only in case inside a folder", () => {
      expect(
        paths([file("Budget.xlsx", [root]), file("budget.xlsx", [root])]),
      ).toEqual(["Root/Budget.xlsx", "Root/budget (1).xlsx"]);
    });

    it("Decrypted names clash: the same names in different folders stay", () => {
      expect(
        paths([
          file("a.txt"),
          file("a.txt"),
          file("a (1).txt"),
          file("a.txt", [root]),
        ]),
      ).toEqual(["a.txt", "a (2).txt", "a (1).txt", "Root/a.txt"]);
    });

    it("A clash of a name of 255 bytes keeps its suffix", () => {
      const long = `${"a".repeat(251)}.txt`;
      const [first, second] = paths([file(long), file(long)]);

      expect(first).toBe(long);
      expect(second).toBe(`${"a".repeat(247)} (1).txt`);
      expect(new TextEncoder().encode(second).length).toBe(255);
    });

    it("Nothing left of the name: the next candidate names the entry", () => {
      const out = toArchiveEntries([
        { data: new Uint8Array([1]), names: ["...", "Title.docx", 5], folders: [] },
        { data: new Uint8Array([1]), names: ["..", "\u0007", 6], folders: [] },
      ]);
      expect(out.map((e) => e.name)).toEqual(["Title.docx", "6"]);
    });
  });

  describe("triggerFileDownload", () => {
    const saved = () => {
      const names: string[] = [];
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        function click(this: HTMLAnchorElement) {
          names.push(this.download);
        },
      );
      return names;
    };

    beforeEach(() => {
      vi.useFakeTimers();
      URL.createObjectURL = vi.fn(() => "blob:test");
      URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      vi.runAllTimers();
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("Archive named after a folder", () => {
      const names = saved();
      triggerFileDownload(new Blob([]), "Plans/2026 Q1.zip");
      expect(names).toEqual(["Plans_2026 Q1.zip"]);
    });

    it("Single file download: the file's own name is made plain", () => {
      const names = saved();
      triggerFileDownload(new File([], "memo\u202e.txt"));
      triggerFileDownload(new Blob([]));
      expect(names).toEqual(["memo.txt", "download"]);
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

    it.each([
      ["an empty segment", "Docs//a.txt"],
      ["a leading separator", "/a.txt"],
      ["a parent reference", "Docs/../a.txt"],
      ["a current directory reference", "./a.txt"],
      ["an unnormalised segment", "Docs/a:b.txt"],
      ["a trailing dot", "Docs/a."],
      ["a backslash", "Docs\\a.txt"],
    ])("Archive refuses a path that was not built: %s", (_, name) => {
      expect(() =>
        createZipFromBuffers([{ name, data: new Uint8Array([1]) }]),
      ).toThrow();
    });

    it("Archive keeps a built path", () => {
      const entries = toArchiveEntries([
        {
          data: new TextEncoder().encode("plan"),
          names: ["../q1:plan.txt", 1],
          folders: [
            { id: 1, title: "Reports/2026" },
            { id: 2, title: "Plans" },
          ],
        },
      ]);

      const unzipped = unzipSync(createZipFromBuffers(entries));

      expect(Object.keys(unzipped)).toEqual(["Reports_2026/Plans/.._q1_plan.txt"]);
      expect(
        new TextDecoder().decode(
          unzipped["Reports_2026/Plans/.._q1_plan.txt"],
        ),
      ).toBe("plan");
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

    const decryptNamed = async (headerName: string, stored: string) => {
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([1])]),
        fileName: headerName,
      });
      const result = await decryptDownloadedFile({
        ...baseConfig,
        originalFileName: stored,
        encryptedData: new ArrayBuffer(8),
      });
      return result.file?.name;
    };

    it("Single file download: the header name is made plain", async () => {
      expect(await decryptNamed("../plans/q1\u0007\u202e.txt", "x.txt")).toBe(
        ".._plans_q1.txt",
      );
    });

    it("Nothing left of the name", async () => {
      expect(await decryptNamed("...", "report.docx")).toBe("report.docx");
      expect(await decryptNamed("..", ". .")).toBe("1");
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

    it("Download of one such file: the verdict on a replaced key reaches the caller as a flag", async () => {
      const payload = new Uint8Array([1, 2, 3]);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(okResponse(payload, payload.byteLength)),
      );
      const userKeys = [{ id: "key-now" }];
      vi.mocked(unwrapDekForCurrentUser).mockRejectedValueOnce(
        new KeyReplacedError(),
      );

      const result = await downloadAndDecryptFileToBuffer({
        ...baseConfig,
        userKeys,
        downloadUrl: "https://x/y",
      });

      expect(result.success).toBe(false);
      expect(result.keyReplaced).toBe(true);
      expect(vi.mocked(unwrapDekForCurrentUser).mock.calls[0][0].userKeys).toBe(
        userKeys,
      );
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
