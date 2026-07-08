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
