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

import { DateTime, DurationLikeObject } from "luxon";
import { parseToDateTime } from "./parse";

export type DateUnit =
  | "years"
  | "months"
  | "weeks"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

/**
 * Adds a duration to a date
 * @param date - Base date
 * @param amount - Amount to add
 * @param unit - Unit of time
 * @returns New DateTime with added duration
 */
export function addToDate(
  date: Date | string | DateTime | null | undefined,
  amount: number,
  unit: DateUnit,
): DateTime | null {
  const dt = parseToDateTime(date);
  if (!dt) return null;

  const duration: DurationLikeObject = { [unit]: amount };
  return dt.plus(duration);
}

/**
 * Subtracts a duration from a date
 * @param date - Base date
 * @param amount - Amount to subtract
 * @param unit - Unit of time
 * @returns New DateTime with subtracted duration
 */
export function subtractFromDate(
  date: Date | string | DateTime | null | undefined,
  amount: number,
  unit: DateUnit,
): DateTime | null {
  const dt = parseToDateTime(date);
  if (!dt) return null;

  const duration: DurationLikeObject = { [unit]: amount };
  return dt.minus(duration);
}

/**
 * Gets the start of a time unit
 * @param date - Base date
 * @param unit - Unit to get start of
 * @returns DateTime at the start of the specified unit
 */
export function startOf(
  date: Date | string | DateTime | null | undefined,
  unit: "year" | "month" | "week" | "day" | "hour" | "minute" | "second",
): DateTime | null {
  const dt = parseToDateTime(date);
  if (!dt) return null;

  return dt.startOf(unit);
}

/**
 * Gets the end of a time unit
 * @param date - Base date
 * @param unit - Unit to get end of
 * @returns DateTime at the end of the specified unit
 */
export function endOf(
  date: Date | string | DateTime | null | undefined,
  unit: "year" | "month" | "week" | "day" | "hour" | "minute" | "second",
): DateTime | null {
  const dt = parseToDateTime(date);
  if (!dt) return null;

  return dt.endOf(unit);
}

/**
 * Creates a DateTime from the current moment with specified additions
 * Equivalent to moment().add(X, unit)
 * @param amount - Amount to add
 * @param unit - Unit of time
 * @returns DateTime with added duration from now
 */
export function fromNowPlus(amount: number, unit: DateUnit): DateTime {
  return DateTime.now().plus({ [unit]: amount });
}

/**
 * Creates a DateTime from the current moment with specified subtractions
 * Equivalent to moment().subtract(X, unit)
 * @param amount - Amount to subtract
 * @param unit - Unit of time
 * @returns DateTime with subtracted duration from now
 */
export function fromNowMinus(amount: number, unit: DateUnit): DateTime {
  return DateTime.now().minus({ [unit]: amount });
}

/**
 * Gets the number of days in the month of the given date
 * @param date - Date to check
 * @returns Number of days in the month
 */
export function daysInMonth(
  date: Date | string | DateTime | null | undefined,
): number {
  const dt = parseToDateTime(date);
  if (!dt) return 0;

  return dt.daysInMonth ?? 0;
}

/**
 * Sets specific date/time components
 * @param date - Base date
 * @param values - Object with values to set
 * @returns New DateTime with updated values
 */
export function setDateValues(
  date: Date | string | DateTime | null | undefined,
  values: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
  },
): DateTime | null {
  const dt = parseToDateTime(date);
  if (!dt) return null;

  return dt.set(values);
}

/**
 * Gets specific date/time components
 * @param date - Date to extract from
 * @returns Object with date components
 */
export function getDateValues(
  date: Date | string | DateTime | null | undefined,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  weekday: number;
} | null {
  const dt = parseToDateTime(date);
  if (!dt) return null;

  return {
    year: dt.year,
    month: dt.month,
    day: dt.day,
    hour: dt.hour,
    minute: dt.minute,
    second: dt.second,
    millisecond: dt.millisecond,
    weekday: dt.weekday,
  };
}
