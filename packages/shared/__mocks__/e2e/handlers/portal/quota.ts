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

export const PATH_QUOTA = "portal/payment/quota";

export const quotaSuccess = {
  response: {
    id: -10,
    title: "Business",
    price: {
      value: 6820,
    },
    nonProfit: false,
    free: false,
    trial: false,
    features: [
      {
        id: "manager",
        value: 31,
        type: "count",
        used: {
          value: 2,
          title: "Admins added:",
        },
        priceTitle: "Number of admins",
      },
      {
        id: "total_size",
        title: "7.57 TB per admin and ability to add space on request",
        value: 8321499136000,
        type: "size",
        used: {
          value: 14745767926,
          title: "Storage space used:",
        },
        priceTitle: "Storage space",
      },
      {
        id: "file_size",
        title: "Max file size",
        value: 1073741824,
        type: "size",
        used: {
          value: 0,
        },
      },
      {
        id: "branding",
        value: false,
        type: "flag",
      },
      {
        id: "oauth",
        value: true,
        type: "flag",
      },
      {
        id: "year",
        value: true,
        type: "flag",
      },
      {
        id: "backup",
        value: true,
        type: "flag",
      },
      {
        id: "users",
        title: "Unlimited number of users and guests",
        value: -1,
        type: "count",
        used: {
          value: 8,
        },
      },
      {
        id: "room",
        title: "Unlimited number of active rooms",
        value: -1,
        type: "count",
        used: {
          value: 148,
          title: "Rooms:",
        },
      },
      {
        id: "customization",
        title: "Branding & customization",
        value: true,
        type: "flag",
      },
      {
        id: "ldap",
        value: true,
        type: "flag",
      },
      {
        id: "sso",
        title: "SSO",
        value: true,
        type: "flag",
      },
      {
        id: "free_backup",
        title: "2 free backups per month",
        value: 2,
        type: "count",
        used: {
          value: 0,
        },
      },
      {
        id: "restore",
        title: "Data recovery",
        value: true,
        type: "flag",
      },
      {
        id: "audit",
        title: "Tracking logins & actions",
        value: true,
        type: "flag",
      },
      {
        id: "thirdparty",
        title: "Third-party integrations",
        value: true,
        type: "flag",
      },
      {
        id: "statistic",
        title: "Storage quotas & statistic",
        value: true,
        type: "flag",
      },
      {
        id: "aiagent",
        value: -1,
        type: "count",
        used: {
          value: 8,
        },
      },
    ],
    usersQuota: {
      enableQuota: false,
      defaultQuota: 0,
      lastRecalculateDate: "2024-04-03T13:02:17.63658Z",
    },
    roomsQuota: {
      enableQuota: true,
      defaultQuota: 0,
      lastRecalculateDate: "2024-04-03T13:02:17.6733891Z",
    },
    aiAgentsQuota: {
      enableQuota: false,
      defaultQuota: 0,
    },
    tenantCustomQuota: {
      enableQuota: false,
      quota: 0,
      lastRecalculateDate: "2025-05-12T12:20:31.3678021Z",
      lastModified: "2025-05-12T12:20:31",
    },
  },
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_QUOTA}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const quotaHandler = () => {
  return new Response(JSON.stringify(quotaSuccess));
};
