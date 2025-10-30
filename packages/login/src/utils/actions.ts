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

"use server";

import { headers } from "next/headers";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";
import {
  createRequest,
  getBaseUrl,
} from "@docspace/shared/utils/next-ssr-helper";
import { TUser } from "@docspace/shared/api/people/types";
import { TPortal } from "@docspace/shared/api/portal/types";
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
  TInvitationSettings,
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
  licenseRequiredHandler,
  settingsHandler,
  colorThemeHandler,
  portalCulturesHandler,
  portalPasswordSettingHandler,
  machineNameHandler,
  portalTimeZoneHandler,
  capabilitiesHandler,
  ssoHandler,
  selfHandler,
  thirdPartyProviderHandler,
  getClientHandler,
  confirmHandler,
  tfaAppHandler,
  scopesHandler,
  companyInfoHandler,
  oauthSignInHelper,
  invitationSettingsHandler,
} from "@docspace/shared/__mocks__/e2e";

import { logger } from "@/../logger.mjs";

const IS_TEST = process.env.E2E_TEST;

export const checkIsAuthenticated = async () => {
  logger.debug(`Start GET /authentication`);

  try {
    const [request] = await createRequest(
      ["/authentication"],
      [["", ""]],
      "GET",
    );

    const res = await fetch(request);

    if (!res.ok) {
      logger.error(`GET /authentication failed: ${res.status}`);
      return;
    }

    const isAuth = await res.json();

    return isAuth.response as boolean;
  } catch (error) {
    logger.error(`Error in checkIsAuthenticated: ${error}`);
  }
};

export async function getSettings() {
  logger.debug(`Start GET /settings?withPassword=true`);

  try {
    const [getSettingsRes] = await createRequest(
      [`/settings?withPassword=true`],
      [["", ""]],
      "GET",
    );

    const settingsRes = IS_TEST
      ? settingsHandler(await headers())
      : await fetch(getSettingsRes);

    if (settingsRes.status === 403) {
      logger.error(`GET /settings?withPassword=true failed: access-restricted`);
      return `access-restricted`;
    }

    if (settingsRes.status === 404) {
      logger.error(`GET /settings?withPassword=true failed: portal-not-found`);
      return "portal-not-found";
    }

    if (!settingsRes.ok) {
      logger.error(
        `GET /settings?withPassword=true failed: ${settingsRes.statusText}`,
      );

      return;
    }

    const settings = await settingsRes.json();

    return settings.response as TSettings;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getSettings: ${error}`);
  }
}

export async function getVersionBuild() {
  logger.debug(`Start GET /settings/version/build`);

  try {
    const [getSettingsRes] = await createRequest(
      [`/settings/version/build`],
      [["", ""]],
      "GET",
    );

    const res = await fetch(getSettingsRes);

    if (!res.ok) {
      logger.error(`GET /settings/version/build failed: ${res.status}`);
      return;
    }

    const versionBuild = await res.json();

    return versionBuild.response as TVersionBuild;
  } catch (error) {
    logger.error(`Error in getVersionBuild: ${error}`);
  }
}

export async function getColorTheme() {
  logger.debug(`Start GET /settings/colortheme`);

  try {
    const [getColorThemeRes] = await createRequest(
      [`/settings/colortheme`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST ? colorThemeHandler() : await fetch(getColorThemeRes);

    if (!res.ok) {
      logger.error(`GET /settings/colortheme failed: ${res.status}`);
      return;
    }

    const colorTheme = await res.json();

    return colorTheme.response as TGetColorTheme;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getColorTheme: ${error}`);
  }
}

