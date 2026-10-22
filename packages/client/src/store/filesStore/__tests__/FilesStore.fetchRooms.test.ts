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

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { observable, runInAction } from "mobx";
import api from "@docspace/shared/api";
import type RoomsFilter from "@docspace/shared/api/rooms/filter";
import {
  FileType,
  FolderType,
  RoomPrivacyFilter,
  RoomSearchArea,
  RoomsType,
} from "@docspace/shared/enums";
import { CategoryType } from "@docspace/shared/constants";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

const room = (id: number): TItem =>
  ({ id, title: `room${id}`, roomType: RoomsType.CustomRoom } as unknown as TItem);

const file = (id: number): TItem =>
  ({
    id,
    parentId: 10,
    title: `f${id}.docx`,
    fileExst: ".docx",
    fileType: FileType.Document,
  }) as unknown as TItem;

const roomsPayload = (folders: TItem[]) => ({
  total: folders.length,
  folders,
  files: [],
  new: 0,
  pathParts: [] as unknown[],
  current: { id: 7, parentId: 0, rootFolderType: FolderType.Rooms, security: {} },
});

describe("FilesStore.fetchRooms — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("requests rooms and puts them in folders, clearing files", async () => {
    const store = createTestFilesStore();
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(roomsPayload([room(1), room(2)]) as never);

    await store.fetchRooms(0);

    expect(getRooms).toHaveBeenCalledTimes(1);
    expect(store.folders.map((f) => f.id)).toEqual([1, 2]);
    expect(store.files).toEqual([]);
  });

  it("aborts the previous rooms request and installs a fresh controller", async () => {
    const store = createTestFilesStore();
    vi.spyOn(api.rooms, "getRooms").mockResolvedValue(roomsPayload([]) as never);
    const prev = { abort: vi.fn() } as unknown as AbortController;
    store.roomsController = prev;

    await store.fetchRooms(0);

    expect(prev.abort).toHaveBeenCalledTimes(1);
    expect(store.roomsController).toBeNull(); // reset to null at the end
  });
});

describe("FilesStore.fetchAgents — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("requests AI agents via api.ai.getAIAgents and fills folders", async () => {
    const store = createTestFilesStore();
    const getAgents = vi
      .spyOn(api.ai, "getAIAgents")
      .mockResolvedValue(roomsPayload([room(3)]) as never);

    await store.fetchAgents(0);

    expect(getAgents).toHaveBeenCalledTimes(1);
    expect(store.folders.map((f) => f.id)).toEqual([3]);
    expect(store.files).toEqual([]);
  });
});

describe("FilesStore.fetchMoreFiles — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("no-ops when there are no more files", async () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    store.files = [file(1)] as never;
    store.filter.total = 1; // filesList already covers the total

    const getFolder = vi.spyOn(api.files, "getFolder");
    await store.fetchMoreFiles();
    expect(getFolder).not.toHaveBeenCalled();
  });

  it("appends the next page (deduped) for a regular folder", async () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    store.files = [file(1)] as never;
    store.folders = [];
    store.filter.total = 10; // more available
    store.filter.page = 0;

    vi.spyOn(api.files, "getFolder").mockResolvedValue({
      files: [file(1), file(2)], // includes a duplicate to prove dedup
      folders: [],
    } as never);

    await store.fetchMoreFiles();

    expect(store.files.map((f) => f.id)).toEqual([1, 2]);
    expect(store.filesIsLoading).toBe(false);
  });
});

// A page past the last available one clamps to the last page and re-requests.
const highTotalPayload = () => ({
  total: 10,
  folders: [room(1)],
  files: [],
  new: 0,
  pathParts: [] as unknown[],
  current: { id: 7, parentId: 0, rootFolderType: FolderType.Rooms, security: {} },
});

describe("FilesStore.fetchRooms / fetchAgents — last-page clamp", () => {
  afterEach(() => vi.restoreAllMocks());

  it("fetchRooms re-requests when the page is beyond the last page", async () => {
    const store = createTestFilesStore();
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(highTotalPayload() as never);

    const filter = store.roomsFilter.clone();
    filter.page = 5;
    filter.pageCount = 50; // custom count keeps page from being reset to 0

    await store.fetchRooms(0, filter);

    // once for the out-of-range page, once for the clamped page
    expect(getRooms).toHaveBeenCalledTimes(2);
  });

  it("fetchAgents re-requests when the page is beyond the last page", async () => {
    const store = createTestFilesStore();
    const getAgents = vi
      .spyOn(api.ai, "getAIAgents")
      .mockResolvedValue(highTotalPayload() as never);

    const filter = store.roomsFilter.clone();
    filter.page = 5;
    filter.pageCount = 50;

    await store.fetchAgents(0, filter);

    expect(getAgents).toHaveBeenCalledTimes(2);
  });
});

