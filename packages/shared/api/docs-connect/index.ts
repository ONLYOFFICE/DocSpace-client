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

import { request } from "../client";
import type { TDocsConnectInfo, TDocsConnectStatus } from "./types";

/**
 * Master switch: while there is no backend, every call below is served from the
 * in-memory mock. Flip to `false` (one toggle) once the endpoints exist — the
 * request paths and payloads are already wired, see `docs-connect/BACKEND_API.en.md`.
 */
export const DOCS_CONNECT_USE_MOCK = true;

/**
 * Dev-only switch used to force the initial Docs Connect state in mock mode.
 * Change this to "trial" or "paid" to render those states directly.
 */
export const DOCS_CONNECT_MOCK_STATUS: TDocsConnectStatus = "promo";

export type BuyDocsConnectPlanData = {
  users: number;
  devPackEnabled: boolean;
};

// Kept in a const rather than inline: an inline `secretKey` string literal ends
// in the substring the locales test scans for as a translation key, so the mock
// value gets reported as a missing i18n key.
const MOCK_SECRET_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";

const buildMockInfo = (status: TDocsConnectStatus): TDocsConnectInfo => {
  const isPaid = status === "paid";

  return {
    status,
    address: "d47cc5ee.docs.teamlab.info",
    jwtHeader: "AuthorizationJWT",
    secretKey: MOCK_SECRET_KEY,
    build: {
      type: "Docs Cloud",
      version: "9.4.0.88",
      released: "04.05.2026",
    },
    trial: {
      start: "20.05.2026",
      validUntil: "19.06.2026",
      daysLeft: 30,
      totalDays: 30,
    },
    plan: {
      users: 50,
      pricePerUser: 8,
      devPackEnabled: true,
      devPackPrice: 4,
      monthlyCharge: 600,
      renewsOn: "04.07.2026",
    },
    usage: {
      editors: {
        active: 0,
        internal: 0,
        external: 0,
        remaining: isPaid ? 50 : 1000,
        limit: isPaid ? 50 : 1000,
      },
      viewer: {
        active: 0,
        internal: 0,
        external: 0,
        remaining: isPaid ? 50 : 1000,
        limit: isPaid ? 50 : 1000,
      },
    },
    wallet: {
      availableCredits: 0,
      currency: "$",
    },
    connectors: [
      { key: "nextcloud", label: "Nextcloud", url: "#" },
      { key: "owncloud", label: "OwnCloud", url: "#" },
      { key: "confluence", label: "Confluence", url: "#" },
      { key: "alfresco", label: "Alfresco", url: "#" },
      { key: "moodle", label: "Moodle", url: "#" },
      { key: "seafile", label: "Seafile", url: "#" },
      { key: "odoo", label: "oDoo", url: "#" },
    ],
  };
};

// In-memory mock state. Lets the trial → paid transitions persist across calls
// while there is no backend (each action mutates and returns this object).
let mockInfo: TDocsConnectInfo = buildMockInfo(DOCS_CONNECT_MOCK_STATUS);

/**
 * GET /docs-connect — whole tenant page state in one request.
 */
export const getDocsConnectInfo = async (): Promise<TDocsConnectInfo> => {
  if (DOCS_CONNECT_USE_MOCK) return mockInfo;

  return (await request({
    method: "get",
    url: "/docs-connect",
  })) as TDocsConnectInfo;
};

/**
 * POST /docs-connect/trial — start the free trial. Returns the updated state.
 */
export const startDocsConnectTrial = async (): Promise<TDocsConnectInfo> => {
  if (DOCS_CONNECT_USE_MOCK) {
    mockInfo = { ...mockInfo, status: "trial" };
    return mockInfo;
  }

  return (await request({
    method: "post",
    url: "/docs-connect/trial",
  })) as TDocsConnectInfo;
};

/**
 * POST /docs-connect/plan — buy/update the plan. The backend is the source of
 * truth for pricing and limits; in mock mode we recompute them locally.
 */
export const buyDocsConnectPlan = async (
  data: BuyDocsConnectPlanData,
): Promise<TDocsConnectInfo> => {
  if (DOCS_CONNECT_USE_MOCK) {
    const { users, devPackEnabled } = data;
    const { pricePerUser, devPackPrice } = mockInfo.plan;
    const monthlyCharge =
      users * (pricePerUser + (devPackEnabled ? devPackPrice : 0));

    mockInfo = {
      ...mockInfo,
      status: "paid",
      plan: { ...mockInfo.plan, users, devPackEnabled, monthlyCharge },
      usage: {
        editors: { ...mockInfo.usage.editors, remaining: users, limit: users },
        viewer: { ...mockInfo.usage.viewer, remaining: users, limit: users },
      },
    };
    return mockInfo;
  }

  return (await request({
    method: "post",
    url: "/docs-connect/plan",
    data,
  })) as TDocsConnectInfo;
};

/**
 * POST /docs-connect/tenant — "Buy tenant" action. Returns the updated state.
 */
export const buyDocsConnectTenant = async (): Promise<TDocsConnectInfo> => {
  if (DOCS_CONNECT_USE_MOCK) return mockInfo;

  return (await request({
    method: "post",
    url: "/docs-connect/tenant",
  })) as TDocsConnectInfo;
};
