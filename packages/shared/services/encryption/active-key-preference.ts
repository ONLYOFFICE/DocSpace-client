// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the
// Free Software Foundation. In accordance with Section 7(a) of the GNU AGPL its
// Section 15 shall be amended to the effect that Ascensio System SIA expressly
// excludes the warranty of non-infringement of any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied
// warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE.
// For details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html

const ACTIVE_KEY_ID_PREFIX = "encryption-active-key-id:";

function readStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function key(userId: string): string {
  return `${ACTIVE_KEY_ID_PREFIX}${userId}`;
}

export function getActiveKeyId(userId: string | undefined): string | null {
  if (!userId) return null;
  const storage = readStorage();
  if (!storage) return null;
  return storage.getItem(key(userId));
}

export function setActiveKeyId(userId: string | undefined, keyId: string): void {
  if (!userId) return;
  const storage = readStorage();
  if (!storage) return;
  storage.setItem(key(userId), keyId);
}

export function clearActiveKeyId(userId: string | undefined): void {
  if (!userId) return;
  const storage = readStorage();
  if (!storage) return;
  storage.removeItem(key(userId));
}
