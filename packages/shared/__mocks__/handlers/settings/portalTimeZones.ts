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

export const PATH = "settings/timezones";

export const portalTimeZonesSuccess = {
  response: [
    {
      id: "Pacific/Niue",
      displayName: "(UTC-11:00) Niue Time",
    },
    {
      id: "Pacific/Midway",
      displayName: "(UTC-11:00) Samoa Standard Time (Midway)",
    },
    {
      id: "Pacific/Pago_Pago",
      displayName: "(UTC-11:00) Samoa Standard Time (Pago Pago)",
    },
    {
      id: "Pacific/Rarotonga",
      displayName: "(UTC-10:00) Cook Islands Standard Time (Rarotonga)",
    },
    {
      id: "America/Adak",
      displayName: "(UTC-10:00) Hawaii-Aleutian Time (Adak)",
    },
    {
      id: "Pacific/Honolulu",
      displayName: "(UTC-10:00) Hawaii-Aleutian Time (Adak) (Honolulu)",
    },
    {
      id: "Pacific/Tahiti",
      displayName: "(UTC-10:00) Tahiti Time",
    },
    {
      id: "Pacific/Marquesas",
      displayName: "(UTC-09:30) Marquesas Time",
    },
    {
      id: "America/Anchorage",
      displayName: "(UTC-09:00) Alaska Time (Anchorage)",
    },
    {
      id: "America/Juneau",
      displayName: "(UTC-09:00) Alaska Time (Juneau)",
    },
    { id: "UTC", displayName: "(UTC) Coordinated Universal Time" },
  ],
  count: 10,
  links: [
    {
      href: `/${API_PREFIX}/${PATH}`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const portalTimeZoneResolver = (): Response => {
  return new Response(JSON.stringify(portalTimeZonesSuccess));
};

export const portalTimeZoneHandler = (port: string) => {
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/${PATH}`, () => {
    return portalTimeZoneResolver();
  });
};
