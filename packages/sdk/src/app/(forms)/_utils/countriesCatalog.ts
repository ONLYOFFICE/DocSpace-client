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

import arSA from "PUBLIC_DIR/images/flags/ar-SA.react.svg?url";
import az from "PUBLIC_DIR/images/flags/az.react.svg?url";
import bg from "PUBLIC_DIR/images/flags/bg.react.svg?url";
import cs from "PUBLIC_DIR/images/flags/cs.react.svg?url";
import deAT from "PUBLIC_DIR/images/flags/de-AT.react.svg?url";
import deCH from "PUBLIC_DIR/images/flags/de-CH.react.svg?url";
import de from "PUBLIC_DIR/images/flags/de.react.svg?url";
import elGR from "PUBLIC_DIR/images/flags/el-GR.react.svg?url";
import enGB from "PUBLIC_DIR/images/flags/en-GB.react.svg?url";
import enUS from "PUBLIC_DIR/images/flags/en-US.react.svg?url";
import esMX from "PUBLIC_DIR/images/flags/es-MX.react.svg?url";
import es from "PUBLIC_DIR/images/flags/es.react.svg?url";
import fi from "PUBLIC_DIR/images/flags/fi.react.svg?url";
import fr from "PUBLIC_DIR/images/flags/fr.react.svg?url";
import hyAM from "PUBLIC_DIR/images/flags/hy-AM.react.svg?url";
import it from "PUBLIC_DIR/images/flags/it.react.svg?url";
import jaJP from "PUBLIC_DIR/images/flags/ja-JP.react.svg?url";
import koKR from "PUBLIC_DIR/images/flags/ko-KR.react.svg?url";
import loLA from "PUBLIC_DIR/images/flags/lo-LA.react.svg?url";
import lv from "PUBLIC_DIR/images/flags/lv.react.svg?url";
import nl from "PUBLIC_DIR/images/flags/nl.react.svg?url";
import pl from "PUBLIC_DIR/images/flags/pl.react.svg?url";
import ptBR from "PUBLIC_DIR/images/flags/pt-BR.react.svg?url";
import pt from "PUBLIC_DIR/images/flags/pt.react.svg?url";
import ro from "PUBLIC_DIR/images/flags/ro.react.svg?url";
import ru from "PUBLIC_DIR/images/flags/ru.react.svg?url";
import si from "PUBLIC_DIR/images/flags/si.react.svg?url";
import sk from "PUBLIC_DIR/images/flags/sk.react.svg?url";
import sl from "PUBLIC_DIR/images/flags/sl.react.svg?url";
import sqAL from "PUBLIC_DIR/images/flags/sq-AL.react.svg?url";
import sr from "PUBLIC_DIR/images/flags/sr.react.svg?url";
import tr from "PUBLIC_DIR/images/flags/tr.react.svg?url";
import ukUA from "PUBLIC_DIR/images/flags/uk-UA.react.svg?url";
import vi from "PUBLIC_DIR/images/flags/vi.react.svg?url";
import zhCN from "PUBLIC_DIR/images/flags/zh-CN.react.svg?url";

// ISO 3166-1 alpha-2 country code (uppercase).
export type CountryCode = string;

export type CountryEntry = {
  /** ISO 3166-1 alpha-2 code, uppercase. Single source of truth for flag mapping. */
  code: CountryCode;
  /** Imported SVG asset URL. */
  flagAsset: string;
  /**
   * Folder-title aliases that resolve to this country.
   * Match is case-insensitive after trim. Include common short/long forms,
   * and (for backward compatibility) language names that previously mapped here.
   */
  aliases: readonly string[];
};

