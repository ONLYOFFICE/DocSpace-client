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

import { TGetFolder } from "../api/files/types";
import {
  files as mockFiles,
  folders as mockFolders,
} from "./e2e/handlers/files/folder";

const getRecentMockFiles = () => {
  return mockFiles.map((f) => ({
    ...f,
    originRoomTitle: "public",
    originId: 9,
    lastOpened: f.updated,
  }));
};

const getRecentMockFolders = () => {
  return mockFolders.map((f) => ({
    ...f,
    lastOpened: f.updated,
  }));
};

export const mockRecentTreeFolder = {
  files: getRecentMockFiles(),
  folders: getRecentMockFolders(),
  current: {
    parentId: 0,
    filesCount: 13,
    foldersCount: 0,
    new: 0,
    mute: false,
    pinned: false,
    private: false,
    indexing: false,
    denyDownload: false,
    fileEntryType: 1,
    id: 268,
    rootFolderId: 268,
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
    title: "Recent",
    access: 0,
    shared: false,
    created: "2025-07-08T17:55:49.0000000+02:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_82-82.png?hash=170986346",
      avatarOriginal:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_orig_648-648.png?hash=170986346",
      avatarMax:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_200-200.png?hash=170986346",
      avatarMedium:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_48-48.png?hash=170986346",
      avatarSmall:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_32-32.png?hash=170986346",
      profileUrl:
        "http://192.168.178.23/accounts/people/filter?search=sanyalu97%40gmail.com",
      hasAvatar: true,
      isAnonim: false,
    },
    updated: "2025-07-11T14:23:23.0000000+02:00",
    rootFolderType: 11,
    updatedBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_82-82.png?hash=170986346",
      avatarOriginal:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_orig_648-648.png?hash=170986346",
      avatarMax:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_200-200.png?hash=170986346",
      avatarMedium:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_48-48.png?hash=170986346",
      avatarSmall:
        "/storage/userPhotos/root/66faa6e4-f133-11ea-b126-00ffeec8b4ef_size_32-32.png?hash=170986346",
      profileUrl:
        "http://192.168.178.23/accounts/people/filter?search=sanyalu97%40gmail.com",
      hasAvatar: true,
      isAnonim: false,
    },
  },
  pathParts: [
    {
      id: 6,
      title: "Recent",
    },
  ],
  startIndex: 0,
  count: 1,
  total: 1,
  new: 0,
} as TGetFolder;
