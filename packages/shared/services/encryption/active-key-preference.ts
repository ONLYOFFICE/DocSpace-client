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

/**
 * Picks the encryption key that should be active on this device, given the
 * server list and a locally stored preference. Multi-key aware.
 *
 *   - 0 keys                       → null (user has no identity yet)
 *   - exactly 1 key                → that one key (legacy single-device)
 *   - 2+ keys, preferred id matches → the preferred key
 *   - 2+ keys, no preferred match   → null (force user to pick on the keys-management page;
 *     auto-picking keys[0] would silently use another device's key and fail unlock).
 */
export function selectActiveKey<
  T extends { id: string },
>(
  keys: T[] | null | undefined,
  preferredId: string | null | undefined,
): T | null {
  if (!keys || keys.length === 0) return null;
  if (keys.length === 1) return keys[0];
  if (!preferredId) return null;
  return keys.find((k) => k.id === preferredId) ?? null;
}
