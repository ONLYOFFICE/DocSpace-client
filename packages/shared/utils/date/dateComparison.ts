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
import { parseToDateTime } from "./parse";

export type DiffUnit =
  | "years"
  | "months"
  | "weeks"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

/**
 * Calculates the difference between two dates in the specified unit
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Unit for the difference
 * @returns Difference as a number (can be negative if date1 < date2)
 */
export function dateDiff(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
  unit: DiffUnit,
): number {
  const dt1 = parseToDateTime(date1);
  const dt2 = parseToDateTime(date2);

  if (!dt1 || !dt2) return 0;

  const diff = dt1.diff(dt2, unit);
  return diff.as(unit);
}

/**
 * Calculates the absolute difference between two dates in the specified unit
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Unit for the difference
 * @returns Absolute difference as a number
 */
export function dateDiffAbs(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
  unit: DiffUnit,
): number {
  return Math.abs(dateDiff(date1, date2, unit));
}

/**
 * Checks if date1 is before date2
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is before date2
 */
export function isBefore(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
): boolean {
  const dt1 = parseToDateTime(date1);
  const dt2 = parseToDateTime(date2);

  if (!dt1 || !dt2) return false;

  return dt1 < dt2;
}

/**
 * Checks if date1 is after date2
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is after date2
 */
export function isAfter(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
): boolean {
  const dt1 = parseToDateTime(date1);
  const dt2 = parseToDateTime(date2);

  if (!dt1 || !dt2) return false;

  return dt1 > dt2;
}

/**
 * Checks if date1 is the same as date2 (at the specified granularity)
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Granularity for comparison (optional)
 * @returns True if dates are the same
 */
export function isSame(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
  unit?: "year" | "month" | "day" | "hour" | "minute" | "second",
): boolean {
  const dt1 = parseToDateTime(date1);
  const dt2 = parseToDateTime(date2);

  if (!dt1 || !dt2) return false;

  if (!unit) {
    return dt1.equals(dt2);
  }

  return dt1.hasSame(dt2, unit);
}

/**
 * Checks if date is between start and end dates
 * @param date - Date to check
 * @param start - Start of range
 * @param end - End of range
 * @param inclusive - Whether to include boundaries (default: true)
 * @returns True if date is within the range
 */
export function isBetween(
  date: Date | string | DateTime | null | undefined,
  start: Date | string | DateTime | null | undefined,
  end: Date | string | DateTime | null | undefined,
  inclusive = true,
): boolean {
  const dt = parseToDateTime(date);
  const dtStart = parseToDateTime(start);
  const dtEnd = parseToDateTime(end);

  if (!dt || !dtStart || !dtEnd) return false;

  if (inclusive) {
    return dt >= dtStart && dt <= dtEnd;
  }
  return dt > dtStart && dt < dtEnd;
}

/**
 * Checks if the date is valid
 * @param date - Date to check
 * @returns True if the date is valid
 */
export function isValidDate(
  date: Date | string | DateTime | null | undefined,
): boolean {
  const dt = parseToDateTime(date);
  return dt?.isValid ?? false;
}

/**
 * Checks if the given date is in the past
 * @param date - Date to check
 * @returns True if the date is in the past
 */
export function isPast(
  date: Date | string | DateTime | null | undefined,
): boolean {
  const dt = parseToDateTime(date);
  if (!dt) return false;

  return dt < DateTime.now();
}

/**
 * Checks if the given date is in the future
 * @param date - Date to check
 * @returns True if the date is in the future
 */
export function isFuture(
  date: Date | string | DateTime | null | undefined,
): boolean {
  const dt = parseToDateTime(date);
  if (!dt) return false;

  return dt > DateTime.now();
}

/**
 * Checks if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same day
 */
export function isSameDay(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
): boolean {
  return isSame(date1, date2, "day");
}

/**
 * Returns the earlier of two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns The earlier DateTime
 */
export function minDate(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
): DateTime | null {
  const dt1 = parseToDateTime(date1);
  const dt2 = parseToDateTime(date2);

  if (!dt1) return dt2;
  if (!dt2) return dt1;

  return dt1 < dt2 ? dt1 : dt2;
}

/**
 * Returns the later of two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns The later DateTime
 */
export function maxDate(
  date1: Date | string | DateTime | null | undefined,
  date2: Date | string | DateTime | null | undefined,
): DateTime | null {
  const dt1 = parseToDateTime(date1);
  const dt2 = parseToDateTime(date2);

  if (!dt1) return dt2;
  if (!dt2) return dt1;

  return dt1 > dt2 ? dt1 : dt2;
}
