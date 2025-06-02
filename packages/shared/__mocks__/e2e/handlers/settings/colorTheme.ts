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

import { http } from "msw";
import { API_PREFIX } from "../../utils";

export const PATH = "settings/colortheme";

export const getSuccessColorTheme = (
  selectedId: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 = 1,
) => {
  return {
    response: {
      themes: [
        {
          id: 1,
          name: "blue",
          main: {
            accent: "#4781D1",
            buttons: "#5299E0",
          },
          text: {
            accent: "#FFFFFF",
            buttons: "#FFFFFF",
          },
        },
        {
          id: 2,
          name: "orange",
          main: {
            accent: "#F97A0B",
            buttons: "#FF9933",
          },
          text: {
            accent: "#FFFFFF",
            buttons: "#FFFFFF",
          },
        },
        {
          id: 3,
          name: "green",
          main: {
            accent: "#2DB482",
            buttons: "#22C386",
          },
          text: {
            accent: "#FFFFFF",
            buttons: "#FFFFFF",
          },
        },
        {
          id: 4,
          name: "red",
          main: {
            accent: "#F2675A",
            buttons: "#F27564",
          },
          text: {
            accent: "#FFFFFF",
            buttons: "#FFFFFF",
          },
        },
        {
          id: 5,
          name: "purple",
          main: {
            accent: "#6D4EC2",
            buttons: "#8570BD",
          },
          text: {
            accent: "#FFFFFF",
            buttons: "#FFFFFF",
          },
        },
        {
          id: 6,
          name: "light-blue",
          main: {
            accent: "#11A4D4",
            buttons: "#13B7EC",
          },
          text: {
            accent: "#FFFFFF",
            buttons: "#FFFFFF",
          },
        },
      ],
      selected: selectedId,
      limit: 9,
    },
    count: 1,
    links: [
      {
        href: `/${API_PREFIX}/${PATH}`,
        action: "GET",
      },
    ],
    status: 0,
    ok: true,
  };
};

export const colorThemeResolver = (
  selectedId: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 = 1,
): Response => {
  return new Response(JSON.stringify(getSuccessColorTheme(selectedId)));
};

export const colorThemeHandler = (
  port: string,
  selectedId: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 = 1,
) => {
  return http.get(`http://localhost:${port}/${API_PREFIX}/${PATH}`, () => {
    return colorThemeResolver(selectedId);
  });
};
