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
 * source code, which remains licensed under the GNU AGPL v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Recovery helpers for failed lazy chunk loads (background throttling in a
// hidden tab aborts or times out the requests). A reload is allowed again
// once RELOAD_WINDOW_MS has passed since the previous one, so the budget
// self-resets after a healthy period instead of being spent forever, while
// a permanently broken page still cannot enter a reload loop.

const RELOAD_WINDOW_MS = 60_000;

const CHUNK_ERROR_PATTERNS = [
  // webpack / Next.js
  /Loading (?:CSS )?chunk/i,
  // Vite / Chromium
  /Failed to fetch dynamically imported module/i,
  // Vite / Firefox
  /error loading dynamically imported module/i,
  // Vite / Safari
  /Importing a module script failed/i,
];

let reloadScheduled = false;

export const isChunkLoadError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const { name, message } = error as Error;
  if (name === "ChunkLoadError") return true;
  return CHUNK_ERROR_PATTERNS.some((re) => re.test(message ?? ""));
};

const lastReloadAt = (storageKey: string): number => {
  try {
    return (
      parseInt(window.sessionStorage.getItem(storageKey) || "0", 10) || 0
    );
  } catch {
    // No sessionStorage (sandboxed SDK iframe, private mode): the reload
    // timestamp cannot survive a reload, so allowing one could loop
    // forever. Report "just reloaded" to disable the fallback.
    return Date.now();
  }
};

// Pure check without side effects: safe to call from a React state
// initializer or render.
export const canReloadOnChunkError = (
  error: unknown,
  storageKey: string,
): boolean => {
  if (typeof window === "undefined") return false;
  if (!isChunkLoadError(error)) return false;
  if (reloadScheduled) return true;
  return Date.now() - lastReloadAt(storageKey) > RELOAD_WINDOW_MS;
};

// Reloading while the tab is still hidden would most likely fail for the
// same reason the original chunk load did, so wait for visibility first.
const whenVisible = (fn: () => void) => {
  if (document.visibilityState === "visible") {
    fn();
    return;
  }
  const handler = () => {
    if (document.visibilityState !== "visible") return;
    document.removeEventListener("visibilitychange", handler);
    fn();
  };
  document.addEventListener("visibilitychange", handler);
};

export const scheduleChunkErrorReload = (storageKey: string) => {
  // Several chunks failing in the same incident must consume the reload
  // budget only once.
  if (reloadScheduled) return;
  reloadScheduled = true;
  whenVisible(() => {
    try {
      window.sessionStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // Checked in lastReloadAt: without sessionStorage the reload is
      // never allowed, so this branch is unreachable in practice.
    }
    window.location.reload();
  });
};
