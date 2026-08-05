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

import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import type {
  TRoom,
  TRoomSecurity,
  RoomMember,
} from "@docspace/shared/api/rooms/types";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TCreatedBy } from "@docspace/shared/types";

/**
 * The stand-in rooms the tour shows a portal that has none of its own.
 *
 * Their ids are negative so nothing can mistake one for a room the server
 * knows about: every real id is a positive integer, so a demo room that leaked
 * past the tour would fail loudly on the first request rather than quietly
 * addressing someone else's room.
 */
const DEMO_ID_BASE = -1000;

/** One room per type, in the order their tiles sit in the quick-actions banner. */
export const DEMO_ROOM_TYPES = [
  RoomsType.EditingRoom,
  RoomsType.VirtualDataRoom,
  RoomsType.PublicRoom,
  RoomsType.CustomRoom,
] as const;

export type TourDemoConfig = {
  /**
   * Titles for the demo rooms, one per `DEMO_ROOM_TYPES` entry. Passed in
   * rather than built here: each room is named after its own type, and those
   * names are the `Common` keys the banner's tiles already use, so the demo
   * needs no translation surface of its own.
   */
  roomTitles: string[];
  /** The signed-in user, who owns every demo room — real data, not invented. */
  owner: TCreatedBy;
};

/** Everything a room admin can do, which is what the demo rooms' owner is. */
const fullSecurity: TRoomSecurity = {
  ChangeOwner: true,
  CopyLink: true,
  CreateRoomFrom: true,
  Embed: true,
  IndexExport: true,
  HistoryExport: true,
  Reconnect: true,
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
  CopySharedLink: true,
  UseChat: true,
};

/**
 * The stand-in rooms that go into the real answer in place of its empty list.
 *
 * `current` is the folder the server itself named, so the rooms sit under the
 * ids the section actually lives at and nothing downstream has to be told this
 * list is not genuine.
 */
export function buildDemoRooms(
  current: TFolder,
  config: TourDemoConfig,
): TRoom[] {
  const now = new Date(0).toISOString();

  return DEMO_ROOM_TYPES.map((roomType, index) => ({
    id: DEMO_ID_BASE - index,
    parentId: current.id,
    rootFolderId: current.id,
    rootFolderType: FolderType.Rooms,
    title: config.roomTitles[index] ?? "",
    roomType,
    filesCount: 0,
    foldersCount: 0,
    new: 0,
    mute: false,
    tags: [],
    logo: { original: "", big: "", medium: "", small: "", color: undefined },
    pinned: false,
    private: false,
    inRoom: true,
    fileEntryType: 1,
    canShare: true,
    access: ShareAccessRights.None,
    shared: false,
    created: now,
    createdBy: config.owner,
    updated: now,
    updatedBy: config.owner,
    security: fullSecurity,
    isRoom: true,
  })) as unknown as TRoom[];
}

/**
 * The member list of a demo room: the signed-in user as its owner, plus two
 * stand-ins that give the roles something to sit against.
 *
 * The stand-ins are addresses rather than names on purpose — an invented
 * person's name would be a user-facing string with nowhere to be translated,
 * and `example.com` is the reserved documentation domain, so nothing here can
 * be mistaken for a real contact.
 */
export function buildDemoMembers(config: TourDemoConfig): RoomMember[] {
  const asUser = (
    id: string,
    displayName: string,
    email: string,
    isVisitor: boolean,
  ) =>
    ({
      id,
      displayName,
      email,
      isVisitor,
      avatar: "",
      avatarSmall: "",
      hasAvatar: false,
    }) as unknown as TUser;

  const items: RoomMember[] = [
    {
      access: ShareAccessRights.FullAccess,
      canEditAccess: false,
      isLocked: false,
      isOwner: true,
      subjectType: 0,
      sharedTo: {
        ...config.owner,
        isVisitor: false,
      } as unknown as TUser,
    },
    {
      access: ShareAccessRights.Editing,
      canEditAccess: true,
      isLocked: false,
      isOwner: false,
      subjectType: 0,
      sharedTo: asUser(
        `${DEMO_ID_BASE}-editor`,
        "editor@example.com",
        "editor@example.com",
        false,
      ),
    },
    {
      access: ShareAccessRights.ReadOnly,
      canEditAccess: true,
      isLocked: false,
      isOwner: false,
      subjectType: 0,
      sharedTo: asUser(
        `${DEMO_ID_BASE}-viewer`,
        "viewer@example.com",
        "viewer@example.com",
        true,
      ),
    },
  ];

  return items;
}
