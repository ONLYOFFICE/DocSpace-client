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

import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH_AGENT_FOLDER_CHAT =
  /\/api\/2\.0\/files\/\d+\?(?!.*(?:^|&)searchArea=(5|6)(?:&|$)).*/;

export const PATH_AGENT_FOLDER_RESULT_STORAGE =
  /\/api\/2\.0\/files\/\d+\?.*(?:^|&)searchArea=6(?:&|$).*/;

export const PATH_AGENT_FOLDER_INFO = /\/api\/2\.0\/files\/folder\/\d+$/;

const createdUpdatedByMock = {
  id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  displayName: "Administrator ",
  avatar: "/static/images/default_user_photo_size_82-82.png?hash=1340933600",
  avatarOriginal:
    "/static/images/default_user_photo_size_200-200.png?hash=1340933600",
  avatarMax:
    "/static/images/default_user_photo_size_200-200.png?hash=1340933600",
  avatarMedium:
    "/static/images/default_user_photo_size_48-48.png?hash=1340933600",
  avatarSmall:
    "/static/images/default_user_photo_size_32-32.png?hash=1340933600",
  profileUrl: "",
  hasAvatar: false,
  isAnonim: false,
};

const getFolderInfo = ({ canUseChat }: { canUseChat: boolean }) => {
  return {
    parentId: 224866,
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
      color: "F2D230",
    },
    pinned: false,
    roomType: 9,
    private: false,
    indexing: false,
    denyDownload: false,
    inRoom: true,
    usedSpace: 29838,
    fileEntryType: 1,
    chatSettings: {
      providerId: 1,
      modelId: "gpt-5.1-2025-11-13",
      prompt: "",
    },
    id: 2,
    rootFolderId: 224866,
    canShare: true,
    security: {
      Read: true,
      Create: false,
      Delete: true,
      EditRoom: true,
      Rename: true,
      CopyTo: false,
      Copy: false,
      MoveTo: false,
      Move: false,
      Pin: true,
      Mute: true,
      EditAccess: true,
      Duplicate: false,
      Download: true,
      CopySharedLink: true,
      Reconnect: false,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: false,
      ChangeOwner: true,
      IndexExport: false,
      UseChat: canUseChat,
    },
    availableShareRights: {
      ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
    },
    title: "Test agent",
    access: 0,
    shared: false,
    sharedForUser: true,
    parentShared: false,
    shortWebUrl: "",
    created: "2025-12-18T16:53:32.0000000+01:00",
    createdBy: createdUpdatedByMock,
    updated: "2025-12-22T16:24:35.0000000+01:00",
    rootFolderType: 34,
    updatedBy: createdUpdatedByMock,
  };
};

const getAgentFolderChat = ({ canUseChat }: { canUseChat: boolean }) => {
  return {
    files: [],
    folders: [
      {
        parentId: 2,
        filesCount: 0,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        type: 32,
        fileEntryType: 1,
        id: 10,
        rootFolderId: 1,
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
        availableShareRights: {
          ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
          PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        },
        title: "Knowledge",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-18T16:53:34.0000000+01:00",
        createdBy: createdUpdatedByMock,
        updated: "2025-12-22T16:24:35.0000000+01:00",
        rootFolderType: 34,
        updatedBy: createdUpdatedByMock,
      },
      {
        parentId: 2,
        filesCount: 0,
        foldersCount: 0,
        new: 0,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        type: 33,
        fileEntryType: 1,
        id: 11,
        rootFolderId: 1,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Create: true,
          Delete: false,
          EditRoom: true,
          Rename: false,
          CopyTo: true,
          Copy: false,
          MoveTo: true,
          Move: false,
          Pin: false,
          Mute: false,
          EditAccess: true,
          Duplicate: false,
          Download: true,
          CopySharedLink: true,
          Reconnect: false,
          CreateRoomFrom: false,
          CopyLink: true,
          Embed: false,
          ChangeOwner: false,
          IndexExport: false,
          UseChat: false,
        },
        availableShareRights: {
          ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
          PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        },
        title: "Result Storage",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-18T16:53:34.0000000+01:00",
        createdBy: createdUpdatedByMock,
        updated: "2025-12-18T16:53:34.0000000+01:00",
        rootFolderType: 34,
        updatedBy: createdUpdatedByMock,
      },
    ],
    current: getFolderInfo({ canUseChat }),
    pathParts: [
      {
        id: 224866,
        title: "AI agents",
        folderType: 34,
      },
      {
        id: 2,
        title: "Test agent",
        roomType: 9,
        folderType: 31,
      },
    ],
    startIndex: 0,
    count: 2,
    total: 2,
    new: 0,
  };
};

