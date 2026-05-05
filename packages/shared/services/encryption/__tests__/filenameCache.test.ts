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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  rememberEncryptedFilename,
  getCachedEncryptedFilename,
  forgetEncryptedFilename,
  clearEncryptedFilenameCache,
  subscribeFilenameCache,
} from "../filenameCache";

// Vitest's jsdom environment provides a real sessionStorage. We clear it
// between tests so each case starts from a clean state.

describe("filenameCache", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe("remember / get", () => {
    it("stores and retrieves a filename for a fileId", () => {
      rememberEncryptedFilename(42, "Q4-Report.docx");
      expect(getCachedEncryptedFilename(42)).toBe("Q4-Report.docx");
    });

    it("treats numeric and string fileIds as the same key", () => {
      rememberEncryptedFilename(42, "report.docx");
      expect(getCachedEncryptedFilename("42")).toBe("report.docx");
      expect(getCachedEncryptedFilename(42)).toBe("report.docx");
    });

    it("returns null for an unknown fileId", () => {
      expect(getCachedEncryptedFilename(999)).toBeNull();
    });

    it("isolates entries by fileId", () => {
      rememberEncryptedFilename(1, "alpha.txt");
      rememberEncryptedFilename(2, "beta.txt");
      expect(getCachedEncryptedFilename(1)).toBe("alpha.txt");
      expect(getCachedEncryptedFilename(2)).toBe("beta.txt");
    });

    it("overwrites an existing entry", () => {
      rememberEncryptedFilename(1, "v1.txt");
      rememberEncryptedFilename(1, "v2.txt");
      expect(getCachedEncryptedFilename(1)).toBe("v2.txt");
    });

    it("ignores empty fileId", () => {
      rememberEncryptedFilename(0, "should-not-store.txt");
      rememberEncryptedFilename("", "also-no.txt");
      expect(getCachedEncryptedFilename(0)).toBeNull();
      expect(getCachedEncryptedFilename("")).toBeNull();
    });

    it("ignores empty filename", () => {
      rememberEncryptedFilename(1, "");
      expect(getCachedEncryptedFilename(1)).toBeNull();
    });
  });

  describe("forget", () => {
    it("removes a single entry without affecting others", () => {
      rememberEncryptedFilename(1, "a.txt");
      rememberEncryptedFilename(2, "b.txt");
      forgetEncryptedFilename(1);
      expect(getCachedEncryptedFilename(1)).toBeNull();
      expect(getCachedEncryptedFilename(2)).toBe("b.txt");
    });

    it("is a no-op for unknown fileId", () => {
      rememberEncryptedFilename(1, "a.txt");
      forgetEncryptedFilename(999);
      expect(getCachedEncryptedFilename(1)).toBe("a.txt");
    });
  });

  describe("clear", () => {
    it("removes every cache entry", () => {
      rememberEncryptedFilename(1, "a.txt");
      rememberEncryptedFilename(2, "b.txt");
      rememberEncryptedFilename(3, "c.txt");
      clearEncryptedFilenameCache();
      expect(getCachedEncryptedFilename(1)).toBeNull();
      expect(getCachedEncryptedFilename(2)).toBeNull();
      expect(getCachedEncryptedFilename(3)).toBeNull();
    });

    it("does not touch unrelated sessionStorage keys", () => {
      sessionStorage.setItem("foo", "bar");
      rememberEncryptedFilename(1, "encrypted.txt");
      clearEncryptedFilenameCache();
      expect(sessionStorage.getItem("foo")).toBe("bar");
      expect(getCachedEncryptedFilename(1)).toBeNull();
    });
  });

  describe("subscribe", () => {
    it("notifies subscribers on remember", () => {
      const listener = vi.fn();
      const unsub = subscribeFilenameCache(listener);
      rememberEncryptedFilename(42, "x.txt");
      expect(listener).toHaveBeenCalledWith("42");
      unsub();
    });

    it("returns an unsubscribe function", () => {
      const listener = vi.fn();
      const unsub = subscribeFilenameCache(listener);
      unsub();
      rememberEncryptedFilename(1, "x.txt");
      expect(listener).not.toHaveBeenCalled();
    });

    it("supports multiple subscribers", () => {
      const a = vi.fn();
      const b = vi.fn();
      subscribeFilenameCache(a);
      subscribeFilenameCache(b);
      rememberEncryptedFilename(7, "x.txt");
      expect(a).toHaveBeenCalledWith("7");
      expect(b).toHaveBeenCalledWith("7");
    });

    it("isolates a throwing subscriber from the rest", () => {
      const ok = vi.fn();
      const broken = vi.fn(() => {
        throw new Error("boom");
      });
      subscribeFilenameCache(broken);
      subscribeFilenameCache(ok);
      // Must not throw out of remember; ok must still be called.
      expect(() => rememberEncryptedFilename(1, "x.txt")).not.toThrow();
      expect(ok).toHaveBeenCalledWith("1");
    });

    it("does not notify on get", () => {
      const listener = vi.fn();
      subscribeFilenameCache(listener);
      rememberEncryptedFilename(1, "x.txt");
      listener.mockClear();
      getCachedEncryptedFilename(1);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("sessionStorage unavailable (soft-fail)", () => {
    let original: typeof sessionStorage;

    beforeEach(() => {
      original = sessionStorage;
      // Replace setItem with a thrower to simulate full / disabled storage.
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      // Sanity: reference original to silence noUnusedLocals.
      void original;
    });

    it("rememberEncryptedFilename swallows storage errors but still notifies", () => {
      const listener = vi.fn();
      subscribeFilenameCache(listener);
      expect(() => rememberEncryptedFilename(1, "x.txt")).not.toThrow();
      expect(listener).toHaveBeenCalledWith("1");
    });
  });
});
