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

import { FolderType, RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import type {
  TRoom,
  TRoomSecurity,
  RoomMember,
} from "@docspace/shared/api/rooms/types";
import type {
  TFile,
  TFolder,
  TGetFolder,
} from "@docspace/shared/api/files/types";
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

/** One stand-in room: what it is, and what the list calls it. */
export type TourDemoRoom = {
  roomType: RoomsType;
  title: string;
};

/**
 * Which endpoint the section's list comes back on.
 *
 * Rooms and Forms are both answered by `files/rooms`; the agents section has an
 * endpoint of its own, `ai/agents`, served by the Node AI service. The two
 * answer in the same shape — the rows arrive in `folders`, under a `current`
 * the server named — so only the route the demo claims differs, and an agent is
 * a room as far as everything downstream is concerned (`RoomsType.AIRoom` under
 * `FolderType.AIAgents`).
 */
export type TourDemoList = "rooms" | "agents";

export type TourDemoConfig = {
  /** The endpoint whose answer the stand-in rows are put into. */
  list: TourDemoList;
  /**
   * The stand-in rooms, in list order. Built by the tour rather than here:
   * what a section's list should be standing in for is the tour's business,
   * and the titles are its translations to hold.
   */
  rooms: TourDemoRoom[];
  /**
   * Whether the section's own list is replaced by them.
   *
   * Off, the stand-in rooms are still built — a tour that walks into one needs
   * something to walk into — but the list the user sees stays their own. That
   * is the line the demo does not cross: a portal with rooms of its own never
   * sees a room it does not have *in its list*.
   */
  standInForList: boolean;
  /** The signed-in user, who owns every demo room — real data, not invented. */
  owner: TCreatedBy;
  /**
   * The stand-in members every demo room shares, after the owner. Which roles
   * are worth showing differs by section — a room has editors and viewers, a
   * form space has the people filling the form in — so the tour picks them.
   */
  memberAccess: ShareAccessRights[];
  /**
   * What the inside of a stand-in room is made of, when the tour walks into
   * one. Only the forms tour does, and only the two system folders need
   * naming — the blank form is named after the space it belongs to.
   */
  contents?: {
    inProgressTitle: string;
    completeTitle: string;
  };
};

/**
 * The ids of the stand-in form space and of the three things inside it. Fixed
 * rather than derived: the tour only ever walks into the first space, and steps
 * anchor on these ids through the row's `folder_{id}` / `file_{id}` element id,
 * which is the one handle that holds in all three views.
 *
 * `space` is the first room `buildDemoRooms` lays down (`DEMO_ID_BASE - 0`) and
 * the one `tourDemo.space` hands back — the step that walks in points at that
 * row, so the space the user is looking at is the space they end up inside.
 */
export const DEMO_SPACE_ITEM_IDS = {
  space: DEMO_ID_BASE,
  inProgress: DEMO_ID_BASE - 100,
  complete: DEMO_ID_BASE - 101,
  form: DEMO_ID_BASE - 102,
} as const;

/**
 * The timestamp every stand-in entity is created and updated at.
 *
 * Read at build time rather than fixed, because the list renders it: the epoch
 * put a literal "1/1/1970" in the Modified column of every demo row, which is
 * the one thing on screen that gives the pretence away. A room the tour claims
 * you could have made a moment ago should not be older than the product.
 */
const demoTimestamp = () => new Date().toISOString();

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
  const now = demoTimestamp();

  return config.rooms.map(({ roomType, title }, index) => ({
    id: DEMO_ID_BASE - index,
    parentId: current.id,
    rootFolderId: current.id,
    // The section names its own root — Rooms and Forms are separate ones, and
    // a room filed under the wrong root is a room in the wrong section.
    rootFolderType: current.rootFolderType ?? FolderType.Rooms,
    title,
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
 * What each stand-in member is called, by the role they hold.
 *
 * Addresses rather than names on purpose — an invented person's name would be
 * a user-facing string with nowhere to be translated, and `example.com` is the
 * reserved documentation domain, so nothing here can be mistaken for a real
 * contact.
 */
const MEMBER_ADDRESS: Partial<Record<ShareAccessRights, string>> = {
  [ShareAccessRights.Editing]: "editor@example.com",
  [ShareAccessRights.ReadOnly]: "viewer@example.com",
  [ShareAccessRights.FormFilling]: "filler@example.com",
};

/**
 * The member list of a demo room: the signed-in user as its owner, plus the
 * stand-ins the tour asked for, which give the roles something to sit against.
 */
export function buildDemoMembers(config: TourDemoConfig): RoomMember[] {
  const asUser = (id: string, email: string, isVisitor: boolean) =>
    ({
      id,
      displayName: email,
      email,
      isVisitor,
      avatar: "",
      avatarSmall: "",
      hasAvatar: false,
    }) as unknown as TUser;

  const owner: RoomMember = {
    access: ShareAccessRights.FullAccess,
    canEditAccess: false,
    isLocked: false,
    isOwner: true,
    subjectType: 0,
    sharedTo: {
      ...config.owner,
      isVisitor: false,
    } as unknown as TUser,
  };

  return [
    owner,
    ...config.memberAccess.map((access, index) => {
      const email = MEMBER_ADDRESS[access] ?? "member@example.com";

      return {
        access,
        canEditAccess: true,
        isLocked: false,
        isOwner: false,
        subjectType: 0,
        // Whoever only ever reads or fills something in is a guest as far as
        // the panel's badge is concerned.
        sharedTo: asUser(
          `${DEMO_ID_BASE}-member-${index}`,
          email,
          access !== ShareAccessRights.Editing,
        ),
      } satisfies RoomMember;
    }),
  ];
}

/** Everything anyone can do to something inside a room they administer. */
const fullFolderSecurity = {
  Read: true,
  Create: true,
  Delete: true,
  EditRoom: false,
  Rename: true,
  CopyTo: true,
  Copy: true,
  MoveTo: true,
  Move: true,
  Pin: false,
  Mute: false,
  EditAccess: false,
  Duplicate: true,
  Download: true,
  CopySharedLink: true,
  Reconnect: false,
  CreateRoomFrom: false,
  CopyLink: true,
  Embed: false,
  ChangeOwner: false,
  IndexExport: false,
  HistoryExport: false,
};

/**
 * The inside of a stand-in form space: the blank form, and the two system
 * folders the answers move between.
 *
 * This is the part of the section the tour cannot borrow from the portal. A
 * form space only grows its `In progress` and `Complete` folders once a form
 * has been uploaded and started, so walking a real space would show a
 * different room to every user — and an empty one to anybody who has not
 * collected anything yet, which is exactly who the tour is for.
 *
 * `room` and `sectionRoot` are the objects the rest of the demo already built
 * from the server's own answer, so the ids, the path and the owner are the
 * same ones the section is really using.
 */
export function buildDemoSpaceContents(
  room: TRoom,
  sectionRoot: TFolder,
  config: TourDemoConfig,
): TGetFolder {
  const now = demoTimestamp();

  const folder = (id: number, title: string, type: FolderType) =>
    ({
      parentId: room.id,
      filesCount: 0,
      foldersCount: 0,
      new: 0,
      mute: false,
      pinned: false,
      private: false,
      indexing: false,
      denyDownload: false,
      fileEntryType: 1,
      id,
      rootFolderId: sectionRoot.id,
      rootFolderType: sectionRoot.rootFolderType,
      parentRoomType: FolderType.FormRoom,
      canShare: false,
      security: fullFolderSecurity,
      title,
      type,
      access: ShareAccessRights.None,
      shared: false,
      created: now,
      createdBy: config.owner,
      updated: now,
      updatedBy: config.owner,
      isFolder: true,
    }) as unknown as TFolder;

  // The blank form, named after the collection it belongs to — so the demo
  // needs no string of its own for it.
  const form = {
    folderId: room.id,
    version: 1,
    versionGroup: 1,
    contentLength: "0 KB",
    pureContentLength: 0,
    fileStatus: 0,
    mute: false,
    viewUrl: "",
    webUrl: "",
    fileType: 10,
    fileExst: ".pdf",
    comment: "",
    thumbnailUrl: "",
    thumbnailStatus: 1,
    isForm: true,
    startFilling: false,
    viewAccessibility: {
      ImageView: false,
      MediaView: false,
      WebView: true,
      WebEdit: true,
      WebReview: false,
      WebCustomFilterEditing: false,
      WebRestrictedEditing: false,
      WebComment: false,
      CoAuhtoring: false,
      CanConvert: false,
      MustConvert: false,
    },
    fileEntryType: 2,
    id: DEMO_SPACE_ITEM_IDS.form,
    rootFolderId: sectionRoot.id,
    rootFolderType: sectionRoot.rootFolderType,
    parentRoomType: FolderType.FormRoom,
    canShare: true,
    security: {
      Read: true,
      Comment: false,
      FillForms: true,
      Review: false,
      Edit: true,
      Delete: true,
      CustomFilter: false,
      Rename: true,
      ReadHistory: true,
      Lock: false,
      EditHistory: false,
      Copy: true,
      Move: true,
      Duplicate: true,
      SubmitToFormGallery: false,
      Download: true,
      Convert: false,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: false,
      EditForm: true,
      StartFilling: true,
      OpenForm: true,
      FillingStatus: true,
      Vectorization: false,
    },
    title: `${room.title}.pdf`,
    access: ShareAccessRights.None,
    shared: false,
    created: now,
    createdBy: config.owner,
    updated: now,
    updatedBy: config.owner,
    shortWebUrl: "",
  } as unknown as TFile;

  // In progress before Complete, which is the order a submission travels in
  // and the order the room itself lists them.
  const folders = [
    folder(
      DEMO_SPACE_ITEM_IDS.inProgress,
      config.contents?.inProgressTitle ?? "",
      FolderType.InProgress,
    ),
    folder(
      DEMO_SPACE_ITEM_IDS.complete,
      config.contents?.completeTitle ?? "",
      FolderType.Done,
    ),
  ];

  return {
    files: [form],
    folders,
    // The room is the folder the section is now in — the same object the list
    // handed over, so its id, owner and permissions do not have to be invented
    // a second time.
    current: {
      ...room,
      filesCount: 1,
      foldersCount: folders.length,
    } as unknown as TFolder,
    pathParts: [
      { id: sectionRoot.id, title: sectionRoot.title },
      { id: room.id, title: room.title },
    ],
    startIndex: 0,
    count: folders.length + 1,
    total: folders.length + 1,
    new: 0,
  };
}
