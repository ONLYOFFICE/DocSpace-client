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

import { DateTime, Info } from "luxon";

/**
 * Converts moment.js format tokens to luxon format tokens
 * Uses placeholder-based replacement to avoid conflicts between similar tokens
 * @param momentFormat - moment.js format string
 * @returns luxon format string
 */
export function convertMomentFormatToLuxon(momentFormat: string): string {
  // Token mappings from moment to luxon
  // Order matters: longer tokens must be processed first
  const tokenMappings: Array<[string, string]> = [
    // Locale-aware formats (must be first as they are full tokens)
    ["LLLL", "ffff"],
    ["LLL", "fff"],
    ["LL", "DDD"],
    ["LTS", "tt"],
    ["LT", "t"],
    ["L", "D"],
    ["llll", "ffff"],
    ["lll", "fff"],
    ["ll", "DDD"],
    ["l", "D"],
    // Year
    ["YYYY", "yyyy"],
    ["YY", "yy"],
    // Month
    ["MMMM", "MMMM"],
    ["MMM", "MMM"],
    ["MM", "MM"],
    ["Mo", "M"], // ordinal not supported in luxon, use plain
    // Day of year
    ["DDDD", "ooo"],
    ["DDD", "o"],
    // Day of month (uppercase D in moment)
    ["DD", "dd"],
    ["Do", "d"], // ordinal not supported in luxon, use plain
    // Weekday (lowercase d in moment)
    ["dddd", "cccc"],
    ["ddd", "ccc"],
    ["dd", "ccccc"],
    // Hour
    ["HH", "HH"],
    ["hh", "hh"],
    // Minute
    ["mm", "mm"],
    // Second
    ["ss", "ss"],
    // Millisecond
    ["SSS", "SSS"],
    ["SS", "SS"],
    // AM/PM
    ["A", "a"],
    // Timezone
    ["ZZ", "ZZZ"],
    ["Z", "ZZ"],
    // Single character tokens (must be last)
    ["M", "M"],
    ["D", "d"],
    ["d", "c"],
    ["H", "H"],
    ["h", "h"],
    ["m", "m"],
    ["s", "s"],
    ["S", "S"],
    ["a", "a"],
  ];

  // Use placeholder-based replacement to avoid conflicts
  // Step 1: Replace all moment tokens with unique placeholders
  const placeholders: Map<string, string> = new Map();
  let result = momentFormat;

  for (let i = 0; i < tokenMappings.length; i++) {
    const [momentToken, luxonToken] = tokenMappings[i];
    const placeholder = `\x00${i}\x00`; // Use null characters as delimiters
    placeholders.set(placeholder, luxonToken);

    // Use word boundary for locale formats, literal match for others
    const isLocaleFormat = /^[Ll]+[Tt]?[Ss]?$/.test(momentToken);
    if (isLocaleFormat) {
      result = result.replace(
        new RegExp(`\\b${momentToken}\\b`, "g"),
        placeholder,
      );
    } else {
      // For regular tokens, replace only if not already a placeholder
      result = result.split(momentToken).join(placeholder);
    }
  }

  // Step 2: Replace all placeholders with luxon tokens
  Array.from(placeholders.entries()).forEach(([placeholder, luxonToken]) => {
    result = result.split(placeholder).join(luxonToken);
  });

  return result;
}

/**
 * Formats a date using luxon with optional locale and timezone
 * @param date - Date to format (Date, string, or DateTime)
 * @param format - Format string (luxon format or moment format with conversion)
 * @param options - Optional locale and timezone settings
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | DateTime | null | undefined,
  format: string,
  options?: {
    locale?: string;
    timezone?: string;
    convertFromMomentFormat?: boolean;
  },
): string {
  if (!date) return "";

  let dt: DateTime;

  if (date instanceof DateTime) {
    dt = date;
  } else if (date instanceof Date) {
    dt = DateTime.fromJSDate(date);
  } else if (typeof date === "string") {
    dt = DateTime.fromISO(date);
    if (!dt.isValid) {
      dt = DateTime.fromSQL(date);
    }
    if (!dt.isValid) {
      dt = DateTime.fromHTTP(date);
    }
    if (!dt.isValid) {
      // Try parsing as RFC2822
      dt = DateTime.fromRFC2822(date);
    }
    if (!dt.isValid) {
      // Try parsing with JavaScript Date as fallback
      const jsDate = new Date(date);
      if (!Number.isNaN(jsDate.getTime())) {
        dt = DateTime.fromJSDate(jsDate);
      }
    }
  } else {
    return "";
  }

  if (!dt.isValid) return "";

  // Apply timezone if provided
  if (options?.timezone) {
    dt = dt.setZone(options.timezone);
  }

  // Apply locale if provided
  if (options?.locale) {
    dt = dt.setLocale(options.locale);
  }

  // Convert moment format to luxon format if needed
  const luxonFormat = options?.convertFromMomentFormat
    ? convertMomentFormatToLuxon(format)
    : format;

  return dt.toFormat(luxonFormat);
}

/**
 * Formats a date to localized string using luxon's preset formats
 * @param date - Date to format
 * @param preset - Preset format type
 * @param options - Optional locale and timezone settings
 * @returns Formatted date string
 */
