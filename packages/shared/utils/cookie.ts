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

/* eslint-disable no-useless-escape */
/* eslint-disable prefer-template */

import api from "../api";
import { LANGUAGE } from "../constants";

export function getCookie(name: string) {
  if (typeof window !== "undefined" && name === LANGUAGE) {
    const url = new URL(window.location.href);
    const culture = url.searchParams.get("culture");

    if (url.pathname === "/confirm/LinkInvite" && culture) {
      return culture;
    }
  }

  if (typeof document === "undefined") return undefined;

  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)",
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(
  name: string,
  value: string,
  optionsParam: { [key: string]: unknown } = {},
  disableEncoding = false,
) {
  let options: { [key: string]: unknown } = {
    path: "/",
    ...optionsParam,
  };

  if (options.expires instanceof Date) {
    options = {
      ...options,
      expires: options.expires.toUTCString(),
    };
  }

  let updatedCookie = disableEncoding
    ? encodeURIComponent(name) + "=" + value
    : encodeURIComponent(name) + "=" + encodeURIComponent(value);

  Object.keys(options).forEach((optionKey) => {
    updatedCookie += "; " + optionKey;
    const optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  });

  document.cookie = updatedCookie;
}

export function deleteCookie(name: string) {
  setCookie(name, "", {
    "max-age": -1,
  });
}

export function getOAuthJWTSignature() {
  return getCookie("x-signature");
}

export async function setOAuthJWTSignature() {
  const token = await api.oauth.getJWTToken()!;

  // Parse the token payload to extract information
  const tokenPayload = JSON.parse(window.atob(token!.split(".")[1]));

  // Get the token's original expiration time
  const tokenExpDate = new Date(tokenPayload.exp * 1000); // Convert seconds to milliseconds

  // Create a new date with current date but time from token
  const currentDate = new Date();
  const expirationDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    tokenExpDate.getHours(),
    tokenExpDate.getMinutes(),
    tokenExpDate.getSeconds(),
  );

  console.log("Setting token with expiration:", expirationDate);

  setCookie("x-signature", token, { expires: expirationDate });
}
