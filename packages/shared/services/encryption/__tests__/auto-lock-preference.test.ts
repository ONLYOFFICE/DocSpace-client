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

import { describe, it, expect, beforeEach } from "vitest";

import {
  AUTO_LOCK_PRESETS,
  AUTO_LOCK_TIMEOUT_KEY,
  AUTO_LOCK_TIMEOUT_KEY_PREFIX,
  DEFAULT_AUTO_LOCK_SECONDS,
  getAutoLockTimeoutSeconds,
  getCurrentAutoLockPresetId,
  setAutoLockPreset,
  setAutoLockScope,
  setAutoLockTimeoutSeconds,
} from "../auto-lock-preference";

describe("auto-lock preference storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setAutoLockScope(null);
  });

  it("returns default (0) when nothing is stored", () => {
    expect(getAutoLockTimeoutSeconds()).toBe(DEFAULT_AUTO_LOCK_SECONDS);
    expect(getCurrentAutoLockPresetId()).toBe("off");
  });

  it("round-trips seconds through localStorage", () => {
    setAutoLockTimeoutSeconds(900);
    expect(getAutoLockTimeoutSeconds()).toBe(900);
    expect(window.localStorage.getItem(AUTO_LOCK_TIMEOUT_KEY)).toBe("900");
    expect(getCurrentAutoLockPresetId()).toBe("15m");
  });

  it("clamps negative values to 0", () => {
    setAutoLockTimeoutSeconds(-1);
    expect(getAutoLockTimeoutSeconds()).toBe(0);
  });

  it("clamps stored values above 24h and the read-time whitelist falls back to default", () => {
    // Setter clamps to MAX_AUTO_LOCK_SECONDS = 24h before writing, but the
    // read-time whitelist (preset values only) further drops it to default
    // since 24h is not a UI-offered preset.
    setAutoLockTimeoutSeconds(10 * 24 * 60 * 60);
    expect(getAutoLockTimeoutSeconds()).toBe(0);
  });

  it("floors fractional seconds (900 is a known preset)", () => {
    setAutoLockTimeoutSeconds(900.7);
    expect(getAutoLockTimeoutSeconds()).toBe(900);
  });

  it("treats malformed stored values as default", () => {
    window.localStorage.setItem(AUTO_LOCK_TIMEOUT_KEY, "not-a-number");
    expect(getAutoLockTimeoutSeconds()).toBe(DEFAULT_AUTO_LOCK_SECONDS);
  });

  it("treats negative stored values as default", () => {
    window.localStorage.setItem(AUTO_LOCK_TIMEOUT_KEY, "-500");
    expect(getAutoLockTimeoutSeconds()).toBe(DEFAULT_AUTO_LOCK_SECONDS);
  });

  it("setAutoLockPreset writes the matching preset's seconds", () => {
    setAutoLockPreset("30m");
    expect(getAutoLockTimeoutSeconds()).toBe(1800);
    setAutoLockPreset("1h");
    expect(getAutoLockTimeoutSeconds()).toBe(3600);
    setAutoLockPreset("off");
    expect(getAutoLockTimeoutSeconds()).toBe(0);
  });

  it("setAutoLockPreset ignores unknown preset ids", () => {
    setAutoLockPreset("1h");
    expect(getAutoLockTimeoutSeconds()).toBe(3600);
    // @ts-expect-error: deliberately pass an invalid id
    setAutoLockPreset("invalid");
    expect(getAutoLockTimeoutSeconds()).toBe(3600);
  });

  it("getAutoLockTimeoutSeconds rejects non-preset values at read time (tamper defense)", () => {
    // Writing succeeds (legacy API), but read-time whitelist enforcement
    // returns the safe default when the stored value isn't a known preset.
    // Protects against localStorage tampering by extensions / hostile scripts.
    setAutoLockTimeoutSeconds(42);
    expect(getAutoLockTimeoutSeconds()).toBe(0);
    expect(getCurrentAutoLockPresetId()).toBe("off");
  });

  it("AUTO_LOCK_PRESETS contains expected ids and ordering", () => {
    expect(AUTO_LOCK_PRESETS.map((p) => p.id)).toEqual([
      "off",
      "5m",
      "15m",
      "30m",
      "1h",
    ]);
  });
});

describe("auto-lock preference scoping", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setAutoLockScope(null);
  });

  it("uses a userId-scoped key when a scope is active", () => {
    setAutoLockScope("user-A");
    setAutoLockTimeoutSeconds(1800);
    expect(
      window.localStorage.getItem(`${AUTO_LOCK_TIMEOUT_KEY_PREFIX}user-A`),
    ).toBe("1800");
    expect(window.localStorage.getItem(AUTO_LOCK_TIMEOUT_KEY)).toBeNull();
  });

  it("isolates two users on the same browser", () => {
    setAutoLockScope("user-A");
    setAutoLockTimeoutSeconds(300);
    setAutoLockScope("user-B");
    expect(getAutoLockTimeoutSeconds()).toBe(DEFAULT_AUTO_LOCK_SECONDS);
    setAutoLockTimeoutSeconds(3600);
    expect(getAutoLockTimeoutSeconds()).toBe(3600);
    setAutoLockScope("user-A");
    expect(getAutoLockTimeoutSeconds()).toBe(300);
  });

  it("migrates a pre-existing legacy value into the scoped slot on first read", () => {
    window.localStorage.setItem(AUTO_LOCK_TIMEOUT_KEY, "900");
    setAutoLockScope("user-A");
    expect(getAutoLockTimeoutSeconds()).toBe(900);
    expect(
      window.localStorage.getItem(`${AUTO_LOCK_TIMEOUT_KEY_PREFIX}user-A`),
    ).toBe("900");
    expect(window.localStorage.getItem(AUTO_LOCK_TIMEOUT_KEY)).toBeNull();
  });
});
