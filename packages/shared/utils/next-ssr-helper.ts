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

import { headers, cookies } from "next/headers";

const API_PREFIX = "api/2.0";
const APISYSTEM_PREFIX = "apisystem";

export const getBaseUrl = async () => {
  const hdrs = await headers();

  const host = hdrs.get("x-forwarded-host");
  const proto = hdrs.get("x-forwarded-proto");

  const baseURL = `${proto}://${host}`;

  return baseURL;
};

export const getAPIUrl = async (apiSystem?: boolean) => {
  const baseUrl = process.env.API_HOST?.trim() ?? (await getBaseUrl());

  const baseAPIUrl = `${baseUrl}/${!apiSystem ? API_PREFIX : APISYSTEM_PREFIX}`;

  return baseAPIUrl;
};

export const createRequest = async (
  paths: string[],
  newHeaders: [string, string][],
  method: string,
  body?: string,
  apiSystem?: boolean,
  signals: (AbortSignal | null | undefined)[] = [],
) => {
  const hdrs = new Headers(await headers());
  hdrs.delete("content-length");
  const cookieStore = await cookies();

  const apiURL = await getAPIUrl(apiSystem);

  newHeaders.forEach((hdr) => {
    if (hdr[0]) hdrs.set(hdr[0], hdr[1]);
  });

  const baseURL = await getBaseUrl();

  if (baseURL && process.env.API_HOST?.trim()) hdrs.set("origin", baseURL);

  // hdrs.set("x-docspace-address", baseURL);

  const authToken = cookieStore.get("asc_auth_key")?.value;

  if (authToken) {
    hdrs.set("Authorization", authToken);
  }

  cookieStore
    .getAll()
    .map((c) => {
      if (c.name.includes("sharelink")) {
        return c;
      }

      return false;
    })
    .filter((v) => !!v)
    .forEach((value) => {
      hdrs.set(value.name, value.value);

      return value;
    });

  const urls = paths.map((path) => `${apiURL}${path}`);

  const requests = urls.map(
    (url, i) =>
      new Request(url, { headers: hdrs, method, body, signal: signals[i] }),
  );

  return requests;
};
