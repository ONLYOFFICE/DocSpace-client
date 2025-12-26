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
import { BASE_URL, API_PREFIX } from "../../e2e/utils";

export const PATH_TARIFF = "portal/tariff";

export const tariffSuccess = {
  response: {
    openSource: false,
    enterprise: false,
    developer: false,
    id: 1,
    state: 1,
    dueDate: "2026-06-05T13:03:34.0000000+04:00",
    delayDueDate: "0001-01-01T00:00:00.0000000Z",
    licenseDate: "0001-01-01T00:00:00.0000000Z",
    customerId: "test@gmail.com",
    quotas: [
      {
        id: 1,
        quantity: 31,
        wallet: false,
      },
    ],
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_TARIFF}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const tariffResolver = () => {
  return new Response(JSON.stringify(tariffSuccess));
};

export const tariffHandler = () => {
  return http.get(`http://localhost/${API_PREFIX}/${PATH_TARIFF}`, () => {
    return tariffResolver();
  });
};


