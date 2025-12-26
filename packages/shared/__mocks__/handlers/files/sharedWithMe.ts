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

import { http } from "msw";
import { BASE_URL, API_PREFIX } from "../../e2e/utils";

type ResponseType = "success" | "empty";

export const PATH_SHARED_WITH_ME = "files/:id";

export const success = {
  response: {
    files: [
      {
        folderId: 4,
        version: 1,
        versionGroup: 1,
        contentLength: "7.54 KB",
        pureContentLength: 7726,
        fileStatus: 0,
        mute: false,
        viewUrl: `${BASE_URL}/filehandler.ashx?action=download&fileid=1`,
        webUrl: `${BASE_URL}/doceditor?fileid=1&version=1`,
        fileType: 7,
        fileExst: ".docx",
        comment: "Created",
        thumbnailStatus: 3,
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
        id: 1,
        rootFolderId: 4,
        canShare: true,
        shareSettings: {
          ExternalLink: 6,
        },
        security: {
          Read: true,
          Comment: false,
          FillForms: false,
          Review: false,
          Edit: true,
          Delete: false,
          CustomFilter: true,
          Rename: true,
          ReadHistory: true,
          Lock: false,
          EditHistory: false,
          Copy: true,
          Move: false,
          Duplicate: false,
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
          OpenForm: false,
          Vectorization: false,
          AskAi: false,
        },
        availableShareRights: {
          User: [
            "ReadWrite",
            "Editing",
            "Review",
            "Comment",
            "Read",
            "Restrict",
          ],
          ExternalLink: ["Editing", "Review", "Comment", "Read"],
          Group: [
            "ReadWrite",
            "Editing",
            "Review",
            "Comment",
            "Read",
            "Restrict",
          ],
          PrimaryExternalLink: ["Editing", "Review", "Comment", "Read"],
        },
        title: "share test.docx",
        access: 1,
        sharedBy: {
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
          hasAvatar: false,
          isAnonim: false,
        },
        ownedBy: {
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
          hasAvatar: false,
          isAnonim: false,
        },
        shared: false,
        sharedForUser: false,
        parentShared: false,
        shortWebUrl: "",
        created: "2025-11-25T20:21:48.0000000+05:00",
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
          hasAvatar: false,
          isAnonim: false,
        },
        updated: "2025-11-25T20:21:59.0000000+05:00",
        rootFolderType: 6,
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
      created: "2025-11-16T18:05:50.0000000+05:00",
      createdBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=317791436",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=317791436",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=317791436",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=317791436",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=317791436",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=test%40gmail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
      updated: "2025-11-16T18:05:50.0000000+05:00",
      rootFolderType: 6,
      updatedBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator ",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=317791436",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=317791436",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=317791436",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=317791436",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=317791436",
        profileUrl: `${BASE_URL}/accounts/people/filter?search=test%40gmail.com`,
        hasAvatar: false,
        isAnonim: false,
      },
    },
    pathParts: [
      {
        id: 4,
        title: "Shared with me",
        folderType: 6,
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
      href: `${BASE_URL}/${API_PREFIX}/files/4?count=100&sortby=DateAndTime&sortOrder=descending`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const empty = {
  ...success,
  response: {
    ...success.response,
    files: [],
    count: 0,
    total: 0,
  },
};

export const sharedWithMeResolver = (type?: ResponseType) => {
  switch (type) {
    case "empty":
      return new Response(JSON.stringify(empty));
    case "success":
    default:
      return new Response(JSON.stringify(success));
  }
};

export const sharedWithMeHandler = (type?: ResponseType, port?: string) => {
    return http.get(`http://localhost:${port}/${API_PREFIX}/${PATH_SHARED_WITH_ME}`, () => {
        return sharedWithMeResolver(type);
    });
}