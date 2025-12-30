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

export const PATH_MY_DOCUMENTS = /.*\/api\/2\.0\/files\/\d+\?.*/;
export const PATH_GET_FILE_INFO = /.*\/api\/2\.0\/files\/file\/\d+$/;

const myDocumentsFiles = {
  response: {
    files: [
      {
        folderId: 7,
        version: 1,
        versionGroup: 1,
        contentLength: "7.54 KB",
        pureContentLength: 7726,
        fileStatus: 32,
        mute: false,
        viewUrl: `${BASE_URL}/filehandler.ashx?action=download&fileid=100`,
        webUrl: `${BASE_URL}/doceditor?fileid=100&version=1`,
        fileType: 7,
        fileExst: ".docx",
        comment: "Created",
        thumbnailStatus: 3,
        locked: false,
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
        lastOpened: "2025-12-11T13:01:52.0000000+03:00",
        fileEntryType: 2,
        id: 100,
        rootFolderId: 7,
        title: "Test document",
        security: {
          Read: true,
          Comment: true,
          FillForms: false,
          Review: true,
          Edit: true,
          Delete: true,
          CustomFilter: false,
          Rename: true,
          ReadHistory: true,
          Lock: true,
          EditHistory: true,
          Copy: true,
          Move: true,
          Duplicate: true,
          SubmitToFormGallery: false,
          Download: true,
          Convert: true,
          CreateRoomFrom: false,
          CopyLink: true,
          Embed: false,
          StartFilling: false,
          FillingStatus: false,
          ResetFilling: false,
          StopFilling: false,
        },
        updated: "2025-12-11T13:01:52.0000000+03:00",
        created: "2025-12-11T13:01:52.0000000+03:00",
        createdBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
          profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
          hasAvatar: false,
          isAnonim: false,
        },
        updatedBy: {
          id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
          displayName: "Administrator ",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
          profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
          hasAvatar: false,
          isAnonim: false,
        },
      },
    ],
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
      id: 100,
      rootFolderId: 12764,
      canShare: true,
      security: {
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
      title: "My documents",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2025-09-03T09:55:24.0000000+00:00",
      createdBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
      updated: "2025-09-03T09:55:24.0000000+00:00",
      rootFolderType: 5,
      updatedBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
      order: "",
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
    total: 1,
    new: 0,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/23187`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const fileInfo = {
  response: {
    folderId: 7,
    version: 1,
    versionGroup: 1,
    contentLength: "7.54 KB",
    pureContentLength: 7726,
    fileStatus: 32,
    mute: false,
    viewUrl: `${BASE_URL}/filehandler.ashx?action=download&fileid=100`,
    webUrl: `${BASE_URL}/doceditor?fileid=100&version=1`,
    fileType: 7,
    fileExst: ".docx",
    comment: "Created",
    thumbnailStatus: 3,
    locked: false,
    formFillingStatus: 0,
    isFavorite: true,
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
    lastOpened: "2025-12-11T13:01:52.0000000+03:00",
    fileEntryType: 2,
    id: 100,
    rootFolderId: 12764,
    title: "Test document",
    security: {
      Read: true,
      Comment: true,
      FillForms: false,
      Review: true,
      Edit: true,
      Delete: true,
      CustomFilter: false,
      Rename: true,
      ReadHistory: true,
      Lock: true,
      EditHistory: true,
      Copy: true,
      Move: true,
      Duplicate: true,
      SubmitToFormGallery: false,
      Download: true,
      Convert: true,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: false,
      StartFilling: false,
      FillingStatus: false,
      ResetFilling: false,
      StopFilling: false,
    },
    updated: "2025-12-11T13:01:52.0000000+03:00",
    created: "2025-12-11T13:01:52.0000000+03:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar:
        "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
      profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
      hasAvatar: false,
      isAnonim: false,
    },
    updatedBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar:
        "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
      profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
      hasAvatar: false,
      isAnonim: false,
    },
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/file/100`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const myDocumentsList = {
  response: {
    files: [
      {
        folderId: 14,
        version: 1,
        versionGroup: 1,
        contentLength: "1.41 MB",
        pureContentLength: 1474429,
        fileStatus: 2,
        mute: false,
        viewUrl:
          "http://localhost:8092/filehandler.ashx?action=download&fileid=23",
        webUrl: "http://localhost:8092/media/view/23",
        fileType: 2,
        fileExst: ".mp4",
        comment: "Uploaded",
        thumbnailStatus: 2,
        formFillingStatus: 0,
        viewAccessibility: {
          ImageView: false,
          MediaView: true,
          WebView: false,
          WebEdit: false,
          WebReview: false,
          WebCustomFilterEditing: false,
          WebRestrictedEditing: false,
          WebComment: false,
          CanConvert: false,
          MustConvert: false,
        },
        fileEntryType: 2,
        id: 23,
        rootFolderId: 14,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Comment: true,
          FillForms: false,
          Review: true,
          Edit: true,
          Delete: true,
          CustomFilter: true,
          Rename: true,
          ReadHistory: true,
          Lock: true,
          EditHistory: true,
          Copy: true,
          Move: true,
          Duplicate: true,
          SubmitToFormGallery: false,
          Download: true,
          Convert: true,
          CreateRoomFrom: true,
          CopyLink: true,
          Embed: false,
          StartFilling: false,
          FillingStatus: false,
          ResetFilling: false,
          StopFilling: false,
          OpenForm: true,
          Vectorization: false,
          AskAi: false,
        },
        availableShareRights: {
          User: ["ReadWrite", "Read", "Restrict", "None"],
          ExternalLink: ["Read", "None"],
          Group: ["ReadWrite", "Read", "Restrict", "None"],
          PrimaryExternalLink: ["Read", "None"],
        },
        title: "ONLYOFFICE Media Sample.mp4",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-25T14:44:41.0000000+03:00",
        createdBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-25T14:45:12.0000000+03:00",
        rootFolderType: 5,
        updatedBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      {
        folderId: 14,
        version: 1,
        versionGroup: 1,
        contentLength: "35.77 KB",
        pureContentLength: 36629,
        fileStatus: 2,
        mute: false,
        viewUrl:
          "http://localhost:8092/filehandler.ashx?action=download&fileid=24",
        webUrl: "http://localhost:8092/media/view/24",
        fileType: 4,
        fileExst: ".jpg",
        comment: "Uploaded",
        thumbnailUrl:
          "http://localhost:8092/filehandler.ashx?action=thumb&fileid=24&version=1&hash=859548744",
        thumbnailStatus: 1,
        formFillingStatus: 0,
        viewAccessibility: {
          ImageView: true,
          MediaView: false,
          WebView: false,
          WebEdit: false,
          WebReview: false,
          WebCustomFilterEditing: false,
          WebRestrictedEditing: false,
          WebComment: false,
          CanConvert: false,
          MustConvert: false,
        },
        fileEntryType: 2,
        dimensions: {
          height: 406,
          width: 500,
        },
        id: 24,
        rootFolderId: 14,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Comment: true,
          FillForms: false,
          Review: true,
          Edit: true,
          Delete: true,
          CustomFilter: true,
          Rename: true,
          ReadHistory: true,
          Lock: true,
          EditHistory: true,
          Copy: true,
          Move: true,
          Duplicate: true,
          SubmitToFormGallery: false,
          Download: true,
          Convert: true,
          CreateRoomFrom: true,
          CopyLink: true,
          Embed: false,
          StartFilling: false,
          FillingStatus: false,
          ResetFilling: false,
          StopFilling: false,
          OpenForm: true,
          Vectorization: false,
          AskAi: false,
        },
        availableShareRights: {
          User: ["ReadWrite", "Read", "Restrict", "None"],
          ExternalLink: ["Read", "None"],
          Group: ["ReadWrite", "Read", "Restrict", "None"],
          PrimaryExternalLink: ["Read", "None"],
        },
        title: "ONLYOFFICE Image Sample.jpg",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2021-04-02T17:29:55.0000000+03:00",
        createdBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-25T14:45:12.0000000+03:00",
        rootFolderType: 5,
        updatedBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      {
        folderId: 14,
        version: 1,
        versionGroup: 1,
        contentLength: "400.77 KB",
        pureContentLength: 410390,
        fileStatus: 2,
        mute: false,
        viewUrl:
          "http://localhost:8092/filehandler.ashx?action=download&fileid=10",
        webUrl: "http://localhost:8092/doceditor?fileid=10&version=1",
        fileType: 7,
        fileExst: ".docx",
        comment: "Created",
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
        id: 10,
        rootFolderId: 14,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Comment: true,
          FillForms: false,
          Review: true,
          Edit: true,
          Delete: true,
          CustomFilter: true,
          Rename: true,
          ReadHistory: true,
          Lock: true,
          EditHistory: true,
          Copy: true,
          Move: true,
          Duplicate: true,
          SubmitToFormGallery: false,
          Download: true,
          Convert: true,
          CreateRoomFrom: true,
          CopyLink: true,
          Embed: false,
          StartFilling: false,
          FillingStatus: false,
          ResetFilling: false,
          StopFilling: false,
          OpenForm: true,
          Vectorization: false,
          AskAi: true,
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
        title: "ONLYOFFICE Document Sample.docx",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-02T11:39:51.0000000+03:00",
        createdBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-25T13:49:18.0000000+03:00",
        rootFolderType: 5,
        updatedBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      {
        folderId: 14,
        version: 1,
        versionGroup: 1,
        contentLength: "85.31 KB",
        pureContentLength: 87354,
        fileStatus: 2,
        mute: false,
        viewUrl:
          "http://localhost:8092/filehandler.ashx?action=download&fileid=11",
        webUrl: "http://localhost:8092/doceditor?fileid=11&version=1",
        fileType: 6,
        fileExst: ".pptx",
        comment: "Created",
        thumbnailStatus: 0,
        formFillingStatus: 0,
        viewAccessibility: {
          ImageView: false,
          MediaView: false,
          WebView: true,
          WebEdit: true,
          WebReview: false,
          WebCustomFilterEditing: false,
          WebRestrictedEditing: false,
          WebComment: true,
          CanConvert: true,
          MustConvert: false,
        },
        fileEntryType: 2,
        id: 11,
        rootFolderId: 14,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Comment: true,
          FillForms: false,
          Review: true,
          Edit: true,
          Delete: true,
          CustomFilter: true,
          Rename: true,
          ReadHistory: true,
          Lock: true,
          EditHistory: true,
          Copy: true,
          Move: true,
          Duplicate: true,
          SubmitToFormGallery: false,
          Download: true,
          Convert: true,
          CreateRoomFrom: true,
          CopyLink: true,
          Embed: false,
          StartFilling: false,
          FillingStatus: false,
          ResetFilling: false,
          StopFilling: false,
          OpenForm: true,
          Vectorization: false,
          AskAi: true,
        },
        availableShareRights: {
          User: ["ReadWrite", "Editing", "Comment", "Read", "Restrict", "None"],
          ExternalLink: ["Editing", "Comment", "Read", "None"],
          Group: [
            "ReadWrite",
            "Editing",
            "Comment",
            "Read",
            "Restrict",
            "None",
          ],
          PrimaryExternalLink: ["Editing", "Comment", "Read", "None"],
        },
        title: "ONLYOFFICE Presentation Sample.pptx",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-02T11:39:52.0000000+03:00",
        createdBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-25T13:49:18.0000000+03:00",
        rootFolderType: 5,
        updatedBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      {
        folderId: 14,
        version: 1,
        versionGroup: 1,
        contentLength: "1.27 MB",
        pureContentLength: 1329569,
        fileStatus: 2,
        mute: false,
        viewUrl:
          "http://localhost:8092/filehandler.ashx?action=download&fileid=12",
        webUrl: "http://localhost:8092/doceditor?fileid=12&version=1",
        fileType: 10,
        fileExst: ".pdf",
        comment: "Created",
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
        id: 12,
        rootFolderId: 14,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Comment: true,
          FillForms: true,
          Review: true,
          Edit: true,
          Delete: true,
          CustomFilter: true,
          Rename: true,
          ReadHistory: true,
          Lock: true,
          EditHistory: true,
          Copy: true,
          Move: true,
          Duplicate: true,
          SubmitToFormGallery: true,
          Download: true,
          Convert: true,
          CreateRoomFrom: true,
          CopyLink: true,
          Embed: false,
          StartFilling: false,
          FillingStatus: false,
          ResetFilling: false,
          StopFilling: false,
          OpenForm: true,
          Vectorization: false,
          AskAi: true,
        },
        availableShareRights: {
          User: ["ReadWrite", "Editing", "FillForms", "Restrict", "None"],
          ExternalLink: ["Editing", "FillForms", "None"],
          Group: ["ReadWrite", "Editing", "FillForms", "Restrict", "None"],
          PrimaryExternalLink: ["Editing", "FillForms", "None"],
        },
        title: "ONLYOFFICE Resume Sample.pdf",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-02T11:39:52.0000000+03:00",
        createdBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-25T13:49:18.0000000+03:00",
        rootFolderType: 5,
        updatedBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
      },
      {
        folderId: 14,
        version: 1,
        versionGroup: 1,
        contentLength: "75.02 KB",
        pureContentLength: 76825,
        fileStatus: 2,
        mute: false,
        viewUrl:
          "http://localhost:8092/filehandler.ashx?action=download&fileid=13",
        webUrl: "http://localhost:8092/doceditor?fileid=13&version=1",
        fileType: 5,
        fileExst: ".xlsx",
        comment: "Created",
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
        id: 13,
        rootFolderId: 14,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Comment: true,
          FillForms: false,
          Review: true,
          Edit: true,
          Delete: true,
          CustomFilter: true,
          Rename: true,
          ReadHistory: true,
          Lock: true,
          EditHistory: true,
          Copy: true,
          Move: true,
          Duplicate: true,
          SubmitToFormGallery: false,
          Download: true,
          Convert: true,
          CreateRoomFrom: true,
          CopyLink: true,
          Embed: false,
          StartFilling: false,
          FillingStatus: false,
          ResetFilling: false,
          StopFilling: false,
          OpenForm: true,
          Vectorization: false,
          AskAi: true,
        },
        availableShareRights: {
          User: ["ReadWrite", "Editing", "Comment", "Read", "Restrict", "None"],
          ExternalLink: ["Editing", "Comment", "Read", "None"],
          Group: [
            "ReadWrite",
            "Editing",
            "Comment",
            "Read",
            "Restrict",
            "None",
          ],
          PrimaryExternalLink: ["Editing", "Comment", "Read", "None"],
        },
        title: "ONLYOFFICE Spreadsheet Sample.xlsx",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-02T11:39:52.0000000+03:00",
        createdBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-25T13:49:18.0000000+03:00",
        rootFolderType: 5,
        updatedBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
      },
    ],
    folders: [
      {
        parentId: 14,
        filesCount: 0,
        foldersCount: 0,
        new: 1,
        mute: false,
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        fileEntryType: 1,
        id: 35,
        rootFolderId: 14,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
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
          Pin: false,
          Mute: false,
          EditAccess: true,
          Duplicate: true,
          Download: true,
          CopySharedLink: true,
          Reconnect: false,
          CreateRoomFrom: true,
          CopyLink: true,
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
        title: "New folder",
        access: 0,
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-12-25T13:49:22.0000000+03:00",
        createdBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-12-25T13:49:22.0000000+03:00",
        rootFolderType: 5,
        updatedBy: {
          id: "fe51dbe8-4ce1-4f4c-b6d1-6bb801e835d6",
          displayName: "roomadmin roomadmin",
          avatar:
            "/static/images/default_user_photo_size_82-82.png?hash=1369717502",
          avatarOriginal:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMax:
            "/static/images/default_user_photo_size_200-200.png?hash=1369717502",
          avatarMedium:
            "/static/images/default_user_photo_size_48-48.png?hash=1369717502",
          avatarSmall:
            "/static/images/default_user_photo_size_32-32.png?hash=1369717502",
          profileUrl:
            "http://localhost:8092/accounts/people/filter?search=roomadmin%40test.test",
          hasAvatar: false,
          isAnonim: false,
        },
      },
    ],
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
      id: 100,
      rootFolderId: 12764,
      canShare: true,
      security: {
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
      title: "My documents",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2025-09-03T09:55:24.0000000+00:00",
      createdBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
      updated: "2025-09-03T09:55:24.0000000+00:00",
      rootFolderType: 5,
      updatedBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=1168361071",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=1168361071",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=1168361071",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=1168361071",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
      order: "",
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
    total: 1,
    new: 0,
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/23187`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const myDocumentsHandler = (isList?: boolean) => {
  if (isList) {
    return new Response(JSON.stringify(myDocumentsList));
  }

  return new Response(JSON.stringify(myDocumentsFiles));
};

export const getFileInfoHandler = () => {
  return new Response(JSON.stringify(fileInfo));
};
