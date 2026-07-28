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

export const PATH_PORTAL_GET = "apisystem/portal/get";

const uncompletedTenant = {
  created: "2021-03-09T17:46:59",
  domain: "second.docspace.site",
  industry: 0,
  language: "en-US",
  name: "Web Office",
  ownerId: "00000000-0000-0000-0000-000000000000",
  portalName: "second",
  status: "Active",
  tenantId: 2,
  timeZoneName: "UTC",
  quotaUsage: {
    tenantId: 2,
    tenantAlias: "docspace.site",
    tenantDomain: "docspace.site",
    storageSize: 9223372036854776000,
    usedSize: 4690191,
    maxRoomAdminsCount: 2147483647,
    roomAdminCount: 0,
    maxUsers: -1,
    usersCount: 0,
    maxRoomsCount: -1,
    roomsCount: 0,
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
    completed: false,
    lastModified: "2021-03-09T17:46:59",
  },
};

const completedTenant = {
  created: "2021-03-09T17:46:59",
  domain: "test.docspace.site",
  industry: 0,
  language: "en-US",
  name: "Web Office",
  ownerId: "00000000-0000-0000-0000-000000000000",
  portalName: "test",
  status: "Active",
  tenantId: 1,
  timeZoneName: "UTC",
  quotaUsage: {
    tenantId: 1,
    tenantAlias: "docspace.site",
    tenantDomain: "docspace.site",
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
};

export const getPortalSuccess = {
  tenants: [completedTenant],
};

const getPortalEmptySuccess = {
  tenants: [],
};

export const getPortalWithUncompletedTenantSuccess = {
  tenants: [completedTenant, uncompletedTenant],
};

export const getPortalResolver = (
  isEmptyPortal?: boolean,
  isUncompletedTenant?: boolean,
): Response => {
  if (isEmptyPortal) {
    return new Response(JSON.stringify(getPortalEmptySuccess));
  }

  if (isUncompletedTenant) {
    return new Response(JSON.stringify(getPortalWithUncompletedTenantSuccess));
  }

  return new Response(JSON.stringify(getPortalSuccess));
};

export const getPortalHandler = (
  port: string,
  isEmptyPortal?: boolean,
  isUncompletedTenant?: boolean,
) => {
  return http.get(`${BASE_URL}:${port}/${PATH_PORTAL_GET}*`, () => {
    return getPortalResolver(isEmptyPortal, isUncompletedTenant);
  });
};

// Handler for /api/2.0/portal/get endpoint (used by management app)
export const getPortalApiHandler = (
  port: string,
  isEmptyPortal?: boolean,
  isUncompletedTenant?: boolean,
) => {
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/portal/get*`, () => {
    return getPortalResolver(isEmptyPortal, isUncompletedTenant);
  });
};
