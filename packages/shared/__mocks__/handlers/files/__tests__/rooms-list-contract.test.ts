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
import {
  privateRoomListHandler,
  privateSectionHandler,
} from "../privateRoomList";
import { recentHandler } from "../recent";
import { rootHandler } from "../root";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3300";
const PRIVATE_ROOM_ID = 9300;
const ORDINARY_ROOM_ID = 9301;

// RoomPrivacyFilter (Core/Core/RoomPrivacyFilter.cs)
const PRIVATE = 1;
const NOT_PRIVATE = 2;

// FolderType (Core/Core/Entries/Folder.cs)
const ROOMS_ROOT = 14;
const PRIVATE_ROOT = 42;

type TRoomsBody = {
  response: {
    folders: { id: number; private: boolean; providerItem?: boolean }[];
    current: { id: number; title: string; rootFolderType: number; new: number };
    pathParts: { id: number; title: string; folderType: number }[];
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

describe("privateRoomListHandler — privacyFilter (mirrors VirtualRoomsCommonController.GetRoomsFolder, FileSecurity.GetVirtualRoomsAsync, FolderDao.BuildRoomsQuery)", () => {
  const useList = () =>
    server.use(
      privateRoomListHandler(PORT, {
        roomId: PRIVATE_ROOM_ID,
        ordinaryRooms: [{ roomId: ORDINARY_ROOM_ID, title: "Ordinary" }],
      }),
    );

  it.each(["?searchArea=Active", ""])(
    "Active rooms without a filter (%s)",
    async (query) => {
      useList();

      const list = await getRooms(query);

      expect(list.folders.map((room) => room.id)).toEqual([ORDINARY_ROOM_ID]);
      expect(list).toMatchObject({ total: 1, count: 1 });
    },
  );

  it("Archive without a filter lists every room", async () => {
    useList();

    const list = await getRooms("?searchArea=Archive");

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

  it("Rights reported", async () => {
    useList();

    const list = (await getRooms("?searchArea=Archive")) as unknown as {
      folders: { id: number; security: Record<string, boolean> }[];
    };
    const securityOf = (id: number) =>
      list.folders.find((room) => room.id === id)?.security;

    expect(securityOf(PRIVATE_ROOM_ID)).toMatchObject({
      Copy: false,
      Duplicate: false,
      IndexExport: false,
      UseChat: false,
    });
    expect(securityOf(ORDINARY_ROOM_ID)).toMatchObject({
      Copy: true,
      Duplicate: true,
    });
  });

  it("a further private room carries the count of the folders below it", async () => {
    server.use(
      privateRoomListHandler(PORT, {
        roomId: PRIVATE_ROOM_ID,
        otherPrivateRooms: [
          { roomId: 9310, title: "Second", foldersCount: 1 },
        ],
      }),
    );

    const list = (await getRooms(
      `?searchArea=Active&privacyFilter=${PRIVATE}`,
    )) as unknown as {
      folders: { id: number; foldersCount: number }[];
    };

    expect(
      list.folders.map(({ id, foldersCount }) => ({ id, foldersCount })),
    ).toEqual([
      { id: PRIVATE_ROOM_ID, foldersCount: 0 },
      { id: 9310, foldersCount: 1 },
    ]);
  });

  it.each(["Active", "Archive"])(
    "NotPrivate leaves the private room out, with searchArea=%s",
    async (searchArea) => {
      useList();

      const list = await getRooms(
        `?searchArea=${searchArea}&privacyFilter=${NOT_PRIVATE}`,
      );

      expect(list.folders.map((room) => room.id)).toEqual([ORDINARY_ROOM_ID]);
      expect(list).toMatchObject({ total: 1, count: 1 });
    },
  );
});

describe("Private section (mirrors VirtualRoomsCommonController.GetRoomsSectionIdAsync, FoldersControllerCommon.GetPrivateRoomsFolder and GetRootFoldersIdsAsync, EntryManager; PrivateRoomSectionTests)", () => {
  const rooms = {
    roomId: PRIVATE_ROOM_ID,
    newItems: 3,
    ordinaryRooms: [{ roomId: ORDINARY_ROOM_ID, title: "Ordinary" }],
  };

  it("PrivateRooms area lists only private rooms, under the Private root", async () => {
    server.use(privateRoomListHandler(PORT, rooms));

    const list = await getRooms("?searchArea=PrivateRooms");

    expect(list.folders.map((room) => room.id)).toEqual([PRIVATE_ROOM_ID]);
    expect(list).toMatchObject({ total: 1, count: 1 });
    expect(list.current).toMatchObject({
      title: "Private",
      rootFolderType: PRIVATE_ROOT,
      new: 3,
    });
    expect(list.pathParts).toEqual([
      { id: list.current.id, title: "Private", folderType: PRIVATE_ROOT },
    ]);
  });

  it("PrivateRooms area ignores a NotPrivate filter", async () => {
    server.use(privateRoomListHandler(PORT, rooms));

    const list = await getRooms(
      `?searchArea=PrivateRooms&privacyFilter=${NOT_PRIVATE}`,
    );

    expect(list.folders.map((room) => room.id)).toEqual([PRIVATE_ROOM_ID]);
  });

  it("Private filter on the Rooms area lists the same rooms under the Rooms root", async () => {
    server.use(privateRoomListHandler(PORT, rooms));

    const list = await getRooms(`?searchArea=Active&privacyFilter=${PRIVATE}`);

    expect(list.folders.map((room) => room.id)).toEqual([PRIVATE_ROOM_ID]);
    expect(list.current.rootFolderType).toBe(ROOMS_ROOT);
  });

  it("PrivateRooms area of the general rooms list is answered under the Private root", async () => {
    server.use(roomListHandler(PORT, TypeRoomList.IsDefault));

    const list = await getRooms("?searchArea=PrivateRooms");

    expect(list.folders.every((room) => room.private)).toBe(true);
    expect(list.current.rootFolderType).toBe(PRIVATE_ROOT);
  });

  const getSection = () =>
    fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/@private`);

  it("Section route lists only private rooms", async () => {
    server.use(privateSectionHandler(PORT, rooms));

    const res = await getSection();
    const section = ((await res.json()) as TRoomsBody).response;

    expect(res.status).toBe(200);
    expect(section.folders.map((room) => room.id)).toEqual([PRIVATE_ROOM_ID]);
    expect(section.current.rootFolderType).toBe(PRIVATE_ROOT);
  });

  it("Section route with the app off", async () => {
    server.use(privateSectionHandler(PORT, { ...rooms, appOff: true }));

    const res = await getSection();

    expect(res.status).toBe(404);
  });

  type TRootBody = {
    response: { current: { rootFolderType: number; title: string } }[];
  };

  const getRootTypes = async () => {
    const res = await fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/@root`);
    return ((await res.json()) as TRootBody).response.map(
      (root) => root.current.rootFolderType,
    );
  };

  it("Root listing with the app on", async () => {
    server.use(rootHandler(PORT));

    const types = await getRootTypes();

    // After Rooms, before Archive: the order of GetRootFoldersIdsAsync.
    expect(types.indexOf(PRIVATE_ROOT)).toBe(types.indexOf(ROOMS_ROOT) + 1);
    expect(types.indexOf(PRIVATE_ROOT)).toBeLessThan(types.indexOf(20));
  });

  it("Root listing with the app off", async () => {
    server.use(rootHandler(PORT, { withPrivateRoot: false }));

    expect(await getRootTypes()).not.toContain(PRIVATE_ROOT);
  });

  it("Recent with the PrivateRooms area is a bad request", async () => {
    server.use(recentHandler(PORT));

    const res = await fetch(
      `${BASE_URL}:${PORT}/${API_PREFIX}/files/28934?searchArea=PrivateRooms`,
    );

    expect(res.status).toBe(400);
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
