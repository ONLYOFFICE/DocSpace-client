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
import { FileType } from "@docspace/shared/enums";
import { thumbnailStatuses } from "@docspace/shared/constants";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";
import type { TFile } from "@docspace/shared/api/files/types";

const file = (id: number): TItem =>
  ({
    id,
    parentId: 10,
    title: `f${id}.docx`,
    fileExst: ".docx",
    fileType: FileType.Document,
    viewAccessibility: {},
  }) as unknown as TItem;

describe("FilesStore.getIsEmptyTrash — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("marks the trash empty when the listing has no items", async () => {
    const store = createTestFilesStore();
    vi.spyOn(api.files, "getTrashFolderList").mockResolvedValue({
      files: [],
      folders: [],
    } as never);

    await store.getIsEmptyTrash();
    expect(store.trashIsEmpty).toBe(true);
  });

  it("marks the trash non-empty when it has items", async () => {
    const store = createTestFilesStore();
    vi.spyOn(api.files, "getTrashFolderList").mockResolvedValue({
      files: [file(1)],
      folders: [],
    } as never);

    await store.getIsEmptyTrash();
    expect(store.trashIsEmpty).toBe(false);
  });
});

describe("FilesStore.fetchFavoritesFolder — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads folders and files from the favorites listing", async () => {
    const store = createTestFilesStore();
    vi.spyOn(api.files, "getFolder").mockResolvedValue({
      folders: [{ id: 2, isFolder: true } as TItem],
      files: [file(1)],
      total: 2,
    } as never);

    await store.fetchFavoritesFolder(7);

    expect(store.folders.map((f) => f.id)).toEqual([2]);
    expect(store.files.map((f) => f.id)).toEqual([1]);
  });
});

describe("FilesStore.updateSelection — characterization", () => {
  it("replaces a stale selected item with the fresh list instance", () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    store.files = [file(1)] as never;
    store.folders = [];

    // a stale copy of the same item is selected
    const stale = { ...file(1) } as TItem;
    store.setSelection([stale]);

    store.updateSelection(file(1));

    // selection now holds a freshly mapped list item, not the stale copy
    // (filesList is a computed that maps anew on each read, so compare by value)
    expect(store.selection[0]).not.toBe(stale);
    expect(store.selection[0]).toStrictEqual(store.filesList[0]);
  });
});

describe("FilesStore.createThumbnails — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("requests thumbnails for WAITING files and caches them", async () => {
    const store = createTestFilesStore();
    const createThumbnails = vi
      .spyOn(api.files, "createThumbnails")
      .mockResolvedValue([] as never);

    const waiting = {
      id: 1,
      versionGroup: 2,
      thumbnailStatus: thumbnailStatuses.WAITING,
    } as unknown as TFile;

    await store.createThumbnails([waiting]);

    expect(createThumbnails).toHaveBeenCalledWith([1]);
    expect(store.thumbnails.has("1|2")).toBe(true);
  });

  it("no-ops in a non-tile view with no explicit files", async () => {
    const store = createTestFilesStore(); // viewAs !== "tile"
    const createThumbnails = vi.spyOn(api.files, "createThumbnails");
    await store.createThumbnails();
    expect(createThumbnails).not.toHaveBeenCalled();
  });
});

describe("FilesStore.openDocEditor — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("opens the doceditor url for the file", () => {
    const store = createTestFilesStore();
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    store.openDocEditor(5);

    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0][0])).toContain("fileId=5");
  });

  it("adds action=view for a preview open", () => {
    const store = createTestFilesStore();
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    store.openDocEditor(5, true);

    expect(String(open.mock.calls[0][0])).toContain("action=view");
  });
});
