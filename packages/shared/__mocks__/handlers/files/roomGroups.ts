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
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_ROOM_GROUPS = "files/group";
export const PATH_ROOM_GROUP_BY_ID = "files/group/:groupId";
export const PATH_ROOM_GROUP_ICON = "files/group/:groupId/icon";

const FOLDER_ICON_SVG_SMALL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 5h8l2 2h10v14H3V5z" fill="#35ABE5"/></svg>`;
const FOLDER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M4 6h10l2 2h12v18H4V6z" fill="#35ABE5"/></svg>`;
const FOLDER_ICON_SVG_MEDIUM = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M5 8h16l3 3h16v24H5V8z" fill="#35ABE5"/></svg>`;

const mockRoomLogo = {
  original: "",
  large: "",
  medium: "",
  small: "",
  color: "61C059",
};

const mockRoomGroups = [
  {
    id: "group-1",
    name: "Marketing",
    totalRooms: 3,
    icon: {
      id: "folder",
      data: {
        small: FOLDER_ICON_SVG_SMALL,
        medium: FOLDER_ICON_SVG_MEDIUM,
        default: FOLDER_ICON_SVG,
      },
    },
    rooms: [
      {
        id: 101,
        title: "Marketing Room 1",
        roomType: 6,
        logo: mockRoomLogo,
        shared: false,
        parentId: 2002,
        filesCount: 0,
        foldersCount: 0,
        rootFolderType: 14,
        security: { Read: true },
        tags: [],
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        inRoom: true,
      },
      {
        id: 102,
        title: "Marketing Room 2",
        roomType: 6,
        logo: mockRoomLogo,
        shared: false,
        parentId: 2002,
        filesCount: 0,
        foldersCount: 0,
        rootFolderType: 14,
        security: { Read: true },
        tags: [],
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        inRoom: true,
      },
      {
        id: 103,
        title: "Marketing Room 3",
        roomType: 6,
        logo: mockRoomLogo,
        shared: false,
        parentId: 2002,
        filesCount: 0,
        foldersCount: 0,
        rootFolderType: 14,
        security: { Read: true },
        tags: [],
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        inRoom: true,
      },
    ],
  },
  {
    id: "group-2",
    name: "Engineering",
    totalRooms: 2,
    icon: {
      id: "folder",
      data: {
        small: FOLDER_ICON_SVG_SMALL,
        medium: FOLDER_ICON_SVG_MEDIUM,
        default: FOLDER_ICON_SVG,
      },
    },
    rooms: [
      {
        id: 201,
        title: "Engineering Room 1",
        roomType: 6,
        logo: mockRoomLogo,
        shared: false,
        parentId: 2002,
        filesCount: 0,
        foldersCount: 0,
        rootFolderType: 14,
        security: { Read: true },
        tags: [],
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        inRoom: true,
      },
      {
        id: 202,
        title: "Engineering Room 2",
        roomType: 6,
        logo: mockRoomLogo,
        shared: false,
        parentId: 2002,
        filesCount: 0,
        foldersCount: 0,
        rootFolderType: 14,
        security: { Read: true },
        tags: [],
        pinned: false,
        private: false,
        indexing: false,
        denyDownload: false,
        inRoom: true,
      },
    ],
  },
];

const emptyRoomGroups: typeof mockRoomGroups = [];

export const roomGroupsHandler = (port: string, withGroups: boolean = true) => {
  const groups = withGroups ? mockRoomGroups : emptyRoomGroups;

  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_GROUPS}`,
    () => {
      return new Response(
        JSON.stringify({
          response: groups,
          count: groups.length,
          status: 0,
          statusCode: 200,
        }),
      );
    },
  );
};

export const roomGroupByIdHandler = (port: string) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_GROUP_BY_ID}`,
    ({ params }) => {
      const { groupId } = params;
      const group = mockRoomGroups.find((g) => g.id === groupId);

      if (!group) {
        return new Response(
          JSON.stringify({
            response: null,
            status: 1,
            statusCode: 404,
          }),
          { status: 404 },
        );
      }

      return new Response(
        JSON.stringify({
          response: group,
          status: 0,
          statusCode: 200,
        }),
      );
    },
  );
};

export const createRoomGroupHandler = (port: string) => {
  return http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_GROUPS}`,
    async () => {
      return new Response(
        JSON.stringify({
          response: {
            id: "group-new",
            name: "New Group",
            totalRooms: 0,
            icon: {
              id: "folder",
              data: {
                small: FOLDER_ICON_SVG_SMALL,
                default: FOLDER_ICON_SVG,
              },
            },
            rooms: [],
          },
          status: 0,
          statusCode: 200,
        }),
      );
    },
  );
};

export const updateRoomGroupHandler = (port: string) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_GROUP_BY_ID}`,
    async () => {
      return new Response(
        JSON.stringify({
          response: {},
          status: 0,
          statusCode: 200,
        }),
      );
    },
  );
};

export const deleteRoomGroupHandler = (port: string) => {
  return http.delete(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_GROUP_BY_ID}`,
    async () => {
      return new Response(
        JSON.stringify({
          response: {},
          status: 0,
          statusCode: 200,
        }),
      );
    },
  );
};

export const updateRoomGroupIconHandler = (port: string) => {
  return http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_ROOM_GROUP_ICON}`,
    async () => {
      return new Response(
        JSON.stringify({
          response: {},
          status: 0,
          statusCode: 200,
        }),
      );
    },
  );
};
