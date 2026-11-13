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

/** The route as the client spells it; the server matches it without case. */
export const PATH_DEFAULT_FOLDER = "settings/defaultFolder";

// FolderType (ASC.Files.Core): the roots SaveDefaultFolder accepts.
const ALLOWED_FOLDER_TYPES = [
  34, // AiAgents
  5, // USER
  14, // VirtualRooms
  6, // SHARE
  10, // Favorites
  11, // Recent
  36, // Forms
  42, // PrivateRooms
  41, // AiHub
  0, // DEFAULT
];

const USER_FOLDER_TYPE = 5;

export type DefaultFolderOptions = {
  /** The caller is a guest, who has no My documents to start at. */
  isGuest?: boolean;
};

/**
 * Mirrors SettingsController.SaveDefaultFolder (HttpPut "defaultfolder"): the
 * caller's own start page. It takes `DefaultFolderType` from the body, accepts
 * the roots a start page can be set to, the Private root among them, and
 * answers StudioDefaultPageSettingsDto with the saved type. Any other folder
 * type, or My documents for a guest, is an ArgumentException: 400.
 */
export const defaultFolderHandler = (
  port: string,
  { isGuest = false }: DefaultFolderOptions = {},
) =>
  http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_DEFAULT_FOLDER}`,
    async ({ request }) => {
      const body = (await request.json()) as {
        DefaultFolderType?: number;
        defaultFolderType?: number;
      };
      const folderType = body.DefaultFolderType ?? body.defaultFolderType;

      if (
        folderType === undefined ||
        !ALLOWED_FOLDER_TYPES.includes(folderType) ||
        (isGuest && folderType === USER_FOLDER_TYPE)
      ) {
        return new Response(
          JSON.stringify({
            error: { message: "DefaultFolderType" },
            status: 1,
            statusCode: 400,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          response: {
            defaultFolderType: folderType,
            lastModified: "2026-11-12T00:00:00.0000000Z",
          },
          status: 0,
          statusCode: 200,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    },
  );
