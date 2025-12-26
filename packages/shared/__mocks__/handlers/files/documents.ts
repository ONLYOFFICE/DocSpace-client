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

import { http } from "msw";
import { BASE_URL, API_PREFIX } from "../../e2e/utils";

export const PATH_MY_DOCUMENTS = "api/2.0/files/:id";
export const PATH_GET_FILE_INFO ="api/2.0/files/file/:id";

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

export const myDocumentsResolver = (): Response => {
  return new Response(JSON.stringify(myDocumentsFiles));
};

export const myDocumentsHandler = () => {
  return http.get(`http://localhost/${API_PREFIX}/${PATH_MY_DOCUMENTS}`, () => {
    return myDocumentsResolver();
  });
};


export const getFileInfoResolver = (): Response => {
  return new Response(JSON.stringify(fileInfo));
};

export const getFileInfoHandler = () => {
  return http.get(`http://localhost/${API_PREFIX}/${PATH_GET_FILE_INFO}`, () => {
    return getFileInfoResolver();
  });
};
