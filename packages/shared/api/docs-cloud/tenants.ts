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

// TODO: Remove all FAKE_* constants and uncomment the request() calls when the API is ready.
// import { request } from "../client";
import type { TTenantConfig, TTenantInfo, TTenantUsage } from "./types";

const FAKE_TENANT_INFO: TTenantInfo = {
  resourceId: "res-001",
  alias: "demo-portal",
  name: "Demo Portal",
  isActive: true,
  isTrial: false,
  isDeveloperPack: false,
  buildVersion: "8.2.1.1",
  licenseDate: "2027-01-01T00:00:00",
  usersLimit: 100,
  docServerAddress: "https://ds.demo-portal.onlyoffice.com",
  authorizationHeader: "AuthorizationJWT",
  documentServerSecret: "***",
  activeEditorsCount: 12,
  internalEditorsCount: 10,
  externalEditorsCount: 2,
  remainingEditorsCount: 88,
  activeViewersCount: 5,
  internalViewersCount: 4,
  externalViewersCount: 1,
  remainingViewersCount: 95,
  monthlyActiveEditors: 30,
  monthlyActiveViewers: 15,
  reportingPeriodStart: "2026-06-01T00:00:00",
  reportingPeriodEnd: "2026-06-30T23:59:59",
};

const FAKE_TENANT_CONFIG: TTenantConfig = {
  name: "Demo Portal",
  authorizationHeader: "AuthorizationJWT",
  documentServerSecret: "",
  anonymousSupport: false,
};

const FAKE_TENANT_USAGE: TTenantUsage = {
  editorsActive: 12,
  editorsInternal: 10,
  editorsExternal: 2,
  editorsRemaining: 88,
  viewersActive: 5,
  viewersInternal: 4,
  viewersExternal: 1,
  viewersRemaining: 95,
  reportingPeriodStart: "2026-06-01T00:00:00",
  reportingPeriodEnd: "2026-06-30T23:59:59",
};

export async function getTenantInfo(): Promise<TTenantInfo> {
  // TODO: return (await request<TTenantInfo>({ method: "get", url: "/tenant/current/info" })) as TTenantInfo;
  return { ...FAKE_TENANT_INFO };
}

export async function getTenantConfiguration(): Promise<TTenantConfig> {
  // TODO: return (await request<TTenantConfig>({ method: "get", url: "/tenant/current/configuration" })) as TTenantConfig;
  return { ...FAKE_TENANT_CONFIG };
}

export async function setTenantConfiguration(
  _config: TTenantConfig,
): Promise<void> {
  // TODO: await request({ method: "put", url: "/tenant/current/configuration", data: config });
}

export async function downloadQuota(): Promise<Blob> {
  // TODO: return (await request<Blob>({ method: "get", url: "/tenant/current/quota", responseType: "blob" })) as Blob;
  return new Blob([], { type: "text/csv" });
}

export async function getTenantUsage(): Promise<TTenantUsage> {
  // TODO: return (await request<TTenantUsage>({ method: "get", url: "/tenant/current/usage" })) as TTenantUsage;
  return { ...FAKE_TENANT_USAGE };
}

