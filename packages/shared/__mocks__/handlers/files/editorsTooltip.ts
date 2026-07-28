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
import { success } from "./sharedWithMe";

export const PATH_SHARED_WITH_ME_EDITORS = "files/:id(\\d+)";

const getSharedWithMeFolderWithEditors = () => {
  const baseFolder = success.response;

  return {
    ...baseFolder,
    files: baseFolder.files.map((file) => ({
      ...file,
      fileStatus: 1, // IsEditing flag
      editingBy: {
        "user-1": "John Doe",
        "user-2": "Jane Smith",
        "00000000-0000-0000-0000-000000000000": "Anonymous",
      },
      activeEditors: {
        "user-1": "John Doe",
        "user-2": "Jane Smith",
        "00000000-0000-0000-0000-000000000000": "Anonymous",
      },
    })),
  };
};

const getSharedWithMeFolderWithManyEditors = (count: number) => {
  const editors: Record<string, string> = {};
  for (let i = 1; i <= count; i++) {
    editors[`user-${i}`] = `Editor ${i}`;
  }

  const baseFolder = success.response;

  return {
    ...baseFolder,
    files: baseFolder.files.map((file) => ({
      ...file,
      fileStatus: 1, // IsEditing flag
      editingBy: editors,
      activeEditors: editors,
    })),
  };
};

export const filesWithEditorsResolver = (): Response => {
  return new Response(
    JSON.stringify({
      response: getSharedWithMeFolderWithEditors(),
    }),
    { status: 200 },
  );
};

export const filesWithEditorsHandler = (port?: string) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl =
      typeof window !== "undefined" ? window.location.origin : `${BASE_URL}`;
  }

  return http.get(
    `${baseUrl}/${API_PREFIX}/${PATH_SHARED_WITH_ME_EDITORS}`,
    () => {
      return filesWithEditorsResolver();
    },
  );
};

export const filesWithManyEditorsResolver = (count: number): Response => {
  return new Response(
    JSON.stringify({
      response: getSharedWithMeFolderWithManyEditors(count),
    }),
    { status: 200 },
  );
};

export const filesWithManyEditorsHandler = (
  port?: string,
  count: number = 15,
) => {
  let baseUrl;
  if (port) {
    baseUrl = `${BASE_URL}:${port}`;
  } else {
    baseUrl =
      typeof window !== "undefined" ? window.location.origin : `${BASE_URL}`;
  }

  return http.get(
    `${baseUrl}/${API_PREFIX}/${PATH_SHARED_WITH_ME_EDITORS}`,
    () => {
      return filesWithManyEditorsResolver(count);
    },
  );
};
