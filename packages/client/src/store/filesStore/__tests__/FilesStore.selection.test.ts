// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect, beforeEach } from "vitest";
import { FileType, FilterType, RoomsType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

// Minimal item fixtures. TItem members are all optional, so we only set what
// the selection logic reads (id, parentId, fileType, roomType).
const documentFile = (): TItem =>
  ({ id: 1, parentId: 10, fileType: FileType.Document } as TItem);
const imageFile = (): TItem =>
  ({ id: 2, parentId: 10, fileType: FileType.Image } as TItem);
const folder = (): TItem => ({ id: 3, fileType: undefined } as TItem);
const customRoom = (): TItem =>
  ({ id: 4, roomType: RoomsType.CustomRoom } as TItem);

describe("FilesStore.getFilesChecked — characterization", () => {
  let store: ReturnType<typeof createTestFilesStore>;

  beforeEach(() => {
    store = createTestFilesStore();
    store.activeFiles = [];
    store.activeFolders = [];
  });

  it("returns true for every item when selected === 'all'", () => {
    expect(store.getFilesChecked(documentFile(), "all")).toBe(true);
    expect(store.getFilesChecked(imageFile(), "all")).toBe(true);
    expect(store.getFilesChecked(folder(), "all")).toBe(true);
  });

  it("matches a document only for DocumentsOnly", () => {
    const file = documentFile();
    expect(
      store.getFilesChecked(file, FilterType.DocumentsOnly.toString()),
    ).toBe(true);
    expect(store.getFilesChecked(file, FilterType.ImagesOnly.toString())).toBe(
      false,
    );
  });

  it("matches an image only for ImagesOnly", () => {
    const file = imageFile();
    expect(store.getFilesChecked(file, FilterType.ImagesOnly.toString())).toBe(
      true,
    );
    expect(
      store.getFilesChecked(file, FilterType.DocumentsOnly.toString()),
    ).toBe(false);
  });

  it("matches a room by its room-<type> selector", () => {
    const room = customRoom();
    expect(
      store.getFilesChecked(room, `room-${RoomsType.CustomRoom}`),
    ).toBe(true);
    expect(store.getFilesChecked(room, `room-${RoomsType.PublicRoom}`)).toBe(
      false,
    );
  });

  it("suppresses items that are in the active list keyed by parentId", () => {
    // Characterization of a counterintuitive branch: getFilesChecked keys off
    // `!file.parentId`. An item WITH a parentId is matched against
    // `activeFolders`; an item WITHOUT one is matched against `activeFiles`.
    const withParent = documentFile(); // parentId: 10
    store.activeFolders = [{ id: withParent.id } as never];
    expect(store.getFilesChecked(withParent, "all")).toBe(false);
    // Not present in activeFiles → not suppressed via that list.
    store.activeFolders = [];
    store.activeFiles = [{ id: withParent.id } as never];
    expect(store.getFilesChecked(withParent, "all")).toBe(true);

    const noParent = folder(); // no parentId
    store.activeFiles = [{ id: noParent.id } as never];
    expect(store.getFilesChecked(noParent, "all")).toBe(false);
  });

  it("captures the full selected-value → result mapping for a document", () => {
    const file = documentFile();
    const selectors = [
      "all",
      "none",
      FilterType.FoldersOnly.toString(),
      FilterType.DocumentsOnly.toString(),
      FilterType.PresentationsOnly.toString(),
      FilterType.SpreadsheetsOnly.toString(),
      FilterType.ImagesOnly.toString(),
      FilterType.MediaOnly.toString(),
      FilterType.ArchiveOnly.toString(),
      FilterType.FilesOnly.toString(),
      `room-${RoomsType.CustomRoom}`,
      `room-${RoomsType.PublicRoom}`,
    ];
    const mapping = Object.fromEntries(
      selectors.map((s) => [s, store.getFilesChecked(file, s)]),
    );
    expect(mapping).toMatchSnapshot();
  });
});

describe("FilesStore.getFilesBySelected — characterization", () => {
  it("keeps only items that pass getFilesChecked", () => {
    const store = createTestFilesStore();
    store.activeFiles = [];
    store.activeFolders = [];

    const items = [documentFile(), imageFile()];
    const result = store.getFilesBySelected(
      items,
      FilterType.DocumentsOnly.toString(),
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("returns all items for 'all'", () => {
    const store = createTestFilesStore();
    store.activeFiles = [];
    store.activeFolders = [];
    const items = [documentFile(), imageFile(), folder()];
    expect(store.getFilesBySelected(items, "all")).toHaveLength(3);
  });
});

describe("FilesStore — selection boolean getters", () => {
  it("reflects the current selection array", () => {
    const store = createTestFilesStore();
    expect(store.hasSelection).toBe(false);
    expect(store.hasOneSelection).toBe(false);

    store.setSelection([documentFile()]);
    expect(store.hasSelection).toBe(true);
    expect(store.hasOneSelection).toBe(true);

    store.setSelection([documentFile(), imageFile()]);
    expect(store.hasSelection).toBe(true);
    expect(store.hasOneSelection).toBe(false);
  });

  it("reflects bufferSelection", () => {
    const store = createTestFilesStore();
    expect(store.hasBufferSelection).toBe(false);
    store.setBufferSelection(documentFile());
    expect(store.hasBufferSelection).toBe(true);
  });

  it("isEmptyFilesList is true only when files and folders are both empty", () => {
    const store = createTestFilesStore();
    store.files = [];
    store.folders = [];
    expect(store.isEmptyFilesList).toBe(true);

    store.files = [documentFile() as never];
    expect(store.isEmptyFilesList).toBe(false);
  });
});
