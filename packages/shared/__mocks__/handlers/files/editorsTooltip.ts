// (c) Copyright Ascensio System SIA 2009-2026
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
