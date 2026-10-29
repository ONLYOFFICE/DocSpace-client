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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "@docspace/shared/api";
import { FileType, FolderType, RoomsType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import { syncSelectedFolderCountsImpl } from "../socket.helpers";
import type { TItem } from "../types";

let navigate: ReturnType<typeof vi.fn>;

beforeEach(() => {
  navigate = vi.fn();
  (window as unknown as { DocSpace: unknown }).DocSpace = { navigate };
});

describe("FilesStore.wsModifyFolderCreate — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("increments the target folder's filesCount for a file created elsewhere", async () => {
    const store = createTestFilesStore(); // current folder id === 1
    store.folders = [{ id: 50, filesCount: 0 } as TItem] as never;

    await store.wsModifyFolderCreate({
      type: "file",
      id: 1,
      data: JSON.stringify({ folderId: 50 }), // not the current folder
    } as never);

    expect((store.folders[0] as { filesCount: number }).filesCount).toBe(1);
  });

  it("updates the version of an existing file in the current folder", async () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    store.files = [
      { id: 1, folderId: 1, version: 1, versionGroup: 1 } as TItem,
    ] as never;
    vi.spyOn(api.files, "getFileInfo").mockResolvedValue({
      id: 1,
      version: 2,
      versionGroup: 2,
    } as never);

    await store.wsModifyFolderCreate({
      type: "file",
      id: 1,
      data: JSON.stringify({ folderId: 1, version: 2, versionGroup: 2 }),
    } as never);

    expect(store.files[0].version).toBe(2);
    expect(store.files[0].versionGroup).toBe(2);
  });
});

describe("FilesStore.wsModifyFolderCreate — form rooms", () => {
  afterEach(() => vi.restoreAllMocks());

  const roomsFolderId = 8;
  const formsFolderId = 9;

  const createRoom = (store: ReturnType<typeof createTestFilesStore>, roomType: RoomsType) => {
    const room = {
      id: 100,
      title: "Room",
      roomType,
      parentId: roomsFolderId,
      createdBy: { id: "other-user" },
    };
    vi.spyOn(api.files, "getFolderInfo").mockResolvedValue(room as never);

    return store.wsModifyFolderCreate({
      type: "folder",
      id: room.id,
      data: JSON.stringify(room),
    } as never);
  };

  it("adds a form room created by another user to the Forms list", async () => {
    const store = createTestFilesStore({
      selectedFolderStore: { id: formsFolderId },
      treeFoldersStore: { isFormsFolder: true },
    });

    await createRoom(store, RoomsType.FormRoom);

    expect(store.folders.map((f) => f.id)).toEqual([100]);
  });

  it("does not add a form room created by another user to the Rooms list", async () => {
    const store = createTestFilesStore({
      selectedFolderStore: { id: roomsFolderId },
      treeFoldersStore: { isFormsFolder: false },
    });

    await createRoom(store, RoomsType.FormRoom);

    expect(store.folders).toEqual([]);
  });

  it("adds a regular room created by another user to the Rooms list", async () => {
    const store = createTestFilesStore({
      selectedFolderStore: { id: roomsFolderId },
      treeFoldersStore: { isFormsFolder: false },
    });

    await createRoom(store, RoomsType.CustomRoom);

    expect(store.folders.map((f) => f.id)).toEqual([100]);
  });

  // A form room is listed in Forms, though its parent is the Rooms folder: it
  // is counted where it is listed, or deleting it later would take the count
  // of Forms below its real value.
  it("counts a form room in the Forms list it is added to", async () => {
    const setFoldersCount = vi.fn();
    const store = createTestFilesStore({
      selectedFolderStore: { id: formsFolderId, foldersCount: 0, setFoldersCount },
      treeFoldersStore: { isFormsFolder: true },
    });

    await createRoom(store, RoomsType.FormRoom);

    expect(setFoldersCount).toHaveBeenCalledWith(1);
  });

  it("does not count a form room in the Rooms list it is left out of", async () => {
    const setFoldersCount = vi.fn();
    const store = createTestFilesStore({
      selectedFolderStore: { id: roomsFolderId, foldersCount: 0, setFoldersCount },
      treeFoldersStore: { isFormsFolder: false },
    });

    await createRoom(store, RoomsType.FormRoom);

    expect(setFoldersCount).not.toHaveBeenCalled();
  });

  it("does not add a regular room created by another user to the Forms list", async () => {
    const store = createTestFilesStore({
      selectedFolderStore: { id: formsFolderId },
      treeFoldersStore: { isFormsFolder: true },
    });

    await createRoom(store, RoomsType.CustomRoom);

    expect(store.folders).toEqual([]);
  });
});

describe("FilesStore.wsModifyFolderCreate — Private section", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  const ROOMS_ROOT_ID = 8;

  const roomArrives = async (
    pathname: string,
    isPrivate: boolean,
    createdBy = "other-user",
  ) => {
    window.history.pushState({}, "", pathname);
    const store = createTestFilesStore({
      selectedFolderStore: { id: ROOMS_ROOT_ID },
      treeFoldersStore: { isFormsFolder: false },
    });
    store.appsStore = {
      isPrivateRoomsSectionAvailable: true,
      isInstalled: () => true,
    } as never;
    // The socket payload carries no private flag; folder info does.
    const room = {
      id: 100,
      title: "Room",
      roomType: RoomsType.CustomRoom,
      parentId: ROOMS_ROOT_ID,
      createdBy: { id: createdBy },
    };
    vi.spyOn(api.files, "getFolderInfo").mockResolvedValue({
      ...room,
      private: isPrivate,
    } as never);

    await store.wsModifyFolderCreate({
      type: "folder",
      id: room.id,
      data: JSON.stringify(room),
    } as never);

    return store.folders.map((f) => f.id);
  };

  it("Invited to a private room: not inserted into the Rooms list", async () => {
    expect(await roomArrives("/rooms/shared/filter", true)).toEqual([]);
  });

  it("Invited to a private room: inserted into the Private list", async () => {
    expect(await roomArrives("/private/filter", true)).toEqual([100]);
  });

  it("Ordinary room created in another tab: not inserted into the Private list", async () => {
    expect(await roomArrives("/private/filter", false, "user-1")).toEqual([]);
  });

  it("Ordinary room created in another tab: inserted into the Rooms list", async () => {
    expect(await roomArrives("/rooms/shared/filter", false, "user-1")).toEqual([
      100,
    ]);
  });
});

