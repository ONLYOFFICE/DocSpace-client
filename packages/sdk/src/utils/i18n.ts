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

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { createInitialTranslations, loadLocale } from "./translationLoaders";

let isInitialized = false;
const loadedLangs = new Set<string>();

const registerBundles = (map: Map<string, Map<string, Record<string, string>>>) => {
  map.forEach((nsList, lang) => {
    nsList.forEach((resources, ns) => {
      i18n.addResourceBundle(lang, ns, resources, true, true);
      loadedLangs.add(lang);
    });
  });
};

export const getI18NInstance = (lng: string) => {
  if (!isInitialized) {
    i18n.use(initReactI18next).init({
      lng,
      fallbackLng: "en",
      load: "currentOnly",
      debug: false,
      interpolation: {
        escapeValue: false,
        format(value, format) {
          if (format === "lowercase") return value.toLowerCase();
          return value;
        },
      },
      ns: ["Common"],
      defaultNS: "Common",
      react: {
        useSuspense: false,
      },
      initImmediate: false,
    });
    registerBundles(createInitialTranslations());
    isInitialized = true;
  } else if (i18n.language !== lng) {
    i18n.changeLanguage(lng);
  }

  if (lng !== "en" && !loadedLangs.has(lng)) {
    loadedLangs.add(lng);
    loadLocale(lng).then((nsMap) => {
      if (!nsMap) return;
      nsMap.forEach((resources, ns) => {
        i18n.addResourceBundle(lng, ns, resources, true, true);
      });
      if (i18n.language === lng) {
        i18n.changeLanguage(lng);
      }
    });
  }


  if (typeof window !== "undefined") {
    if (!window.i18n) {
      window.i18n = { inLoad: [], loaded: {} };
    }
    window.i18n.t = i18n.t.bind(i18n);
    window.i18n.instance = i18n;
  }

  return i18n;
};

