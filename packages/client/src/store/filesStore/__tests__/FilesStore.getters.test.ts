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

import { describe, it, expect } from "vitest";
import { FileStatus, FolderType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

describe("FilesStore.hasNew — characterization", () => {
  it("is true when any file/folder carries the IsNew status bit", () => {
    const store = createTestFilesStore();
    store.files = [{ id: 1, fileStatus: FileStatus.IsNew } as TItem] as never;
    expect(store.hasNew).toBe(true);
  });

  it("is false when nothing is new", () => {
    const store = createTestFilesStore();
    store.files = [{ id: 1, fileStatus: FileStatus.None } as TItem] as never;
    store.folders = [];
    expect(store.hasNew).toBe(false);
  });
});

describe("FilesStore.canCreate — characterization", () => {
  it("allows creation in personal and rooms roots", () => {
    for (const rootFolderType of [FolderType.USER, FolderType.Rooms]) {
      const store = createTestFilesStore({
        selectedFolderStore: { rootFolderType },
      });
      expect(store.canCreate).toBe(true);
    }
  });

  it("denies creation in a shared folder without editor access", () => {
    const store = createTestFilesStore({
      selectedFolderStore: {
        rootFolderType: FolderType.SHARE,
        access: 0,
        isRootFolder: false,
      },
    });
    expect(store.canCreate).toBe(false);
  });
});

describe("FilesStore.isFiltered — characterization", () => {
  it("is falsy for the default (unfiltered) view", () => {
    const store = createTestFilesStore();
    expect(store.isFiltered).toBeFalsy();
  });
});
