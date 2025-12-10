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

type ResponseType = "delete" | "success" | "empty";

export const PATH_FAVORITES = /.*\/api\/2\.0\/files\/\d+\?.*/;
export const PATH_DELETE_FAVORITES = /.*\/api\/2\.0\/files\/favorites$/;
export const PATH_GET_FILE = /.*\/api\/2\.0\/files\/file\/\d+$/;

const file = [
  {
    folderId: 7,
    version: 1,
    versionGroup: 1,
    contentLength: "7.54 KB",
    pureContentLength: 7726,
    fileStatus: 32,
    mute: false,
    viewUrl: `${BASE_URL}/filehandler.ashx?action=download&fileid=1`,
    webUrl: `${BASE_URL}/doceditor?fileid=1&version=1`,
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
    lastOpened: "2025-12-10T13:01:52.0000000+03:00",
    fileEntryType: 2,
    id: 1,
    rootFolderId: 7,
    originId: 7,
    originRoomId: 7,
    originTitle: "My documents",
    originRoomTitle: "My documents",
    canShare: false,
    shareSettings: {
      ExternalLink: 6,
    },
    security: {
      Read: true,
      Comment: true,
      FillForms: false,
      Review: true,
      Edit: false,
      Delete: false,
      CustomFilter: false,
      Rename: false,
      ReadHistory: true,
      Lock: false,
      EditHistory: true,
      Copy: true,
      Move: true,
      Duplicate: false,
      SubmitToFormGallery: false,
      Download: true,
      Convert: true,
      CreateRoomFrom: false,
      CopyLink: false,
      Embed: false,
      StartFilling: false,
      FillingStatus: false,
      ResetFilling: false,
      StopFilling: false,
      OpenForm: true,
      Vectorization: false,
      AskAi: true,
      CopySharedLink: false,
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
    title: "New document.docx",
    access: 0,
    shared: false,
    sharedForUser: false,
    parentShared: false,
    shortWebUrl: "",
    created: "2025-12-10T13:00:53.0000000+03:00",
    createdBy: {
      id: "0000000000-0000-000000-000000000",
      displayName: "Admin Admin",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=261361478",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=261361478",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=261361478",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=261361478",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=261361478",
      profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
      hasAvatar: true,
      isAnonim: false,
    },
    updated: "2025-12-10T13:00:53.0000000+03:00",
    rootFolderType: 5,
    updatedBy: {
      id: "0000000000-0000-000000-000000000",
      displayName: "Admin Admin",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=261361478",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=261361478",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=261361478",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=261361478",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=261361478",
      profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
      hasAvatar: true,
      isAnonim: false,
    },
    order: "",
    isFavorite: true,
  },
];

export const successFavorites = {
  response: {
    files: [...file],
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
      id: 2,
      rootFolderId: 2,
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
      created: "2025-09-22T17:29:25.0000000+03:00",
      createdBy: {
        id: "0000000000-0000-000000-000000000",
        displayName: "Admin Admin",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=261361478",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=261361478",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=261361478",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=261361478",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=261361478",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
        hasAvatar: true,
        isAnonim: false,
      },
      updated: "2025-09-22T17:29:25.0000000+03:00",
      rootFolderType: 10,
      updatedBy: {
        id: "0000000000-0000-000000-000000000",
        displayName: "Admin Admin",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=261361478",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=261361478",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=261361478",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=261361478",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=261361478",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=admin%40gmail.com`,
        hasAvatar: true,
        isAnonim: false,
      },
      order: "",
    },
    pathParts: [
      {
        id: 2,
        title: "Favorites",
        folderType: 10,
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
      href: `${BASE_URL}/${API_PREFIX}/files/2?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const emptyFavorites = {
  ...successFavorites,
  response: {
    ...successFavorites.response,
    files: [],
    count: 0,
    total: 0,
  },
};

export const deleteFavorites = {
  response: true,
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_DELETE_FAVORITES}`,
      action: "DELETE",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const getFile = {
  response: { ...file[0], isFavorite: false },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/files/file/1`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const favoritesHandler = (type: ResponseType) => {
  switch (type) {
    case "empty":
      return new Response(JSON.stringify(emptyFavorites));
    case "delete":
      return new Response(JSON.stringify(deleteFavorites));
    case "success":
    default:
      return new Response(JSON.stringify(successFavorites));
  }
};

export const getFileHandler = () => {
  return new Response(JSON.stringify(getFile));
};
