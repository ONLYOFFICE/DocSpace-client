// (c) Copyright Ascensio System SIA 2009-2024
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

"use server";

import { headers } from "next/headers";

import {
  TCapabilities,
  TGetColorTheme,
  TSettings,
  TThirdPartyProvider,
  TVersionBuild,
} from "@docspace/shared/api/settings/types";
import { TenantStatus } from "@docspace/shared/enums";
import { TWhiteLabel } from "@docspace/shared/utils/whiteLabelHelper";

const API_PREFIX = "api/2.0";

export const getBaseUrl = () => {
  const hdrs = headers();

  const host = hdrs.get("x-forwarded-host");
  const proto = hdrs.get("x-forwarded-proto");

  const baseURL = `${proto}://${host}`;

  return baseURL;
};

export const getAPIUrl = () => {
  const baseUrl = getBaseUrl();
  const baseAPIUrl = `${baseUrl}/${API_PREFIX}`;

  return baseAPIUrl;
};

export const createRequest = (
  paths: string[],
  newHeaders: [string, string][],
  method: string,
  body?: string,
) => {
  const hdrs = new Headers(headers());

  const apiURL = getAPIUrl();

  newHeaders.forEach((hdr) => {
    if (hdr[0]) hdrs.set(hdr[0], hdr[1]);
  });

  const urls = paths.map((path) => `${apiURL}${path}`);

  const requests = urls.map(
    (url) => new Request(url, { headers: hdrs, method, body }),
  );

  return requests;
};

export const checkIsAuthenticated = async () => {
  const [request] = createRequest(["/authentication"], [["", ""]], "GET");

  const res = (await (await fetch(request)).json()).response as boolean;

  return res;
};

export const getData = async () => {
  const requests = createRequest(
    [
      `/settings?withPassword=false`,
      `/settings/version/build`,
      `/settings/colortheme`,
      `/settings/whitelabel/logos`,
    ],
    [["", ""]],
    "GET",
  );

  const actions = requests.map((req) => fetch(req));

  const [settingsRes, ...rest] = await Promise.all(actions);

  const settings = (await settingsRes.json()).response as TSettings;

  if (settings.tenantStatus !== TenantStatus.PortalRestore) {
    const settingsRequests = createRequest(
      [`/people/thirdparty/providers`, `/capabilities`, `/settings/ssov2`],
      [["", ""]],
      "GET",
    );

    const settingsActions = settingsRequests.map((req) => fetch(req));

    const response = await Promise.all(settingsActions);

    response.forEach((res) => rest.push(res));
  }

  const otherRes = (await Promise.all(rest.map((r) => r.json()))).map(
    (r) => r.response,
  );

  return [settings, ...otherRes] as [
    TSettings,
    TVersionBuild,
    TGetColorTheme,
    TWhiteLabel[],
    TThirdPartyProvider[] | undefined,
    TCapabilities | undefined,
    any,
  ];
};
