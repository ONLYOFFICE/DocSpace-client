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

import { BASE_URL } from "../../utils";

export const PATH_PORTAL_GET = "apisystem/portal/get?statistics=true";

export const getPortalSuccess = {
  tenants: [
    {
      created: "2021-03-09T17:46:59",
      domain: BASE_URL,
      industry: 0,
      language: "en-US",
      name: "Web Office",
      ownerId: "00000000-0000-0000-0000-000000000000",
      portalName: BASE_URL,
      status: "Active",
      tenantId: 1,
      timeZoneName: "UTC",
      quotaUsage: {
        tenantId: 1,
        tenantAlias: BASE_URL,
        tenantDomain: BASE_URL,
        storageSize: 9223372036854776000,
        usedSize: 4690191,
        maxRoomAdminsCount: 2147483647,
        roomAdminCount: 2,
        maxUsers: -1,
        usersCount: 0,
        maxRoomsCount: -1,
        roomsCount: 4,
        maxAIAgentsCount: -1,
        aiAgentsCount: 0,
      },
      customQuota: -1,
      owner: {
        id: "00000000-0000-0000-0000-000000000000",
        email: "test@gmail.com",
        displayName: "Administrator ",
      },
      wizardSettings: {
        completed: true,
        lastModified: "2021-03-09T17:46:59",
      },
    },
  ],
};

export const getPortalHandler = (): Response => {
  return new Response(JSON.stringify(getPortalSuccess));
};
