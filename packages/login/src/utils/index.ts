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

import { thirdPartyLogin } from "@docspace/shared/utils/loginUtils";
import { Nullable, TTranslation } from "@docspace/shared/types";

import { MessageKey } from "./enums";
import { TTimeZone } from "@docspace/shared/api/settings/types";
import { TTimeZoneOption } from "@/types";

import { findWindows } from "windows-iana";

export async function oAuthLogin(profile: string) {
  let isSuccess = false;
  try {
    await thirdPartyLogin(profile);
    isSuccess = true;
    const redirectPath = localStorage.getItem("redirectPath");

    if (redirectPath) {
      localStorage.removeItem("redirectPath");
      window.location.href = redirectPath;
    }
  } catch (e) {
    isSuccess = false;
    return isSuccess;
  }

  localStorage.removeItem("profile");
  localStorage.removeItem("code");

  return isSuccess;
}

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
    default:
      return t("Common:Error");
  }
};

export const getInvitationLinkData = (encodeString: string) => {
  const fromBinaryStr = (encodeString: string) => {
    const decodeStr = atob(encodeString);

    const decoder = new TextDecoder();
    const charCodeArray = Uint8Array.from(
      { length: decodeStr.length },
      (element, index) => decodeStr.charCodeAt(index),
    );

    return decoder.decode(charCodeArray);
  };

  const decodeString = fromBinaryStr(encodeString);
  const queryParams = JSON.parse(decodeString) as {
    email: string;
    roomName: string;
    firstName: string;
    lastName: string;
    type: string;
  };

  return queryParams;
};

export const getEmailFromInvitation = (encodeString: Nullable<string>) => {
  if (!encodeString) return "";

  const queryParams = getInvitationLinkData(encodeString);

  if (!queryParams || !queryParams.email) return "";

  return queryParams.email;
};

export const mapTimezonesToArray = (
  timezones: TTimeZone[],
): TTimeZoneOption[] => {
  return timezones.map((timezone) => {
    return { key: timezone.id, label: timezone.displayName };
  });
};

export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

export const getSelectZone = (
  zones: TTimeZoneOption[],
  userTimezone: string,
) => {
  const defaultTimezone = "UTC";
  const isWindowsZones = zones[0].key === "Dateline Standard Time"; //TODO: get from server

  if (isWindowsZones) {
    const windowsZoneKey = findWindows(userTimezone);
    return (
      zones.filter((zone) => zone.key === windowsZoneKey[0]) ||
      zones.filter((zone) => zone.key === defaultTimezone)
    );
  }
  return (
    zones.filter((zone) => zone.key === userTimezone) ||
    zones.filter((zone) => zone.key === defaultTimezone)
  );
};

export const getStringFromSearchParams = (searchParams: {
  [key: string]: string;
}): string => {
  let stringSearchParams = "";

  for (const [key, value] of Object.entries(searchParams)) {
    stringSearchParams += `&${key}=${value}`;
  }

  return stringSearchParams.slice(1);
};
