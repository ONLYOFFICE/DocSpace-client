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
 * All non-code elements of the Project's GUI elements, including illustrations,
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

import { http, HttpResponse } from "msw";
import { ShareAccessRights } from "../../../enums";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_ROOM_LINK = "files/rooms/:roomId/link";
export const PATH_ROOM_LINKS = "files/rooms/:roomId/links";
export const PATH_FILE_LINK = "files/file/:fileId/link";

const ADMIN_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const makeUser = () => ({
  id: ADMIN_ID,
  displayName: "Administrator",
  avatarSmall: "",
  profileUrl: "",
  hasAvatar: false,
  isAnonim: false,
});

export const roomInfoHandler = (port: string, roomId: number | string) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/${roomId}`,
    () =>
      HttpResponse.json({
        response: {
          id: roomId,
          roomType: 6,
          isRoom: true,
          title: "Public Room",
          rootFolderId: 2002,
          rootFolderType: 14,
          canShare: true,
          shared: true,
          sharedForUser: false,
          parentShared: false,
          inRoom: true,
          fileEntryType: 1,
          parentId: 2002,
          filesCount: 1,
          foldersCount: 0,
          new: 0,
          mute: false,
          pinned: false,
          private: false,
          security: {
            Read: true,
            Create: true,
            Delete: false,
            EditRoom: true,
            EditAccess: true,
            CopyLink: true,
            Embed: true,
          },
          access: 0,
          created: "2026-01-01T00:00:00.000Z",
          createdBy: makeUser(),
          updated: "2026-01-01T00:00:00.000Z",
          updatedBy: makeUser(),
        },
      }),
  );

export const roomContentHandler = (
  port: string,
  roomId: number | string,
  fileId: number | string,
  currentOverrides: Record<string, unknown> = {},
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/${roomId}`,
    () =>
      HttpResponse.json({
        response: {
          files: [
            {
              id: fileId,
              folderId: roomId,
              version: 1,
              versionGroup: 1,
              contentLength: "10 KB",
              pureContentLength: 10240,
              fileStatus: 2,
              mute: false,
              viewUrl: "",
              webUrl: "",
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
              rootFolderId: roomId,
              rootFolderType: 14,
              parentRoomType: 22,
              inRoom: true,
              canShare: true,
              shared: true,
              sharedForUser: false,
              parentShared: false,
              shortWebUrl: "",
              shareSettings: { ExternalLink: 6 },
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
              },
              availableShareRights: {
                ExternalLink: ["Read", "None"],
                PrimaryExternalLink: ["Read", "None"],
              },
              title: "Room Document.docx",
              access: 0,
              created: "2026-01-01T00:00:00.000Z",
              createdBy: makeUser(),
              updated: "2026-01-01T00:00:00.000Z",
              updatedBy: makeUser(),
            },
          ],
          folders: [],
          current: {
            parentId: 2002,
            filesCount: 1,
            foldersCount: 0,
            new: 0,
            mute: false,
            pinned: false,
            private: false,
            indexing: false,
            denyDownload: false,
            fileEntryType: 1,
            id: roomId,
            rootFolderId: 2002,
            rootFolderType: 14,
            isRoom: true,
            roomType: 6,
            canShare: true,
            shareSettings: { ExternalLink: 6, PrimaryExternalLink: 1 },
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
              UseChat: false,
            },
            title: "Public Room",
            access: 0,
            shared: true,
            sharedForUser: false,
            parentShared: false,
            shortWebUrl: "",
            created: "2026-01-01T00:00:00.000Z",
            createdBy: makeUser(),
            updated: "2026-01-01T00:00:00.000Z",
            updatedBy: makeUser(),
            ...currentOverrides,
          },
          pathParts: [
            { id: 2002, title: "Rooms", folderType: 14 },
            { id: roomId, title: "Public Room", folderType: 14 },
          ],
          startIndex: 0,
          count: 1,
          total: 1,
          new: 0,
        },
        count: 1,
        status: 0,
        statusCode: 200,
      }),
  );

export const makeRoomLink = (internal: boolean) => ({
  access: ShareAccessRights.ReadOnly,
  canEditInternal: true,
  canEditExpirationDate: true,
  canRevoke: true,
  sharedTo: {
    id: "room-link-id",
    title: "Shared link",
    shareLink: `${BASE_URL}/s/room-shared-link`,
    linkType: 1,
    denyDownload: false,
    isExpired: false,
    primary: true,
    internal,
    requestToken: "",
  },
});

export const roomPrimaryLinkHandler = (
  port: string,
  roomId: number | string,
  internal = false,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/${roomId}/link`,
    () => HttpResponse.json({ response: makeRoomLink(internal) }),
  );

export const roomLinksHandler = (
  port: string,
  roomId: number | string,
  internal = false,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/${roomId}/links`,
    () =>
      HttpResponse.json({
        response: [makeRoomLink(internal)],
        count: 1,
      }),
  );

export const roomFileLinksHandler = (
  port: string,
  fileId: number | string,
  links: unknown[] = [],
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/file/${fileId}/links`,
    () =>
      HttpResponse.json({
        response: { items: links, total: links.length },
        count: links.length,
        status: 0,
        statusCode: 200,
      }),
  );

const makeFileLink = (port: string, internal: boolean) =>
  HttpResponse.json({
    response: {
      access: ShareAccessRights.ReadOnly,
      canEditInternal: true,
      canEditExpirationDate: true,
      canRevoke: false,
      sharedTo: {
        id: "room-file-link-id",
        title: "Shared link",
        shareLink: `${BASE_URL}:${port}/s/roomFileLink`,
        linkType: 1,
        denyDownload: false,
        isExpired: false,
        primary: true,
        internal,
        requestToken: "",
      },
    },
  });

export const roomFilePrimaryLinkHandler = (
  port: string,
  fileId: number | string,
  internal = false,
) =>
  http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/files/file/${fileId}/link`,
    () => makeFileLink(port, internal),
  );

export const roomFileGetPrimaryLinkHandler = (
  port: string,
  fileId: number | string,
  internal = false,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/file/${fileId}/link`,
    () => makeFileLink(port, internal),
  );
