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
import type { TGetRootFolder } from "../../../api/files/types";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH = "files/@root";

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
        id: 2,
        rootFolderId: 2,
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
          id: 2,
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
        id: 6,
        rootFolderId: 6,
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
        availableShareRights: {},
        title: "AI agents",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        created: "2025-10-30T13:04:11.0000000+05:00",
        createdBy: {
          id: "487b33be-9a9c-4270-a61f-d23d2e4f22e4",
          displayName: "asdasd asdadsads",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1927501797",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1927501797",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1927501797",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1927501797",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1927501797",
          profileUrl: `${BASE_URL}/accounts/people/filter?search=test@gmail.com`,

          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-10T14:13:36.0000000+05:00",
        rootFolderType: 34,
        updatedBy: {
          id: "487b33be-9a9c-4270-a61f-d23d2e4f22e4",
          displayName: "asdasd asdadsads",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1927501797",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1927501797",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1927501797",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1927501797",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1927501797",
          profileUrl: `${BASE_URL}/accounts/people/filter?search=test@gmail.com`,
          hasAvatar: false,
          isAnonim: false,
        },
      },
      pathParts: [
        {
          id: 6,
          title: "AI agents",
          folderType: 34,
        },
      ],
      startIndex: 0,
      count: 0,
      total: 0,
      new: 0,
    },
  ];
};

export const foldersTreeResolver = () => {
  return new Response(JSON.stringify({ response: getFoldersTree() }));
};

export const foldersTreeHandler = (port: string) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl =
      typeof window !== "undefined" ? window.location.origin : `${BASE_URL}`;
  }

  return http.get(`${baseUrl}/${API_PREFIX}/${PATH}`, () => {
    return foldersTreeResolver();
  });
};
