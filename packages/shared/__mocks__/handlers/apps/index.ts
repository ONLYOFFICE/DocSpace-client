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


import { delay, http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_APPS = "apps";

/**
 * The apps the installation configuration declares, all enabled - the default
 * of `buildtools/config/appsettings.json`. A spec that needs one switched off
 * passes its id in `disabled`.
 */
export const APP_IDS = [
  "ai-files",
  "ai-rooms",
  "ai-forms",
  "ai-agents",
  "docs-cloud",
  "ai-arbiter",
  "e2e-rooms",
] as const;

export type AppsHandlerOptions = {
  /** Apps an administrator switched off in Settings -> Apps. */
  disabled?: string[];
  /** Answer the list with this HTTP error instead. */
  errorStatus?: number;
  /** Never answer the list, to hold the page in its loading state. */
  pending?: boolean;
};

const apiUrl = (port: string, path: string) =>
  `${BASE_URL}:${port}/${API_PREFIX}/${path}`;

const jsonResponse = (response: unknown, statusCode = 200) =>
  new Response(JSON.stringify({ response, count: 1, status: 0, statusCode }), {
    status: statusCode,
  });

export const appsList = (disabled: string[] = []) =>
  APP_IDS.map((id) => ({ id, enabled: !disabled.includes(id) }));

export const appsHandler = (
  port: string,
  { disabled, errorStatus, pending }: AppsHandlerOptions = {},
) =>
  http.get(apiUrl(port, PATH_APPS), async () => {
    if (pending) await delay("infinite");

    if (errorStatus)
      return jsonResponse({ message: "Apps are unavailable" }, errorStatus);

    return jsonResponse(appsList(disabled));
  });

/** Echoes the new state back, as `PUT apps/{id}/enabled` does. */
export const setAppEnabledHandler = (port: string) =>
  http.put(apiUrl(port, `${PATH_APPS}/:id/enabled`), async ({ params, request }) => {
    const body = (await request.json()) as { enabled?: boolean };

    return jsonResponse({ id: params.id, enabled: !!body?.enabled });
  });

export const appsHandlers = (port: string) => [
  appsHandler(port),
  setAppEnabledHandler(port),
];
