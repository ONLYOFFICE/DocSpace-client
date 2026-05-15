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
import { BASE_URL, API_PREFIX } from "../../e2e/utils";

type ResponseType = "success" | "empty";

export const PATH_SHARED_WITH_ME = "files/:id(\\d+)";

const getSharedWithMeFolder = () => ({
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
        User: ["ReadWrite", "Editing", "Review", "Comment", "Read", "Restrict"],
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
    },
    title: "Shared with me",
    access: 0,
    shared: false,
    created: "2025-11-16T18:05:50.0000000+05:00",
    createdBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=317791436",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=317791436",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=317791436",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=317791436",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=317791436",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
    updated: "2025-11-16T18:05:50.0000000+05:00",
    rootFolderType: 6,
    updatedBy: {
      id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
      displayName: "Administrator ",
      avatar: "/static/images/default_user_photo_size_82-82.png?hash=317791436",
      avatarOriginal:
        "/static/images/default_user_photo_size_200-200.png?hash=317791436",
      avatarMax:
        "/static/images/default_user_photo_size_200-200.png?hash=317791436",
      avatarMedium:
        "/static/images/default_user_photo_size_48-48.png?hash=317791436",
      avatarSmall:
        "/static/images/default_user_photo_size_32-32.png?hash=317791436",
      profileUrl: "",
      hasAvatar: false,
      isAnonim: false,
    },
  },
  pathParts: [
    {
      id: 4,
      title: "Shared with me",
    },
  ],
  startIndex: 0,
  count: 1,
  total: 1,
  new: 0,
});

export const success = {
  response: getSharedWithMeFolder(),
};

const getEmptySharedWithMeFolder = () => ({
  ...getSharedWithMeFolder(),
  files: [],
  count: 0,
  total: 0,
});

export const empty = {
  response: getEmptySharedWithMeFolder(),
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

export const sharedWithMeHandler = (port?: string, type?: ResponseType) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_SHARED_WITH_ME}`,
    () => {
      return sharedWithMeResolver(type);
    },
  );
};
