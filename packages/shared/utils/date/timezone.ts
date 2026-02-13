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

import { DateTime, Settings } from "luxon";
import { parseToDateTime } from "./parse";

// Note: Window.timezone is declared in types/index.ts

/**
 * Gets the browser's timezone
 * @returns IANA timezone string (e.g., "America/New_York")
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Gets the application timezone (from window.timezone or browser default)
 * @returns IANA timezone string
 */
export function getAppTimezone(): string {
  return window.timezone || getBrowserTimezone();
}

/**
 * Converts a date to a specific timezone
 * @param date - Date to convert
 * @param timezone - Target timezone (IANA format)
 * @returns DateTime in the specified timezone
 */
export function toTimezone(
  date: Date | string | DateTime | null | undefined,
  timezone: string,
): DateTime | null {
  const dt = parseToDateTime(date);
  if (!dt) return null;

  return dt.setZone(timezone);
}

/**
 * Converts a date to the application timezone
 * @param date - Date to convert
 * @returns DateTime in the application timezone
 */
export function toAppTimezone(
  date: Date | string | DateTime | null | undefined,
): DateTime | null {
  return toTimezone(date, getAppTimezone());
}

/**
 * Checks if a timezone string is valid
 * @param timezone - Timezone to validate
 * @returns True if the timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  const dt = DateTime.now().setZone(timezone);
  return dt.isValid;
}

/**
 * Gets the UTC offset for a timezone
 * @param timezone - Timezone to check
 * @returns UTC offset in minutes
 */
export function getTimezoneOffset(timezone: string): number {
  const dt = DateTime.now().setZone(timezone);
  return dt.offset;
}

/**
 * Formats a date with timezone applied
 * @param date - Date to format
 * @param format - Format string (luxon format)
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatWithTimezone(
  date: Date | string | DateTime | null | undefined,
  format: string,
  options?: {
    timezone?: string;
    locale?: string;
  },
): string {
  const dt = parseToDateTime(date);
  if (!dt) return "";

  let result = dt;

  const tz = options?.timezone || getAppTimezone();
  result = result.setZone(tz);

  if (options?.locale) {
    result = result.setLocale(options.locale);
  }

  return result.toFormat(format);
}

/**
 * Sets the default timezone for luxon
 * @param timezone - Timezone to set as default
 */
export function setDefaultTimezone(timezone: string): void {
  Settings.defaultZone = timezone;
}

/**
 * Sets the default locale for luxon
 * @param locale - Locale to set as default
 */
export function setDefaultLocale(locale: string): void {
  Settings.defaultLocale = locale;
}

/**
 * Gets Unix timestamp in seconds
 * @param date - Date to convert
 * @returns Unix timestamp (seconds since epoch)
 */
export function toUnixTimestamp(
  date: Date | string | DateTime | null | undefined,
): number {
  const dt = parseToDateTime(date);
  if (!dt) return 0;

  return Math.floor(dt.toMillis() / 1000);
}

/**
 * Creates DateTime from Unix timestamp
 * @param timestamp - Unix timestamp (seconds since epoch)
 * @returns DateTime object
 */
export function fromUnixTimestamp(timestamp: number): DateTime {
  return DateTime.fromSeconds(timestamp);
}

/**
 * Converts DateTime to ISO string
 * @param date - Date to convert
 * @returns ISO 8601 string
 */
export function toISOString(
  date: Date | string | DateTime | null | undefined,
): string {
  const dt = parseToDateTime(date);
  if (!dt) return "";

  return dt.toISO() ?? "";
}

/**
 * Converts DateTime to JavaScript Date object
 * @param dateTime - DateTime to convert
 * @returns JavaScript Date object
 */
export function toJSDate(
  dateTime: DateTime | null | undefined,
): Date | null {
  if (!dateTime || !dateTime.isValid) return null;
  return dateTime.toJSDate();
}