type TDocSpaceWindow = { DocSpace?: { location: { pathname: string } } };

const openAddress = (pathname: string) => {
  (window as unknown as TDocSpaceWindow).DocSpace = { location: { pathname } };
};

const sentFilter = (getRooms: { mock: { calls: unknown[][] } }, call = 0) =>
  getRooms.mock.calls[call][0] as RoomsFilter;

const storeOnRoomsList = (isPrivateRoomsSectionAvailable: boolean) => {
  const store = createTestFilesStore({
    treeFoldersStore: { isRoomsFolder: true },
  });
  store.appsStore = {
    isPrivateRoomsSectionAvailable,
    isInstalled: () => true,
  };
  store.getFilesContextOptions = (() => []) as never;
  return store;
};

describe("FilesStore rooms requests — Private section scope", () => {
  beforeEach(() => openAddress("/rooms/shared/filter"));

  afterEach(() => {
    delete (window as unknown as TDocSpaceWindow).DocSpace;
    vi.restoreAllMocks();
  });

  it.each([
    ["/private/filter", RoomSearchArea.Active],
    ["/private/12/filter", RoomSearchArea.Active],
    ["/private/archived/filter", RoomSearchArea.Archive],
  ])("List opened: Private on %s", async (pathname, searchArea) => {
    openAddress(pathname);
    const store = storeOnRoomsList(true);
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(roomsPayload([room(1)]) as never);

    await store.fetchRooms(0);

    expect(sentFilter(getRooms)).toMatchObject({
      privacyFilter: RoomPrivacyFilter.Private,
      searchArea,
    });
  });

  it.each([
    ["/rooms/shared/filter", RoomSearchArea.Active],
    ["/rooms/archived/filter", RoomSearchArea.Archive],
  ])(
    "NotPrivate on %s while the section is available",
    async (pathname, searchArea) => {
      openAddress(pathname);
      const store = storeOnRoomsList(true);
      const getRooms = vi
        .spyOn(api.rooms, "getRooms")
        .mockResolvedValue(roomsPayload([room(1)]) as never);
      const filter = store.roomsFilter.clone();
      filter.searchArea = searchArea;

      await store.fetchRooms(0, filter);

      expect(sentFilter(getRooms)).toMatchObject({
        privacyFilter: RoomPrivacyFilter.NotPrivate,
        searchArea,
      });
    },
  );

  it.each([
    ["Search in Rooms", { filterValue: "budget" }],
    ["Room group opened in Rooms", { groupId: "group-1" }],
  ])(
    "%s: NotPrivate while the section is available",
    async (_, query) => {
      const store = storeOnRoomsList(true);
      const getRooms = vi
        .spyOn(api.rooms, "getRooms")
        .mockResolvedValue(roomsPayload([room(1)]) as never);
      const filter = Object.assign(store.roomsFilter.clone(), query);

      await store.fetchRooms(0, filter);

      expect(sentFilter(getRooms)).toMatchObject({
        ...query,
        privacyFilter: RoomPrivacyFilter.NotPrivate,
      });
    },
  );

  it("none while the section is not available", async () => {
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(roomsPayload([room(1)]) as never);

    const unavailable = storeOnRoomsList(false);
    await unavailable.fetchRooms(0);

    const beforeAppsStore = storeOnRoomsList(false);
    beforeAppsStore.appsStore = null;
    await beforeAppsStore.fetchRooms(0);

    expect(sentFilter(getRooms, 0).privacyFilter).toBeNull();
    expect(sentFilter(getRooms, 1).privacyFilter).toBeNull();
  });

  it("Address carries another privacy value: the URL privacyFilter and searchArea are overridden, roomsFilter is not mutated", async () => {
    openAddress("/private/filter");
    const store = storeOnRoomsList(true);
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(roomsPayload([room(1)]) as never);
    const filter = store.roomsFilter.clone();
    filter.privacyFilter = RoomPrivacyFilter.NotPrivate;
    filter.searchArea = RoomSearchArea.Archive;

    await store.fetchRooms(0, filter);

    expect(sentFilter(getRooms)).toMatchObject({
      privacyFilter: RoomPrivacyFilter.Private,
      searchArea: RoomSearchArea.Active,
    });
    expect(filter.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
    expect(store.roomsFilter.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
    expect(store.roomsFilter.searchArea).toBe(RoomSearchArea.Archive);
  });

  it("Next page: the next-page request keeps the scope", async () => {
    openAddress("/private/archived/filter");
    const store = storeOnRoomsList(true);
    store.folders = [room(1)] as never;
    store.roomsFilter.total = 10;
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(roomsPayload([room(2)]) as never);

    await store.fetchMoreFiles();

    expect(sentFilter(getRooms)).toMatchObject({
      privacyFilter: RoomPrivacyFilter.Private,
      searchArea: RoomSearchArea.Archive,
      page: 1,
    });
    expect(store.roomsFilter.privacyFilter).toBeNull();
  });

  it("Refill after archiving: the refill after rooms leave the list keeps the scope", async () => {
    openAddress("/private/filter");
    const store = storeOnRoomsList(true);
    store.folders = [room(1), room(2), room(3)] as never;
    store.roomsFilter.total = 200;
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(roomsPayload([room(4)]) as never);

    await store.removeFiles(null, [1]);

    expect(sentFilter(getRooms)).toMatchObject({
      privacyFilter: RoomPrivacyFilter.Private,
      searchArea: RoomSearchArea.Active,
    });
    expect(store.folders.map((f) => f.id)).toEqual([2, 3, 4]);
  });

  it("reloads the open Rooms list when the section availability flips", async () => {
    const store = storeOnRoomsList(true);
    const apps = observable({
      isPrivateRoomsSectionAvailable: true,
      isInstalled: () => true,
    });
    const getRooms = vi
      .spyOn(api.rooms, "getRooms")
      .mockResolvedValue(roomsPayload([room(1)]) as never);
    store.watchPrivateRoomsSection(apps);

    runInAction(() => {
      apps.isPrivateRoomsSectionAvailable = false;
    });
    await vi.waitFor(() => expect(getRooms).toHaveBeenCalledTimes(1));
    expect(sentFilter(getRooms, 0).privacyFilter).toBeNull();

    runInAction(() => {
      apps.isPrivateRoomsSectionAvailable = true;
    });
    await vi.waitFor(() => expect(getRooms).toHaveBeenCalledTimes(2));
    expect(sentFilter(getRooms, 1).privacyFilter).toBe(
      RoomPrivacyFilter.NotPrivate,
    );
  });

  it.each(["/private/filter", "/rooms/shared/12/filter"])(
    "leaves %s alone when the section availability flips",
    async (pathname) => {
      openAddress(pathname);
      const store = storeOnRoomsList(true);
      const apps = observable({
        isPrivateRoomsSectionAvailable: true,
        isInstalled: () => true,
      });
      const getRooms = vi.spyOn(api.rooms, "getRooms");
      store.watchPrivateRoomsSection(apps);

      runInAction(() => {
        apps.isPrivateRoomsSectionAvailable = false;
      });

      expect(getRooms).not.toHaveBeenCalled();
    },
  );
});

describe("FilesStore.fetchRooms — selection carried into the list", () => {
  afterEach(() => vi.restoreAllMocks());

  // useFiles fetches the rooms list without clearing the selection.
  const fetchListShowing = async (shownFolderId: number) => {
    const store = createTestFilesStore();
    vi.spyOn(api.rooms, "getRooms").mockResolvedValue(
      roomsPayload([room(1), room(2)]) as never,
    );
    store.selectedFolderStore.id = shownFolderId;
    store.categoryType = CategoryType.Shared;
    store.setBufferSelection(file(30));

    await store.fetchRooms(null, null, undefined, undefined, false);

    return store;
  };

  it("keeps the selection when the list on screen is fetched again", async () => {
    const store = await fetchListShowing(7);

    expect(store.bufferSelection?.id).toBe(30);
  });

  it("Nothing selected on the list: drops the selection of the room it was opened from", async () => {
    const store = await fetchListShowing(12);

    expect(store.bufferSelection).toBeNull();
    expect(store.selection).toEqual([]);
  });
});
