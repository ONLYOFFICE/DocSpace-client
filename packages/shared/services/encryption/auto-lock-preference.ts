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

export const AUTO_LOCK_TIMEOUT_KEY_PREFIX = "encryption-auto-lock-timeout:";
const LEGACY_AUTO_LOCK_TIMEOUT_KEY = "encryption-auto-lock-timeout-seconds";

export const AUTO_LOCK_TIMEOUT_KEY = LEGACY_AUTO_LOCK_TIMEOUT_KEY;

export const AUTO_LOCK_PRESETS = [
  { id: "off", seconds: 0 },
  { id: "5m", seconds: 300 },
  { id: "15m", seconds: 900 },
  { id: "30m", seconds: 1800 },
  { id: "1h", seconds: 3600 },
] as const;

export type AutoLockPresetId = (typeof AUTO_LOCK_PRESETS)[number]["id"];

export const DEFAULT_AUTO_LOCK_SECONDS = 0;

const MAX_AUTO_LOCK_SECONDS = 24 * 60 * 60;

let currentScopeUserId: string | null = null;

export function setAutoLockScope(userId: string | null): void {
  const next = userId && userId.length > 0 ? String(userId) : null;
  currentScopeUserId = next;
}

function storageKey(): string {
  return currentScopeUserId
    ? `${AUTO_LOCK_TIMEOUT_KEY_PREFIX}${currentScopeUserId}`
    : LEGACY_AUTO_LOCK_TIMEOUT_KEY;
}

function readStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

const ALLOWED_PRESET_SECONDS: ReadonlySet<number> = new Set(
  AUTO_LOCK_PRESETS.map((p) => p.seconds),
);

export function getAutoLockTimeoutSeconds(): number {
  const storage = readStorage();
  if (!storage) return DEFAULT_AUTO_LOCK_SECONDS;
  let raw = storage.getItem(storageKey());
  if (raw === null && currentScopeUserId !== null) {
    raw = storage.getItem(LEGACY_AUTO_LOCK_TIMEOUT_KEY);
    if (raw !== null) {
      storage.setItem(storageKey(), raw);
      storage.removeItem(LEGACY_AUTO_LOCK_TIMEOUT_KEY);
    }
  }
  if (raw === null) return DEFAULT_AUTO_LOCK_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_AUTO_LOCK_SECONDS;
  if (parsed > MAX_AUTO_LOCK_SECONDS) return MAX_AUTO_LOCK_SECONDS;
  // Defense against localStorage tampering — a hostile script (or browser
  // extension) could write an arbitrary value to extend the auto-lock window
  // beyond the UI-offered presets. Read-time enforce the whitelist; falling
  // back to the safe default if the stored value isn't recognized.
  if (!ALLOWED_PRESET_SECONDS.has(parsed)) return DEFAULT_AUTO_LOCK_SECONDS;
  return parsed;
}

export function setAutoLockTimeoutSeconds(seconds: number): void {
  const storage = readStorage();
  if (!storage) return;
  const clamped = Math.max(
    0,
    Math.min(MAX_AUTO_LOCK_SECONDS, Math.floor(seconds)),
  );
  storage.setItem(storageKey(), String(clamped));
}

export function setAutoLockPreset(id: AutoLockPresetId): void {
  const preset = AUTO_LOCK_PRESETS.find((p) => p.id === id);
  if (!preset) return;
  setAutoLockTimeoutSeconds(preset.seconds);
}

export function getCurrentAutoLockPresetId(): AutoLockPresetId {
  const seconds = getAutoLockTimeoutSeconds();
  const exact = AUTO_LOCK_PRESETS.find((p) => p.seconds === seconds);
  return exact?.id ?? "off";
}
