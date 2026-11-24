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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { forgetKeyOnDevice } from "../device-records";
import {
  hasDeviceUnlock,
  resetDeviceUnlockStoreForTests,
} from "../device-unlock-store";
import {
  hasPasskeyUnlock,
  resetPasskeyUnlockStoreForTests,
} from "../passkey-unlock";
import {
  mockIDB,
  resetMockIDB,
  seedMockIDB,
} from "../../private-room/__tests__/_helpers/mock-idb";

const KEY_A = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
const KEY_B = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=";

describe("Removing the key removes what this device keeps of it", () => {
  const seed = (...records: Array<{ userId: string; publicKey: string }>) => {
    seedMockIDB(
      "docspace-device-unlock",
      1,
      "device_unlock",
      records.map((r) => ({ ...r, updatedAt: Date.now() })),
    );
    seedMockIDB("docspace-passkey-unlock", 1, "passkey_unlock", records);
  };

  beforeEach(() => {
    resetMockIDB();
    vi.stubGlobal("indexedDB", mockIDB);
    resetDeviceUnlockStoreForTests();
    resetPasskeyUnlockStoreForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetDeviceUnlockStoreForTests();
    resetPasskeyUnlockStoreForTests();
  });

  it("Both records removed", async () => {
    seed({ userId: "user-1", publicKey: KEY_A });

    await forgetKeyOnDevice("user-1");

    expect(await hasDeviceUnlock("user-1")).toBe(false);
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
  });

  it("Both records removed: by the key they were written for", async () => {
    seed({ userId: "user-1", publicKey: KEY_A });

    await forgetKeyOnDevice("user-1", KEY_A);

    expect(await hasDeviceUnlock("user-1")).toBe(false);
    expect(await hasPasskeyUnlock("user-1")).toBe(false);
  });

  it("Records of another key kept", async () => {
    seed({ userId: "user-1", publicKey: KEY_B });

    await forgetKeyOnDevice("user-1", KEY_A);

    expect(await hasDeviceUnlock("user-1")).toBe(true);
    expect(await hasPasskeyUnlock("user-1", KEY_B)).toBe(true);
  });

  it("Records of another key kept: another user's records stay", async () => {
    seed(
      { userId: "user-1", publicKey: KEY_A },
      { userId: "user-2", publicKey: KEY_A },
    );

    await forgetKeyOnDevice("user-1");

    expect(await hasDeviceUnlock("user-2")).toBe(true);
    expect(await hasPasskeyUnlock("user-2")).toBe(true);
  });
});
