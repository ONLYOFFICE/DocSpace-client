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

  if (authToken) hdrs.set("Authorization", authToken);

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
