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

export const AUTO_LOCK_TIMEOUT_KEY = "encryption-auto-lock-timeout-seconds";

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

function readStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getAutoLockTimeoutSeconds(): number {
  const storage = readStorage();
  if (!storage) return DEFAULT_AUTO_LOCK_SECONDS;
  const raw = storage.getItem(AUTO_LOCK_TIMEOUT_KEY);
  if (raw === null) return DEFAULT_AUTO_LOCK_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_AUTO_LOCK_SECONDS;
  if (parsed > MAX_AUTO_LOCK_SECONDS) return MAX_AUTO_LOCK_SECONDS;
  return parsed;
}

export function setAutoLockTimeoutSeconds(seconds: number): void {
  const storage = readStorage();
  if (!storage) return;
  const clamped = Math.max(
    0,
    Math.min(MAX_AUTO_LOCK_SECONDS, Math.floor(seconds)),
  );
  storage.setItem(AUTO_LOCK_TIMEOUT_KEY, String(clamped));
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
