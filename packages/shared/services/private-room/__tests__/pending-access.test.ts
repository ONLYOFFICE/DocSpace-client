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

import { autorun } from "mobx";
import { afterEach, describe, expect, it } from "vitest";

import { pendingAccessStore } from "../pending-access";

const ROOM_ID = 9200;

describe("pendingAccessStore", () => {
  afterEach(() => {
    pendingAccessStore.clear(ROOM_ID, "u-bob");
    pendingAccessStore.clear(ROOM_ID + 1, "u-bob");
  });

  it("records the files a member misses in one room only", () => {
    pendingAccessStore.record({
      roomId: ROOM_ID,
      userId: "u-bob",
      missingFileIds: [2, 3],
    });

    expect(pendingAccessStore.get(ROOM_ID, "u-bob")).toEqual({
      roomId: ROOM_ID,
      userId: "u-bob",
      missingFileIds: [2, 3],
    });
    expect(pendingAccessStore.get(ROOM_ID + 1, "u-bob")).toBeUndefined();
    expect(pendingAccessStore.get(ROOM_ID, "u-ann")).toBeUndefined();
  });

  it("replaces the record with the files still missing", () => {
    pendingAccessStore.record({
      roomId: ROOM_ID,
      userId: "u-bob",
      missingFileIds: [2, 3],
    });
    pendingAccessStore.record({
      roomId: ROOM_ID,
      userId: "u-bob",
      missingFileIds: [3],
    });

    expect(pendingAccessStore.get(ROOM_ID, "u-bob")?.missingFileIds).toEqual([
      3,
    ]);
  });

  it("clears the record on success, and observers see both changes", () => {
    const seen: (number[] | undefined)[] = [];
    const dispose = autorun(() => {
      seen.push(pendingAccessStore.get(ROOM_ID, "u-bob")?.missingFileIds);
    });

    pendingAccessStore.record({
      roomId: ROOM_ID,
      userId: "u-bob",
      missingFileIds: [2],
    });
    pendingAccessStore.clear(ROOM_ID, "u-bob");
    dispose();

    expect(seen).toEqual([undefined, [2], undefined]);
  });
});