export const COUNTRIES: readonly CountryEntry[] = [
  {
    code: "SA",
    flagAsset: arSA,
    aliases: ["Saudi Arabia", "KSA", "Kingdom of Saudi Arabia", "Arabic"],
  },
  {
    code: "AZ",
    flagAsset: az,
    aliases: ["Azerbaijan", "Azerbaijani"],
  },
  {
    code: "BG",
    flagAsset: bg,
    aliases: ["Bulgaria", "Bulgarian"],
  },
  {
    code: "CZ",
    flagAsset: cs,
    aliases: ["Czech Republic", "Czechia", "Czech"],
  },
  {
    code: "AT",
    flagAsset: deAT,
    aliases: ["Austria"],
  },
  {
    code: "CH",
    flagAsset: deCH,
    aliases: ["Switzerland"],
  },
  {
    code: "DE",
    flagAsset: de,
    aliases: ["Germany", "German", "Deutschland"],
  },
  {
    code: "GR",
    flagAsset: elGR,
    aliases: ["Greece", "Greek"],
  },
  {
    code: "GB",
    flagAsset: enGB,
    aliases: [
      "United Kingdom",
      "Great Britain",
      "Britain",
      "UK",
      "U.K.",
      "England",
    ],
  },
  {
    code: "US",
    flagAsset: enUS,
    aliases: [
      "United States",
      "United States of America",
      "USA",
      "U.S.",
      "U.S.A.",
      "America",
      "English",
    ],
  },
  {
    code: "MX",
    flagAsset: esMX,
    aliases: ["Mexico"],
  },
  {
    code: "ES",
    flagAsset: es,
    aliases: ["Spain", "Spanish", "Espa\u00F1a"],
  },
  {
    code: "FI",
    flagAsset: fi,
    aliases: ["Finland", "Finnish"],
  },
  {
    code: "FR",
    flagAsset: fr,
    aliases: ["France", "French"],
  },
  {
    code: "AM",
    flagAsset: hyAM,
    aliases: ["Armenia", "Armenian"],
  },
  {
    code: "IT",
    flagAsset: it,
    aliases: ["Italy", "Italian", "Italia"],
  },
  {
    code: "JP",
    flagAsset: jaJP,
    aliases: ["Japan", "Japanese"],
  },
  {
    code: "KR",
    flagAsset: koKR,
    aliases: ["South Korea", "Korea", "Republic of Korea", "Korean"],
  },
  {
    code: "LA",
    flagAsset: loLA,
    aliases: ["Laos", "Lao"],
  },
  {
    code: "LV",
    flagAsset: lv,
    aliases: ["Latvia", "Latvian"],
  },
  {
    code: "NL",
    flagAsset: nl,
    aliases: ["Netherlands", "Holland", "Dutch"],
  },
  {
    code: "PL",
    flagAsset: pl,
    aliases: ["Poland", "Polish"],
  },
  {
    code: "BR",
    flagAsset: ptBR,
    aliases: ["Brazil", "Brasil"],
  },
  {
    code: "PT",
    flagAsset: pt,
    aliases: ["Portugal", "Portuguese"],
  },
  {
    code: "RO",
    flagAsset: ro,
    aliases: ["Romania", "Romanian"],
  },
  {
    code: "RU",
    flagAsset: ru,
    aliases: ["Russia", "Russian Federation", "Russian"],
  },
  {
    code: "LK",
    flagAsset: si,
    aliases: ["Sri Lanka", "Sinhala"],
  },
  {
    code: "SK",
    flagAsset: sk,
    aliases: ["Slovakia", "Slovak"],
  },
  {
    code: "SI",
    flagAsset: sl,
    aliases: ["Slovenia", "Slovenian"],
  },
  {
    code: "AL",
    flagAsset: sqAL,
    aliases: ["Albania", "Albanian"],
  },
  {
    code: "RS",
    flagAsset: sr,
    aliases: ["Serbia", "Serbian"],
  },
  {
    code: "TR",
    flagAsset: tr,
    aliases: ["Turkey", "T\u00FCrkiye", "Turkiye", "Turkish"],
  },
  {
    code: "UA",
    flagAsset: ukUA,
    aliases: ["Ukraine", "Ukrainian"],
  },
  {
    code: "VN",
    flagAsset: vi,
    aliases: ["Vietnam", "Viet Nam", "Vietnamese"],
  },
  {
    code: "CN",
    flagAsset: zhCN,
    aliases: ["China", "PRC", "People's Republic of China", "Chinese"],
  },
];

const FLAGS_BY_CODE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const c of COUNTRIES) map[c.code] = c.flagAsset;
  return map;
})();

const ALIAS_INDEX: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const c of COUNTRIES) {
    // Self-match: the country code itself is also a valid alias.
    map[c.code.toLowerCase()] = c.code;
    for (const a of c.aliases) map[a.trim().toLowerCase()] = c.code;
  }
  return map;
})();

export function getFlagAssetByCode(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return FLAGS_BY_CODE[code.toUpperCase()];
}

export function lookupCountryByAlias(value: string): string | undefined {
  return ALIAS_INDEX[value.trim().toLowerCase()];
}

export function isKnownCountryCode(code: string): boolean {
  return Object.hasOwn(FLAGS_BY_CODE, code.toUpperCase());
}
