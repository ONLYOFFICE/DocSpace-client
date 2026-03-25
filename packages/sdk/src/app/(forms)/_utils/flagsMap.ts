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

/** Lookup by locale code */
const FLAGS_MAP: Record<string, string> = {
  "ar-SA": arSA,
  az,
  bg,
  cs,
  "de-AT": deAT,
  "de-CH": deCH,
  de,
  "el-GR": elGR,
  "en-GB": enGB,
  "en-US": enUS,
  "es-MX": esMX,
  es,
  fi,
  fr,
  "hy-AM": hyAM,
  it,
  "ja-JP": jaJP,
  "ko-KR": koKR,
  "lo-LA": loLA,
  lv,
  nl,
  pl,
  "pt-BR": ptBR,
  pt,
  ro,
  ru,
  si,
  sk,
  sl,
  "sq-AL": sqAL,
  sr,
  tr,
  "uk-UA": ukUA,
  vi,
  "zh-CN": zhCN,
};

/** Lookup by language name (case-insensitive) → locale code */
const LANGUAGE_NAME_MAP: Record<string, string> = {
  arabic: "ar-SA",
  azerbaijani: "az",
  bulgarian: "bg",
  czech: "cs",
  german: "de",
  greek: "el-GR",
  english: "en-US",
  spanish: "es",
  finnish: "fi",
  french: "fr",
  armenian: "hy-AM",
  italian: "it",
  japanese: "ja-JP",
  korean: "ko-KR",
  lao: "lo-LA",
  latvian: "lv",
  dutch: "nl",
  polish: "pl",
  portuguese: "pt",
  romanian: "ro",
  russian: "ru",
  sinhala: "si",
  slovak: "sk",
  slovenian: "sl",
  albanian: "sq-AL",
  serbian: "sr",
  turkish: "tr",
  ukrainian: "uk-UA",
  vietnamese: "vi",
  chinese: "zh-CN",
};

/**
 * Looks up a flag SVG URL by locale code (e.g. "en-US", "fr")
 * or language name (e.g. "German", "English").
 * Returns undefined if no matching flag is found.
 */
export function getFlagUrl(key: string): string | undefined {
  // Direct locale code match
  const direct = FLAGS_MAP[key];
  if (direct) return direct;

  // Language name match (case-insensitive)
  const locale = LANGUAGE_NAME_MAP[key.toLowerCase()];
  if (locale) return FLAGS_MAP[locale];

  return undefined;
}
