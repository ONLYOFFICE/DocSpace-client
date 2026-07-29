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

const reloadMock = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload: reloadMock },
  writable: true,
});

const RELOAD_KEY = "test-chunk-reload";

const PAGE_CHUNK_URL =
  "https://portal.example/doceditor/_next/static/chunks/app/page-1.js";

const chunkError = (message: string, name = "Error") =>
  Object.assign(new Error(message), { name });

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
};

const setOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
};

// The module keeps a "reload already scheduled" flag, so every test gets a
// freshly evaluated copy.
let mod: typeof import("./chunk-load-error");

beforeEach(async () => {
  vi.resetModules();
  window.sessionStorage.clear();
  setVisibility("visible");
  setOnline(true);
  mod = await import("./chunk-load-error");
});

afterEach(() => {
  vi.restoreAllMocks();
  // Flush pending gated reloads so their self-removing listeners do not
  // leak into the next test.
  setVisibility("visible");
  setOnline(true);
  document.dispatchEvent(new Event("visibilitychange"));
  window.dispatchEvent(new Event("online"));
});

describe("isChunkLoadError", () => {
  it("detects a webpack timeout error by name (production report)", () => {
    const error = chunkError(
      `Loading chunk 5076 failed.\n(timeout: ${PAGE_CHUNK_URL})`,
      "ChunkLoadError",
    );

    expect(mod.isChunkLoadError(error)).toBe(true);
  });

  it("detects webpack chunk messages without the error name", () => {
    expect(mod.isChunkLoadError(chunkError("Loading chunk 42 failed."))).toBe(
      true,
    );
    expect(
      mod.isChunkLoadError(chunkError("Loading CSS chunk 42 failed.")),
    ).toBe(true);
  });

  it("detects Vite dynamic import failures across browsers", () => {
    const messages = [
      `Failed to fetch dynamically imported module: ${PAGE_CHUNK_URL}`,
      `error loading dynamically imported module: ${PAGE_CHUNK_URL}`,
      "Importing a module script failed.",
    ];

    for (const message of messages) {
      expect(mod.isChunkLoadError(chunkError(message))).toBe(true);
    }
  });

  it("ignores unrelated errors and non-error values", () => {
    expect(mod.isChunkLoadError(chunkError("Cannot read properties"))).toBe(
      false,
    );
    expect(mod.isChunkLoadError(null)).toBe(false);
    expect(mod.isChunkLoadError(undefined)).toBe(false);
    expect(mod.isChunkLoadError("Loading chunk 1 failed")).toBe(false);
  });
});

describe("canReloadOnChunkError", () => {
  const error = chunkError("Loading chunk 1 failed.", "ChunkLoadError");

  it("rejects non-chunk errors", () => {
    expect(mod.canReloadOnChunkError(new Error("boom"), RELOAD_KEY)).toBe(
      false,
    );
  });

  it("allows a reload when the budget is untouched", () => {
    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(true);
  });

  it("blocks a second reload right after the previous one", () => {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now() - 1_000));

    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(false);
  });

  it("re-allows a reload after the budget window has passed", () => {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now() - 61_000));

    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(true);
  });

  it("treats a legacy boolean flag as an empty budget", () => {
    window.sessionStorage.setItem(RELOAD_KEY, "true");

    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(true);
  });

  it("never allows a reload when sessionStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(false);
  });

  it("stays positive while a reload is already scheduled", () => {
    mod.scheduleChunkErrorReload(RELOAD_KEY);

    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(true);
  });
});

describe("scheduleChunkErrorReload", () => {
  it("reloads immediately when the tab is visible", () => {
    mod.scheduleChunkErrorReload(RELOAD_KEY);

    expect(reloadMock).toHaveBeenCalledTimes(1);
    const stamp = Number(window.sessionStorage.getItem(RELOAD_KEY));
    expect(stamp).toBeGreaterThan(0);
  });

  it("consumes the budget once for concurrent failures", () => {
    mod.scheduleChunkErrorReload(RELOAD_KEY);
    mod.scheduleChunkErrorReload(RELOAD_KEY);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("emulates the reported bug: chunk timeout in a hidden tab", () => {
    // A page chunk request is throttled in the background and webpack
    // rejects it with a timeout ChunkLoadError (production Firebase
    // report). The old fix reloaded while the tab was still hidden and
    // burned its only reload on a request doomed to fail the same way.
    const error = chunkError(
      `Loading chunk 5076 failed.\n(timeout: ${PAGE_CHUNK_URL})`,
      "ChunkLoadError",
    );

    setVisibility("hidden");

    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(true);
    mod.scheduleChunkErrorReload(RELOAD_KEY);

    // No reload while the window is minimized.
    expect(reloadMock).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBeNull();

    // The user restores the window: now the reload fires and the budget
    // is stamped.
    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(
      Number(window.sessionStorage.getItem(RELOAD_KEY)),
    ).toBeGreaterThan(0);
  });

  it("emulates a mobile network drop: reload waits for connectivity", () => {
    setOnline(false);
    mod.scheduleChunkErrorReload(RELOAD_KEY);

    // No reload into the void while the device is offline.
    expect(reloadMock).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBeNull();

    // Connectivity returns: the browser fires "online" and the reload
    // runs with a stamped budget.
    setOnline(true);
    window.dispatchEvent(new Event("online"));

    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(
      Number(window.sessionStorage.getItem(RELOAD_KEY)),
    ).toBeGreaterThan(0);
  });

  it("requires both visibility and connectivity before reloading", () => {
    setVisibility("hidden");
    setOnline(false);
    mod.scheduleChunkErrorReload(RELOAD_KEY);

    setOnline(true);
    window.dispatchEvent(new Event("online"));
    expect(reloadMock).not.toHaveBeenCalled();

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("blocks a reload loop on the next page load, then self-resets", async () => {
    const error = chunkError("Loading chunk 1 failed.", "ChunkLoadError");

    mod.scheduleChunkErrorReload(RELOAD_KEY);
    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Simulate the reloaded page: fresh module, same sessionStorage. The
    // page is still broken and fails again immediately — no second reload.
    vi.resetModules();
    mod = await import("./chunk-load-error");
    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(false);

    // A later, unrelated incident in the same tab gets a reload again.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    expect(mod.canReloadOnChunkError(error, RELOAD_KEY)).toBe(true);
    vi.useRealTimers();
  });
});
