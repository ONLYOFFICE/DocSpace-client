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

import { Nullable, TTranslation } from "@docspace/shared/types";

import { parseURL } from "@docspace/shared/utils/common";
import { getCookie } from "@docspace/shared/utils";

import { getAvailablePortals as getAvailablePortalsServer } from "./actions";

import { MessageKey, OAuth2ErrorKey } from "./enums";

export const getMessageFromKey = (messageKey: number) => {
  return MessageKey[messageKey];
};

export const getMessageKeyTranslate = (t: TTranslation, message: string) => {
  switch (message) {
    case "Error":
      return t("Common:Error");
    case "None":
      return t("Common:UnknownError");
    case "ErrorUserNotFound":
      return t("Errors:ErrorUserNotFound");
    case "ErrorExpiredActivationLink":
      return t("Errors:ErrorExpiredActivationLink");
    case "ErrorInvalidActivationLink":
      return t("Errors:ErrorInvalidActivationLink");
    case "ErrorConfirmURLError":
      return t("Errors:ErrorConfirmURLError");
    case "ErrorNotCorrectEmail":
      return t("Common:IncorrectEmail");
    case "LoginWithBruteForce":
      return t("Errors:LoginWithBruteForce");
    case "RecaptchaInvalid":
      return t("Errors:RecaptchaInvalid");
    case "LoginWithAccountNotFound":
      return t("Errors:LoginWithAccountNotFound");
    case "InvalidUsernameOrPassword":
      return t("Errors:InvalidUsernameOrPassword");
    case "SsoSettingsDisabled":
      return t("Errors:SsoSettingsDisabled");
    case "ErrorNotAllowedOption":
      return t("Errors:ErrorNotAllowedOption");
    case "SsoSettingsEmptyToken":
      return t("Errors:SsoSettingsEmptyToken");
    case "SsoSettingsNotValidToken":
      return t("Errors:SsoSettingsNotValidToken");
    case "SsoSettingsCantCreateUser":
      return t("Errors:SsoSettingsCantCreateUser");
    case "SsoSettingsUserTerminated":
      return t("Errors:SsoSettingsUserTerminated");
    case "SsoError":
      return t("Errors:SsoError");
    case "SsoAuthFailed":
      return t("Errors:SsoAuthFailed");
    case "SsoAttributesNotFound":
      return t("Errors:SsoAttributesNotFound");
    case "QuotaPaidUserLimitError":
      return t("Common:QuotaPaidUserLimitError");
    case "InvalidLink":
      return t("Common:InvalidLink");
    default:
      return t("Common:Error");
  }
};

export const getOAuthMessageKeyTranslation = (
  t: TTranslation,
  messageKey?: OAuth2ErrorKey,
) => {
  if (!messageKey) return;
  switch (messageKey) {
    case OAuth2ErrorKey.asc_retrieval_error:
      return t("Common:SomethingWentWrong");
    case OAuth2ErrorKey.client_disabled_error:
      return t("Errors:OAuthApplicationDisabled");
    case OAuth2ErrorKey.client_not_found_error:
      return t("Errors:OAuthApplicationEmpty");
    case OAuth2ErrorKey.client_permission_denied_error:
      return t("Common:AccessDenied");
    case OAuth2ErrorKey.missing_client_id_error:
      return t("Errors:OAuthClientEmpty");
    case OAuth2ErrorKey.something_went_wrong_error:
      return t("Common:UnknownError");
    case OAuth2ErrorKey.missing_asc_cookie_error:
    default:
      return t("Common:Error");
  }
};

export const getInvitationLinkData = (encodeString: Nullable<string>) => {
  if (!encodeString) return;

  let locationObject;

  try {
    const decodeString = decodeURIComponent(encodeString);
    locationObject = parseURL(decodeString);
  } catch (e) {
    console.error("parse error", e);
  }

  return locationObject;
};

export const getEmailFromInvitation = (encodeString: Nullable<string>) => {
  if (!encodeString) return "";

  const queryParams = getInvitationLinkData(encodeString);

  if (!queryParams || !queryParams.email) return "";

  return queryParams.email;
};

export const getStringFromSearchParams = (searchParams: {
  [key: string]: string;
}): string => {
  const stringSearchParams = Object.entries(searchParams).reduce(
    (acc, [key, value]) => `${acc}&${key}=${value}`,
    "",
  );

  return stringSearchParams.slice(1);
};

export const getRedirectURL = () => {
  const redirect_url = getCookie("x-redirect-authorization-uri");

  if (!redirect_url) {
    const scopes = getCookie("x-scopes");
    const url = getCookie("x-url");

    let redirectUrl = url;

    if (scopes) redirectUrl += `&scope=${scopes?.split(";").join("%20")}`;

    return redirectUrl!;
  }

  const decodedRedirectUrl = window.atob(
    redirect_url.replace(/-/g, "+").replace(/_/g, "/"),
  );

  return decodedRedirectUrl;
};

export const encodeParams = (str: string) => {
  return str
    .split("&")
    .map((pair) => {
      const [key, value] = pair.split("=");
      const encodedValue = encodeURIComponent(value);
      return `${key}=${encodedValue}`;
    })
    .join("&");
};

export async function getAvailablePortals(data: {
  Email: string;
  PasswordHash: string;
  recaptchaResponse?: string | null | undefined;
  recaptchaType?: unknown | undefined;
}) {
  const config = window.ClientConfig;

  const path = `/portal/signin`;

  if (config?.oauth2?.apiSystem.length) {
    const urls: string[] = config.oauth2.apiSystem.map(
      (url: string) => `https://${url}/apisystem${path}`,
    );

    const actions = await Promise.allSettled(
      urls.map((url: string) =>
        fetch(url, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ),
    );

    const fullFiledActions = actions.filter(
      (action) => action.status === "fulfilled",
    );

    if (fullFiledActions.length) {
      const portalsRes = fullFiledActions
        .filter((action) => {
          return action.value.ok;
        })
        .map((action) => action.value);

      if (!portalsRes.length) {
        const portals = await fullFiledActions[0].value.json();

        return { ...portals, status: fullFiledActions[0].status };
      }

      const portals = (await Promise.all(portalsRes.map((res) => res.json())))
        .map(
          (p: { tenants: { portalLink: string; portalName: string }[] }) =>
            p.tenants,
        )
        .flat();

      return portals;
    }
  }

  const portalsRes = await getAvailablePortalsServer(data);

  if (portalsRes.error) return portalsRes;

  return portalsRes as { portalLink: string; portalName: string }[];
}
