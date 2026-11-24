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

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEVICE_UNLOCK_MAX_AGE_MS,
  getDeviceUnlockWrittenAt,
  hasDeviceUnlock,
  resetDeviceUnlockStoreForTests,
} from "../services/encryption/device-unlock-store";
import {
  hasPasskeyUnlock,
  resetPasskeyUnlockStoreForTests,
} from "../services/encryption/passkey-unlock";
import {
  mockIDB,
  resetMockIDB,
  seedMockIDB,
} from "../services/private-room/__tests__/_helpers/mock-idb";

import { useDeviceRecordPruning } from "./useDeviceRecordPruning";

const KEY_A = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
const KEY_B = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=";
const DAY = 24 * 60 * 60 * 1000;

const seed = (publicKey: string, writtenAt = Date.now()) => {
  seedMockIDB("docspace-device-unlock", 1, "device_unlock", [
    { userId: "user-1", publicKey, updatedAt: writtenAt } as never,
  ]);
  seedMockIDB("docspace-passkey-unlock", 1, "passkey_unlock", [
    { userId: "user-1", publicKey } as never,
  ]);
};

// Let the effect's IndexedDB round trips finish before asserting that
// nothing was removed.
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe("Removing the key removes what this device keeps of it", () => {
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

  it("Key removed on another device", async () => {
    seed(KEY_A);

    renderHook(() => useDeviceRecordPruning("user-1", [{ publicKey: KEY_B }]));

    await waitFor(async () => {
      expect(await hasDeviceUnlock("user-1")).toBe(false);
      expect(await hasPasskeyUnlock("user-1")).toBe(false);
    });
  });

  it("Key removed on another device: an empty list removes both records", async () => {
    seed(KEY_A);

    renderHook(() => useDeviceRecordPruning("user-1", []));

    await waitFor(async () => {
      expect(await hasDeviceUnlock("user-1")).toBe(false);
      expect(await hasPasskeyUnlock("user-1")).toBe(false);
    });
  });

  it("Key removed on another device: the records of a listed key stay", async () => {
    seed(KEY_A);

    renderHook(() =>
      useDeviceRecordPruning("user-1", [
        { publicKey: KEY_B },
        { publicKey: KEY_A },
      ]),
    );
    await settle();

    expect(await hasDeviceUnlock("user-1")).toBe(true);
    expect(await hasPasskeyUnlock("user-1", KEY_A)).toBe(true);
  });

  it("Key list not known", async () => {
    seed(KEY_A);

    renderHook(() => useDeviceRecordPruning("user-1", null));
    await settle();

    expect(await hasDeviceUnlock("user-1")).toBe(true);
    expect(await hasPasskeyUnlock("user-1")).toBe(true);
  });

  it("Expired record without an unlock", async () => {
    seed(KEY_A, Date.now() - DEVICE_UNLOCK_MAX_AGE_MS - DAY);

    renderHook(() => useDeviceRecordPruning("user-1", null));

    await waitFor(async () => {
      expect(await hasDeviceUnlock("user-1")).toBe(false);
    });
    expect(await getDeviceUnlockWrittenAt("user-1")).toBeNull();
  });

  it("Expired record without an unlock: a record within its age stays", async () => {
    seed(KEY_A, Date.now() - DEVICE_UNLOCK_MAX_AGE_MS + DAY);

    renderHook(() => useDeviceRecordPruning("user-1", [{ publicKey: KEY_A }]));
    await settle();

    expect(await hasDeviceUnlock("user-1")).toBe(true);
  });
});
