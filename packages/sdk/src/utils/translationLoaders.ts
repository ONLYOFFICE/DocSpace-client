// (c) Copyright Ascensio System SIA 2009-2026
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

import CommonEn from "PUBLIC_DIR/locales/en/Common.json";

export type TCommon = Record<string, string>;
export type TNsMap = Map<string, TCommon>;
export type TTranslationsMap = Map<string, TNsMap>;

const loaders: Record<string, () => Promise<{ default: TCommon }>> = {
  "ar-SA": () =>
    import(
      /* webpackChunkName: "locale-ar-SA" */ "PUBLIC_DIR/locales/ar-SA/Common.json"
    ),
  az: () =>
    import(
      /* webpackChunkName: "locale-az" */ "PUBLIC_DIR/locales/az/Common.json"
    ),
  bg: () =>
    import(
      /* webpackChunkName: "locale-bg" */ "PUBLIC_DIR/locales/bg/Common.json"
    ),
  cs: () =>
    import(
      /* webpackChunkName: "locale-cs" */ "PUBLIC_DIR/locales/cs/Common.json"
    ),
  de: () =>
    import(
      /* webpackChunkName: "locale-de" */ "PUBLIC_DIR/locales/de/Common.json"
    ),
  "el-GR": () =>
    import(
      /* webpackChunkName: "locale-el-GR" */ "PUBLIC_DIR/locales/el-GR/Common.json"
    ),
  es: () =>
    import(
      /* webpackChunkName: "locale-es" */ "PUBLIC_DIR/locales/es/Common.json"
    ),
  fi: () =>
    import(
      /* webpackChunkName: "locale-fi" */ "PUBLIC_DIR/locales/fi/Common.json"
    ),
  fr: () =>
    import(
      /* webpackChunkName: "locale-fr" */ "PUBLIC_DIR/locales/fr/Common.json"
    ),
  "hy-AM": () =>
    import(
      /* webpackChunkName: "locale-hy-AM" */ "PUBLIC_DIR/locales/hy-AM/Common.json"
    ),
  it: () =>
    import(
      /* webpackChunkName: "locale-it" */ "PUBLIC_DIR/locales/it/Common.json"
    ),
  "ja-JP": () =>
    import(
      /* webpackChunkName: "locale-ja-JP" */ "PUBLIC_DIR/locales/ja-JP/Common.json"
    ),
  "ko-KR": () =>
    import(
      /* webpackChunkName: "locale-ko-KR" */ "PUBLIC_DIR/locales/ko-KR/Common.json"
    ),
  "lo-LA": () =>
    import(
      /* webpackChunkName: "locale-lo-LA" */ "PUBLIC_DIR/locales/lo-LA/Common.json"
    ),
  lv: () =>
    import(
      /* webpackChunkName: "locale-lv" */ "PUBLIC_DIR/locales/lv/Common.json"
    ),
  nl: () =>
    import(
      /* webpackChunkName: "locale-nl" */ "PUBLIC_DIR/locales/nl/Common.json"
    ),
  pl: () =>
    import(
      /* webpackChunkName: "locale-pl" */ "PUBLIC_DIR/locales/pl/Common.json"
    ),
  pt: () =>
    import(
      /* webpackChunkName: "locale-pt" */ "PUBLIC_DIR/locales/pt/Common.json"
    ),
  "pt-BR": () =>
    import(
      /* webpackChunkName: "locale-pt-BR" */ "PUBLIC_DIR/locales/pt-BR/Common.json"
    ),
  ro: () =>
    import(
      /* webpackChunkName: "locale-ro" */ "PUBLIC_DIR/locales/ro/Common.json"
    ),
  ru: () =>
    import(
      /* webpackChunkName: "locale-ru" */ "PUBLIC_DIR/locales/ru/Common.json"
    ),
  si: () =>
    import(
      /* webpackChunkName: "locale-si" */ "PUBLIC_DIR/locales/si/Common.json"
    ),
  sk: () =>
    import(
      /* webpackChunkName: "locale-sk" */ "PUBLIC_DIR/locales/sk/Common.json"
    ),
  sl: () =>
    import(
      /* webpackChunkName: "locale-sl" */ "PUBLIC_DIR/locales/sl/Common.json"
    ),
  "sq-AL": () =>
    import(
      /* webpackChunkName: "locale-sq-AL" */ "PUBLIC_DIR/locales/sq-AL/Common.json"
    ),
  "sr-Cyrl-RS": () =>
    import(
      /* webpackChunkName: "locale-sr-Cyrl-RS" */ "PUBLIC_DIR/locales/sr-Cyrl-RS/Common.json"
    ),
  "sr-Latn-RS": () =>
    import(
      /* webpackChunkName: "locale-sr-Latn-RS" */ "PUBLIC_DIR/locales/sr-Latn-RS/Common.json"
    ),
  tr: () =>
    import(
      /* webpackChunkName: "locale-tr" */ "PUBLIC_DIR/locales/tr/Common.json"
    ),
  "uk-UA": () =>
    import(
      /* webpackChunkName: "locale-uk-UA" */ "PUBLIC_DIR/locales/uk-UA/Common.json"
    ),
  vi: () =>
    import(
      /* webpackChunkName: "locale-vi" */ "PUBLIC_DIR/locales/vi/Common.json"
    ),
  "zh-CN": () =>
    import(
      /* webpackChunkName: "locale-zh-CN" */ "PUBLIC_DIR/locales/zh-CN/Common.json"
    ),
};

export const SUPPORTED_LOCALES = ["en", ...Object.keys(loaders)];

export const createInitialTranslations = (): TTranslationsMap => {
  const nsMap: TNsMap = new Map([["Common", CommonEn as TCommon]]);
  return new Map([["en", nsMap]]);
};

export const loadLocale = async (lng: string): Promise<TNsMap | null> => {
  if (lng === "en") {
    return new Map([["Common", CommonEn as TCommon]]);
  }
  const loader = loaders[lng];
  if (!loader) return null;
  const mod = await loader();
  const data = (mod.default ?? mod) as TCommon;
  return new Map([["Common", data]]);
};
