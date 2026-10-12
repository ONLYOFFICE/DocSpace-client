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

import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture the persistence calls: setFilesFilter/setRoomsFilter persist the
// chosen sort into user storage via userFilterUtils. Mock it so we can assert
// the key/payload without touching localStorage.
vi.mock("@docspace/shared/utils/userFilterUtils", () => ({
  getUserFilter: vi.fn(() => ({ sortBy: "DateAndTime", sortOrder: "descending" })),
  setUserFilter: vi.fn(),
}));

import { getUserFilter, setUserFilter } from "@docspace/shared/utils/userFilterUtils";

import { createTestFilesStore } from "./testHarness";

describe("FilesStore.setFilesFilter — characterization", () => {
  beforeEach(() => {
    vi.mocked(setUserFilter).mockClear();
    vi.mocked(getUserFilter).mockClear();
  });

  it("assigns the filter and resets the pagination/find flags", () => {
    const store = createTestFilesStore();
    store.isHidePagination = true;
    store.isLoadingFilesFind = true;

    const filter = store.filter.clone();
    store.setFilesFilter(filter);

    expect(store.filter).toBe(filter);
    expect(store.isHidePagination).toBe(false);
    expect(store.isLoadingFilesFind).toBe(false);
  });

  it("persists the chosen sort via setUserFilter", () => {
    const store = createTestFilesStore();
    const filter = store.filter.clone();
    filter.sortBy = "AZ";
    filter.sortOrder = "ascending";

    store.setFilesFilter(filter);

    expect(setUserFilter).toHaveBeenCalledTimes(1);
    const [, payload] = vi.mocked(setUserFilter).mock.calls[0];
    expect(payload).toMatchObject({ sortBy: "AZ", sortOrder: "ascending" });
  });
});

describe("FilesStore.setRoomsFilter — characterization", () => {
  beforeEach(() => {
    vi.mocked(setUserFilter).mockClear();
  });

  it("forces pageCount=100, assigns roomsFilter and persists sort", () => {
    const store = createTestFilesStore();
    const filter = store.roomsFilter.clone();
    filter.sortBy = "AZ";
    filter.sortOrder = "ascending";

    store.setRoomsFilter(filter);

    expect(filter.pageCount).toBe(100);
    expect(store.roomsFilter).toBe(filter);
    expect(setUserFilter).toHaveBeenCalledTimes(1);
  });
});
