/* eslint-disable no-useless-escape */
/* eslint-disable prefer-template */

import { LANGUAGE } from "../constants";

export function getCookie(name: string) {
  if (name === LANGUAGE) {
    const url = new URL(window.location.href);
    const culture = url.searchParams.get("culture");

    if (url.pathname === "/confirm/LinkInvite" && culture) {
      return culture;
    }
  }

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
  options: { [key: string]: unknown } = {},
) {
  options = {
    path: "/",
    ...options,
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie =
    encodeURIComponent(name) + "=" + encodeURIComponent(value);

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
