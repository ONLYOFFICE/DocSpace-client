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

export const PATH_USER_QUOTA_SETTINGS = "settings/userquotasettings";
export const PATH_CHECK_RECALCULATE_QUOTA = "settings/checkrecalculatequota";

const envelope = (response: unknown) =>
  new Response(
    JSON.stringify({ response, count: 1, status: 0, statusCode: 200 }),
  );

// A portal whose quotas have already been counted: with no
// `lastRecalculateDate` the page starts a recalculation on every open.
export const quotaSettingsSuccess = {
  enableQuota: false,
  defaultQuota: -1,
  lastRecalculateDate: "2024-01-01T00:00:00.0000000Z",
  userLastRecalculateDate: "2024-01-01T00:00:00.0000000Z",
};

export const userQuotaSettingsHandler = (
  port: string,
  overrides?: Partial<typeof quotaSettingsSuccess>,
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_USER_QUOTA_SETTINGS}`,
    () => envelope({ ...quotaSettingsSuccess, ...overrides }),
  );
};

export const checkRecalculateQuotaHandler = (
  port: string,
  needRecalculating: boolean = false,
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_CHECK_RECALCULATE_QUOTA}`,
    () => envelope(needRecalculating),
  );
};
