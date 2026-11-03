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
import { PATH_ROOMS_LIST, withRoomPrivacyFilter } from "./roomList";

export type PrivateRoomListOptions = {
  roomId: number;
  title?: string;
  ownerId?: string;
  /**
   * More private rooms, listed right after the first one. `foldersCount` is
   * the number of folders below the room, as FolderDtoHelper copies it from
   * the stored counter (FolderQueries.UpdateFoldersCountAsync).
   */
  otherPrivateRooms?: { roomId: number; title: string; foldersCount?: number }[];
  /** Rooms listed after the private ones, with `private: false`. */
  ordinaryRooms?: { roomId: number; title: string }[];
  /** The new-items count (`new`) of the first private room. */
  newItems?: number;
  /** Leaves the first private room out, for an area with no private rooms. */
  withoutPrivateRoom?: boolean;
};

const okResponse = <T>(response: T): Response =>
  new Response(JSON.stringify({ response, status: 0, statusCode: 200 }), {
    headers: { "Content-Type": "application/json" },
  });

export const privateRoomListHandler = (
  port: string,
  opts: PrivateRoomListOptions,
) => {
  const ownerId = opts.ownerId ?? "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
  const title = opts.title ?? "Private Test Room";

  const security = {
    Read: true,
    Create: true,
    Delete: true,
    EditRoom: true,
    Rename: true,
    CopyTo: true,
    Copy: true,
    MoveTo: true,
    Move: true,
    Pin: true,
    Mute: true,
    EditAccess: true,
    Duplicate: true,
    Download: true,
    CopySharedLink: false,
    CreateRoomFrom: false,
    CopyLink: false,
    Embed: false,
    Reconnect: false,
    ChangeOwner: true,
    IndexExport: false,
    UseChat: false,
  };

  const createdBy = {
    id: ownerId,
    displayName: "Administrator ",
    avatarSmall:
      "/static/images/default_user_photo_size_32-32.png?hash=520061207",
    profileUrl: "",
    hasAvatar: false,
  };

  const roomDto = (
    id: number,
    roomTitle: string,
    isPrivate: boolean,
    newItems = 0,
    foldersCount = 0,
  ) => ({
    parentId: 2002,
    filesCount: 0,
    foldersCount,
    new: newItems,
    mute: false,
    tags: [],
    logo: {
      original: "",
      large: "",
      medium: "",
      small: "",
      color: "8048B0",
    },
    pinned: false,
    roomType: 5,
    private: isPrivate,
    indexing: false,
    denyDownload: false,
    inRoom: true,
    usedSpace: 0,
    fileEntryType: 1,
    id,
    rootFolderId: 2002,
    canShare: true,
    security,
    title: roomTitle,
    access: 0,
    shared: false,
    sharedForUser: false,
    parentShared: false,
    shortWebUrl: "",
    created: "2026-01-01T00:00:00.0000000+00:00",
    createdBy,
    updated: "2026-01-01T00:00:00.0000000+00:00",
    rootFolderType: 14,
    parentRoomType: 14,
    updatedBy: createdBy,
  });

  const folders = [
    ...(opts.withoutPrivateRoom
      ? []
      : [roomDto(opts.roomId, title, true, opts.newItems)]),
    ...(opts.otherPrivateRooms ?? []).map((room) =>
      roomDto(room.roomId, room.title, true, 0, room.foldersCount),
    ),
    ...(opts.ordinaryRooms ?? []).map((room) =>
      roomDto(room.roomId, room.title, false),
    ),
  ];

  const current = {
    parentId: 0,
    filesCount: 0,
    foldersCount: folders.length,
    new: 0,
    mute: false,
    pinned: false,
    private: false,
    indexing: false,
    denyDownload: false,
    fileEntryType: 1,
    id: 2002,
    rootFolderId: 2002,
    canShare: false,
    security: {
      Read: true,
      Create: true,
      Delete: false,
      EditRoom: false,
      Rename: false,
      CopyTo: false,
      MoveTo: false,
    },
    title: "Rooms",
    access: 1,
    shared: false,
    rootFolderType: 14,
  };

  const body = {
    folders,
    files: [],
    current,
    pathParts: [{ id: 2002, title: "Rooms", folderType: 14 }],
    startIndex: 0,
    total: folders.length,
    count: folders.length,
    new: 0,
  };

  // The Archive root has id 11244 in the root mock (root.ts).
  const archiveBody = {
    ...body,
    current: {
      ...current,
      id: 11244,
      rootFolderId: 11244,
      title: "Archive",
      rootFolderType: 20,
    },
    pathParts: [{ id: 11244, title: "Archive", folderType: 20 }],
  };

  /**
   * Mirrors VirtualRoomsController.GetRoomsFolder (HttpGet "rooms"):
   * GetRoomsSectionIdAsync picks the Archive root for searchArea=Archive and
   * the Rooms root otherwise, and FileStorageService.GetFolderItemsAsync
   * answers that section as `current` and as the only breadcrumb, titled by
   * FilesMappingAction (FilesUCResource.Archive or VirtualRooms). Both areas
   * list the same rooms. `privacyFilter` keeps the private room or the
   * ordinary ones (withRoomPrivacyFilter).
   */
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOMS_LIST}`,
    ({ request }) => {
      const isArchive =
        new URL(request.url).searchParams.get("searchArea") === "Archive";

      return okResponse(
        withRoomPrivacyFilter(isArchive ? archiveBody : body, request),
      );
    },
  );
};
