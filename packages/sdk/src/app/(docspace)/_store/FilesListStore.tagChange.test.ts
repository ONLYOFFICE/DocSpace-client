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
import { TagChangeType } from "@docspace/shared/components/tag-management/TagManagement.types";

import { FilesListStore } from "./FilesListStore";
import type { TFolderItem } from "../_hooks/useItemList";

const ROOM_ID = 1;
const OTHER_ROOM_ID = 2;

const room = (id: number, tags: string[]) =>
  ({ id, title: `room-${id}`, tags }) as unknown as TFolderItem;

const tagsOf = (item: unknown) => (item as { tags?: string[] }).tags;

// The rooms on screen are patched from the change rather than read back from
// the server: a room read right after a tag was bound to it can still come
// back without that tag, and the stale answer would be what gets stored.
describe("FilesListStore.applyTagChange", () => {
  it("binds the tag to the one room it was sent for", () => {
    const store = new FilesListStore();

    store.setItems([room(ROOM_ID, ["alpha"]), room(OTHER_ROOM_ID, ["alpha"])]);

    store.applyTagChange({
      type: TagChangeType.Bound,
      roomId: ROOM_ID,
      label: "beta",
    });

    // A tag just bound leads the room's list.
    expect(tagsOf(store.items[0])).toEqual(["beta", "alpha"]);
    expect(tagsOf(store.items[1])).toEqual(["alpha"]);
  });

  it("unbinds the tag from the one room it was sent for", () => {
    const store = new FilesListStore();

    store.setItems([
      room(ROOM_ID, ["alpha", "beta"]),
      room(OTHER_ROOM_ID, ["beta"]),
    ]);

    store.applyTagChange({
      type: TagChangeType.Unbound,
      roomId: ROOM_ID,
      label: "beta",
    });

    expect(tagsOf(store.items[0])).toEqual(["alpha"]);
    expect(tagsOf(store.items[1])).toEqual(["beta"]);
  });

  // What a refetch of one room could not do, and the reason this exists.
  it("renames and removes the tag in every room that carries it", () => {
    const store = new FilesListStore();

    store.setItems([
      room(ROOM_ID, ["alpha", "beta"]),
      room(OTHER_ROOM_ID, ["beta"]),
    ]);

    store.applyTagChange({
      type: TagChangeType.Renamed,
      oldLabel: "beta",
      newLabel: "gamma",
    });

    expect(tagsOf(store.items[0])).toEqual(["alpha", "gamma"]);
    expect(tagsOf(store.items[1])).toEqual(["gamma"]);

    store.applyTagChange({ type: TagChangeType.Removed, label: "gamma" });

    expect(tagsOf(store.items[0])).toEqual(["alpha"]);
    expect(tagsOf(store.items[1])).toEqual([]);
  });

  it("writes nothing when the change reaches no room on screen", () => {
    const store = new FilesListStore();

    store.setItems([room(ROOM_ID, ["alpha"])]);

    const before = store.items;

    store.applyTagChange({ type: TagChangeType.Removed, label: "beta" });

    // The same array, so nothing observing the list re-renders.
    expect(store.items).toBe(before);
  });
});
