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

// sessionStorage-backed display-name cache for encrypted files.
// Cache lifetime = tab lifetime (matches SecretStorage); cross-tab/device
// propagation is left to lazy decrypt of the DSE3 header on download.

const KEY_PREFIX = "encfn:";

let currentScopeUserId: string | null = null;

export function setFilenameCacheScope(userId: string | null): void {
  const next = userId && userId.length > 0 ? String(userId) : null;
  if (currentScopeUserId !== next) {
    clearEncryptedFilenameCache();
  }
  currentScopeUserId = next;
}

function storageKey(fileId: number | string): string {
  return currentScopeUserId
    ? `${KEY_PREFIX}${currentScopeUserId}:${fileId}`
    : `${KEY_PREFIX}${fileId}`;
}

function safeStorage(): Storage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

/** Called with the file whose name changed, or "" when every name did. */
type CacheChangeListener = (fileId: string) => void;
const listeners = new Set<CacheChangeListener>();

let cacheVersion = 0;

export function getFilenameCacheVersion(): number {
  return cacheVersion;
}

export function subscribeFilenameCache(
  listener: CacheChangeListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(fileId: number | string): void {
  cacheVersion += 1;
  const id = String(fileId);
  for (const l of listeners) {
    try {
      l(id);
    } catch {
      // a faulty listener must not break cache writes
    }
  }
}

// Files wrapped for a key the user no longer holds. Kept for the page only
// and cleared with the names, so a lock or a reload makes them be read again.
// Spec: private-rooms/file-operations, "A private room names the files wrapped for a key the user no longer holds"
const replacedKeyFiles = new Set<string>();

export function markReplacedKeyFile(fileId: number | string): void {
  const id = String(fileId);
  if (!fileId || replacedKeyFiles.has(id)) return;
  replacedKeyFiles.add(id);
  notify(id);
}

export function isReplacedKeyFile(fileId: number | string): boolean {
  return replacedKeyFiles.has(String(fileId));
}

export function rememberEncryptedFilename(
  fileId: number | string,
  originalName: string,
): void {
  if (!fileId || !originalName) return;
  const s = safeStorage();
  if (!s) {
    notify(fileId);
    return;
  }
  try {
    s.setItem(storageKey(fileId), originalName);
  } catch {
    // storage full / disabled - degrade silently
  }
  notify(fileId);
}

export function getCachedEncryptedFilename(
  fileId: number | string,
): string | null {
  if (!fileId) return null;
  const s = safeStorage();
  if (!s) return null;
  try {
    return s.getItem(storageKey(fileId));
  } catch {
    return null;
  }
}

export function resolveDisplayTitle(
  file:
    | {
        id?: number | string | null;
        title?: string | null;
        encrypted?: boolean | null;
      }
    | null
    | undefined,
): string {
  const title = file?.title ?? "";
  if (file?.encrypted && file.id) {
    return getCachedEncryptedFilename(file.id) || title;
  }
  return title;
}

export function forgetEncryptedFilename(fileId: number | string): void {
  if (!fileId) return;
  const s = safeStorage();
  if (!s) return;
  try {
    s.removeItem(storageKey(fileId));
  } catch {
    //
  }
}

/**
 * Drops every cached name and tells the subscribers, so that names shown
 * from the cache go back to the names as stored.
 * Spec: private-rooms/key-management, "File names stay as stored while the key is locked"
 */
export function clearEncryptedFilenameCache(): void {
  replacedKeyFiles.clear();
  const s = safeStorage();
  if (!s) {
    notify("");
    return;
  }
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(KEY_PREFIX)) toRemove.push(k);
    }
    for (const k of toRemove) s.removeItem(k);
  } catch {
    /* ignore */
  }
  notify("");
}