describe("FilesStore.redirectToParent — characterization", () => {
  const pathPart = (id: number) => ({ id }) as never;

  it("navigates to the templates listing when a template room is removed", () => {
    const store = createTestFilesStore();

    store.redirectToParent(
      { id: 5 } as never,
      [pathPart(1), pathPart(5)],
      true, // isRoom
      true, // isTemplate
      FolderType.Rooms,
    );

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(String(navigate.mock.calls[0][0])).toContain("/rooms/shared/filter");
  });

  it("navigates to the form templates listing when a form template is removed", () => {
    const store = createTestFilesStore({
      selectedFolderStore: { roomType: RoomsType.FormRoom },
    });

    store.redirectToParent(
      { id: 5 } as never,
      [pathPart(1), pathPart(5)],
      true, // isRoom
      true, // isTemplate
      FolderType.RoomTemplates,
    );

    expect(navigate).toHaveBeenCalledTimes(1);
    const url = String(navigate.mock.calls[0][0]);
    expect(url).toContain("/forms/filter");
    expect(url).toContain("searchArea=FormTemplates");
  });

  it("does nothing when the removed id is not part of the path", () => {
    const store = createTestFilesStore();

    store.redirectToParent(
      { id: 999 } as never,
      [pathPart(1), pathPart(2)],
      true,
      true,
      RoomsType.CustomRoom as unknown as FolderType,
    );

    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("FilesStore.wsModifyFolderCreate — deferred queue add", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("enqueues a getFileInfo lookup ~300ms after a new-file event", async () => {
    vi.useFakeTimers();
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    store.files = [];
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    const getFileInfo = vi
      .spyOn(api.files, "getFileInfo")
      .mockResolvedValue({ id: 7, folderId: 1 } as never);

    await store.wsModifyFolderCreate({
      type: "file",
      id: 7,
      data: JSON.stringify({ id: 7, folderId: 1, title: "New.docx" }),
    } as never);

    // nothing fetched yet — the lookup is deferred behind a 300ms timer
    expect(getFileInfo).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);

    expect(getFileInfo).toHaveBeenCalledWith(7, undefined);
  });
});

// The harness wraps its fakes in MobX, so spies are kept by reference here.
const createCountingStore = () => {
  const counts = { setFilesCount: vi.fn(), setFoldersCount: vi.fn() };
  const store = createTestFilesStore({
    selectedFolderStore: { id: 1, filesCount: 0, foldersCount: 0, ...counts },
  });
  return { store, ...counts };
};

describe("FilesStore.wsModifyFolderCreate — folders count", () => {
  afterEach(() => vi.restoreAllMocks());

  it("counts a folder created in the current folder", async () => {
    const { store, setFoldersCount } = createCountingStore();
    store.folders = [{ id: 60 } as TItem] as never;

    await store.wsModifyFolderCreate({
      type: "folder",
      id: 60,
      data: JSON.stringify({ id: 60, parentId: 1 }),
    } as never);

    expect(setFoldersCount).toHaveBeenCalledWith(1);
  });

  // The parent folders are subscribed too, so their events reach the store.
  it("does not count a folder created in a parent folder", async () => {
    const { store, setFoldersCount } = createCountingStore();

    await store.wsModifyFolderCreate({
      type: "folder",
      id: 60,
      data: JSON.stringify({ id: 60, parentId: 50 }),
    } as never);

    expect(setFoldersCount).not.toHaveBeenCalled();
  });
});

describe("syncSelectedFolderCounts", () => {
  afterEach(() => vi.restoreAllMocks());

  it("takes the current folder's counts from the server", async () => {
    const { store, setFilesCount, setFoldersCount } = createCountingStore();
    vi.spyOn(api.files, "getFolderInfo").mockResolvedValue({
      id: 1,
      filesCount: 6,
      foldersCount: 2,
    } as never);

    await syncSelectedFolderCountsImpl(store);

    expect(api.files.getFolderInfo).toHaveBeenCalledWith(1, true);
    expect(setFilesCount).toHaveBeenCalledWith(6);
    expect(setFoldersCount).toHaveBeenCalledWith(2);
  });

  it("drops the answer when the user has left the folder meanwhile", async () => {
    const { store, setFilesCount } = createCountingStore();
    vi.spyOn(api.files, "getFolderInfo").mockImplementation(async () => {
      store.selectedFolderStore.id = 2;
      return { id: 1, filesCount: 6, foldersCount: 2 } as never;
    });

    await syncSelectedFolderCountsImpl(store);

    expect(setFilesCount).not.toHaveBeenCalled();
  });

  it("keeps the local counts when the request fails", async () => {
    const { store, setFilesCount } = createCountingStore();
    vi.spyOn(api.files, "getFolderInfo").mockRejectedValue(new Error("403"));

    await syncSelectedFolderCountsImpl(store);

    expect(setFilesCount).not.toHaveBeenCalled();
  });
});
