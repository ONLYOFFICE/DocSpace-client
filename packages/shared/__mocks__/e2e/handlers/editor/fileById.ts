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

const fileByIdSuccess = {
  response: {
    folderId: 19,
    version: 3,
    versionGroup: 3,
    contentLength: "68.71 KB",
    pureContentLength: 70359,
    fileStatus: 256,
    mute: false,
    viewUrl: `${BASE_URL}/filehandler.ashx?action=download&fileid=20`,
    webUrl: `${BASE_URL}/doceditor?fileid=20&version=3`,
    fileType: 10,
    fileExst: ".pdf",
    comment: "Edited",
    thumbnailStatus: 0,
    hasDraft: false,
    formFillingStatus: 4,
    isForm: true,
    startFilling: true,
    viewAccessibility: {
      ImageView: false,
      MediaView: false,
      WebView: false,
      WebEdit: true,
      WebReview: false,
      WebCustomFilterEditing: false,
      WebRestrictedEditing: true,
      WebComment: true,
      CanConvert: false,
      MustConvert: false,
    },
    lastOpened: "2025-12-30T17:03:47.0000000+03:00",
    fileEntryType: 2,
    id: 20,
    rootFolderId: 3,
    originRoomId: 19,
    originRoomTitle: "VDR Room",
    canShare: true,
    shareSettings: {
      ExternalLink: 6,
    },
    security: {
      Read: true,
      Comment: true,
      FillForms: false,
      Review: true,
      Edit: false,
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
      CreateRoomFrom: false,
      CopyLink: false,
      Embed: true,
      StartFilling: false,
      FillingStatus: true,
      ResetFilling: false,
      StopFilling: false,
      OpenForm: true,
      Vectorization: false,
      AskAi: false,
    },
    availableShareRights: {
      ExternalLink: ["Editing", "FillForms", "None"],
      PrimaryExternalLink: ["Editing", "FillForms", "None"],
    },
    title: "New PDF form.pdf",
    access: 0,
    shared: true,
    sharedForUser: false,
    parentShared: false,
    shortWebUrl: `${BASE_URL}/s/WC3k2r7sQHSNXbh`,
    created: "2025-12-30T17:01:34.0000000+03:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    updated: "2025-12-30T17:04:36.0000000+03:00",
    rootFolderType: 14,
    parentRoomType: 29,
    updatedBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=868996641",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=868996641",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=868996641",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=868996641",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    order: "2",
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}${API_PREFIX}/files/file/20`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const fileByIdHandler = () => {
  return new Response(JSON.stringify(fileByIdSuccess));
};
