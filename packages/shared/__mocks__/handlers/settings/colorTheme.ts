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
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/${PATH}`, () => {
    return colorThemeResolver(selectedId);
  });
};
