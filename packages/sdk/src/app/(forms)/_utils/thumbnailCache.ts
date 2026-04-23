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

const MAX_CACHE_SIZE = 100;

type CacheEntry = { blobUrl: string; refCount: number };

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<string>>();
const pendingRefs = new Map<string, number>();

const evictIfFull = () => {
  if (cache.size < MAX_CACHE_SIZE) return;
  for (const [key, entry] of cache) {
    if (entry.refCount <= 0) {
      URL.revokeObjectURL(entry.blobUrl);
      cache.delete(key);
      return;
    }
  }
};

export function getThumbnailSync(key: string): string | undefined {
  return cache.get(key)?.blobUrl;
}

export function acquireThumbnail(key: string): Promise<string> {
  if (!key) return Promise.reject(new Error("empty thumbnail key"));

  const existing = cache.get(key);
  if (existing) {
    existing.refCount += 1;
    return Promise.resolve(existing.blobUrl);
  }

  const pending = inFlight.get(key);
  if (pending) {
    pendingRefs.set(key, (pendingRefs.get(key) ?? 0) + 1);
    return pending;
  }

  pendingRefs.set(key, 1);

  const p = fetch(key, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const refCount = pendingRefs.get(key) ?? 0;
      pendingRefs.delete(key);

      if (refCount <= 0) {
        URL.revokeObjectURL(blobUrl);
        return blobUrl;
      }

      evictIfFull();
      cache.set(key, { blobUrl, refCount });
      return blobUrl;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, p);
  return p;
}

export function releaseThumbnail(key: string): void {
  if (!key) return;

  const entry = cache.get(key);
  if (entry) {
    if (entry.refCount > 0) entry.refCount -= 1;
    return;
  }

  if (inFlight.has(key)) {
    const n = pendingRefs.get(key) ?? 0;
    pendingRefs.set(key, n - 1);
  }
}
