import { LANGUAGE } from "COMMON_DIR/constants";

export function getCookie(name) {
  if (name === LANGUAGE) {
    const url = new URL(window.location.href);
    const culture = url.searchParams.get("culture");

    if (url.pathname == "/confirm/LinkInvite" && culture) {
      return culture;
    }
  }

  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
