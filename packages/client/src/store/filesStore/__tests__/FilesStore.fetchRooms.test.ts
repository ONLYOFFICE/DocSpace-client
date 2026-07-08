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

import { describe, it, expect, vi, afterEach } from "vitest";
import api from "@docspace/shared/api";
import { FileType, FolderType, RoomsType } from "@docspace/shared/enums";

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

  it("requests AI agents via api.ai.getNewAiAgents and fills folders", async () => {
    const store = createTestFilesStore();
    const getAgents = vi
      .spyOn(api.ai, "getNewAiAgents")
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
