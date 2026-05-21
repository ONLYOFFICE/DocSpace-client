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

export const PATH_OAUTH_TOKEN = "security/oauth2/token";

const tokenSuccess = {
  response:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzgwZmEzYy02M2EwLTRlYTYtYWRmNy1kNTU3ZGIzMWRhNDAiLCJ1c2VyX2lkIjoiZWM4MGZhM2MtNjNhMC00ZWE2LWFkZjctZDU1N2RiMzFkYTQwIiwidXNlcl9uYW1lIjoiVmlrdG9yIEZvbWluIiwidXNlcl9lbWFpbCI6InZpa3Rvci5mb21pbkBvbmx5b2ZmaWNlLmNvbSIsInRlbmFudF9pZCI6IjE4NCIsInRlbmFudF91cmwiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pbyIsImlzX2FkbWluIjoidHJ1ZSIsImlzX2d1ZXN0IjoiZmFsc2UiLCJpc19wdWJsaWMiOiJmYWxzZSIsImV4cCI6MTc2NjU3MzM3NCwiaXNzIjoiaHR0cHM6Ly91emJla2lzdGFuLm9ubHlvZmZpY2UuaW8iLCJhdWQiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pbyJ9.o8hMouVNMuITkiYkD7XVFzJv7e6cFOl3SqgYinzyM_g",
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_OAUTH_TOKEN}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const tokenResolver = (): Response => {
  return new Response(JSON.stringify(tokenSuccess));
};

export const tokenHandler = (port: string) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_OAUTH_TOKEN}`,
    () => {
      return tokenResolver();
    },
  );
};
