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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  rememberEncryptedFilename,
  getCachedEncryptedFilename,
  forgetEncryptedFilename,
  clearEncryptedFilenameCache,
  subscribeFilenameCache,
  resolveDisplayTitle,
  getFilenameCacheVersion,
} from "../filename-cache";

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

  describe("storage read/remove failure paths (soft-fail)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("getCachedEncryptedFilename returns null when getItem throws", () => {
      sessionStorage.setItem("encfn:7", "real-name.docx");
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      expect(getCachedEncryptedFilename(7)).toBeNull();
    });

    it("forgetEncryptedFilename does not throw when removeItem throws", () => {
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      expect(() => forgetEncryptedFilename(1)).not.toThrow();
    });

    it("clearEncryptedFilenameCache does not throw when iteration throws", () => {
      sessionStorage.setItem("encfn:1", "a");
      sessionStorage.setItem("encfn:2", "b");
      vi.spyOn(Storage.prototype, "key").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      expect(() => clearEncryptedFilenameCache()).not.toThrow();
    });
  });

  describe("resolveDisplayTitle", () => {
    it("returns the raw title for non-encrypted files", () => {
      rememberEncryptedFilename(1, "real.docx");
      expect(
        resolveDisplayTitle({ id: 1, title: "server.docx", encrypted: false }),
      ).toBe("server.docx");
    });

    it("returns the cached name for encrypted files with a cache hit", () => {
      rememberEncryptedFilename(1, "Q4-Report.docx");
      expect(
        resolveDisplayTitle({
          id: 1,
          title: "obfuscated-uuid.docx",
          encrypted: true,
        }),
      ).toBe("Q4-Report.docx");
    });

    it("falls back to the raw title for encrypted files on cache miss", () => {
      expect(
        resolveDisplayTitle({
          id: 999,
          title: "obfuscated-uuid.docx",
          encrypted: true,
        }),
      ).toBe("obfuscated-uuid.docx");
    });

    it("falls back to the raw title when encrypted but no id", () => {
      expect(
        resolveDisplayTitle({ title: "obfuscated.docx", encrypted: true }),
      ).toBe("obfuscated.docx");
    });

    it("handles null / undefined / empty inputs gracefully", () => {
      expect(resolveDisplayTitle(null)).toBe("");
      expect(resolveDisplayTitle(undefined)).toBe("");
      expect(resolveDisplayTitle({})).toBe("");
    });
  });

  describe("getFilenameCacheVersion", () => {
    it("increments on every cache write", () => {
      const before = getFilenameCacheVersion();
      rememberEncryptedFilename(1, "a.txt");
      const afterFirst = getFilenameCacheVersion();
      rememberEncryptedFilename(2, "b.txt");
      const afterSecond = getFilenameCacheVersion();

      expect(afterFirst).toBeGreaterThan(before);
      expect(afterSecond).toBeGreaterThan(afterFirst);
    });
  });

  describe("subscribe with faulty listener", () => {
    it("a throwing listener does not block other listeners during notify", () => {
      const good = vi.fn();
      const bad = vi.fn(() => {
        throw new Error("listener bug");
      });
      const good2 = vi.fn();
      subscribeFilenameCache(good);
      subscribeFilenameCache(bad);
      subscribeFilenameCache(good2);

      expect(() => rememberEncryptedFilename(1, "x.txt")).not.toThrow();
      expect(good).toHaveBeenCalledWith("1");
      expect(bad).toHaveBeenCalled();
      expect(good2).toHaveBeenCalledWith("1");
    });
  });
});
