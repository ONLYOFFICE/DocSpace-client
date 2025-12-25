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

import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH_ACTIVE_CONNECTIONS = "security/activeconnections";

const activeConnectionsSuccess = {
  response: {
    loginEvent: 1,
    items: [
      {
        id: 1,
        tenantId: 1,
        userId: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        mobile: false,
        ip: "1.1.1.1",
        country: "",
        city: "",
        browser: "Chrome 143",
        platform: "Mac OS X 10 Apple Mac",
        date: "2025-12-23T00:29:48.0000000+03:00",
        page: `${BASE_URL}/wizard`,
      },
    ],
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_ACTIVE_CONNECTIONS}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const activeConnectionsHandler = (): Response => {
  return new Response(JSON.stringify(activeConnectionsSuccess));
};
