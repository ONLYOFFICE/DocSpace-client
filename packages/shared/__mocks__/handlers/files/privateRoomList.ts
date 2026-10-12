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
import { PATH_ROOMS_LIST } from "./roomList";

export type PrivateRoomListOptions = {
  roomId: number;
  title?: string;
  ownerId?: string;
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
    Disconnect: false,
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

  const folder = {
    parentId: 2002,
    filesCount: 0,
    foldersCount: 0,
    new: 0,
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
    private: true,
    indexing: false,
    denyDownload: false,
    inRoom: true,
    usedSpace: 0,
    fileEntryType: 1,
    id: opts.roomId,
    rootFolderId: 2002,
    canShare: true,
    security,
    title,
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
  };

  const current = {
    parentId: 0,
    filesCount: 0,
    foldersCount: 1,
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
    folderType: 14,
    isArchive: false,
  };

  const body = {
    folders: [folder],
    files: [],
    current,
    pathParts: [{ id: 2002, title: "Rooms" }],
    startIndex: 0,
    total: 1,
    count: 1,
    new: 0,
  };

  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOMS_LIST}`,
    () => okResponse(body),
  );
};
