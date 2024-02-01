import difference from "lodash/difference";

import { LANGUAGE } from "../constants";

import { getCookie } from "./cookie";

export function getLanguage(lng: string) {
  try {
    if (!lng) return lng;

    let language = lng === "en-US" || lng === "en-GB" ? "en" : lng;

    const splitted = lng.split("-");

    if (splitted.length === 2 && splitted[0] === splitted[1].toLowerCase()) {
      language = splitted[0];
    }

    return language;
  } catch (error) {
    return lng;
  }
}

export const getBannerAttribute = () => {
  const bar = document.getElementById("bar-banner");
  const mainBar = document.getElementById("main-bar");
  const rects = mainBar ? mainBar.getBoundingClientRect() : null;

  const headerHeight = bar
    ? 108 + 50
    : mainBar && rects?.height
      ? rects.height + 40
      : 48 + 50;

  const sectionHeaderTop = bar
    ? "108px"
    : rects
      ? `${rects.height + 40}px`
      : "48px";

  const sectionHeaderMarginTop = bar
    ? "106px"
    : rects
      ? `${rects.height + 36}px`
      : "46px";

  const loadLanguagePath = async () => {
    if (!window?.firebaseHelper) return;

    const lng: string[] | string = getCookie(LANGUAGE) || "en";

    const language = getLanguage(typeof lng === "object" ? lng[0] : lng);

    const localBar = (localStorage.getItem("bar") || "")
      .split(",")
      .filter((b) => b.length > 0);

    const localItem = localStorage.getItem("barClose");

    const closed = localItem ? JSON.parse(localItem) : [];

    const banner = difference(localBar, closed);

    let index = Number(localStorage.getItem("barIndex") || 0);
    if (index >= banner.length) {
      index -= 1;
    }
    const currentBar = banner[index];

    let htmlUrl =
      currentBar && window.firebaseHelper?.config?.authDomain
        ? `https://${window.firebaseHelper.config.authDomain}/${language}/${currentBar}/index.html`
        : null;

    if (htmlUrl) {
      await fetch(htmlUrl).then((data) => {
        if (data.ok) return;
        htmlUrl = null;
      });
    }

    return [htmlUrl, currentBar];
  };

  return {
    headerHeight,
    sectionHeaderTop,
    sectionHeaderMarginTop,
    loadLanguagePath,
  };
};
