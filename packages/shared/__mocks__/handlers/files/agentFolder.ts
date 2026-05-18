/*
 * (c) Copyright Ascensio System SIA 2009-2026
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

import { http } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import { VectorizationStatus } from "../../../enums";

export const PATH_AGENT_FOLDER_CHAT = "files/:id(\\d+)";

export const PATH_AGENT_FOLDER_RESULT_STORAGE = "files/:id(\\d+)";

export const PATH_AGENT_FOLDER_KNOWLEDGE = "files/:id(\\d+)";

export const PATH_AGENT_FOLDER_INFO = "files/folder/:id(\\d+)";

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

const getFolderInfo = ({
  canUseChat,
  thinkingSupported = false,
}: {
  canUseChat: boolean;
  thinkingSupported?: boolean;
}) => {
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
      modelId: "GPT-5.1",
      prompt: "",
      multimodal: { image: { formats: [".png", ".jpg", ".jpeg", ".gif", ".webp"] } },
      capabilities: {
        vision: false,
        toolCalling: true,
        thinking: thinkingSupported,
      },
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

const getAgentFolderChat = ({
  canUseChat,
  thinkingSupported = false,
}: {
  canUseChat: boolean;
  thinkingSupported?: boolean;
}) => {
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
    current: getFolderInfo({ canUseChat, thinkingSupported }),
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

const getMockFiles = (
  vectorizationStatus: VectorizationStatus = VectorizationStatus.Completed,
  canRetryVectorization: boolean = true,
) => {
  const security = {
    Read: true,
    Comment: false,
    FillForms: false,
    Review: false,
    Edit: false,
    Delete: true,
    CustomFilter: false,
    Rename: false,
    ReadHistory: false,
    Lock: false,
    EditHistory: false,
    Copy: true,
    Move: false,
    Duplicate: false,
    SubmitToFormGallery: false,
    Download: true,
    Convert: false,
    CreateRoomFrom: false,
    CopyLink: false,
    Embed: false,
    StartFilling: false,
    FillingStatus: false,
    ResetFilling: false,
    StopFilling: false,
    OpenForm: false,
    Vectorization: canRetryVectorization,
    AskAi: true,
  };

  return [
    {
      folderId: 3,
      version: 1,
      versionGroup: 1,
      contentLength: "75.02 KB",
      pureContentLength: 76825,
      fileStatus: 0,
      mute: false,
      viewUrl: "",
      webUrl: "",
      fileType: 5,
      fileExst: ".xlsx",
      comment: "Copied",
      thumbnailStatus: 0,
      formFillingStatus: 0,
      viewAccessibility: {
        ImageView: false,
        MediaView: false,
        WebView: true,
        WebEdit: true,
        WebReview: false,
        WebCustomFilterEditing: true,
        WebRestrictedEditing: false,
        WebComment: true,
        CanConvert: true,
        MustConvert: false,
      },
      fileEntryType: 2,
      vectorizationStatus,
      id: 6,
      rootFolderId: 1,
      canShare: false,
      security,
      availableShareRights: {
        ExternalLink: ["Editing", "Comment", "Read", "None"],
        PrimaryExternalLink: ["Editing", "Comment", "Read", "None"],
      },
      title: "Test spreadsheet.xlsx",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2026-01-20T11:38:09.0000000+01:00",
      createdBy: createdUpdatedByMock,
      updated: "2026-01-20T11:38:09.0000000+01:00",
      rootFolderType: 34,
      updatedBy: createdUpdatedByMock,
    },
    {
      folderId: 3,
      version: 1,
      versionGroup: 1,
      contentLength: "400.77 KB",
      pureContentLength: 410390,
      fileStatus: 0,
      mute: false,
      viewUrl: "",
      webUrl: "",
      fileType: 7,
      fileExst: ".docx",
      comment: "Copied",
      thumbnailStatus: 0,
      formFillingStatus: 0,
      viewAccessibility: {
        ImageView: false,
        MediaView: false,
        WebView: true,
        WebEdit: true,
        WebReview: true,
        WebCustomFilterEditing: false,
        WebRestrictedEditing: false,
        WebComment: true,
        CanConvert: true,
        MustConvert: false,
      },
      fileEntryType: 2,
      vectorizationStatus,
      id: 7,
      rootFolderId: 1,
      canShare: false,
      security,
      availableShareRights: {
        ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      },
      title: "Test document.docx",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2026-01-20T11:38:09.0000000+01:00",
      createdBy: createdUpdatedByMock,
      updated: "2026-01-20T11:38:09.0000000+01:00",
      rootFolderType: 34,
      updatedBy: createdUpdatedByMock,
    },
    {
      folderId: 3,
      version: 1,
      versionGroup: 1,
      contentLength: "1.27 MB",
      pureContentLength: 1329569,
      fileStatus: 0,
      mute: false,
      viewUrl: "",
      webUrl: "",
      fileType: 10,
      fileExst: ".pdf",
      comment: "Copied",
      thumbnailStatus: 0,
      hasDraft: false,
      formFillingStatus: 0,
      isForm: true,
      viewAccessibility: {
        ImageView: false,
        MediaView: false,
        WebView: false,
        WebEdit: true,
        WebReview: false,
        WebCustomFilterEditing: false,
        WebRestrictedEditing: true,
        WebComment: true,
        CanConvert: true,
        MustConvert: false,
      },
      fileEntryType: 2,
      vectorizationStatus,
      id: 5,
      rootFolderId: 1,
      canShare: false,
      security,
      availableShareRights: {
        ExternalLink: ["Editing", "FillForms", "None"],
        PrimaryExternalLink: ["Editing", "FillForms", "None"],
      },
      title: "Test form.pdf",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2026-01-20T11:38:07.0000000+01:00",
      createdBy: createdUpdatedByMock,
      updated: "2026-01-20T11:38:07.0000000+01:00",
      rootFolderType: 34,
      updatedBy: createdUpdatedByMock,
    },
  ];
};

const getAgentFolderKnowledge = (
  options: {
    isEmpty?: boolean;
    canUploadFiles?: boolean;
    vectorizationStatus?: VectorizationStatus;
    canRetryVectorization?: boolean;
  } = {},
) => {
  const {
    isEmpty = false,
    canUploadFiles = true,
    vectorizationStatus = VectorizationStatus.Completed,
    canRetryVectorization = true,
  } = options;

  const files = isEmpty
    ? []
    : getMockFiles(vectorizationStatus, canRetryVectorization);

  return {
    files,
    folders: [],
    current: {
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
      id: 3,
      rootFolderId: 1,
      canShare: false,
      security: {
        Read: true,
        Create: canUploadFiles,
        Delete: false,
        EditRoom: false,
        Rename: false,
        CopyTo: canUploadFiles,
        Copy: false,
        MoveTo: canUploadFiles,
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
      created: "2026-01-19T16:55:10.0000000+01:00",
      createdBy: createdUpdatedByMock,
      updated: "2026-01-19T16:55:10.0000000+01:00",
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
        id: 3,
        title: "Knowledge",
        folderType: 32,
      },
    ],
    startIndex: 0,
    count: 0,
    total: 0,
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
  const files = isEmpty ? [] : getMockFiles();

  return {
    files: files,
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

const successFolderChatWithThinking = {
  response: getAgentFolderChat({ canUseChat: true, thinkingSupported: true }),
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

const successFolderKnowledgeVectorizationDisabled = {
  response: getAgentFolderKnowledge({ canUploadFiles: false }),
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

const successFolderKnowledgeEmpty = {
  response: getAgentFolderKnowledge({ isEmpty: true }),
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

const successFolderKnowledgeVectorizationCompleted = {
  response: getAgentFolderKnowledge(),
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

const successFolderKnowledgeVectorizationInProgress = {
  response: getAgentFolderKnowledge({
    vectorizationStatus: VectorizationStatus.InProgress,
  }),
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

const successFolderKnowledgeVectorizationFailed = {
  response: getAgentFolderKnowledge({
    vectorizationStatus: VectorizationStatus.Failed,
  }),
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

const successFolderKnowledgeVectorizationFailedNoRetry = {
  response: getAgentFolderKnowledge({
    vectorizationStatus: VectorizationStatus.Failed,
    canRetryVectorization: false,
  }),
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
  response: getAgentFolderResultStorage({ canUseChat: true, isEmpty: false }),
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

const successFolderResultStorageEmpty = {
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

export const agentFolderChatResolver = (
  type: "default" | "canNotUseChat" | "withThinking" = "default",
) => {
  switch (type) {
    case "canNotUseChat":
      return new Response(JSON.stringify(successFolderChatCanNotUseChat));
    case "withThinking":
      return new Response(JSON.stringify(successFolderChatWithThinking));
    case "default":
      return new Response(JSON.stringify(successFolderChatDefault));
  }
};

export const agentFolderResultStorageResolver = (
  type: "default" | "empty" | "canNotUseChat" = "default",
) => {
  switch (type) {
    case "canNotUseChat":
      return new Response(
        JSON.stringify(successFolderResultStorageCanNotUseChat),
      );
    case "empty":
      return new Response(JSON.stringify(successFolderResultStorageEmpty));
    case "default":
      return new Response(JSON.stringify(successFolderResultStorageDefault));
  }
};

export const agentFolderKnowledgeResolver = (
  type:
    | "default"
    | "empty"
    | "vectorizationDisabled"
    | "vectorizationFailed"
    | "vectorizationFailedNoRetry"
    | "vectorizationInProgress",
) => {
  switch (type) {
    case "vectorizationDisabled":
      return new Response(
        JSON.stringify(successFolderKnowledgeVectorizationDisabled),
      );
    case "vectorizationFailed":
      return new Response(
        JSON.stringify(successFolderKnowledgeVectorizationFailed),
      );

    case "vectorizationFailedNoRetry":
      return new Response(
        JSON.stringify(successFolderKnowledgeVectorizationFailedNoRetry),
      );
    case "vectorizationInProgress":
      return new Response(
        JSON.stringify(successFolderKnowledgeVectorizationInProgress),
      );
    case "empty":
      return new Response(JSON.stringify(successFolderKnowledgeEmpty));
    case "default":
      return new Response(
        JSON.stringify(successFolderKnowledgeVectorizationCompleted),
      );
  }
};

export const agentFolderInfoResolver = (
  type: "default" | "canNotUseChat" = "default",
) => {
  switch (type) {
    case "canNotUseChat":
      return new Response(JSON.stringify(successFolderInfoCanNotUseChat));
    case "default":
      return new Response(JSON.stringify(successFolderInfoDefault));
  }
};

export const agentFolderChatHandler = (
  port: string,
  type: "default" | "canNotUseChat" | "withThinking" = "default",
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AGENT_FOLDER_CHAT}`,
    ({ request, params }) => {
      // Handle requests for agent folder (id=2) - this is the mock agent folder ID used in tests
      const url = new URL(request.url);
      const searchArea = url.searchParams.get("searchArea");

      const folderId = params.id;
      if (folderId === "2" && searchArea !== "6" && searchArea !== "5") {
        return agentFolderChatResolver(type);
      }
      // Pass through to other handlers for non-agent folders
      return;
    },
  );
};

export const agentFolderResultStorageHandler = (
  port: string,
  type: "default" | "canNotUseChat" | "empty" = "default",
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AGENT_FOLDER_RESULT_STORAGE}`,
    ({ request }) => {
      // Only handle requests with searchArea=6 (Result Storage) to avoid intercepting other folder requests
      const url = new URL(request.url);
      const searchArea = url.searchParams.get("searchArea");
      if (searchArea !== "6") {
        return;
      }
      return agentFolderResultStorageResolver(type);
    },
  );
};

export const agentFolderKnowledgeHandler = (
  port: string,
  type:
    | "default"
    | "empty"
    | "vectorizationDisabled"
    | "vectorizationFailed"
    | "vectorizationFailedNoRetry"
    | "vectorizationInProgress" = "default",
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AGENT_FOLDER_KNOWLEDGE}`,
    ({ request }) => {
      // Only handle requests with searchArea=5 (Knowledge) to avoid intercepting other folder requests
      const url = new URL(request.url);
      const searchArea = url.searchParams.get("searchArea");

      if (searchArea !== "5") {
        return;
      }

      return agentFolderKnowledgeResolver(type);
    },
  );
};

export const agentFolderInfoHandler = (
  port: string,
  type: "default" | "canNotUseChat" = "default",
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AGENT_FOLDER_INFO}`,
    () => {
      return agentFolderInfoResolver(type);
    },
  );
};
