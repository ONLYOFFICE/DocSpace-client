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
import { FileType } from "@docspace/shared/enums";

beforeEach(() => {
  (window as unknown as { DocSpace: unknown }).DocSpace = { navigate: vi.fn() };
});

// Capture the "created PDF form" dialog so wsCreatedPDFForm can be asserted.
vi.mock("SRC_DIR/components/dialogs/CreatedPDFFormDialog", () => ({
  showCreatedPDFFormDialog: vi.fn(),
}));

import { showCreatedPDFFormDialog } from "SRC_DIR/components/dialogs/CreatedPDFFormDialog";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

const file = (id: number, folderId = 1): TItem =>
  ({
    id,
    folderId,
    parentId: folderId,
    title: `f${id}.docx`,
    fileExst: ".docx",
    fileType: FileType.Document,
    viewAccessibility: {},
  }) as unknown as TItem;

describe("FilesStore.onResolveNewFile — characterization", () => {
  it("prepends a new file that belongs to the current folder", () => {
    const store = createTestFilesStore(); // selectedFolderStore.id === 1
    store.getFilesContextOptions = (() => []) as never;
    store.files = [file(1)] as never;

    store.onResolveNewFile({ fileInfo: file(99, 1) });

    expect(store.files.map((f) => f.id)).toEqual([99, 1]);
  });

  it("ignores a file that already exists", () => {
    const store = createTestFilesStore();
    store.files = [file(99)] as never;
    store.onResolveNewFile({ fileInfo: file(99, 1) });
    expect(store.files).toHaveLength(1);
  });

  it("ignores a file for a different folder", () => {
    const store = createTestFilesStore();
    store.files = [file(1)] as never;
    store.onResolveNewFile({ fileInfo: file(99, 999) });
    expect(store.files.map((f) => f.id)).toEqual([1]);
  });

  it("no-ops without fileInfo", () => {
    const store = createTestFilesStore();
    store.files = [file(1)] as never;
    store.onResolveNewFile({});
    expect(store.files.map((f) => f.id)).toEqual([1]);
  });
});

// MobX action fields can't be spied/reassigned (it corrupts the store's mobx
// admin), so these assert at the api layer the delegated methods call:
// getFileInfo -> api.files.getFileInfo, refreshFolder -> api.files.getFolderInfo,
// refreshFiles -> fetchFiles -> api.files.getFolder.
describe("FilesStore.wsModifyFolderUpdate — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("file update fetches fresh file info", async () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    const getFileInfo = vi
      .spyOn(api.files, "getFileInfo")
      .mockResolvedValue(file(5) as never);

    await store.wsModifyFolderUpdate({
      type: "file",
      data: JSON.stringify({ id: 5, title: "x" }),
    } as never);

    expect(getFileInfo).toHaveBeenCalledWith(5, undefined, undefined);
  });

  it("folder update delegates to refreshFolder (getFolderInfo)", async () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = (() => []) as never;
    const getFolderInfo = vi
      .spyOn(api.files, "getFolderInfo")
      .mockResolvedValue({ id: 7, security: {} } as never);

    await store.wsModifyFolderUpdate({
      type: "folder",
      data: JSON.stringify({ id: 7 }),
    } as never);

    expect(getFolderInfo).toHaveBeenCalledWith(7);
  });
});

describe("FilesStore.wsChangeFolderAccessRights — characterization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("refreshes the folder when the current user's access changed", () => {
    const store = createTestFilesStore(); // selectedFolderStore.id === 1, user id "user-1"
    store.getFilesContextOptions = (() => []) as never;
    const getFolderInfo = vi
      .spyOn(api.files, "getFolderInfo")
      .mockResolvedValue({ id: 1, security: {} } as never);
    // refreshFiles -> fetchFiles -> getFolder; keep it inert.
    vi.spyOn(api.files, "getFolder").mockResolvedValue({
      total: 0,
      folders: [],
      files: [],
      pathParts: [],
      current: { id: 1, rootFolderType: 0, parentId: 0, security: {} },
    } as never);

    store.wsChangeFolderAccessRights({
      id: 1,
      data: JSON.stringify({ "user-1": 1 }),
    } as never);

    expect(getFolderInfo).toHaveBeenCalledWith(1);
  });

  it("ignores changes for a folder that is not the current one", () => {
    const store = createTestFilesStore();
    const getFolderInfo = vi.spyOn(api.files, "getFolderInfo");

    store.wsChangeFolderAccessRights({
      id: 999,
      data: JSON.stringify({ "user-1": 1 }),
    } as never);

    expect(getFolderInfo).not.toHaveBeenCalled();
  });
});

describe("FilesStore.wsCreatedPDFForm — characterization", () => {
  it("shows the dialog for a form created in the current folder", () => {
    const store = createTestFilesStore();
    store.wsCreatedPDFForm({
      data: JSON.stringify({ folderId: 1, id: 3 }),
    } as never);
    expect(showCreatedPDFFormDialog).toHaveBeenCalledTimes(1);
  });

  it("does nothing for a form created elsewhere", () => {
    const store = createTestFilesStore();
    vi.mocked(showCreatedPDFFormDialog).mockClear();
    store.wsCreatedPDFForm({
      data: JSON.stringify({ folderId: 999, id: 3 }),
    } as never);
    expect(showCreatedPDFFormDialog).not.toHaveBeenCalled();
  });
});
