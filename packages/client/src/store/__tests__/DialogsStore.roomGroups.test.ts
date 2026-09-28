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

import { describe, it, expect, vi, beforeEach } from "vitest";

import { RoomSearchArea } from "@docspace/shared/enums";

const { getRoomGroups } = vi.hoisted(() => ({ getRoomGroups: vi.fn() }));

vi.mock("@docspace/shared/api/rooms", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getRoomGroups,
}));

const { default: DialogsStore } = await import("../DialogsStore");

const createStore = () =>
  new DialogsStore(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

const group = (id: string) => ({ id, name: id, totalRooms: 0 });

describe("DialogsStore — room groups per section", () => {
  beforeEach(() => {
    getRoomGroups.mockReset();
  });

  it("keeps the requested area and its groups", async () => {
    const store = createStore();
    getRoomGroups.mockResolvedValue([group("forms-1")]);

    await store.getAllRoomGroups(RoomSearchArea.Forms);

    expect(getRoomGroups).toHaveBeenCalledWith(RoomSearchArea.Forms);
    expect(store.roomGroupsArea).toBe(RoomSearchArea.Forms);
    expect(store.roomGroups.map((g) => g.id)).toEqual(["forms-1"]);
  });

  it("drops a response that arrives after the section changed", async () => {
    const store = createStore();

    let resolveActive: (value: unknown) => void = () => {};
    const activeResponse = new Promise((resolve) => {
      resolveActive = resolve;
    });

    getRoomGroups.mockReturnValueOnce(activeResponse);
    const activeRequest = store.getAllRoomGroups(RoomSearchArea.Active);

    getRoomGroups.mockResolvedValueOnce([group("forms-1")]);
    await store.getAllRoomGroups(RoomSearchArea.Forms);

    resolveActive([group("active-1")]);
    await activeRequest;

    expect(store.roomGroupsArea).toBe(RoomSearchArea.Forms);
    expect(store.roomGroups.map((g) => g.id)).toEqual(["forms-1"]);
  });

  it("clears the previous section's groups before fetching", async () => {
    const store = createStore();
    getRoomGroups.mockResolvedValueOnce([group("active-1")]);

    await store.getAllRoomGroups(RoomSearchArea.Active);
    expect(store.roomGroups).toHaveLength(1);

    getRoomGroups.mockImplementationOnce(() => {
      expect(store.roomGroups).toHaveLength(0);
      expect(store.roomGroupsArea).toBe(RoomSearchArea.Forms);
      return Promise.resolve([]);
    });

    await store.getAllRoomGroups(RoomSearchArea.Forms);
  });
});
