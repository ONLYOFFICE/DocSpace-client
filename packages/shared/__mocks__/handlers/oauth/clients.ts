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
import { BASE64_LOGO } from "./base64logo";

export const PATH_OAUTH_CLIENTS = `oauth2/clients/consents`;

const clientsEmptySuccess = {
  data: [],
  limit: 50,
  last_modified_on: null,
};

export const clientsSuccess = {
  data: [
    {
      scopes:
        "accounts:write rooms:read accounts.self:read accounts:read rooms:write",
      client: {
        name: "Test",
        description: "https://test.com",
        scopes: [
          "accounts:write",
          "rooms:read",
          "accounts.self:read",
          "accounts:read",
          "rooms:write",
        ],
        public: true,
        client_id: "d651bfeb-ed50-4a85-a59f-2b91d581f43b",
        website_url: "https://test.com",
        terms_url: "https://test.com",
        policy_url: "https://test.com",
        logo: BASE64_LOGO,
        authentication_methods: ["client_secret_post", "none"],
        is_public: true,
        created_on: "2025-08-22T08:10:10.243238358Z",
        created_by: "ad7f6ac8-223d-48af-922a-52df946e41f2",
        modified_on: "2025-09-24T07:27:58.621348026Z",
        modified_by: "ad7f6ac8-223d-48af-922a-52df946e41f2",
      },
      registered_client_id: "d651bfeb-ed50-4a85-a59f-2b91d581f43b",
      modified_at: "2025-12-24T11:03:20.309146Z",
    },
  ],
  limit: 50,
  last_modified_on: null,
};

export const clientsResolver = (isEmpty: boolean = false): Response => {
  return new Response(
    JSON.stringify(isEmpty ? clientsEmptySuccess : clientsSuccess),
  );
};

export const clientsHandler = (port: string, isEmpty?: boolean) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_OAUTH_CLIENTS}`,
    () => {
      return clientsResolver(isEmpty);
    },
  );
};
