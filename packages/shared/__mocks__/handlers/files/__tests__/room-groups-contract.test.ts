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

// CONTRACT TESTS — lock the room groups mocks to the server's actual
// behavior. Same purpose as privacyroom/__tests__/contract.test.ts; see that
// file's preamble for the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { createRoomGroupHandler, roomGroupsHandler } from "../roomGroups";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3302";
const GROUPS = `${BASE_URL}:${PORT}/${API_PREFIX}/files/group`;

const PRIVATE_ROOM_ID = 9300;
const ORDINARY_ROOM_ID = 9301;

const roomAreas = {
  [PRIVATE_ROOM_ID]: "PrivateRooms",
  [ORDINARY_ROOM_ID]: "Active",
};

const listGroups = async (searchArea?: string) => {
  const res = await fetch(
    `${GROUPS}${searchArea ? `?searchArea=${searchArea}` : ""}`,
  );
  return (
    (await res.json()) as { response: { name: string; searchArea: string }[] }
  ).response;
};

const createGroup = (searchArea: string | undefined, rooms: number[]) =>
  fetch(GROUPS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Group", icon: "star", rooms, searchArea }),
  });

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("room groups belong to one section (mirrors GroupsController, RoomGroupArea; PrivateRoomSectionTests)", () => {
  it("lists the groups of the Private section apart from those of Rooms and Forms", async () => {
    server.use(roomGroupsHandler(PORT));

    const privateGroups = await listGroups("PrivateRooms");
    const roomsGroups = await listGroups();

    expect(privateGroups.length).toBeGreaterThan(0);
    expect(
      privateGroups.every((group) => group.searchArea === "PrivateRooms"),
    ).toBe(true);
    expect(roomsGroups.every((group) => group.searchArea === "Active")).toBe(
      true,
    );
  });

  it("creates a group in the Private section and answers its area", async () => {
    server.use(createRoomGroupHandler(PORT, { roomAreas }));

    const res = await createGroup("PrivateRooms", [PRIVATE_ROOM_ID]);

    expect(res.status).toBe(200);
    expect(
      ((await res.json()) as { response: { searchArea: string } }).response
        .searchArea,
    ).toBe("PrivateRooms");
  });

  it("takes a missing area as Rooms", async () => {
    server.use(createRoomGroupHandler(PORT, { roomAreas }));

    const res = await createGroup(undefined, [ORDINARY_ROOM_ID]);

    expect(
      ((await res.json()) as { response: { searchArea: string } }).response
        .searchArea,
    ).toBe("Active");
  });

  it("refuses a room of another section", async () => {
    server.use(createRoomGroupHandler(PORT, { roomAreas }));

    expect((await createGroup("PrivateRooms", [ORDINARY_ROOM_ID])).status).toBe(
      400,
    );
    expect((await createGroup("Active", [PRIVATE_ROOM_ID])).status).toBe(400);
  });

  it("refuses an area that holds no groups", async () => {
    server.use(createRoomGroupHandler(PORT));

    expect((await createGroup("Archive", [])).status).toBe(400);
  });
});
