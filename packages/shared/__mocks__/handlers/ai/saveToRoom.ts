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

import { http, HttpResponse } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

/**
 * "Save to room..." on a file a chat reply produced (a generated image, a
 * created document): ui-kit's folder selector over the Files API, then a
 * copy of the file into the picked room (`CopyToRoomDialog`,
 * `copyFileToFolder`).
 *
 * The selector opens on the portal's roots (`files/@root`, left to
 * `rootHandler`), lists the rooms from Rooms (`GET files/rooms`) and opens a
 * room (`GET files/:id`, with `GET files/folder/:id`); "Copy here" is enabled
 * only where the caller may create files (`current.security.Create`). The
 * copy is `PUT files/fileops/copy`, polled through `GET files/fileops` until
 * the operation is finished (FileOperationType.Copy = 1).
 */

/** The Rooms root of `files/@root` (`root.ts`). */
const ROOMS_ROOT_ID = 2002;
const ROOMS_FOLDER_TYPE = 14;
const CUSTOM_ROOM_TYPE = 5;
const CUSTOM_ROOM_FOLDER_TYPE = 19;

const OWNER = {
  id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  displayName: "Administrator",
  avatarSmall: "/static/images/default_user_photo_size_32-32.png",
  hasAvatar: false,
};

/** A room the selector lists. */
export type AiCopyTargetRoomMock = {
  id: number;
  title: string;
  /**
   * The caller may add files to it (an editor or a manager of the room);
   * `false` for a Viewer, whose room cannot be confirmed as the target.
   */
  canCreate: boolean;
};

/** One copy the handlers ran: the body of `PUT files/fileops/copy`. */
export type AiCopyRequest = {
  fileIds: (number | string)[];
  folderIds: (number | string)[];
  destFolderId: number | string;
  conflictResolveType?: number;
  deleteAfter?: boolean;
};

const roomDto = ({ id, title, canCreate }: AiCopyTargetRoomMock) => ({
  id,
  title,
  roomType: CUSTOM_ROOM_TYPE,
  type: CUSTOM_ROOM_FOLDER_TYPE,
  parentId: ROOMS_ROOT_ID,
  rootFolderId: ROOMS_ROOT_ID,
  rootFolderType: ROOMS_FOLDER_TYPE,
  created: "2026-11-01T10:00:00.0000000+00:00",
  updated: "2026-11-01T10:00:00.0000000+00:00",
  createdBy: OWNER,
  updatedBy: OWNER,
  pinned: false,
  tags: [],
  mute: false,
  inRoom: true,
  // FileShare: RoomManager (9) or Read (2).
  access: canCreate ? 9 : 2,
  filesCount: 0,
  foldersCount: 0,
  isFavorite: false,
  new: 0,
  logo: {
    original: "",
    large: "",
    medium: "",
    small: "",
    color: "5CC5D4",
    cover: null,
  },
  security: {
    Read: true,
    Create: canCreate,
    CopyTo: canCreate,
    MoveTo: canCreate,
    Copy: true,
    Download: true,
    EditRoom: canCreate,
    Rename: canCreate,
    Delete: false,
    Pin: true,
    Mute: true,
    CopyLink: true,
  },
});

const roomsRoot = (foldersCount: number) => ({
  id: ROOMS_ROOT_ID,
  parentId: 0,
  rootFolderId: ROOMS_ROOT_ID,
  rootFolderType: ROOMS_FOLDER_TYPE,
  title: "Rooms",
  filesCount: 0,
  foldersCount,
  security: { Read: true, Create: true },
});

const content = (
  current: Record<string, unknown>,
  pathParts: Record<string, unknown>[],
  folders: unknown[] = [],
) => ({
  response: {
    files: [],
    folders,
    current,
    pathParts,
    startIndex: 0,
    count: folders.length,
    total: folders.length,
    new: 0,
  },
  status: 0,
  statusCode: 200,
});

/**
 * The rooms of the selector and the copy into one of them. Every copy is
 * pushed to `log`; it finishes at once, as a copy of one file does.
 *
 * `GET files/rooms` answers the Rooms list with `rooms` only (a query of the
 * "AI rooms" or another search area is left to the other handlers), so use
 * this after the handlers of the page it is opened on.
 */
export const aiCopyToRoomHandlers = (
  port: string,
  rooms: AiCopyTargetRoomMock[],
  log?: AiCopyRequest[],
) => {
  const base = `${BASE_URL}:${port}/${API_PREFIX}`;
  const find = (id: unknown) => rooms.find((room) => String(room.id) === id);
  const operations: Record<string, unknown>[] = [];

  return [
    http.get(`${base}/files/rooms`, ({ request }) => {
      const searchArea = new URL(request.url).searchParams.get("searchArea");
      if (searchArea && searchArea !== "Active") return undefined;
      return HttpResponse.json(
        content(
          roomsRoot(rooms.length),
          [{ id: ROOMS_ROOT_ID, title: "Rooms", folderType: ROOMS_FOLDER_TYPE }],
          rooms.map(roomDto),
        ),
      );
    }),

    http.get(`${base}/files/folder/:id`, ({ params }) => {
      const room = find(params.id);
      if (!room) return undefined;
      return HttpResponse.json({
        response: { ...roomDto(room), isRoom: true },
        status: 0,
        statusCode: 200,
      });
    }),

    http.get(`${base}/files/:id`, ({ params }) => {
      const room = find(params.id);
      if (!room) return undefined;
      return HttpResponse.json(
        content({ ...roomDto(room), isRoom: true }, [
          { id: ROOMS_ROOT_ID, title: "Rooms", folderType: ROOMS_FOLDER_TYPE },
          {
            id: room.id,
            title: room.title,
            folderType: CUSTOM_ROOM_FOLDER_TYPE,
            roomType: CUSTOM_ROOM_TYPE,
          },
        ]),
      );
    }),

    http.put(`${base}/files/fileops/copy`, async ({ request }) => {
      const body = (await request.json()) as AiCopyRequest;
      log?.push(body);
      const operation = {
        id: `mock-copy-${operations.length + 1}`,
        Operation: 1,
        progress: 100,
        error: "",
        processed: String(body.fileIds.length + body.folderIds.length),
        finished: true,
        status: 2,
      };
      operations.push(operation);
      return HttpResponse.json({
        response: [operation],
        status: 0,
        statusCode: 200,
      });
    }),

    http.get(`${base}/files/fileops`, () =>
      HttpResponse.json({ response: operations, status: 0, statusCode: 200 }),
    ),
  ];
};
