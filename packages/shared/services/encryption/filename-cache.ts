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

// sessionStorage-backed display-name cache for encrypted files.
// Cache lifetime = tab lifetime (matches SecretStorage); cross-tab/device
// propagation is left to lazy decrypt of the DSE3 header on download.

const KEY_PREFIX = "encfn:";

function safeStorage(): Storage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

type CacheChangeListener = (fileId: string) => void;
const listeners = new Set<CacheChangeListener>();

export function subscribeFilenameCache(
  listener: CacheChangeListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(fileId: number | string): void {
  const id = String(fileId);
  for (const l of listeners) {
    try {
      l(id);
    } catch {
      // a faulty listener must not break cache writes
    }
  }
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
    s.setItem(`${KEY_PREFIX}${fileId}`, originalName);
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
    return s.getItem(`${KEY_PREFIX}${fileId}`);
  } catch {
    return null;
  }
}

export function forgetEncryptedFilename(fileId: number | string): void {
  if (!fileId) return;
  const s = safeStorage();
  if (!s) return;
  try {
    s.removeItem(`${KEY_PREFIX}${fileId}`);
  } catch {
    //
  }
}

export function clearEncryptedFilenameCache(): void {
  const s = safeStorage();
  if (!s) return;
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
}
