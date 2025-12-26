// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { BASE_URL, API_PREFIX } from "../../utils";

export const PATH_CREATE_ROOM = "files/rooms";
export const PATH_NEW_ROOM = /.*\/api\/2\.0\/files\/\d+(?:\?.*)?$/;
export const PATH_ROOM_LINKS =
  /.*\/api\/2\.0\/files\/rooms\/\d+\/links(?:\?.*)?$/;
export const PATH_ROOM_SHARE_1 =
  /.*api\/2\.0\/files\/rooms\/\d+\/share\?(?:[^#]*&)?filterType=0(?:&|$)[^#]*$/;
export const PATH_ROOM_SHARE_2 =
  /.*api\/2\.0\/files\/rooms\/\d+\/share\?(?:[^#]*&)?filterType=2(?:&|$)[^#]*$/;
export const PATH_PUBLIC_ROOM_FOLDER_INFO =
  /.*api\/2\.0\/files\/folder\/\d+(?:\?.*)?$/;
export const PATH_PUBLIC_ROOM_FILES = /.*api\/2\.0\/files\/\d+(?:\?.*)?$/;

const createRoomSuccess = {
  response: {
    parentId: 2,
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
      color: "5CC3F7",
    },
    pinned: false,
    roomType: 5,
    private: false,
    indexing: false,
    denyDownload: false,
    inRoom: true,
    quotaLimit: 1048576000,
    isCustomQuota: false,
    usedSpace: 0,
    fileEntryType: 1,
    id: 269971,
    rootFolderId: 2,
    canShare: true,
    shareSettings: {
      PrimaryExternalLink: 1,
      ExternalLink: 5,
    },
    security: {
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
      Reconnect: false,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: false,
      ChangeOwner: true,
      IndexExport: false,
      UseChat: false,
    },
    availableShareRights: {
      ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
    },
    title: "Custom room",
    access: 0,
    shared: false,
    sharedForUser: false,
    parentShared: false,
    shortWebUrl: "",
    created: "2025-12-26T16:47:17.0000000+04:00",
    createdBy: {
      id: "ec80fa3c-63a0-4ea6-adf7-d557db31da40",
      displayName: "Administrator",
      avatar:
        "/static/images/default_user_photo_size_82-82.png?hash=1889470986",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=1889470986",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=1889470986",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    updated: "2025-12-26T16:47:17.0000000+04:00",
    rootFolderType: 14,
    updatedBy: {
      id: "ec80fa3c-63a0-4ea6-adf7-d557db31da40",
      displayName: "Administrator",
      avatar:
        "/static/images/default_user_photo_size_82-82.png?hash=1889470986",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=1889470986",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=1889470986",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

const newRoomSuccess = {
  response: {
    files: [],
    folders: [],
    current: {
      parentId: 2,
      filesCount: 0,
      foldersCount: 0,
      isShareable: true,
      new: 0,
      mute: false,
      tags: [],
      logo: {
        original: "",
        large: "",
        medium: "",
        small: "",
        color: "5CC3F7",
      },
      pinned: false,
      roomType: 5,
      private: false,
      indexing: false,
      denyDownload: false,
      inRoom: true,
      quotaLimit: 1048576000,
      isCustomQuota: false,
      usedSpace: 0,
      fileEntryType: 1,
      id: 269971,
      rootFolderId: 2,
      canShare: true,
      shareSettings: {
        PrimaryExternalLink: 1,
        ExternalLink: 5,
      },
      security: {
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
        Reconnect: false,
        CreateRoomFrom: false,
        CopyLink: true,
        Embed: false,
        ChangeOwner: true,
        IndexExport: false,
        UseChat: false,
      },
      availableShareRights: {
        ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      },
      title: "Custom room",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2025-12-26T16:47:17.0000000+04:00",
      createdBy: {
        id: "ec80fa3c-63a0-4ea6-adf7-d557db31da40",
        displayName: "Administrator",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1889470986",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1889470986",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1889470986",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
      updated: "2025-12-26T16:47:17.0000000+04:00",
      rootFolderType: 14,
      parentRoomType: 19,
      updatedBy: {
        id: "ec80fa3c-63a0-4ea6-adf7-d557db31da40",
        displayName: "Administrator",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1889470986",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1889470986",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1889470986",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
    },
    pathParts: [
      {
        id: 2,
        title: "Rooms",
        folderType: 14,
      },
      {
        id: 269971,
        title: "Custom room",
        roomType: 5,
        folderType: 19,
      },
    ],
    startIndex: 0,
    count: 0,
    total: 0,
    new: 0,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/269971?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const createPublicRoomSuccess = {
  response: {
    parentId: 2,
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
      color: "7757D9",
    },
    pinned: false,
    roomType: 6,
    private: false,
    indexing: false,
    denyDownload: false,
    inRoom: true,
    usedSpace: 0,
    fileEntryType: 1,
    id: 10,
    rootFolderId: 2,
    canShare: true,
    shareSettings: {
      PrimaryExternalLink: 1,
      ExternalLink: 5,
    },
    security: {
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
      Reconnect: false,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: false,
      ChangeOwner: true,
      IndexExport: false,
      UseChat: false,
    },
    availableShareRights: {
      ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
    },
    title: "Public room",
    access: 2,
    shared: false,
    sharedForUser: false,
    parentShared: false,
    shortWebUrl: "",
    created: "2025-12-26T16:29:12.0000000+03:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    updated: "2025-12-26T16:29:12.0000000+03:00",
    rootFolderType: 14,
    updatedBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

const newPublicRoomSuccess = {
  response: {
    parentId: 2,
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
      color: "7757D9",
    },
    pinned: false,
    roomType: 6,
    private: false,
    indexing: false,
    denyDownload: false,
    inRoom: true,
    usedSpace: 0,
    fileEntryType: 1,
    id: 10,
    rootFolderId: 2,
    canShare: true,
    shareSettings: {
      PrimaryExternalLink: 1,
      ExternalLink: 5,
    },
    security: {
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
      Reconnect: false,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: false,
      ChangeOwner: true,
      IndexExport: false,
      UseChat: false,
    },
    availableShareRights: {
      ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
    },
    title: "Public room",
    access: 2,
    shared: false,
    sharedForUser: false,
    parentShared: false,
    shortWebUrl: "",
    created: "2025-12-26T16:29:12.0000000+03:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    updated: "2025-12-26T16:29:12.0000000+03:00",
    rootFolderType: 14,
    updatedBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms`,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

const roomsLinkSuccess = {
  response: [],
  count: 0,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/269971/links?type=1`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const publicRoomLinkSuccess = {
  response: [
    {
      access: 2,
      sharedTo: {
        id: "d7717b79-f571-41a4-a35e-0a6601260bc5",
        title: "Shared link",
        shareLink: `${BASE_URL}/s/qCZ_tZwvN8-sbqQ`,
        linkType: 1,
        denyDownload: false,
        isExpired: false,
        primary: true,
        internal: false,
        requestToken:
          "WHZ3SmNyTWRYZHFDZ2VIYTcrVFV3d0pVbTJjdkpBeXUvNGVoNk1ZZ0p5Yz0_ImQ3NzE3Yjc5LWY1NzEtNDFhNC1hMzVlLTBhNjYwMTI2MGJjNSI",
      },
      sharedLink: {
        id: "d7717b79-f571-41a4-a35e-0a6601260bc5",
        title: "Shared link",
        shareLink: `${BASE_URL}/s/qCZ_tZwvN8-sbqQ`,
        linkType: 1,
        denyDownload: false,
        isExpired: false,
        primary: true,
        internal: false,
        requestToken:
          "WHZ3SmNyTWRYZHFDZ2VIYTcrVFV3d0pVbTJjdkpBeXUvNGVoNk1ZZ0p5Yz0_ImQ3NzE3Yjc5LWY1NzEtNDFhNC1hMzVlLTBhNjYwMTI2MGJjNSI",
      },
      isLocked: false,
      isOwner: false,
      canEditAccess: false,
      canEditInternal: false,
      canEditDenyDownload: true,
      canEditExpirationDate: false,
      canRevoke: true,
      subjectType: 4,
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/10/links?type=1`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const roomShareFirstSuccess = {
  response: [
    {
      access: 1,
      sharedTo: {
        firstName: "Administrator",
        lastName: "",
        userName: "administrator",
        email: "admin@gmail.com",
        status: 1,
        activationStatus: 0,
        workFrom: "2023-11-30T04:00:00.0000000+04:00",
        isAdmin: true,
        isRoomAdmin: false,
        isLDAP: false,
        listAdminModules: ["files"],
        isOwner: false,
        isVisitor: false,
        isCollaborator: false,
        cultureName: "en-US",
        mobilePhoneActivationStatus: 0,
        isSSO: false,
        usedSpace: 10315392,
        registrationDate: "2023-11-30T14:33:10.0000000+04:00",
        hasPersonalFolder: false,
        id: "ec80fa3c-63a0-4ea6-adf7-d557db31da40",
        displayName: "Administrator",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1889470986",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1889470986",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1889470986",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
      sharedToUser: {
        firstName: "Administrator",
        lastName: "",
        userName: "administrator",
        email: "admin@gmail.com",
        status: 1,
        activationStatus: 0,
        workFrom: "2023-11-30T04:00:00.0000000+04:00",
        isAdmin: true,
        isRoomAdmin: false,
        isLDAP: false,
        listAdminModules: ["files"],
        isOwner: false,
        isVisitor: false,
        isCollaborator: false,
        cultureName: "en-US",
        mobilePhoneActivationStatus: 0,
        isSSO: false,
        usedSpace: 10315392,
        registrationDate: "2023-11-30T14:33:10.0000000+04:00",
        hasPersonalFolder: false,
        id: "ec80fa3c-63a0-4ea6-adf7-d557db31da40",
        displayName: "Administrator",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1889470986",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1889470986",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1889470986",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1889470986",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
      isLocked: false,
      isOwner: true,
      canEditAccess: false,
      canEditInternal: false,
      canEditDenyDownload: true,
      canEditExpirationDate: false,
      canRevoke: false,
      subjectType: 0,
    },
  ],
  count: 1,
  total: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/269981/share?filterType=0&startIndex=0&count=100&filterValue=`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const roomShareSecondSuccess = {
  response: [],
  count: 0,
  total: 0,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/269981/share?filterType=2`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const publicRoomShareSecondSuccess = {
  response: [
    {
      access: 2,
      sharedTo: {
        id: "d7717b79-f571-41a4-a35e-0a6601260bc5",
        title: "Shared link",
        shareLink: `${BASE_URL}/s/qCZ_tZwvN8-sbqQ`,
        linkType: 1,
        denyDownload: false,
        isExpired: false,
        primary: true,
        internal: false,
        requestToken:
          "WHZ3SmNyTWRYZHFDZ2VIYTcrVFV3d0pVbTJjdkpBeXUvNGVoNk1ZZ0p5Yz0_ImQ3NzE3Yjc5LWY1NzEtNDFhNC1hMzVlLTBhNjYwMTI2MGJjNSI",
      },
      sharedLink: {
        id: "d7717b79-f571-41a4-a35e-0a6601260bc5",
        title: "Shared link",
        shareLink: `${BASE_URL}/s/qCZ_tZwvN8-sbqQ`,
        linkType: 1,
        denyDownload: false,
        isExpired: false,
        primary: true,
        internal: false,
        requestToken:
          "WHZ3SmNyTWRYZHFDZ2VIYTcrVFV3d0pVbTJjdkpBeXUvNGVoNk1ZZ0p5Yz0_ImQ3NzE3Yjc5LWY1NzEtNDFhNC1hMzVlLTBhNjYwMTI2MGJjNSI",
      },
      isLocked: false,
      isOwner: false,
      canEditAccess: false,
      canEditInternal: false,
      canEditDenyDownload: true,
      canEditExpirationDate: false,
      canRevoke: true,
      subjectType: 4,
    },
  ],
  count: 1,
  total: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/rooms/10/share?filterType=2`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const publicRoomFolderInfoSuccess = {
  response: {
    parentId: 2,
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
      color: "7757D9",
    },
    pinned: false,
    roomType: 6,
    private: false,
    indexing: false,
    denyDownload: false,
    inRoom: true,
    usedSpace: 0,
    fileEntryType: 1,
    id: 10,
    rootFolderId: 2,
    canShare: true,
    shareSettings: {
      PrimaryExternalLink: 1,
      ExternalLink: 5,
    },
    security: {
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
      Reconnect: false,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: true,
      ChangeOwner: true,
      IndexExport: false,
      UseChat: false,
    },
    availableShareRights: {
      ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
    },
    title: "Public room",
    access: 0,
    shared: true,
    sharedForUser: false,
    parentShared: false,
    shortWebUrl: "",
    created: "2025-12-26T16:29:12.0000000+03:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    updated: "2025-12-26T16:29:12.0000000+03:00",
    rootFolderType: 14,
    updatedBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    isFavorite: false,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/folder/10`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const publicRoomFilesSuccess = {
  response: {
    files: [],
    folders: [],
    current: {
      parentId: 2,
      filesCount: 0,
      foldersCount: 0,
      isShareable: true,
      new: 0,
      mute: false,
      tags: [],
      logo: {
        original: "",
        large: "",
        medium: "",
        small: "",
        color: "7757D9",
      },
      pinned: false,
      roomType: 6,
      private: false,
      indexing: false,
      denyDownload: false,
      inRoom: true,
      usedSpace: 0,
      fileEntryType: 1,
      id: 10,
      rootFolderId: 2,
      canShare: true,
      shareSettings: {
        PrimaryExternalLink: 1,
        ExternalLink: 5,
      },
      security: {
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
        Reconnect: false,
        CreateRoomFrom: false,
        CopyLink: true,
        Embed: true,
        ChangeOwner: true,
        IndexExport: false,
        UseChat: false,
      },
      availableShareRights: {
        ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      },
      title: "Public room",
      access: 0,
      shared: true,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2025-12-26T16:29:12.0000000+03:00",
      createdBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=868996641",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=868996641",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=868996641",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
      updated: "2025-12-26T16:29:12.0000000+03:00",
      rootFolderType: 14,
      parentRoomType: 22,
      updatedBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=868996641",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=868996641",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=868996641",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
    },
    pathParts: [
      {
        id: 2,
        title: "Rooms",
        folderType: 14,
      },
      {
        id: 10,
        title: "Public room",
        roomType: 6,
        folderType: 22,
      },
    ],
    startIndex: 0,
    count: 0,
    total: 0,
    new: 0,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/10?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const createRoomHandler = () => {
  return new Response(JSON.stringify(createRoomSuccess));
};

export const newRoomHandler = () => {
  return new Response(JSON.stringify(newRoomSuccess));
};

export const roomsLinkHandler = () => {
  return new Response(JSON.stringify(roomsLinkSuccess));
};

export const roomShareFirstHandler = () => {
  return new Response(JSON.stringify(roomShareFirstSuccess));
};

export const roomShareSecondHandler = () => {
  return new Response(JSON.stringify(roomShareSecondSuccess));
};

export const createPublicRoomHandler = () => {
  return new Response(JSON.stringify(createPublicRoomSuccess));
};

export const newPublicRoomHandler = () => {
  return new Response(JSON.stringify(newPublicRoomSuccess));
};

export const publicRoomLinkHandler = () => {
  return new Response(JSON.stringify(publicRoomLinkSuccess));
};

export const publicRoomFolderInfoHandler = () => {
  return new Response(JSON.stringify(publicRoomFolderInfoSuccess));
};

export const publicRoomFilesHandler = () => {
  return new Response(JSON.stringify(publicRoomFilesSuccess));
};

export const publicRoomShareSecondHandler = () => {
  return new Response(JSON.stringify(publicRoomShareSecondSuccess));
};
