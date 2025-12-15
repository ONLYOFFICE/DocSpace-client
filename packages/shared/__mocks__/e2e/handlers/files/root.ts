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

export const ROOT_PATH = "files/@root?**";

const successRoot = {
  response: [
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 0,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 1,
        rootFolderId: 1,
        canShare: false,
        security: {
          Read: true,
          Create: false,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: false,
          Copy: false,
          MoveTo: false,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: false,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
          FillForms: false,
          Edit: false,
          SubmitToFormGallery: false,
          Lock: false,
          CustomFilter: false,
          StartFilling: false,
          StopFilling: false,
          FillingStatus: false,
        },
        availableShareRights: {},
        title: "Favorites",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-09-03T09:55:24.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-09-03T09:55:24.0000000+00:00",
        rootFolderType: 10,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        order: "",
      },
      pathParts: [
        {
          id: 176935,
          title: "Favorites",
          folderType: 10,
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 0,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 28934,
        rootFolderId: 28934,
        canShare: false,
        security: {
          Read: true,
          Create: false,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: false,
          Copy: false,
          MoveTo: false,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: false,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
          FillForms: false,
          Edit: false,
          SubmitToFormGallery: false,
          Lock: false,
          CustomFilter: false,
          StartFilling: false,
          StopFilling: false,
          FillingStatus: false,
        },
        availableShareRights: {},
        title: "Recent",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2024-02-16T12:12:01.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2024-02-16T12:12:01.0000000+00:00",
        rootFolderType: 11,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        order: "",
      },
      pathParts: [
        {
          id: 28934,
          title: "Recent",
          folderType: 11,
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 0,
        foldersCount: 0,
        isShareable: true,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 4,
        rootFolderId: 4,
        canShare: false,
        security: {
          Read: true,
          Create: false,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: false,
          Copy: false,
          MoveTo: false,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: false,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
        },
        availableShareRights: {},
        title: "Shared with me",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2023-01-26T14:37:30.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2023-01-26T14:37:30.0000000+00:00",
        rootFolderType: 6,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      pathParts: [
        {
          id: 11241,
          title: "Shared with me",
          folderType: 6,
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 62,
        foldersCount: 7,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 12764,
        rootFolderId: 12764,
        canShare: false,
        security: {
          Read: true,
          Create: true,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: true,
          Copy: false,
          MoveTo: true,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: false,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
        },
        availableShareRights: {
          User: [
            "ReadWrite",
            "Editing",
            "Review",
            "Comment",
            "Read",
            "Restrict",
            "None",
          ],
          ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
          Group: [
            "ReadWrite",
            "Editing",
            "Review",
            "Comment",
            "Read",
            "Restrict",
            "None",
          ],
          PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        },
        title: "My documents",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2023-03-27T14:25:42.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-07-03T12:04:48.0000000+00:00",
        rootFolderType: 5,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      pathParts: [
        {
          id: 12764,
          title: "My documents",
          folderType: 5,
        },
      ],
      startIndex: 0,
      count: 1,
      total: 7,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 0,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 12765,
        rootFolderId: 12765,
        canShare: false,
        security: {
          Read: true,
          Create: false,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: false,
          Copy: false,
          MoveTo: true,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: false,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
        },
        availableShareRights: {},
        title: "Trash",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2023-03-27T14:25:42.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-04-30T17:03:05.0000000+00:00",
        rootFolderType: 3,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      pathParts: [
        {
          id: 12765,
          title: "Trash",
          folderType: 3,
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 0,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 11239,
        rootFolderId: 11239,
        canShare: false,
        security: {
          Read: true,
          Create: true,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: false,
          Copy: false,
          MoveTo: true,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: false,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
        },
        availableShareRights: {},
        title: "Rooms",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2023-01-26T14:37:30.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-11-21T15:23:01.0000000+00:00",
        rootFolderType: 14,
        parentRoomType: 14,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      pathParts: [
        {
          id: 11239,
          title: "Rooms",
          folderType: 14,
        },
      ],
      startIndex: 0,
      count: 1,
      total: 149,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 2410,
        foldersCount: 306,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 11244,
        rootFolderId: 11244,
        canShare: false,
        security: {
          Read: true,
          Create: false,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: false,
          Copy: true,
          MoveTo: true,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: true,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
        },
        availableShareRights: {},
        title: "Archive",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2023-01-26T14:37:39.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2023-01-26T14:37:39.0000000+00:00",
        rootFolderType: 20,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      pathParts: [
        {
          id: 11244,
          title: "Archive",
          folderType: 20,
        },
      ],
      startIndex: 0,
      count: 1,
      total: 78,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 0,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 224866,
        rootFolderId: 224866,
        canShare: false,
        security: {
          Read: true,
          Create: true,
          Delete: false,
          EditRoom: false,
          Rename: false,
          CopyTo: false,
          Copy: false,
          MoveTo: true,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: false,
          Duplicate: false,
          Download: false,
          CopySharedLink: false,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: false,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
        },
        availableShareRights: {},
        title: "AI agents",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-10-29T16:24:48.0000000+00:00",
        createdBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-11-12T14:31:29.0000000+00:00",
        rootFolderType: 34,
        updatedBy: {
          id: "00000000-0000-0000-0000-0000000000",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1976880553",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1976880553",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1976880553",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1976880553",
          profileUrl: "",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      pathParts: [
        {
          id: 224866,
          title: "AI agents",
          folderType: 34,
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${ROOT_PATH}?filterType=2&count=1`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const rootHandler = () => {
  return new Response(JSON.stringify(successRoot));
};
