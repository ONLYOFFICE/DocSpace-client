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
import { TagChangeType } from "@docspace/shared/components/tag-management";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { createTestFilesStore } from "./testHarness";

const ROOM_ID = 1;
const OTHER_ROOM_ID = 2;

const room = (id: number, tags: string[]) =>
  ({ id, title: `room-${id}`, tags }) as unknown as TFolder;

// Only a room carries tags, and `folders` holds both.
const tagsOf = (folder: TFolder | TRoom) =>
  "tags" in folder ? folder.tags : undefined;

// How far a change reaches is what the change says, and no socket message says
// it for a rename or a removal - so the rooms on screen are patched from the
// change itself.
describe("FilesStore.applyTagChange", () => {
  it("binds the tag to the one room it was sent for", () => {
    const store = createTestFilesStore();

    store.folders = [room(ROOM_ID, ["alpha"]), room(OTHER_ROOM_ID, ["alpha"])];

    store.applyTagChange({
      type: TagChangeType.Bound,
      roomId: ROOM_ID,
      label: "beta",
    });

    // A tag just bound leads the room's list.
    expect(tagsOf(store.folders[0])).toEqual(["beta", "alpha"]);
    // The other room was not the one it was sent for.
    expect(tagsOf(store.folders[1])).toEqual(["alpha"]);
  });

  it("unbinds the tag from the one room it was sent for", () => {
    const store = createTestFilesStore();

    store.folders = [
      room(ROOM_ID, ["alpha", "beta"]),
      room(OTHER_ROOM_ID, ["beta"]),
    ];

    store.applyTagChange({
      type: TagChangeType.Unbound,
      roomId: ROOM_ID,
      label: "beta",
    });

    expect(tagsOf(store.folders[0])).toEqual(["alpha"]);
    expect(tagsOf(store.folders[1])).toEqual(["beta"]);
  });

  it("lists a created tag in the room it was created in", () => {
    const store = createTestFilesStore();

    store.folders = [room(ROOM_ID, []), room(OTHER_ROOM_ID, [])];

    store.applyTagChange({
      type: TagChangeType.Created,
      roomId: ROOM_ID,
      label: "beta",
    });

    expect(tagsOf(store.folders[0])).toEqual(["beta"]);
    expect(tagsOf(store.folders[1])).toEqual([]);
  });

  it("renames the tag in every room that carries it", () => {
    const store = createTestFilesStore();

    store.folders = [
      room(ROOM_ID, ["alpha", "beta"]),
      room(OTHER_ROOM_ID, ["beta"]),
    ];

    store.applyTagChange({
      type: TagChangeType.Renamed,
      oldLabel: "beta",
      newLabel: "gamma",
    });

    expect(tagsOf(store.folders[0])).toEqual(["alpha", "gamma"]);
    expect(tagsOf(store.folders[1])).toEqual(["gamma"]);
  });

  it("takes a removed tag out of every room", () => {
    const store = createTestFilesStore();

    store.folders = [
      room(ROOM_ID, ["alpha", "beta"]),
      room(OTHER_ROOM_ID, ["beta"]),
    ];

    store.applyTagChange({ type: TagChangeType.Removed, label: "beta" });

    expect(tagsOf(store.folders[0])).toEqual(["alpha"]);
    expect(tagsOf(store.folders[1])).toEqual([]);
  });

  it("leaves a room the change does not touch as it was", () => {
    const store = createTestFilesStore();

    store.folders = [room(ROOM_ID, ["beta"]), room(OTHER_ROOM_ID, ["gamma"])];

    const untouched = store.folders[1];

    store.applyTagChange({ type: TagChangeType.Removed, label: "beta" });

    // Not written back at all, so nothing observing that room re-renders.
    expect(store.folders[1]).toBe(untouched);
    expect(tagsOf(store.folders[1])).toEqual(["gamma"]);
  });
});
