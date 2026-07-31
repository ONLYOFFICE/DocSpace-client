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

import { describe, it, expect, beforeEach } from "vitest";
import { FileType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

const CTX = ["ctx"] as unknown as ReturnType<
  ReturnType<typeof createTestFilesStore>["getFilesContextOptions"]
>;

const file = (id: number): TItem =>
  ({
    id,
    parentId: 10,
    title: `f${id}.docx`,
    fileExst: ".docx",
    fileType: FileType.Document,
    viewAccessibility: {},
  }) as unknown as TItem;

// A fake DOM node in the shape setSelections reads in tile view.
const tileNode = (value: string) =>
  ({ getAttribute: (k: string) => (k === "value" ? value : null) }) as unknown as Element;

describe("FilesStore.withCtrlSelect — characterization", () => {
  it("toggles an item in and out of the selection", () => {
    const store = createTestFilesStore();
    store.setSelection([]);
    const item = { id: 1, isFolder: false } as TItem;

    store.withCtrlSelect(item);
    expect(store.selection.map((s) => s.id)).toEqual([1]);
    expect(store.hotkeyCaret?.id).toBe(1);

    store.withCtrlSelect(item); // second ctrl-click deselects
    expect(store.selection).toHaveLength(0);
  });
});

describe("FilesStore.setSelections — characterization", () => {
  let store: ReturnType<typeof createTestFilesStore>;

  beforeEach(() => {
    store = createTestFilesStore();
    store.getFilesContextOptions = () => CTX;
    store.setViewAs("tile");
    store.files = [file(42) as never];
    store.folders = [];
    store.setSelection([]);
  });

  it("adds a file whose node value matches a list item", () => {
    store.setSelections([tileNode("file_42_0_0_0")], []);
    expect(store.selection.map((s) => s.id)).toEqual([42]);
  });

  it("ignores nodes without a resolvable value", () => {
    store.setSelections([tileNode("")], []);
    expect(store.selection).toHaveLength(0);
  });

  it("clear=true resets the selection before applying additions", () => {
    store.setSelection([file(99)]);
    store.setSelections([tileNode("file_42_0_0_0")], [], true);
    expect(store.selection.map((s) => s.id)).toEqual([42]);
  });
});

describe("FilesStore.withShiftSelect — characterization", () => {
  it("selects the contiguous range between the caret start and the item", () => {
    const store = createTestFilesStore();
    store.getFilesContextOptions = () => CTX;
    store.files = [file(1), file(2), file(3)] as never;
    store.folders = [];
    store.setSelection([]);

    const list = store.filesList; // mapped list items (isFolder === false)
    store.setHotkeyCaretStart(list[0]);
    store.setHotkeyCaret(list[0]);

    store.withShiftSelect(list[2]);

    expect(store.selection.map((s) => s.id).sort()).toEqual([1, 2, 3]);
  });
});
