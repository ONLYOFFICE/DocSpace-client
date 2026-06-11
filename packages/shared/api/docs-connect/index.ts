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

import type { TDocsConnectInfo, TDocsConnectStatus } from "./types";

/**
 * Dev-only switch used to force the initial Docs Connect state while there is no
 * backend yet. Change this to "trial" or "paid" to render those states directly.
 * Once the real endpoint exists, `getDocsConnectInfo` should call it instead of
 * returning the mock below.
 */
export const DOCS_CONNECT_MOCK_STATUS: TDocsConnectStatus = "promo";

const buildMockInfo = (status: TDocsConnectStatus): TDocsConnectInfo => {
  const isPaid = status === "paid";

  return {
    status,
    address: "d47cc5ee.docs.teamlab.info",
    jwtHeader: "AuthorizationJWT",
    secretKey: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    build: {
      type: "Docs Cloud",
      version: "9.4.0.88",
      released: "04.05.2026",
    },
    trial: {
      start: "20.05.2026",
      validUntil: "19.06.2026",
      daysLeft: 30,
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
      availableCredits: 1000,
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

/**
 * FAKE API — returns the whole Docs Connect configuration in a single request.
 * Replace the body with a real `request(...)` call once the backend is ready.
 */
export const getDocsConnectInfo = (): Promise<TDocsConnectInfo> => {
  return Promise.resolve(buildMockInfo(DOCS_CONNECT_MOCK_STATUS));
};
