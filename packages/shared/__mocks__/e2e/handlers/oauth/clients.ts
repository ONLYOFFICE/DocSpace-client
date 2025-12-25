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

import { BASE64_LOGO } from "./base64logo";

export const PATH_OAUTH_CLIENTS = /\/api\/2\.0\/clients\/consents(?:\?.*)?$/;

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

export const clientsEmptyHandler = (): Response => {
  return new Response(JSON.stringify(clientsEmptySuccess));
};

export const clientsHandler = (): Response => {
  return new Response(JSON.stringify(clientsSuccess));
};
