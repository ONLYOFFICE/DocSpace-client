/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import type { TGetRootFolder } from "../../../../api/files/types";

const getFoldersTree = (): TGetRootFolder[] => {
  return [
    {
      files: [],
      folders: [
        {
          parentId: 5,
          filesCount: 0,
          foldersCount: 0,
          new: 0,
          mute: false,
          pinned: false,
          private: false,
          indexing: false,
          denyDownload: false,
          fileEntryType: 1,
          id: 12,
          rootFolderId: 5,
          canShare: false,
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
            Pin: false,
            Mute: false,
            EditAccess: false,
            Duplicate: true,
            Download: true,
            CopySharedLink: true,
            Reconnect: false,
            CreateRoomFrom: true,
            CopyLink: true,
            Embed: false,
            ChangeOwner: false,
            IndexExport: false,
          },
          title: "New folder",
          access: 0,
          shared: false,
          created: "2025-01-23T14:30:52.0000000+01:00",
          createdBy: {
            id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
          updated: "2025-01-23T14:30:52.0000000+01:00",
          rootFolderType: 5,
          updatedBy: {
            id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
      ],
      current: {
        parentId: 0,
        filesCount: 4,
        foldersCount: 2,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 5,
        rootFolderId: 5,
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
        },
        title: "Documents",
        access: 0,
        shared: false,
        created: "2025-01-20T12:23:49.0000000+01:00",
        createdBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
        updated: "2025-01-20T12:23:51.0000000+01:00",
        rootFolderType: 5,
        updatedBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
          id: 5,
          title: "Documents",
        },
      ],
      startIndex: 0,
      count: 1,
      total: 2,
      new: 0,
    },
    {
      files: [],
      folders: [],
      current: {
        parentId: 0,
        filesCount: 1,
        foldersCount: 0,
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
        },
        title: "Trash",
        access: 0,
        shared: false,
        created: "2025-01-19T17:32:52.0000000+01:00",
        createdBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
        updated: "2025-01-19T17:32:52.0000000+01:00",
        rootFolderType: 3,
        updatedBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
          id: 4,
          title: "Trash",
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
    {
      files: [],
      folders: [
        {
          parentId: 1,
          filesCount: 5,
          foldersCount: 2,
          new: 0,
          mute: false,
          tags: [],
          logo: {
            original: "",
            large: "",
            medium: "",
            small: "",
            color: "FF7FD4",
          },
          pinned: false,
          roomType: 6,
          private: false,
          indexing: false,
          denyDownload: false,
          inRoom: true,
          usedSpace: 2799744,
          fileEntryType: 1,
          id: 6,
          rootFolderId: 1,
          canShare: true,
          security: {
            Read: true,
            Create: true,
            Delete: false,
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
          },
          title: "public",
          access: 0,
          shared: true,
          created: "2025-01-20T16:33:06.0000000+01:00",
          createdBy: {
            id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
          updated: "2025-01-27T13:15:04.0000000+01:00",
          rootFolderType: 14,
          updatedBy: {
            id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
      ],
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
        },
        title: "Rooms",
        access: 0,
        shared: false,
        created: "2025-01-19T17:32:51.0000000+01:00",
        createdBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
        updated: "2025-01-27T13:15:04.0000000+01:00",
        rootFolderType: 14,
        parentRoomType: 14,
        updatedBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
          id: 1,
          title: "Rooms",
        },
      ],
      startIndex: 0,
      count: 1,
      total: 6,
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
        id: 3,
        rootFolderId: 3,
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
        },
        title: "Archive",
        access: 0,
        shared: false,
        created: "2025-01-19T17:32:52.0000000+01:00",
        createdBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
        updated: "2025-01-19T17:32:52.0000000+01:00",
        rootFolderType: 20,
        updatedBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
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
          id: 3,
          title: "Archive",
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
  ];
};

export const foldersTreeHandler = (): Response => {
  return new Response(JSON.stringify({ response: getFoldersTree() }));
};
