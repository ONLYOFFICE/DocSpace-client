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

// Rooms as a list hands them to the info panel and the dialogs: a server room
// DTO passed through buildFilesListItems, not a hand-built object.

import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import {
  buildFilesListItems,
  type BuildFilesListItemsDeps,
} from "../filesList.helpers";
import type { TItem } from "../types";

const deps = {
  fileItemsList: null,
  enablePlugins: false,
  aiReadyNeedReset: undefined,
  getIcon: () => "icon.svg",
  getThirdPartyIcon: () => "",
  getItemUrl: () => "",
  getFilesContextOptions: () => [],
  folders: [],
  isRecycleBinFolder: false,
  encryptedFilenameCacheVersion: 0,
} as unknown as BuildFilesListItemsDeps;

export const roomDto = (over: Partial<TRoom> = {}): TRoom =>
  ({
    id: 14,
    parentId: 2,
    rootFolderId: 2,
    rootFolderType: FolderType.Rooms,
    title: "Shared target",
    roomType: RoomsType.CustomRoom,
    filesCount: 0,
    foldersCount: 0,
    shareSettings: { ExternalLink: 5, PrimaryExternalLink: 1 },
    security: {
      EditAccess: true,
      EditRoom: true,
      ReadHistory: true,
      Read: true,
    },
    ...over,
  }) as unknown as TRoom;

export const privateRoomDto = (over: Partial<TRoom> = {}): TRoom =>
  roomDto({ private: true, ...over });

export const listItemOf = (dto: TRoom): TRoom =>
  buildFilesListItems([dto as unknown as TItem], deps)[0] as unknown as TRoom;
