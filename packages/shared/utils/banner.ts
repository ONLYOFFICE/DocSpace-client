/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import difference from "lodash/difference";

import { LANGUAGE } from "../constants";

import { getCookie } from "@docspace/ui-kit/utils/cookie";

export function getLanguage(lng: string) {
  try {
    if (!lng) return lng;

    let language = lng === "en-US" || lng === "en-GB" ? "en" : lng;

    const splitted = lng.split("-");

    if (splitted.length === 2 && splitted[0] === splitted[1].toLowerCase()) {
      [language] = splitted;
    }

    return language;
  } catch {
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
