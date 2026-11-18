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

import { http } from "msw";

import { BASE_URL, API_PREFIX } from "../../e2e/utils";

export const PATH_ROOMS_NEWS = "files/rooms/news";

export type RoomsNewsRoom = {
  roomId: number;
  title: string;
  /** RoomType of the room; CustomRoom (5) when left out. */
  roomType?: number;
  isPrivate?: boolean;
  /** The files the caller has not opened yet; one when left out. */
  files?: { id: number; title: string }[];
};

const NEWS_DATE = "2026-11-12T10:00:00.0000000+00:00";

/**
 * Mirrors VirtualRoomsCommonController.GetRoomsNewItems (HttpGet
 * "rooms/news"): the new files of every room under the Rooms root, grouped by
 * day and then by room, as `NewItemsDto<RoomNewItemsDto>`. The listing has no
 * section of its own: form rooms and private rooms come with the others. Each
 * room is in its short form (FolderDtoHelper.GetShortAsync), which still
 * carries the room type and, from GetFolderWrapperAsync, the `private`
 * setting; the files are FileDto.
 */
export const roomsNewsHandler = (port: string, rooms: RoomsNewsRoom[]) => {
  const items = rooms.map((room) => ({
    room: {
      id: room.roomId,
      parentId: 2002,
      title: room.title,
      roomType: room.roomType ?? 5,
      private: !!room.isPrivate,
      rootFolderType: 14,
      rootFolderId: 2002,
      fileEntryType: 1,
      logo: { original: "", large: "", medium: "", small: "", color: "8048B0" },
    },
    items: (room.files ?? [{ id: room.roomId * 10, title: "New file.docx" }]).map(
      (file) => ({
        id: file.id,
        folderId: room.roomId,
        title: file.title,
        fileExst: ".docx",
        fileType: 7,
        fileEntryType: 2,
        rootFolderType: 14,
        rootFolderId: 2002,
        viewAccessibility: {},
        security: { Read: true },
      }),
    ),
  }));

  const response = items.length > 0 ? [{ date: NEWS_DATE, items }] : [];

  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOMS_NEWS}`,
    () =>
      new Response(JSON.stringify({ response, status: 0, statusCode: 200 }), {
        headers: { "Content-Type": "application/json" },
      }),
  );
};
