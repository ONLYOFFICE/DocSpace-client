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
  FileType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
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
 * Demo ids count down from here. Negative, so a row that leaked past the tour
 * fails loudly instead of addressing somebody else's room: every real id is a
 * positive integer.
 */
const DEMO_ID_BASE = -1000;

/** Keeps the room ids clear of the ids of what is inside a room. */
const DEMO_ROOM_ID_LIMIT = 100;

/** Where the ids of a stand-in room's contents start, below every room id. */
const DEMO_CONTENTS_ID_BASE = DEMO_ID_BASE - DEMO_ROOM_ID_LIMIT;

/** One stand-in room: what it is, and what the list calls it. */
export type TourDemoRoom = {
  roomType: RoomsType;
  title: string;
};

/**
 * One stand-in file in a list of files somebody else shared.
 *
 * `access` is what the signed-in user was given on it, not what the sharer
 * holds — that is the column the tour is about.
 */
export type TourDemoFile = {
  /** The name without its extension, which `fileExst` carries. */
  title: string;
  fileExst: string;
  fileType: FileType;
  access: ShareAccessRights;
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
 *
 * `shared` and `personal` are plain folders: the list comes back on
 * `files/{id}` and the rows arrive in `files`. They differ only in who owns
 * them.
 */
export type TourDemoList = "rooms" | "agents" | "shared" | "personal";

export type TourDemoConfig = {
  /** The endpoint whose answer the stand-in rows are put into. */
  list: TourDemoList;
  /** In list order, and named by the tour: the titles are its translations. */
  rooms?: TourDemoRoom[];
  files?: TourDemoFile[];
  /** Where the stand-in files go: a file list is answered by `files/{id}`. */
  folderId?: number;
  /**
   * Whether the user's own list is replaced by them. Off, the stand-in rooms
   * are still built for a tour that walks into one, but the list stays theirs:
   * a portal with rooms of its own never sees a room it does not have.
   */
  standInForList: boolean;
  /**
   * The signed-in user, who owns every demo row — real data, not invented. The
   * store hands it over as `TUser`, which the rows carry as their `TCreatedBy`.
   */
  owner: TCreatedBy | TUser;
  /** The roles worth showing in a room's member list, picked by the tour. */
  memberAccess?: ShareAccessRights[];
  /** Named only by the forms tour, the one that walks into a stand-in room. */
  contents?: {
    inProgressTitle: string;
    completeTitle: string;
  };
};

/**
 * The stand-in form space and the three things inside it. Fixed rather than
 * derived: steps anchor on these ids through the row's `folder_{id}` element
 * id, the one handle that holds in all three views. `space` is the first room
 * `buildDemoRooms` lays down, which is the one the tour walks into.
 */
export const DEMO_SPACE_ITEM_IDS = {
  space: DEMO_ID_BASE,
  inProgress: DEMO_CONTENTS_ID_BASE,
  complete: DEMO_CONTENTS_ID_BASE - 1,
  form: DEMO_CONTENTS_ID_BASE - 2,
} as const;

/**
 * Whether an id is the demo's own rather than the portal's. Every real id is a
 * positive integer and the demo's count down from `DEMO_ID_BASE`, so anything
 * that must not be asked about the server can be told apart by this alone —
 * a stand-in room is only ever answered by the interceptors above it.
 */
export const isTourDemoId = (id: string | number) => Number(id) <= DEMO_ID_BASE;

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
 * The cover colour of the nth stand-in room.
 *
 * A room with no cover of its own is drawn as its initials on a coloured
 * square, and the colour is part of what makes a row read as a room at all —
 * without one the list is initials floating on the page.
 *
 * Walked by list position rather than drawn at random the way the product does
 * it: a colour per run would make every screenshot comparison a coin toss.
 * Returned without the leading `#`, which is what RoomIcon expects.
 */
const demoLogoColor = (index: number) =>
  globalColors.logoColors[index % globalColors.logoColors.length].replace(
    "#",
    "",
  );

/**
 * The stand-in rooms put into the real answer in place of its empty list.
 * `current` is the folder the server named, so nothing downstream has to be
 * told the list is not genuine.
 */
export function buildDemoRooms(
  current: TFolder,
  config: TourDemoConfig,
): TRoom[] {
  const now = demoTimestamp();

  // Past this the room ids run into the ids of the things inside a room, and
  // the routes keyed on them would answer for the wrong one. No tour comes
  // close — the sections ask for three — so this is a wall, not a policy.
  const rooms = (config.rooms ?? []).slice(0, DEMO_ROOM_ID_LIMIT);

  return rooms.map(({ roomType, title }, index) => ({
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
    logo: {
      original: "",
      large: "",
      medium: "",
      small: "",
      color: demoLogoColor(index),
    },
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
 * Addresses rather than names: an invented name would be a user-facing string
 * with nowhere to be translated, and `example.com` is the reserved domain.
 */
const MEMBER_ADDRESS: Partial<Record<ShareAccessRights, string>> = {
  [ShareAccessRights.Editing]: "editor@example.com",
  [ShareAccessRights.ReadOnly]: "viewer@example.com",
  [ShareAccessRights.FormFilling]: "filler@example.com",
};

/** The signed-in user as owner, plus the stand-ins the tour asked for. */
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
    ...(config.memberAccess ?? []).map((access, index) => {
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

/**
 * Who shared the stand-in files.
 *
 * An address rather than a name, for the same reason the members are addresses
 * (see `MEMBER_ADDRESS`) — and one person rather than several, because the
 * column the tour points at is about where a file came from, not about how many
 * people it could have come from.
 */
const SHARED_BY_ADDRESS = "colleague@example.com";

/**
 * What a guest may do with a file that was shared with them, by the access they
 * were given. Everything that would act on somebody else's file — renaming it,
 * moving it, passing it on — stays off whatever the level: those are the
 * owner's to do, and a demo row that offered them would be teaching a lie.
 */
const sharedFileSecurity = (access: ShareAccessRights) => ({
  Read: true,
  Edit: access === ShareAccessRights.Editing,
  Comment:
    access === ShareAccessRights.Comment ||
    access === ShareAccessRights.Editing,
  Review: false,
  FillForms: false,
  CustomFilter: false,
  ReadHistory: false,
  EditHistory: false,
  Download: true,
  Delete: false,
  Rename: false,
  Lock: false,
  Copy: false,
  Move: false,
  Duplicate: false,
  Convert: false,
  SubmitToFormGallery: false,
  CreateRoomFrom: false,
  CopyLink: false,
  Embed: false,
  EditForm: false,
  StartFilling: false,
  OpenForm: false,
  FillingStatus: false,
  Vectorization: false,
});

/** What every stand-in file carries, whoever it belongs to. */
function demoFileFields(
  current: TFolder,
  file: TourDemoFile,
  index: number,
  rootFolderType: FolderType,
  now: string,
) {
  return {
    id: DEMO_ID_BASE - index,
    folderId: current.id,
    rootFolderId: current.id,
    // The section names its own root, so a stand-in file cannot end up filed
    // as somebody's personal document.
    rootFolderType: current.rootFolderType ?? rootFolderType,
    title: `${file.title}${file.fileExst}`,
    fileExst: file.fileExst,
    fileType: file.fileType,
    version: 1,
    versionGroup: 1,
    contentLength: "0 KB",
    pureContentLength: 0,
    fileStatus: 0,
    mute: false,
    comment: "",
    viewUrl: "",
    webUrl: "",
    shortWebUrl: "",
    thumbnailUrl: "",
    thumbnailStatus: 1,
    fileEntryType: 2,
    shared: false,
    sharedForUser: false,
    parentShared: false,
    created: now,
    updated: now,
  };
}

/**
 * The stand-in files of a Shared with me that has nothing in it yet, carrying
 * the two things the section exists to show: where a file came from, and what
 * may be done with it.
 */
export function buildDemoSharedFiles(
  current: TFolder,
  config: TourDemoConfig,
): TFile[] {
  const now = demoTimestamp();

  const sharedBy = {
    id: `${DEMO_ID_BASE}-shared-by`,
    displayName: SHARED_BY_ADDRESS,
    avatar: "",
    avatarSmall: "",
    hasAvatar: false,
    profileUrl: "",
    isAnonim: false,
  } as unknown as TCreatedBy;

  return (config.files ?? []).map((file, index) => {
    const { access } = file;
    const canEdit = access === ShareAccessRights.Editing;

    return {
      ...demoFileFields(current, file, index, FolderType.SHARE, now),
      // Not theirs to pass on, which keeps the share button off the row.
      canShare: false,
      sharedBy,
      createdBy: sharedBy,
      updatedBy: sharedBy,
      access,
      security: sharedFileSecurity(access),
      viewAccessibility: {
        ImageView: false,
        MediaView: false,
        WebView: true,
        WebEdit: canEdit,
        WebReview: false,
        WebCustomFilterEditing: false,
        WebRestrictedEditing: false,
        WebComment: canEdit || access === ShareAccessRights.Comment,
        CoAuhtoring: canEdit,
        CanConvert: false,
        MustConvert: false,
      },
    };
  }) as unknown as TFile[];
}

const ownFileSecurity = {
  Read: true,
  Edit: true,
  Comment: true,
  Review: true,
  FillForms: true,
  CustomFilter: true,
  ReadHistory: true,
  EditHistory: true,
  Download: true,
  Delete: true,
  Rename: true,
  Lock: true,
  Copy: true,
  Move: true,
  Duplicate: true,
  Convert: true,
  SubmitToFormGallery: false,
  CreateRoomFrom: true,
  CopyLink: true,
  Embed: false,
  EditForm: false,
  StartFilling: false,
  OpenForm: false,
  FillingStatus: false,
  Vectorization: false,
};

/**
 * The three formats every file section stands in with, named by the caller so
 * the titles stay the tour's translations to hold.
 */
export function buildDemoFileList(titles: {
  document: string;
  spreadsheet: string;
  presentation: string;
}): TourDemoFile[] {
  return [
    {
      title: titles.document,
      fileExst: ".docx",
      fileType: FileType.Document,
      access: ShareAccessRights.Editing,
    },
    {
      title: titles.spreadsheet,
      fileExst: ".xlsx",
      fileType: FileType.Spreadsheet,
      access: ShareAccessRights.Comment,
    },
    {
      title: titles.presentation,
      fileExst: ".pptx",
      fileType: FileType.Presentation,
      access: ShareAccessRights.ReadOnly,
    },
  ];
}

/** The stand-in files of a personal space its owner has emptied. */
export function buildDemoPersonalFiles(
  current: TFolder,
  config: TourDemoConfig,
): TFile[] {
  const now = demoTimestamp();

  return (config.files ?? []).map(
    (file, index) =>
      ({
        ...demoFileFields(current, file, index, FolderType.USER, now),
        canShare: true,
        createdBy: config.owner,
        updatedBy: config.owner,
        access: ShareAccessRights.None,
        security: ownFileSecurity,
        viewAccessibility: {
          ImageView: false,
          MediaView: false,
          WebView: true,
          WebEdit: true,
          WebReview: true,
          WebCustomFilterEditing: true,
          WebRestrictedEditing: false,
          WebComment: true,
          CoAuhtoring: true,
          CanConvert: false,
          MustConvert: false,
        },
      }) as unknown as TFile,
  );
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
 * The inside of a stand-in form space: the blank form and the two system
 * folders the answers move between. A real space only grows them once a form
 * has been started, so walking one would show something different to everyone.
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
