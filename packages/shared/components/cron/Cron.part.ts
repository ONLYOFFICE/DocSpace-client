// (c) Copyright Ascensio System SIA 2009-2025
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