export async function getThirdPartyProviders(inviteView: boolean = false) {
  logger.debug(
    `Start GET /people/thirdparty/providers?inviteView=${inviteView}`,
  );

  try {
    const [getThirdPartyRes] = await createRequest(
      [`/people/thirdparty/providers?inviteView=${inviteView}`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? thirdPartyProviderHandler(await headers())
      : await fetch(getThirdPartyRes);

    if (!res.ok) {
      logger.error(
        `GET /people/thirdparty/providers?inviteView=${inviteView} failed: ${res.status}`,
      );
      return;
    }

    const thirdParty = await res.json();

    return thirdParty.response as TThirdPartyProvider[];
  } catch (error) {
    logger.error(`Error in getThirdPartyProviders: ${error}`);
  }
}

export async function getCapabilities() {
  logger.debug(`Start GET /capabilities`);

  try {
    const [getCapabilitiesRes] = await createRequest(
      [`/capabilities`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? capabilitiesHandler(await headers())
      : await fetch(getCapabilitiesRes);

    if (!res.ok) {
      logger.error(`GET /capabilities failed: ${res.status}`);
      return;
    }

    const capabilities = await res.json();

    return capabilities.response as TCapabilities;
  } catch (error) {
    logger.error(`Error in getCapabilities: ${error}`);
  }
}

export async function getSSO() {
  logger.debug(`Start GET /settings/ssov2`);

  try {
    const [getSSORes] = await createRequest(
      [`/settings/ssov2`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST ? ssoHandler() : await fetch(getSSORes);

    if (!res.ok) {
      logger.error(`GET /settings/ssov2 failed: ${res.status}`);
      return;
    }

    const sso = await res.json();

    return sso.response as TGetSsoSettings;
  } catch (error) {
    logger.error(`Error in getSSO: ${error}`);
  }
}

export async function getUser() {
  logger.debug(`Start GET /people/@self`);

  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getUserRes] = await createRequest(
      [`/people/@self`],
      [["", ""]],
      "GET",
    );

    if (!cookie?.includes("asc_auth_key")) return undefined;
    const userRes = IS_TEST ? selfHandler() : await fetch(getUserRes);

    if (userRes.status === 401) {
      logger.error(`GET /people/@self failed: ${userRes.status}`);
      return undefined;
    }

    if (!userRes.ok) {
      logger.error(`GET /people/@self failed: ${userRes.status}`);
      return;
    }

    const user = await userRes.json();

    return user.response as TUser;
  } catch (error) {
    logger.error(`Error in getUser: ${error}`);
  }
}

export async function getUserByName() {
  logger.debug(`Start GET /people/firstname.lastname`);

  try {
    const hdrs = await headers();
    const cookie = hdrs.get("cookie");

    const [getUserRes] = await createRequest(
      [`/people/firstname.lastname`],
      [["", ""]],
      "GET",
    );

    if (!cookie?.includes("asc_auth_key")) return undefined;
    const userRes = IS_TEST ? selfHandler() : await fetch(getUserRes);

    if (userRes.status === 401) return undefined;

    if (!userRes.ok) {
      logger.error(`GET /people/firstname.lastname failed: ${userRes.status}`);
      return;
    }

    const user = await userRes.json();

    return user.response as TUser;
  } catch (error) {
    logger.error(`Error in getUserByName: ${error}`);
  }
}

export async function getUserByEmail(
  userEmail: string,
  confirmKey: string | null = null,
) {
  logger.debug(`Start GET /people/email?email=${userEmail}`);
  try {
    const [getUserByEmai] = await createRequest(
      [`/people/email?email=${userEmail}`],
      [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? selfHandler(null, await headers())
      : await fetch(getUserByEmai);

    if (!res.ok) {
      logger.error(
        `GET /people/email?email=${userEmail} failed: ${res.status}`,
      );
      return;
    }

    const user = await res.json();

    if (user.response && user.response.displayName) {
      user.response.displayName = Encoder.htmlDecode(user.response.displayName);
    }

    return user.response as TUser;
  } catch (error) {
    logger.error(`Error in getUserByEmail: ${error}`);
  }
}

export async function getScopeList(token?: string) {
  logger.debug(`Start GET /scopes`);

  try {
    const hdrs: [string, string][] = token
      ? [["Cookie", `x-signature=${token}`]]
      : [["", ""]];

    const [getScopeListRes] = await createRequest([`/scopes`], hdrs, "GET");

    const scopeList = IS_TEST ? scopesHandler() : await fetch(getScopeListRes);

    if (!scopeList.ok) {
      logger.error(`GET /scopes failed: ${scopeList.status}`);
      return;
    }

    const scopes = await scopeList.json();

    return scopes as TScope[];
  } catch (error) {
    logger.error(`Error in getScopeList: ${error}`);
  }
}

export async function getOAuthClient(clientId: string) {
  logger.debug(`Start GET /clients/${clientId}/public/info`);

  try {
    const route = `/clients/${clientId}/public/info`;

    const request = await createRequest([route], [["", ""]], "GET");

    const oauthClient = IS_TEST ? getClientHandler() : await fetch(request[0]);

    if (!oauthClient) {
      logger.error(
        `GET /clients/${clientId}/public/info failed: missing oauthClient`,
      );
      return;
    }

    const client = await oauthClient.json();

    return { client: transformToClientProps(client) };
  } catch (e) {
    logger.error(`error: ${e} getOAuthClient`);
    console.log(e);
  }
}

export async function getPortalCultures() {
  logger.debug(`Start GET /settings/cultures`);

  try {
    const [getPortalCulturesRes] = await createRequest(
      [`/settings/cultures`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? portalCulturesHandler()
      : await fetch(getPortalCulturesRes);

    if (!res.ok) {
      logger.error(`GET /settings/cultures failed: ${res.statusText}`);
      return;
    }

    const cultures = await res.json();

    return cultures.response as TPortalCultures;
  } catch (error) {
    logger.error(`Error in getPortalCultures: ${error}`);
  }
}

export async function getConfig() {
  logger.debug(`Start GET {baseUrl}/static/scripts/config.json`);

  try {
    const baseUrl = await getBaseUrl();

    const config = IS_TEST
      ? new Response(JSON.stringify({}))
      : await (await fetch(`${baseUrl}/static/scripts/config.json`)).json();

    return config;
  } catch (error) {
    logger.error(`Error in getConfig: ${error}`);
  }
}

export async function getCompanyInfoSettings() {
  logger.debug(`Start GET /settings/rebranding/company`);

  try {
    const [getCompanyInfoSettingsRes] = await createRequest(
      [`/settings/rebranding/company`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? companyInfoHandler()
      : await fetch(getCompanyInfoSettingsRes);

    if (!res.ok) {
      logger.error(`GET /settings/rebranding/company failed: ${res.status}`);
      return;
    }

    const passwordSettings = await res.json();

    return passwordSettings.response as TCompanyInfo;
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    logger.error(`Error in getCompanyInfoSettings: ${error}`);
  }
}

export async function getPortalPasswordSettings(
  confirmKey: string | null = null,
) {
  logger.debug(`Start GET /settings/security/password`);

  try {
    const [getPortalPasswordSettingsRes] = await createRequest(
      [`/settings/security/password`],
      [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
      "GET",
    );
    const res = IS_TEST
      ? portalPasswordSettingHandler()
      : await fetch(getPortalPasswordSettingsRes);

    if (!res.ok) {
      logger.error(`GET /settings/security/password failed: ${res.statusText}`);
      return;
    }

    const passwordSettings = await res.json();

    return passwordSettings.response as TPasswordSettings;
  } catch (error) {
    logger.error(`Error in getPortalPasswordSettings: ${error}`);
  }
}

export async function getUserFromConfirm(
  userId: string,
  confirmKey: string | null = null,
) {
  logger.debug(`Start GET /people/${userId}`);

  try {
    const [getUserFromConfirmRes] = await createRequest(
      [`/people/${userId}`],
      [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? selfHandler(null, await headers())
      : await fetch(getUserFromConfirmRes);

    if (!res.ok) {
      logger.error(`GET /people/${userId} failed: ${res.status}`);
      return;
    }

    const user = await res.json();

    if (user.response && user.response.displayName) {
      user.response.displayName = Encoder.htmlDecode(user.response.displayName);
    }

    return user.response as TUser;
  } catch (error) {
    logger.error(`Error in getUserFromConfirm: ${error}`);
  }
}

export async function getMachineName(confirmKey: string | null = null) {
  logger.debug(`Start GET /settings/machine`);

  try {
    const [getMachineNameRes] = await createRequest(
      [`/settings/machine`],
      [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
      "GET",
    );

    const res = IS_TEST ? machineNameHandler() : await fetch(getMachineNameRes);

    if (!res.ok) {
      logger.error(`GET /settings/machine failed: ${res.statusText}`);
      throw new Error(res.statusText);
    }

    const machineName = await res.json();

    return machineName.response as string;
  } catch (error) {
    logger.error(`Error in getMachineName: ${error}`);
    throw error;
  }
}

export async function getIsLicenseRequired() {
  logger.debug(`Start GET /settings/license/required`);

  try {
    const [getIsLicenseRequiredRes] = await createRequest(
      [`/settings/license/required`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? licenseRequiredHandler(await headers())
      : await fetch(getIsLicenseRequiredRes);

    if (!res.ok) {
      logger.error(`GET /settings/license/required failed: ${res.statusText}`);
      throw new Error(res.statusText);
    }

    const isLicenseRequire = await res.json();

    return isLicenseRequire.response as boolean;
  } catch (error) {
    logger.error(`Error in getIsLicenseRequired: ${error}`);
    throw error;
  }
}

export async function getPortalTimeZones(confirmKey: string | null = null) {
  logger.debug(`Start GET /settings/timezones`);

  try {
    const [getPortalTimeZonesRes] = await createRequest(
      [`/settings/timezones`],
      [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? portalTimeZoneHandler()
      : await fetch(getPortalTimeZonesRes);

    if (!res.ok) {
      logger.error(`GET /settings/timezones failed: ${res.statusText}`);
      throw new Error(res.statusText);
    }

    const portalTimeZones = await res.json();

    return portalTimeZones.response as TTimeZone[];
  } catch (error) {
    logger.error(`Error in getPortalTimeZones: ${error}`);
    throw error;
  }
}

export async function getPortal() {
  logger.debug(`Start GET /portal`);

  try {
    const [getPortalRes] = await createRequest([`/portal`], [["", ""]], "GET");

    const res = IS_TEST ? portalTimeZoneHandler() : await fetch(getPortalRes);

    if (!res.ok) {
      logger.error(`GET /portal failed: ${res.status}`);
      throw new Error(res.statusText);
    }

    const portal = await res.json();

    return { ...portal.response, tenantAlias: portal.links[0].href } as TPortal;
  } catch (error) {
    logger.error(`Error in getPortal: ${error}`);
    throw error;
  }
}

export async function getTfaSecretKeyAndQR(confirmKey: string | null = null) {
  logger.debug(`Start GET /settings/tfaapp/setup`);

  try {
    const [getTfaSecretKeyAndQRRes] = await createRequest(
      [`/settings/tfaapp/setup`],
      [confirmKey ? ["Confirm", confirmKey] : ["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? tfaAppHandler()
      : await fetch(getTfaSecretKeyAndQRRes);

    if (!res.ok) {
      logger.error(`GET /settings/tfaapp/setup failed: ${res.status}`);
      throw new Error(res.statusText);
    }

    const tfaSecretKeyAndQR = await res.json();

    return tfaSecretKeyAndQR.response as TTfaSecretKeyAndQR;
  } catch (error) {
    logger.error(`Error in getTfaSecretKeyAndQR: ${error}`);
    throw error;
  }
}

export async function checkConfirmLink(data: TConfirmLinkParams) {
  logger.debug(`Start POST /authentication/confirm`);

  try {
    const [checkConfirmLinkRes] = await createRequest(
      [`/authentication/confirm`],
      [["Content-Type", "application/json"]],
      "POST",
      JSON.stringify(data),
    );

    const response = IS_TEST
      ? confirmHandler(await headers())
      : await fetch(checkConfirmLinkRes);

    if (!response.ok) {
      logger.error(`POST /authentication/confirm failed: ${response.status}`);

      throw new Error(response.statusText);
    }

    const result = await response.json();

    return result.response as TConfirmLinkResult;
  } catch (error) {
    logger.error(`Error in checkConfirmLink: ${error}`);
    throw error;
  }
}

export async function getAvailablePortals(data: {
  Email: string;
  PasswordHash: string;
  recaptchaResponse?: string | null | undefined;
  recaptchaType?: unknown | undefined;
}) {
  logger.debug(`Start POST /portal/signin`);

  try {
    const path = `/portal/signin`;
    const request = await createRequest(
      [path],
      [["Content-Type", "application/json"]],
      "POST",
      JSON.stringify(data),
      true,
    );

    const portalsRes = IS_TEST ? oauthSignInHelper() : await fetch(request[0]);

    const portals = await portalsRes.json();

    if (portals.error) return portals;

    return portals.tenants as { portalLink: string; portalName: string }[];
  } catch (error) {
    logger.error(`Error in getAvailablePortals: ${error}`);
    return { error: { message: String(error) } };
  }
}

export async function getOauthJWTToken() {
  logger.debug(`Start GET /security/oauth2/token`);

  try {
    const [getJWTToken] = await createRequest(
      [`/security/oauth2/token`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? new Response(JSON.stringify({ response: "123456" }))
      : await fetch(getJWTToken);

    if (!res.ok) {
      logger.error(`GET /security/oauth2/token failed: ${res.statusText}`);
      throw new Error(res.statusText);
    }

    const jwtToken = await res.json();

    return jwtToken.response as string;
  } catch (error) {
    logger.error(`Error in getOauthJWTToken: ${error}`);
    throw error;
  }
}

export async function getInvitationSettings() {
  logger.debug(`Start GET /settings/invitationsettings`);

  try {
    const [getInvitationSettingsRes] = await createRequest(
      [`/settings/invitationsettings`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? invitationSettingsHandler()
      : await fetch(getInvitationSettingsRes);

    if (!res.ok) {
      logger.error(`GET /settings/invitationsettings failed: ${res.status}`);
      return;
    }

    const invitationSettings = await res.json();

    return invitationSettings.response as TInvitationSettings;
  } catch (error) {
    logger.error(`Error in getInvitationSettings: ${error}`);
  }
}