const getAgentFolderResultStorage = ({
  canUseChat,
  isEmpty,
}: {
  canUseChat: boolean;
  isEmpty: boolean;
}) => {
  return {
    files: [],
    folders: [],
    current: {
      parentId: 2,
      filesCount: 0,
      foldersCount: 0,
      isShareable: true,
      new: 0,
      mute: false,
      pinned: false,
      private: false,
      indexing: false,
      denyDownload: false,
      type: 33,
      fileEntryType: 1,
      id: 4,
      rootFolderId: 1,
      canShare: true,
      shareSettings: {
        ExternalLink: 6,
      },
      security: {
        Read: true,
        Create: true,
        Delete: false,
        EditRoom: true,
        Rename: false,
        CopyTo: true,
        Copy: false,
        MoveTo: true,
        Move: false,
        Pin: false,
        Mute: false,
        EditAccess: true,
        Duplicate: false,
        Download: true,
        CopySharedLink: true,
        Reconnect: false,
        CreateRoomFrom: false,
        CopyLink: true,
        Embed: false,
        ChangeOwner: false,
        IndexExport: false,
        UseChat: canUseChat,
      },
      availableShareRights: {
        ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      },
      title: "Result Storage",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2025-12-24T16:49:49.0000000+01:00",
      createdBy: createdUpdatedByMock,
      updated: "2025-12-24T16:49:49.0000000+01:00",
      rootFolderType: 34,
      updatedBy: createdUpdatedByMock,
    },
    pathParts: [
      {
        id: 224866,
        title: "AI agents",
        folderType: 34,
      },
      {
        id: 2,
        title: "Test agent",
        roomType: 9,
        folderType: 31,
      },
      {
        id: 4,
        title: "Result Storage",
        folderType: 33,
      },
    ],
    startIndex: 0,
    count: 0,
    total: 0,
    new: 0,
  };
};

const successFolderChatDefault = {
  response: getAgentFolderChat({ canUseChat: true }),
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/2?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successFolderChatCanNotUseChat = {
  response: getAgentFolderChat({ canUseChat: false }),
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/2?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successFolderResultStorageDefault = {
  response: getAgentFolderResultStorage({ canUseChat: true, isEmpty: true }),
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/2?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successFolderResultStorageCanNotUseChat = {
  response: getAgentFolderResultStorage({ canUseChat: false, isEmpty: true }),
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/2?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successFolderInfoDefault = {
  response: getFolderInfo({ canUseChat: true }),
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/2`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const successFolderInfoCanNotUseChat = {
  response: getFolderInfo({ canUseChat: false }),
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/2`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const agentFolderChatHandler = (
  type: "default" | "canNotUseChat" = "default",
) => {
  switch (type) {
    case "canNotUseChat":
      return new Response(JSON.stringify(successFolderChatCanNotUseChat));
    case "default":
      return new Response(JSON.stringify(successFolderChatDefault));
  }
};

export const agentFolderResultStorageHandler = (
  type: "default" | "canNotUseChat" = "default",
) => {
  switch (type) {
    case "canNotUseChat":
      return new Response(
        JSON.stringify(successFolderResultStorageCanNotUseChat),
      );
    case "default":
      return new Response(JSON.stringify(successFolderResultStorageDefault));
  }
};

export const agentFolderInfoHandler = (
  type: "default" | "canNotUseChat" = "default",
) => {
  switch (type) {
    case "canNotUseChat":
      return new Response(JSON.stringify(successFolderInfoCanNotUseChat));
    case "default":
      return new Response(JSON.stringify(successFolderInfoDefault));
  }
};
