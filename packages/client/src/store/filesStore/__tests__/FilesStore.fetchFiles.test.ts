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
import axios from "axios";
import api from "@docspace/shared/api";
import { FileType, FolderType, RoomsType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
// After the harness, which mocks the toast module.
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

// Minimal getFolder payload for a plain personal folder (empty pathParts skips
// the per-crumb getFolderInfo calls; USER root skips the room/AI branches).
const folderPayload = () => ({
  total: 0,
  folders: [],
  files: [],
  new: 0,
  pathParts: [] as unknown[],
  current: {
    id: 1,
    parentId: 0,
    rootFolderType: FolderType.USER,
    security: {},
    private: false,
    roomType: undefined,
    inRoom: false,
    type: undefined,
  },
});

describe("FilesStore.fetchFiles — characterization", () => {
  beforeEach(() => {
    (window as unknown as { DocSpace: unknown }).DocSpace = {
      navigate: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests the folder and populates files/folders from the response", async () => {
    const store = createTestFilesStore();
    const getFolder = vi
      .spyOn(api.files, "getFolder")
      .mockResolvedValue(folderPayload() as never);

    await store.fetchFiles(1);

    expect(getFolder).toHaveBeenCalledTimes(1);
    expect(getFolder.mock.calls[0][0]).toBe(1); // folderId
    expect(store.files).toEqual([]);
    expect(store.folders).toEqual([]);
  });

  it("aborts the previous request and installs a fresh AbortController", async () => {
    const store = createTestFilesStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(folderPayload() as never);

    const prev = { abort: vi.fn() } as unknown as AbortController;
    store.filesController = prev;

    await store.fetchFiles(1);

    expect(prev.abort).toHaveBeenCalledTimes(1);
    expect(store.filesController).not.toBe(prev);
  });

  it("redirects a visitor without a personal folder away from @my (no fetch)", async () => {
    const store = createTestFilesStore({
      userStore: {
        user: { id: "u1", isVisitor: true, hasPersonalFolder: false },
      },
    });
    const getFolder = vi.spyOn(api.files, "getFolder");

    await store.fetchFiles("@my");

    expect(
      (window as unknown as { DocSpace: { navigate: ReturnType<typeof vi.fn> } })
        .DocSpace.navigate,
    ).toHaveBeenCalledTimes(1);
    expect(getFolder).not.toHaveBeenCalled();
  });
});

const ROOMS_ROOT = { id: 2, title: "Rooms", folderType: FolderType.Rooms };
const ROOM = { id: 5, title: "Room", roomType: RoomsType.CustomRoom };
const SUBFOLDER = { id: 6, title: "Reports" };

const roomContents = (isPrivateRoom: boolean, inSubfolder = false) => ({
  total: 1,
  folders: [],
  files: [
    {
      id: 70,
      parentId: inSubfolder ? SUBFOLDER.id : ROOM.id,
      title: "plan.txt",
      fileExst: ".txt",
      fileType: FileType.Document,
      viewAccessibility: {},
    },
  ],
  new: 0,
  pathParts: inSubfolder ? [ROOMS_ROOT, ROOM, SUBFOLDER] : [ROOMS_ROOT, ROOM],
  current: {
    ...(inSubfolder ? SUBFOLDER : ROOM),
    parentId: inSubfolder ? ROOM.id : ROOMS_ROOT.id,
    rootFolderType: FolderType.Rooms,
    security: {},
    private: inSubfolder ? false : isPrivateRoom,
    inRoom: true,
  },
});

describe("FilesStore.fetchFiles — Private section address", () => {
  let navigate: ReturnType<typeof vi.fn>;

  const openAddress = (pathname: string, search: string, state?: unknown) => {
    (window as unknown as { DocSpace: unknown }).DocSpace = {
      navigate,
      location: { pathname, search, state },
    };
  };

  const sectionStore = (
    isPrivateRoomsSectionAvailable = true,
    overrides: Parameters<typeof createTestFilesStore>[0] = {},
  ) => {
    const store = createTestFilesStore(overrides);
    store.appsStore = {
      isPrivateRoomsSectionAvailable,
      isInstalled: () => true,
    };
    store.getFilesContextOptions = (() => []) as never;
    store.maybeBackfillEncryptedRoom = vi.fn();
    return store;
  };

  /** The section loading setters, kept to assert on what the store calls. */
  const sectionLoading = () => ({
    setIsSectionHeaderLoading: vi.fn(),
    setIsSectionFilterLoading: vi.fn(),
  });

  beforeEach(() => {
    navigate = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("commits no state before moving a private room opened under Rooms", async () => {
    openAddress("/rooms/shared/5/filter", "?folder=5", { highlightFileId: 70 });
    const store = sectionStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(true) as never,
    );
    const { categoryType, filter } = store;

    await store.fetchFiles(5);

    expect(navigate).toHaveBeenCalledWith("/private/5/filter?folder=5", {
      replace: true,
      state: { highlightFileId: 70, privateRoomsSectionDecided: true },
    });
    expect(store.files).toEqual([]);
    expect(store.categoryType).toBe(categoryType);
    expect(store.filter).toBe(filter);
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("Embedded frame", async () => {
    openAddress("/rooms/shared/5/filter", "?folder=5");
    const store = sectionStore();
    Object.assign(store.settingsStore, { isFrame: true });
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(true) as never,
    );

    await store.fetchFiles(5);

    expect(navigate).toHaveBeenCalledWith(
      "/private/5/filter?folder=5",
      expect.objectContaining({ replace: true }),
    );
    expect(store.files).toEqual([]);
  });

  it("shows the room once its address was decided", async () => {
    openAddress("/private/5/filter", "?folder=5", {
      privateRoomsSectionDecided: true,
    });
    const store = sectionStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(true) as never,
    );

    await store.fetchFiles(5);

    expect(navigate).not.toHaveBeenCalled();
    expect(store.files.map((f) => f.id)).toEqual([70]);
    expect(toastr.warning).toHaveBeenCalledTimes(1);
  });

  it("moves an ordinary room opened under /private to Rooms", async () => {
    openAddress("/private/5/filter", "?folder=5");
    const store = sectionStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(false) as never,
    );

    await store.fetchFiles(5);

    expect(navigate).toHaveBeenCalledWith(
      "/rooms/shared/5/filter?folder=5",
      expect.objectContaining({ replace: true }),
    );
    expect(store.files).toEqual([]);
  });

  it("reads the room of a folder once to decide its section", async () => {
    openAddress("/private/6/filter", "?folder=6");
    const store = sectionStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(true, true) as never,
    );
    const getFolderInfo = vi
      .spyOn(api.files, "getFolderInfo")
      .mockResolvedValue({ ...ROOM, private: true, security: {} } as never);

    await store.fetchFiles(6);

    expect(navigate).not.toHaveBeenCalled();
    expect(getFolderInfo).toHaveBeenCalledTimes(1);
    expect(store.files.map((f) => f.id)).toEqual([70]);
  });

  it("commits nothing and moves no room when its fetch was superseded", async () => {
    openAddress("/rooms/shared/6/filter", "?folder=6");
    const store = sectionStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(true, true) as never,
    );
    let roomLookupSignal: AbortSignal | undefined;
    vi.spyOn(api.files, "getFolderInfo").mockImplementation(
      async (_id, _skipRedirect, _share, signal) => {
        roomLookupSignal = signal;
        store.filesController = new AbortController();
        return { ...ROOM, private: true, security: {} } as never;
      },
    );
    const { categoryType, filter } = store;
    const selectedFolderId = store.selectedFolderStore.id;

    const fetching = store.fetchFiles(6);
    const fetchSignal = store.filesController!.signal;
    await fetching;

    expect(navigate).not.toHaveBeenCalled();
    expect(roomLookupSignal).toBe(fetchSignal);
    expect(store.files).toEqual([]);
    expect(store.folders).toEqual([]);
    expect(store.categoryType).toBe(categoryType);
    expect(store.filter).toBe(filter);
    expect(store.selectedFolderStore.id).toBe(selectedFolderId);
  });

  it("Superseded load", async () => {
    openAddress("/rooms/shared/6/filter", "?folder=6", { highlightFileId: 70 });
    const clientLoadingStore = sectionLoading();
    const store = sectionStore(true, { clientLoadingStore });
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(true, true) as never,
    );
    vi.spyOn(api.files, "getFolderInfo").mockImplementation(async () => {
      store.filesController = new AbortController();
      return { ...ROOM, private: true, security: {} } as never;
    });
    const setIsLoadedFetchFiles = vi.fn();
    const setHighlightFile = vi.fn();
    store.setIsLoadedFetchFiles = setIsLoadedFetchFiles;
    store.setHighlightFile = setHighlightFile;

    await store.fetchFiles(6);

    expect(setIsLoadedFetchFiles).not.toHaveBeenCalledWith(true);
    expect(clientLoadingStore.setIsSectionHeaderLoading).not.toHaveBeenCalled();
    expect(clientLoadingStore.setIsSectionFilterLoading).not.toHaveBeenCalled();
    expect(setHighlightFile).not.toHaveBeenCalled();
  });

  it("Superseded load: a cancelled fetch whose successor took the controller", async () => {
    openAddress("/private/5/filter", "?folder=5", { highlightFileId: 70 });
    const clientLoadingStore = sectionLoading();
    const store = sectionStore(true, { clientLoadingStore });
    vi.spyOn(api.files, "getFolder").mockImplementation(async () => {
      store.filesController = new AbortController();
      throw new axios.Cancel("superseded");
    });
    const setIsLoadedFetchFiles = vi.fn();
    const setHighlightFile = vi.fn();
    store.setIsLoadedFetchFiles = setIsLoadedFetchFiles;
    store.setHighlightFile = setHighlightFile;

    await expect(store.fetchFiles(5)).rejects.toBeInstanceOf(axios.Cancel);

    expect(setIsLoadedFetchFiles).not.toHaveBeenCalledWith(true);
    expect(clientLoadingStore.setIsSectionHeaderLoading).not.toHaveBeenCalled();
    expect(clientLoadingStore.setIsSectionFilterLoading).not.toHaveBeenCalled();
    expect(setHighlightFile).not.toHaveBeenCalled();
  });

  it("Cancelled without a successor", async () => {
    openAddress("/private/5/filter", "?folder=5");
    const clientLoadingStore = sectionLoading();
    const store = sectionStore(true, { clientLoadingStore });
    vi.spyOn(api.files, "getFolder").mockImplementation(async () => {
      throw new axios.Cancel("left the page");
    });
    const setIsLoadedFetchFiles = vi.fn();
    store.setIsLoadedFetchFiles = setIsLoadedFetchFiles;

    await expect(store.fetchFiles(5)).rejects.toBeInstanceOf(axios.Cancel);

    expect(setIsLoadedFetchFiles).toHaveBeenLastCalledWith(true);
    expect(clientLoadingStore.setIsSectionHeaderLoading).toHaveBeenCalledWith(
      false,
    );
    expect(clientLoadingStore.setIsSectionFilterLoading).toHaveBeenCalledWith(
      false,
    );
  });

  it("leaves the address alone while the section is not available", async () => {
    openAddress("/rooms/shared/5/filter", "?folder=5");
    const store = sectionStore(false);
    vi.spyOn(api.files, "getFolder").mockResolvedValue(
      roomContents(true) as never,
    );

    await store.fetchFiles(5);

    expect(navigate).not.toHaveBeenCalled();
    expect(store.files.map((f) => f.id)).toEqual([70]);
  });
});
