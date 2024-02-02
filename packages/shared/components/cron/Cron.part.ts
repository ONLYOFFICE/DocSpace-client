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
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
