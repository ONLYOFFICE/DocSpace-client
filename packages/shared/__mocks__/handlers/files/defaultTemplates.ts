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
import { BASE_URL, API_PREFIX } from "../../e2e/utils";

export const PATH_DEFAULT_TEMPLATES = "files/settings/defaulttemplate";

type ResponseType = "default" | "customized" | "long";

const defaultTemplates = {
  response: {
    items: [
      {
        fileExtension: ".docx",
      },
      {
        fileExtension: ".pdf",
      },
      {
        fileExtension: ".xlsx",
      },
      {
        fileExtension: ".pptx",
      },
    ],
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_DEFAULT_TEMPLATES}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const defaultTemplatesCustomized = {
  response: {
    items: [
      {
        selectedFile: 13,
        fileExtension: ".docx",
        fileTitle: "ONLYOFFICE Document Sample.docx",
        lastModified: "2026-01-21T18:34:37+00:00",
        fileSize: 408980,
      },
      {
        fileExtension: ".pdf",
      },
      {
        fileExtension: ".xlsx",
      },
      {
        fileExtension: ".pptx",
      },
    ],
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_DEFAULT_TEMPLATES}`,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
};

const defaultTemplatesLongTitle = {
  response: {
    items: [
      {
        selectedFile: 13,
        fileExtension: ".docx",
        fileTitle:
          "Long long long long long long long long long long long long long long long long long",
        lastModified: "2026-01-21T18:34:37+00:00",
        fileSize: 408980,
      },
      {
        fileExtension: ".pdf",
      },
      {
        fileExtension: ".xlsx",
      },
      {
        fileExtension: ".pptx",
      },
    ],
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_DEFAULT_TEMPLATES}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const defaultTemplatesResolver = (type?: ResponseType) => {
  switch (type) {
    case "customized":
      return new Response(JSON.stringify(defaultTemplatesCustomized));
    case "long":
      return new Response(JSON.stringify(defaultTemplatesLongTitle));
    default:
      return new Response(JSON.stringify(defaultTemplates));
  }
};

export const defaultTemplatesHandler = (port: string, type?: ResponseType) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_DEFAULT_TEMPLATES}`,
    () => {
      return defaultTemplatesResolver(type);
    },
  );
};

export const defaultTemplatesSetHandler = (
  port: string,
  type?: ResponseType,
) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_DEFAULT_TEMPLATES}`,
    () => {
      return defaultTemplatesResolver(type);
    },
  );
};

export const defaultTemplatesResetHandler = (
  port: string,
  type?: ResponseType,
) => {
  return http.delete(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_DEFAULT_TEMPLATES}`,
    () => {
      return defaultTemplatesResolver(type);
    },
  );
};

export const defaultTemplatesLongHandler = (
  port: string,
  type?: ResponseType,
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_DEFAULT_TEMPLATES}`,
    () => {
      return defaultTemplatesResolver(type);
    },
  );
};