export function formatDateLocalized(
  date: Date | string | DateTime | null | undefined,
  preset:
    | "DATE_SHORT"
    | "DATE_MED"
    | "DATE_MED_WITH_WEEKDAY"
    | "DATE_FULL"
    | "DATE_HUGE"
    | "TIME_SIMPLE"
    | "TIME_WITH_SECONDS"
    | "TIME_WITH_SHORT_OFFSET"
    | "TIME_WITH_LONG_OFFSET"
    | "TIME_24_SIMPLE"
    | "TIME_24_WITH_SECONDS"
    | "TIME_24_WITH_SHORT_OFFSET"
    | "TIME_24_WITH_LONG_OFFSET"
    | "DATETIME_SHORT"
    | "DATETIME_MED"
    | "DATETIME_FULL"
    | "DATETIME_HUGE",
  options?: {
    locale?: string;
    timezone?: string;
  },
): string {
  if (!date) return "";

  let dt: DateTime;

  if (date instanceof DateTime) {
    dt = date;
  } else if (date instanceof Date) {
    dt = DateTime.fromJSDate(date);
  } else if (typeof date === "string") {
    dt = DateTime.fromISO(date);
    if (!dt.isValid) {
      const jsDate = new Date(date);
      if (!Number.isNaN(jsDate.getTime())) {
        dt = DateTime.fromJSDate(jsDate);
      }
    }
  } else {
    return "";
  }

  if (!dt.isValid) return "";

  if (options?.timezone) {
    dt = dt.setZone(options.timezone);
  }

  if (options?.locale) {
    dt = dt.setLocale(options.locale);
  }

  return dt.toLocaleString(DateTime[preset]);
}

/**
 * Gets localized weekday names
 * @param format - Format type: "narrow", "short", "long"
 * @param locale - Locale string
 * @returns Array of weekday names
 */
export function getWeekdays(
  format: "narrow" | "short" | "long" = "long",
  locale?: string,
): string[] {
  return Info.weekdays(format, { locale });
}

/**
 * Gets localized month names
 * @param format - Format type: "narrow", "short", "long", "numeric", "2-digit"
 * @param locale - Locale string
 * @returns Array of month names
 */
export function getMonths(
  format: "narrow" | "short" | "long" | "numeric" | "2-digit" = "long",
  locale?: string,
): string[] {
  return Info.months(format, { locale });
}

/**
 * Gets the short month names (3 letters)
 * @param locale - Locale string
 * @returns Array of short month names
 */
export function getMonthsShort(locale?: string): string[] {
  return Info.months("short", { locale });
}

/**
 * Gets the localized weekday name by weekday index (1-7, Monday is 1)
 * @param weekday - Weekday index (1 = Monday, 7 = Sunday in luxon)
 * @param format - Format type: "narrow", "short", "long"
 * @param locale - Locale string
 * @returns Weekday name
 */
export function getWeekdayName(
  weekday: number,
  format: "narrow" | "short" | "long" = "long",
  locale?: string,
): string {
  const weekdays = Info.weekdays(format, { locale });
  // luxon weekdays are 1-indexed (1 = Monday, 7 = Sunday)
  // Array is 0-indexed, so subtract 1
  const index = ((weekday - 1) % 7 + 7) % 7;
  return weekdays[index] || "";
}

/**
 * Gets the first day of week for a locale (0 = Sunday, 1 = Monday, etc.)
 * Most locales use Monday (1), US/Canada use Sunday (0)
 * @param locale - Locale string
 * @returns First day of week (0-6)
 */
export function getFirstDayOfWeek(locale?: string): number {
  // Locales that typically start the week on Sunday
  const sundayStartLocales = [
    "en-US",
    "en-CA",
    "en-AU",
    "he",
    "ar",
    "ko",
    "zh",
    "ja",
  ];

  const normalizedLocale = locale?.toLowerCase() || "en";

  // Check if the locale starts with any of the Sunday-start locales
  const startsSunday = sundayStartLocales.some(
    (l) =>
      normalizedLocale === l.toLowerCase() ||
      normalizedLocale.startsWith(`${l.toLowerCase()}-`),
  );

  return startsSunday ? 0 : 1;
}
