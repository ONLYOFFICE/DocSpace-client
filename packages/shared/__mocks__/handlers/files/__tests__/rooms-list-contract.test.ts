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

// CONTRACT TESTS — lock the rooms-list mocks to the server's actual
// behavior. Same purpose as privacyroom/__tests__/contract.test.ts; see that
// file's preamble for the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { roomListHandler, TypeRoomList } from "../roomList";
import { privateRoomListHandler } from "../privateRoomList";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3300";
const PRIVATE_ROOM_ID = 9300;
const ORDINARY_ROOM_ID = 9301;

// RoomPrivacyFilter (Core/Core/RoomPrivacyFilter.cs)
const PRIVATE = 1;
const NOT_PRIVATE = 2;

type TRoomsBody = {
  response: {
    folders: { id: number; private: boolean; providerItem?: boolean }[];
    total: number;
    count: number;
  };
};

const getRooms = async (query = "") => {
  const res = await fetch(
    `${BASE_URL}:${PORT}/${API_PREFIX}/files/rooms${query}`,
  );
  return ((await res.json()) as TRoomsBody).response;
};

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("privateRoomListHandler — privacyFilter (mirrors VirtualRoomsCommonController.GetRoomsFolder, FolderDao.BuildRoomsQuery)", () => {
  const useList = () =>
    server.use(
      privateRoomListHandler(PORT, {
        roomId: PRIVATE_ROOM_ID,
        ordinaryRooms: [{ roomId: ORDINARY_ROOM_ID, title: "Ordinary" }],
      }),
    );

  it("lists every room without a privacy filter", async () => {
    useList();

    const list = await getRooms("?searchArea=Active");

    expect(list.folders.map((room) => room.id)).toEqual([
      PRIVATE_ROOM_ID,
      ORDINARY_ROOM_ID,
    ]);
    expect(list.total).toBe(2);
  });

  it.each(["Active", "Archive"])(
    "Private keeps only the private room, with searchArea=%s",
    async (searchArea) => {
      useList();

      const list = await getRooms(
        `?searchArea=${searchArea}&privacyFilter=${PRIVATE}`,
      );

      expect(list.folders.map((room) => room.id)).toEqual([PRIVATE_ROOM_ID]);
      expect(list).toMatchObject({ total: 1, count: 1 });
    },
  );

  it.each([
    ["Active", 2002, "Rooms"],
    ["Archive", 11244, "Archive"],
  ])(
    "answers the section root of searchArea=%s as current",
    async (searchArea, id, title) => {
      useList();

      const list = (await getRooms(`?searchArea=${searchArea}`)) as unknown as {
        current: { id: number; title: string };
        pathParts: { id: number }[];
      };

      expect(list.current).toMatchObject({ id, title });
      expect(list.pathParts.map((part) => part.id)).toEqual([id]);
    },
  );

  it("a further private room carries the count of the folders below it", async () => {
    server.use(
      privateRoomListHandler(PORT, {
        roomId: PRIVATE_ROOM_ID,
        otherPrivateRooms: [
          { roomId: 9310, title: "Second", foldersCount: 1 },
        ],
      }),
    );

    const list = (await getRooms("?searchArea=Active")) as unknown as {
      folders: { id: number; foldersCount: number }[];
    };

    expect(
      list.folders.map(({ id, foldersCount }) => ({ id, foldersCount })),
    ).toEqual([
      { id: PRIVATE_ROOM_ID, foldersCount: 0 },
      { id: 9310, foldersCount: 1 },
    ]);
  });

  it("NotPrivate leaves the private room out", async () => {
    useList();

    const list = await getRooms(
      `?searchArea=Active&privacyFilter=${NOT_PRIVATE}`,
    );

    expect(list.folders.map((room) => room.id)).toEqual([ORDINARY_ROOM_ID]);
    expect(list).toMatchObject({ total: 1, count: 1 });
  });
});

describe("roomListHandler — privacyFilter and third-party rooms (mirrors FileSecurity.GetVirtualRoomsAsync)", () => {
  it("Private returns no room on third-party storage", async () => {
    server.use(roomListHandler(PORT, TypeRoomList.ContextMenu));
    const unfiltered = await getRooms();
    expect(unfiltered.folders.some((room) => room.providerItem)).toBe(true);

    const list = await getRooms(`?privacyFilter=${PRIVATE}`);

    expect(list.folders).toEqual([]);
    expect(list.total).toBe(
      unfiltered.total - unfiltered.folders.length,
    );
  });

  it("NotPrivate keeps the rooms on third-party storage", async () => {
    server.use(roomListHandler(PORT, TypeRoomList.ContextMenu));
    const unfiltered = await getRooms();

    const list = await getRooms(`?privacyFilter=${NOT_PRIVATE}`);

    expect(list.folders).toEqual(unfiltered.folders);
    expect(list.total).toBe(unfiltered.total);
  });
});
