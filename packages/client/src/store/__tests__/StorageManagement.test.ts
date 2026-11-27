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

const api = vi.hoisted(() => ({
  getPortal: vi.fn(),
  getPortalUsersCount: vi.fn(),
  getFilesUsedSpace: vi.fn(),
  checkRecalculateQuota: vi.fn(),
  getQuotaSettings: vi.fn(),
  recalculateQuota: vi.fn(),
  getRooms: vi.fn(),
  getUserList: vi.fn(),
}));
const toastr = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock("@docspace/shared/api/portal", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getPortal: api.getPortal,
  getPortalUsersCount: api.getPortalUsersCount,
}));
vi.mock("@docspace/shared/api/files", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getFilesUsedSpace: api.getFilesUsedSpace,
}));
vi.mock("@docspace/shared/api/settings", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  checkRecalculateQuota: api.checkRecalculateQuota,
  getQuotaSettings: api.getQuotaSettings,
  recalculateQuota: api.recalculateQuota,
}));
vi.mock("@docspace/shared/api/rooms", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getRooms: api.getRooms,
}));
vi.mock("@docspace/shared/api/people", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getUserList: api.getUserList,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));

import { RoomsProviderType, SortByFieldName } from "@docspace/shared/enums";

import StorageManagement from "../StorageManagement";

type TStoreArgs = ConstructorParameters<typeof StorageManagement>;

const makeStore = ({ isFreeTariff = false, standalone = false } = {}) =>
  new StorageManagement(
    ...([
      { getFilesListItems: (items: unknown[]) => items },
      { usersStore: { getPeopleListItem: (user: unknown) => user } },
      {},
      { isFreeTariff, fetchPortalQuota: vi.fn() },
      { standalone, addAbortControllers: vi.fn() },
    ] as unknown as TStoreArgs),
  );

beforeEach(() => {
  api.getPortal.mockResolvedValue({});
  api.getPortalUsersCount.mockResolvedValue(3);
  api.getFilesUsedSpace.mockResolvedValue({});
  api.getQuotaSettings.mockResolvedValue({ lastRecalculateDate: "2026-11-01" });
  api.checkRecalculateQuota.mockResolvedValue(false);
  api.recalculateQuota.mockResolvedValue(undefined);
  api.getRooms.mockResolvedValue({ folders: [{ id: 1 }] });
  api.getUserList.mockResolvedValue({ items: [{ id: "u1" }] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Top lists of Storage management", () => {
  it("rooms and users asked for by used space, largest first, one more than shown", async () => {
    const store = makeStore();

    await store.init();

    const [users] = api.getUserList.mock.calls[0];
    const [rooms] = api.getRooms.mock.calls[0];
    for (const filter of [users, rooms]) {
      expect(filter.sortBy).toBe(SortByFieldName.UsedSpace);
      expect(filter.sortOrder).toBe("descending");
      expect(filter.pageCount).toBe(6);
    }
    expect(Number(rooms.provider)).toBe(RoomsProviderType.Storage);
    expect(store.accounts).toEqual([{ id: "u1" }]);
    expect(store.rooms).toEqual([{ id: 1 }]);
    expect(store.activeUsersCount).toBe(3);
  });

  it("Free plan on SaaS: no top lists", async () => {
    await makeStore({ isFreeTariff: true }).init();

    expect(api.getUserList).not.toHaveBeenCalled();
    expect(api.getRooms).not.toHaveBeenCalled();
  });

  it("Server installation: top lists whatever the plan", async () => {
    await makeStore({ isFreeTariff: true, standalone: true }).init();

    expect(api.getUserList).toHaveBeenCalled();
  });
});

describe("Recalculating the used space", () => {
  it("Never recalculated: started at once, busy until the server is done, then reloaded", async () => {
    vi.useFakeTimers();
    api.getQuotaSettings.mockResolvedValue({});
    api.checkRecalculateQuota
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const store = makeStore();

    await store.init();

    expect(api.recalculateQuota).toHaveBeenCalledTimes(1);
    expect(store.isRecalculating).toBe(true);

    await vi.advanceTimersByTimeAsync(2000);
    expect(store.isRecalculating).toBe(true);

    await vi.advanceTimersByTimeAsync(2000);
    expect(store.isRecalculating).toBe(false);
    expect(api.getPortal).toHaveBeenCalledTimes(2);
  });

  it("Recalculation still running on the server: busy and watched", async () => {
    vi.useFakeTimers();
    api.checkRecalculateQuota
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const store = makeStore();

    await store.init();

    expect(api.recalculateQuota).not.toHaveBeenCalled();
    expect(store.isRecalculating).toBe(true);

    await vi.advanceTimersByTimeAsync(2000);
    expect(store.isRecalculating).toBe(false);
  });

  it("Recalculation refused: the error is shown and the page is not busy", async () => {
    api.getQuotaSettings.mockResolvedValue({});
    api.recalculateQuota.mockRejectedValue("Server error");
    const store = makeStore();

    await store.init();

    expect(toastr.error).toHaveBeenCalledWith("Server error");
    expect(store.isRecalculating).toBe(false);
  });
});
