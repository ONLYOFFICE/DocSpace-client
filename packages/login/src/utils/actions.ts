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

import { cookies, headers } from "next/headers";

import {
  createRequest,
  getBaseUrl,
} from "@docspace/shared/utils/next-ssr-helper";
import { TUser } from "@docspace/shared/api/people/types";
import {
  TCapabilities,
  TCompanyInfo,
  TGetColorTheme,
  TGetSsoSettings,
  TPasswordSettings,
  TPortalCultures,
  TSettings,
  TThirdPartyProvider,
  TTimeZone,
  TVersionBuild,
} from "@docspace/shared/api/settings/types";
import { Encoder } from "@docspace/shared/utils/encoder";
import {
  TConfirmLinkParams,
  TConfirmLinkResult,
  TTfaSecretKeyAndQR,
} from "@/types";
import { TScope } from "@docspace/shared/utils/oauth/types";
import { transformToClientProps } from "@docspace/shared/utils/oauth";
import {
  colorThemeSuccess,
  getMockResponse,
  isLicenseRequiredFalseSuccess,
  machineNameSuccess,
  portalCulturesSuccess,
  portalTimeZonesSuccess,
  settingsPasswordSuccess,
  settingsSuccessWithAuthWizard,
} from "@docspace/shared/__mocks__/e2e";


const IS_TEST = process.env.TEST;

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

  const settingsRes = IS_TEST
    ? getMockResponse(settingsSuccessWithAuthWizard)
    : await fetch(getSettings);

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
  const [getColorTheme] = createRequest(
    [`/settings/colortheme`],
    [["", ""]],
    "GET",
  );

  const res = IS_TEST
    ? getMockResponse(colorThemeSuccess)
    : await fetch(getColorTheme);

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

export async function getUser() {
  const hdrs = headers();
  const cookie = hdrs.get("cookie");

  const [getUser] = createRequest([`/people/@self`], [["", ""]], "GET");

  if (!cookie?.includes("asc_auth_key")) return undefined;
  const userRes = await fetch(getUser);

  if (userRes.status === 401) return undefined;

  if (!userRes.ok) return;

  const user = await userRes.json();

  return user.response as TUser;
}

export async function getScopeList() {
  const [getScopeList] = createRequest([`/scopes`], [["", ""]], "GET");

  const scopeList = await fetch(getScopeList);

  if (!scopeList.ok) return;

  const scopes = await scopeList.json();

  return scopes as TScope[];
}

export async function getOAuthClient(clientId: string) {
  const [getOAuthClient] = createRequest(
    [`/clients/${clientId}/public/info`],
    [["", ""]],
    "GET",
  );

  const oauthClient = await fetch(getOAuthClient);

  if (!oauthClient.ok) return;

  const client = await oauthClient.json();

  return transformToClientProps(client);
}

export async function getPortalCultures() {
  const [getPortalCultures] = createRequest(
    [`/settings/cultures`],
    [["", ""]],
    "GET",
  );

  const res = IS_TEST
    ? getMockResponse(portalCulturesSuccess)
    : await fetch(getPortalCultures);

  if (!res.ok) return;

  const cultures = await res.json();

  return cultures.response as TPortalCultures;
}

export async function gitAvailablePortals(data: {
  email: string;
  passwordHash: string;
}) {
  const [gitAvailablePortals] = createRequest(
    [`/portal/signin`],
    [["Content-Type", "application/json"]],
    "POST",
    JSON.stringify(data),
    true,
  );

  console.log(gitAvailablePortals.url);

  const response = await fetch(gitAvailablePortals);
  if (!response.ok) return null;

  const { response: portals } = await response.json();

  console.log(portals);

  // return config;
}

export async function getConfig() {
  const baseUrl = getBaseUrl();
  const config = await (
    await fetch(`${baseUrl}/static/scripts/config.json`)
  ).json();

  return config;
}

export async function getCompanyInfoSettings() {
  const [getCompanyInfoSettings] = createRequest(
    [`/settings/rebranding/company`],
    [["", ""]],
    "GET",
  );

  const res = await fetch(getCompanyInfoSettings);

  if (!res.ok) throw new Error(res.statusText);

  const passwordSettings = await res.json();

  return passwordSettings.response as TCompanyInfo;
}

export async function getPortalPasswordSettings(
  confirmKey: string | null = null,
) {
  const [getPortalPasswordSettings] = createRequest(
    [`/settings/security/password`],
    [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
    "GET",
  );
  const res = IS_TEST
    ? getMockResponse(settingsPasswordSuccess)
    : await fetch(getPortalPasswordSettings);

  if (!res.ok) return;

  const passwordSettings = await res.json();

  return passwordSettings.response as TPasswordSettings;
}

export async function getUserFromConfirm(
  userId: string,
  confirmKey: string | null = null,
) {
  const [getUserFromConfirm] = createRequest(
    [`/people/${userId}`],
    [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
    "GET",
  );

  const res = await fetch(getUserFromConfirm);

  if (!res.ok) return;

  const user = await res.json();

  if (user && user.displayName) {
    user.displayName = Encoder.htmlDecode(user.displayName);
  }

  return user.response as TUser;
}

export async function getMachineName(confirmKey: string | null = null) {
  const [getMachineName] = createRequest(
    [`/settings/machine`],
    [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
    "GET",
  );

  const res = IS_TEST
    ? getMockResponse(machineNameSuccess)
    : await fetch(getMachineName);

  if (!res.ok) throw new Error(res.statusText);

  const machineName = await res.json();

  return machineName.response as string;
}

export async function getIsLicenseRequired() {
  const [getIsLicenseRequired] = createRequest(
    [`/settings/license/required`],
    [["", ""]],
    "GET",
  );

  const res = IS_TEST
    ? getMockResponse(isLicenseRequiredFalseSuccess, headers())
    : await fetch(getIsLicenseRequired);

  if (!res.ok) throw new Error(res.statusText);

  const isLicenseRequire = await res.json();

  return isLicenseRequire.response as boolean;
}

export async function getPortalTimeZones(confirmKey: string | null = null) {
  const [getPortalTimeZones] = createRequest(
    [`/settings/timezones`],
    [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
    "GET",
  );

  const res = IS_TEST
    ? getMockResponse(portalTimeZonesSuccess)
    : await fetch(getPortalTimeZones);

  if (!res.ok) throw new Error(res.statusText);

  const portalTimeZones = await res.json();

  return portalTimeZones.response as TTimeZone[];
}

export async function getTfaSecretKeyAndQR(confirmKey: string | null = null) {
  const [getTfaSecretKeyAndQR] = createRequest(
    [`/settings/tfaapp/setup`],
    [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
    "GET",
  );

  const res = await fetch(getTfaSecretKeyAndQR);

  if (!res.ok) throw new Error(res.statusText);

  const tfaSecretKeyAndQR = await res.json();

  return tfaSecretKeyAndQR.response as TTfaSecretKeyAndQR;
}

export async function checkConfirmLink(data: TConfirmLinkParams) {
  const [checkConfirmLink] = createRequest(
    [`/authentication/confirm`],
    [["Content-Type", "application/json"]],
    "POST",
    JSON.stringify(data),
  );

  const response = await fetch(checkConfirmLink);

  if (!response.ok) throw new Error(response.statusText);

  const result = await response.json();

  return result.response as TConfirmLinkResult;
}
