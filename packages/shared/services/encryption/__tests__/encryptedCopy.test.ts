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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addCopySuffix,
  decryptEncryptedItemToFile,
  tagFileForCopy,
} from "../encryptedCopy";
import type { IdentityKeyPair } from "../types";

// TS lib.dom rejects Uint8Array<ArrayBufferLike> as BodyInit on some lib versions.
const respond = (bytes: number | Uint8Array, init?: ResponseInit): Response => {
  const body = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return new Response(body as unknown as BodyInit, init);
};

vi.mock("../fileKeys", () => ({
  decryptFile: vi.fn(),
  wipeDek: vi.fn(),
}));
vi.mock("../roomFileAccess", () => ({
  unwrapDekForCurrentUser: vi.fn(),
}));
vi.mock("../../../api/files", () => ({
  getFileEncryptionAccess: vi.fn(),
}));

import { decryptFile, wipeDek } from "../fileKeys";
import { getFileEncryptionAccess } from "../../../api/files";
import { unwrapDekForCurrentUser } from "../roomFileAccess";

const identity: IdentityKeyPair = {
  publicKey: new Uint8Array(32),
  privateKey: new Uint8Array(32),
} as IdentityKeyPair;

const baseItem = {
  id: 1,
  title: "fallback.docx",
  viewUrl: "https://files/1/view",
  contentType: "application/x-doc",
};

describe("encryptedCopy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("decryptEncryptedItemToFile — early throws (no crypto / network on bad input)", () => {
    it("throws when getFileEncryptionAccess returns null", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce(
        null as never,
      );
      await expect(
        decryptEncryptedItemToFile(baseItem, "u1", identity),
      ).rejects.toThrow(/Encryption access info missing/);
      expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
      expect(wipeDek).not.toHaveBeenCalled();
    });

    it("throws when fileKeys is missing", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      await expect(
        decryptEncryptedItemToFile(baseItem, "u1", identity),
      ).rejects.toThrow(/Encryption access info missing/);
    });

    it("throws when the current user has no entry in fileKeys", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce({
        fileKeys: [{ userId: "other-user" }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      await expect(
        decryptEncryptedItemToFile(baseItem, "u1", identity),
      ).rejects.toThrow(/no decrypt access/);
      expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
      expect(wipeDek).not.toHaveBeenCalled();
    });

    it("hasOwnEntry uses String() coercion on both sides", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce({
        fileKeys: [{ userId: 42 }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(respond(new Uint8Array([1, 2, 3]))),
      );
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([9])]),
        fileName: "ok.docx",
      });

      const out = await decryptEncryptedItemToFile(baseItem, "42", identity);
      expect(out.name).toBe("ok.docx");
    });
  });

  describe("decryptEncryptedItemToFile — fetch & decrypt", () => {
    const validAccess = {
      fileKeys: [{ userId: "u1" }],
      userKeys: [],
    } as const;

    it("throws when the viewUrl fetch is not ok", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validAccess as any,
      );
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response(null, { status: 403 })),
      );

      await expect(
        decryptEncryptedItemToFile(baseItem, "u1", identity),
      ).rejects.toThrow(/Failed to fetch encrypted blob: 403/);
      expect(unwrapDekForCurrentUser).not.toHaveBeenCalled();
      expect(wipeDek).not.toHaveBeenCalled();
    });

    it("returns a File with the decrypted name and correct MIME on success", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validAccess as any,
      );
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(respond(16)),
      );
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([5, 6])]),
        fileName: "real.docx",
      });

      const file = await decryptEncryptedItemToFile(baseItem, "u1", identity);
      expect(file.name).toBe("real.docx");
      expect(file.type).toBe("application/x-doc");
      expect(wipeDek).toHaveBeenCalledTimes(1);
    });

    it("falls back to item.title when the DSE3 header has no encryptedName", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validAccess as any,
      );
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(respond(16)),
      );
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([5])]),
        fileName: null,
      });

      const file = await decryptEncryptedItemToFile(baseItem, "u1", identity);
      expect(file.name).toBe("fallback.docx");
    });

    it("wipes the DEK even if decryptFile throws", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validAccess as any,
      );
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(respond(16)),
      );
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockRejectedValueOnce(
        new Error("auth tag mismatch"),
      );

      await expect(
        decryptEncryptedItemToFile(baseItem, "u1", identity),
      ).rejects.toThrow(/auth tag mismatch/);
      expect(wipeDek).toHaveBeenCalledTimes(1);
    });

    it("does NOT wipe when the failure is BEFORE the DEK is unwrapped", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validAccess as any,
      );
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(respond(16)),
      );
      vi.mocked(unwrapDekForCurrentUser).mockRejectedValueOnce(
        new Error("no access"),
      );

      await expect(
        decryptEncryptedItemToFile(baseItem, "u1", identity),
      ).rejects.toThrow(/no access/);
      expect(wipeDek).not.toHaveBeenCalled();
    });

    it("falls back contentType to octet-stream when item.contentType is missing", async () => {
      vi.mocked(getFileEncryptionAccess).mockResolvedValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validAccess as any,
      );
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(respond(8)),
      );
      vi.mocked(unwrapDekForCurrentUser).mockResolvedValueOnce(
        new Uint8Array(32),
      );
      vi.mocked(decryptFile).mockResolvedValueOnce({
        data: new Blob([new Uint8Array([1])]),
        fileName: "x.bin",
      });

      const file = await decryptEncryptedItemToFile(
        { ...baseItem, contentType: undefined },
        "u1",
        identity,
      );
      expect(file.type).toBe("application/octet-stream");
    });
  });

  describe("addCopySuffix", () => {
    it("inserts ` (n)` before the last extension", () => {
      expect(addCopySuffix("doc.pdf")).toBe("doc (1).pdf");
      expect(addCopySuffix("doc.pdf", 3)).toBe("doc (3).pdf");
    });

    it("appends the suffix when there is no extension", () => {
      expect(addCopySuffix("Makefile")).toBe("Makefile (1)");
    });

    it("treats leading-dot files as ext-less (dotIdx > 0)", () => {
      expect(addCopySuffix(".env")).toBe(".env (1)");
    });

    it("splits on the LAST dot for multi-dot names", () => {
      expect(addCopySuffix("archive.tar.gz")).toBe("archive.tar (1).gz");
    });
  });

  describe("tagFileForCopy", () => {
    it("mutates the file in place and returns the same reference", () => {
      const f = new File([new Uint8Array(4)], "a.txt");
      const tagged = tagFileForCopy(f, 42, {
        roomType: 5,
        isPrivate: true,
      });
      expect(tagged).toBe(f);
      expect(tagged.parentFolderId).toBe(42);
      expect(tagged.uploadContext).toEqual({
        roomType: 5,
        isPrivate: true,
      });
    });

    it("supports string folder ids (some store paths use string ids)", () => {
      const f = new File([new Uint8Array(4)], "a.txt");
      const tagged = tagFileForCopy(f, "root-personal", {
        isPrivate: false,
      });
      expect(tagged.parentFolderId).toBe("root-personal");
      expect(tagged.uploadContext?.isPrivate).toBe(false);
    });
  });
});
