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

import { cookies } from "next/headers";

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";

import {
  TCapabilities,
  TGetColorTheme,
  TGetSsoSettings,
  TPortalCultures,
  TSettings,
  TThirdPartyProvider,
  TVersionBuild,
} from "@docspace/shared/api/settings/types";
import { TenantStatus } from "@docspace/shared/enums";

export const checkIsAuthenticated = async () => {
  const [request] = createRequest(["/authentication"], [["", ""]], "GET");

  const res = await fetch(request);

  if (!res.ok) return;

  const isAuth = await res.json();

  return isAuth.response as boolean;
};

export async function getSettings() {
  const [getSettings] = createRequest(
    [`/settings?withPassword=true`],
    [["", ""]],
    "GET",
  );

  const settingsRes = await fetch(getSettings);

  if (settingsRes.status === 403) return `access-restricted`;

  if (settingsRes.status === 404) return "portal-not-found";

  if (!settingsRes.ok) return;

  const settings = await settingsRes.json();

  return settings.response as TSettings;
}

export async function getVersionBuild() {
  const [getSettings] = createRequest(
    [`/settings/version/build`],
    [["", ""]],
    "GET",
  );

  const res = await fetch(getSettings);

  if (!res.ok) return;

  const versionBuild = await res.json();

  return versionBuild.response as TVersionBuild;
}

export async function getColorTheme() {
  const [getSettings] = createRequest(
    [`/settings/colortheme`],
    [["", ""]],
    "GET",
  );

  const res = await fetch(getSettings);

  if (!res.ok) return;

  const colorTheme = await res.json();

  return colorTheme.response as TGetColorTheme;
}

export async function getThirdPartyProviders() {
  const [getThirdParty] = createRequest(
    [`/people/thirdparty/providers`],
    [["", ""]],
    "GET",
  );

  const res = await fetch(getThirdParty);

  if (!res.ok) return;

  const thirdParty = await res.json();

  return thirdParty.response as TThirdPartyProvider[];
}

export async function getCapabilities() {
  const [getCapabilities] = createRequest([`/capabilities`], [["", ""]], "GET");

  const res = await fetch(getCapabilities);

  if (!res.ok) return;

  const capabilities = await res.json();

  return capabilities.response as TCapabilities;
}

export async function getSSO() {
  const [getSSO] = createRequest([`/settings/ssov2`], [["", ""]], "GET");

  const res = await fetch(getSSO);

  if (!res.ok) return;

  const sso = await res.json();

  return sso.response as TGetSsoSettings;
}
