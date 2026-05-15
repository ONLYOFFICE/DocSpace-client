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

import { DateTime } from "luxon";
import { defaultOptions } from "./Cron.constants";
import {
  arrayToStringPart,
  assertValidArray,
  findDate,
  stringToArrayPart,
  getUnits,
} from "./Cron.utils";
import type { Options, PeriodType } from "./Cron.types";

const units = getUnits();

export const stringToArray = (str: string, full = false) => {
  if (typeof str !== "string") {
    throw new Error("Invalid cron string");
  }
  const parts = str.replace(/\s+/g, " ").trim().split(" ");
  if (parts.length !== 5) {
    throw new Error("Invalid cron string format");
  } else {
    return parts.map((part, idx) => stringToArrayPart(part, units[idx], full));
  }
};

export function arrayToString(arr: number[][], options?: Partial<Options>) {
  assertValidArray(arr);
  const parts = arr.map((part, idx) =>
    arrayToStringPart(part, units[idx], { ...defaultOptions, ...options }),
  );
  return parts.join(" ");
}

export function getCronStringFromValues(
  period: PeriodType,
  months: number[] | undefined,
  monthDays: number[] | undefined,
  weekDays: number[] | undefined,
  hours: number[] | undefined,
  minutes: number[] | undefined,
) {
  const newMonths = period === "Year" && months ? months : [];
  const newMonthDays =
    (period === "Year" || period === "Month") && monthDays ? monthDays : [];
  const newWeekDays =
    (period === "Year" || period === "Month" || period === "Week") && weekDays
      ? weekDays
      : [];
  const newHours =
    period !== "Minute" && period !== "Hour" && hours ? hours : [];
  const newMinutes = period !== "Minute" && minutes ? minutes : [];

  const parsedArray = arrayToString([
    newMinutes,
    newHours,
    newMonthDays,
    newMonths,
    newWeekDays,
  ]);

  return parsedArray;
}

export const getNextSynchronization = (
  cronString: string,
  timezone?: string,
) => {
  try {
    const cron = stringToArray(cronString, true);
    assertValidArray(cron);
    let date: DateTime = DateTime.utc();

    if (timezone !== "00:00") date = date.setZone(timezone);

    if (!date.isValid) {
      throw new Error("Invalid timezone provided");
    }

    if (date.second > 0) {
      // plus a minute to the date to prevent returning dates in the past
      date = date.plus({ minute: 1 });
    }

    return findDate(cron, date);
  } catch (error) {
    console.log(error);
  }
};
