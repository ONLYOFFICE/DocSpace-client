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

import { DateTime } from "luxon";

/**
 * Parses various date formats to a luxon DateTime
 * This is a flexible parser that tries multiple formats
 * @param date - Date to parse (Date, string, DateTime, null, or undefined)
 * @returns DateTime object or null if parsing fails
 */
export function parseToDateTime(
  date: Date | string | DateTime | null | undefined,
): DateTime | null {
  if (!date) return null;

  // Already a DateTime
  if (date instanceof DateTime) {
    return date.isValid ? date : null;
  }

  // JavaScript Date object
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return null;
    return DateTime.fromJSDate(date);
  }

  // String - try multiple formats
  if (typeof date === "string") {
    // Check for null/empty date patterns
    if (
      date === "0001-01-01T00:00:00.0000000Z" ||
      date === "0001-01-01T00:00:00Z" ||
      date === ""
    ) {
      return null;
    }

    // Try ISO format first (most common)
    let dt = DateTime.fromISO(date);
    if (dt.isValid) return dt;

    // Try SQL format
    dt = DateTime.fromSQL(date);
    if (dt.isValid) return dt;

    // Try HTTP format
    dt = DateTime.fromHTTP(date);
    if (dt.isValid) return dt;

    // Try RFC2822 format
    dt = DateTime.fromRFC2822(date);
    if (dt.isValid) return dt;

    // Try parsing with specific formats commonly used in the codebase
    const formats = [
      "yyyy-MM-dd HH:mm:ss",
      "yyyy-MM-dd HH:mm",
      "yyyy-MM-dd",
      "dd MMM yyyy",
      "dd MMMM yyyy",
      "MM/dd/yyyy",
      "dd/MM/yyyy",
      "yyyy/MM/dd",
    ];

    for (const format of formats) {
      dt = DateTime.fromFormat(date, format);
      if (dt.isValid) return dt;
    }

    // Last resort: try JavaScript Date parsing
    const jsDate = new Date(date);
    if (!Number.isNaN(jsDate.getTime())) {
      return DateTime.fromJSDate(jsDate);
    }
  }

  return null;
}

/**
 * Parses a date string with a specific format
 * @param dateString - Date string to parse
 * @param format - Expected format (luxon format tokens)
 * @param options - Optional locale
 * @returns DateTime object or null if parsing fails
 */
export function parseWithFormat(
  dateString: string,
  format: string,
  options?: { locale?: string },
): DateTime | null {
  const opts = options?.locale ? { locale: options.locale } : undefined;
  const dt = DateTime.fromFormat(dateString, format, opts);
  return dt.isValid ? dt : null;
}

/**
 * Parses an ISO date string
 * @param isoString - ISO 8601 date string
 * @returns DateTime object or null if parsing fails
 */
export function parseISO(isoString: string): DateTime | null {
  const dt = DateTime.fromISO(isoString);
  return dt.isValid ? dt : null;
}

/**
 * Creates a DateTime from individual components
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day of month
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param second - Second (0-59)
 * @returns DateTime object
 */
export function createDateTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): DateTime {
  return DateTime.fromObject({ year, month, day, hour, minute, second });
}

/**
 * Creates a DateTime from milliseconds since epoch
 * @param millis - Milliseconds since Unix epoch
 * @returns DateTime object
 */
export function fromMillis(millis: number): DateTime {
  return DateTime.fromMillis(millis);
}

/**
 * Creates a DateTime from seconds since epoch
 * @param seconds - Seconds since Unix epoch
 * @returns DateTime object
 */
export function fromSeconds(seconds: number): DateTime {
  return DateTime.fromSeconds(seconds);
}

/**
 * Creates a DateTime representing now
 * @returns Current DateTime
 */
export function now(): DateTime {
  return DateTime.now();
}

/**
 * Creates a DateTime representing today at midnight
 * @returns Today's DateTime at 00:00:00
 */
export function today(): DateTime {
  return DateTime.now().startOf("day");
}

/**
 * Creates a DateTime in UTC
 * @param options - DateTime components
 * @returns UTC DateTime
 */
export function utc(options?: {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}): DateTime {
  if (options) {
    return DateTime.fromObject(options, { zone: "utc" });
  }
  return DateTime.utc();
}
