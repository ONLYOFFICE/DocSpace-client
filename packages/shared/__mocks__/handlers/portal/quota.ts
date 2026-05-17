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

export const PATH_QUOTA = "portal/payment/quota";

export const quotaSuccess = (
  withCustomization: boolean = true,
  lifetime: boolean = true,
  trial: boolean = false,
  saas: boolean = false,
  year: boolean = false,
) => ({
  response: {
    id: -10,
    title: "Business",
    price: {
      value: 6820,
    },
    nonProfit: false,
    free: false,
    trial,
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
        value: !saas,
        type: "flag",
      },
      {
        id: "oauth",
        value: true,
        type: "flag",
      },
      {
        id: "year",
        value: year,
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
        value: withCustomization,
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
      {
        id: "lifetime",
        type: "flag",
        value: lifetime,
      },
    ],
    usersQuota: {
      enableQuota: false,
      defaultQuota: 0,
      lastRecalculateDate: "2024-04-03T13:02:17.63658Z",
    },
    roomsQuota: {
      enableQuota: false,
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
});

export const quotaResolver = (
  withCustomization: boolean = true,
  lifetime: boolean = true,
  trial: boolean = false,
  saas: boolean = false,
  year: boolean = false,
) => {
  return new Response(
    JSON.stringify(
      quotaSuccess(withCustomization, lifetime, trial, saas, year),
    ),
  );
};

export const quotaHandler = (
  port: string,
  withCustomization: boolean = true,
  lifetime: boolean = true,
  trial: boolean = false,
  saas: boolean = false,
  year: boolean = false,
) => {
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/${PATH_QUOTA}`, () => {
    return quotaResolver(withCustomization, lifetime, trial, saas, year);
  });
};
