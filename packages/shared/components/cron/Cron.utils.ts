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

import capitalize from "lodash/capitalize";
import type { TFunction } from "i18next";
import { DateTime, Info } from "luxon";

import { Options, PeriodOptionType, PeriodType, Unit } from "./Cron.types";

export const parseNumber = (value: unknown) => {
  if (typeof value === "string") {
    const str: string = value.trim();
    if (/^\d+$/.test(str)) {
      const num = Number(str);
      if (!Number.isNaN(num) && Number.isFinite(num)) {
        return num;
      }
    }
  } else if (typeof value === "number") {
    if (
      !Number.isNaN(value) &&
      Number.isFinite(value) &&
      value === Math.floor(value)
    ) {
      return value;
    }
  }
  return undefined;
};

export const assertValidArray = (arr: unknown): void | never => {
  if (
    arr === undefined ||
    !Array.isArray(arr) ||
    arr.length !== 5 ||
    arr.some((element) => !Array.isArray(element))
  ) {
    throw new Error("Invalid cron array");
  }
};

export const getRange = (start: number, end: number): number[] => {
  const array: number[] = [];
  for (let i = start; i <= end; i += 1) {
    array.push(i);
  }
  return array;
};

export const sort = (array: number[]) => [...array].sort((a, b) => a - b);

export const flatten = (arrays: number[][]) =>
  ([] as number[]).concat.apply([], arrays);

export const dedup = (array: number[]) => {
  const result: number[] = [];
  array.forEach((i) => {
    if (result.indexOf(i) < 0) {
      result.push(i);
    }
  });
  return result;
};

export const getPeriodFromCronParts = (cronParts: number[][]): PeriodType => {
  if (cronParts[3].length > 0) {
    return "Year";
  }
  if (cronParts[2].length > 0) {
    return "Month";
  }
  if (cronParts[4].length > 0) {
    return "Week";
  }
  if (cronParts[1].length > 0) {
    return "Day";
  }
  if (cronParts[0].length > 0) {
    return "Hour";
  }
  // return "minute";
  return "Hour";
};

export const fixFormatValue = (value: number, local: string) => {
  const result = value.toLocaleString(local, {
    minimumIntegerDigits: 2,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: false,
  });
  return result;
};

const replaceAlternatives = (strProp: string, unit: Unit) => {
  let str = strProp;
  if (unit.alt) {
    str = str.toUpperCase();
    for (let i = 0; i < unit.alt.length; i += 1) {
      str = str.replace(unit.alt[i], String(i + unit.min));
    }
  }
  return str;
};

const getError = (error: string, unit: Unit) =>
  new Error(`${error} for ${unit.name}`);

const fixSunday = (valuesProp: number[], unit: Unit) => {
  let values = valuesProp;

  if (unit.name === "weekday") {
    values = values.map((value) => {
      if (value === 7) {
        return 0;
      }
      return value;
    });
  }
  return values;
};

const assertInRange = (values: number[], unit: Unit) => {
  const first = values[0];
  const last = values[values.length - 1];
  if (first < unit.min) {
    throw getError(`Value "${first}" out of range`, unit);
  } else if (last > unit.max) {
    throw getError(`Value "${last}" out of range`, unit);
  }
};

const isInterval = (values: number[], step: number) => {
  for (let i = 1; i < values.length; i += 1) {
    const prev = values[i - 1];
    const value = values[i];
    if (value - prev !== step) {
      return false;
    }
  }
  return true;
};

const isFull = (values: number[], unit: Unit) => {
  return values.length === unit.max - unit.min + 1;
};

const getStep = (values: number[]) => {
  if (values.length > 2) {
    const step = values[1] - values[0];
    if (step > 1) {
      return step;
    }
  }
  return 0;
};

const isFullInterval = (values: number[], unit: Unit, step: number) => {
  const min = values[0];
  const max = values[values.length - 1];
  const haveAllValues = values.length === (max - min) / step + 1;
  if (min === unit.min && max + step > unit.max && haveAllValues) {
    return true;
  }
  return false;
};

const formatValue = (value: number, unit: Unit, options: Options) => {
  if (
    (options.outputWeekdayNames && unit.name === "weekday") ||
    (options.outputMonthNames && unit.name === "month")
  ) {
    if (unit.alt) {
      return unit.alt[value - unit.min];
    }
  }
  return value;
};

const toRanges = (values: number[]) => {
  const retval: number[][] = [];
  let startPart: number | undefined;
  values.forEach((value, index, self) => {
    if (value !== self[index + 1] - 1) {
      if (startPart !== undefined) {
        retval.push([startPart, value]);
        startPart = undefined;
      } else {
        retval.push([value]);
      }
    } else if (startPart === undefined) {
      startPart = value;
    }
  });
  return retval;
};

const parseRange = (rangeString: string, context: string, unit: Unit) => {
  const subparts = rangeString.split("-");
  if (subparts.length === 1) {
    const value = parseNumber(subparts[0]);
    if (value === undefined) {
      throw getError(`Invalid value "${context}"`, unit);
    }
    return [value];
  }

  if (subparts.length === 2) {
    const minValue = parseNumber(subparts[0]);
    const maxValue = parseNumber(subparts[1]);
    if (minValue === undefined || maxValue === undefined) {
      throw getError(`Invalid value "${context}"`, unit);
    }
    if (maxValue < minValue) {
      throw getError(
        `Max range is less than min range in "${rangeString}"`,
        unit,
      );
    }
    return getRange(minValue, maxValue);
  }

  throw getError(`Invalid value "${rangeString}"`, unit);
};

const parseStep = (step: string, unit: Unit) => {
  if (step !== undefined) {
    const parsedStep = parseNumber(step);
    if (parsedStep === undefined) {
      throw getError(`Invalid interval step value "${step}"`, unit);
    }
    return parsedStep;
  }
  return 0;
};

const applyInterval = (valuesProp: number[], step: number) => {
  let values = [...valuesProp];
  if (step) {
    const minVal = values[0];
    values = values.filter(
      (value) => value % step === minVal % step || value === minVal,
    );
  }
  return values;
};
const toString = (values: number[], unit: Unit, options: Options) => {
  let retval = "";
  if (isFull(values, unit) || values.length === 0) {
    if (options.outputHashes) {
      retval = "H";
    } else {
      retval = "*";
    }
  } else {
    const step = getStep(values);
    if (step && isInterval(values, step)) {
      if (isFullInterval(values, unit, step)) {
        if (options.outputHashes) {
          retval = `H/${step}`;
        } else {
          retval = `*/${step}`;
        }
      } else {
        const min = values[0];
        const max = values[values.length - 1];
        const range = `${formatValue(min, unit, options)}-${formatValue(
          max,
          unit,
          options,
        )}`;
        if (options.outputHashes) {
          retval = `H(${range})/${step}`;
        } else {
          retval = `${range}/${step}`;
        }
      }
    } else {
      retval = toRanges(values)
        .map((range) => {
          if (range.length === 1) {
            return formatValue(range[0], unit, options);
          }
          return `${formatValue(range[0], unit, options)}-${formatValue(
            range[1],
            unit,
            options,
          )}`;
        })
        .join(",");
    }
  }

  return retval;
};

export const arrayToStringPart = (
  arr: number[],
  unit: Unit,
  options: Options,
) => {
  const values = sort(
    dedup(
      fixSunday(
        arr.map((value) => {
          const parsedValue = parseNumber(value);
          if (parsedValue === undefined) {
            throw getError(`Invalid value "${value}"`, unit);
          }
          return parsedValue;
        }),
        unit,
      ),
    ),
  );
  assertInRange(values, unit);
  return toString(values, unit, options);
};

export const stringToArrayPart = (str: string, unit: Unit, full = false) => {
  if ((str === "*" || str === "*/1") && !full) {
    return [];
  }

  const values = sort(
    dedup(
      fixSunday(
        flatten(
          replaceAlternatives(str, unit)
            .split(",")
            .map((value: string) => {
              const valueParts = value.split("/");
              if (valueParts.length > 2) {
                throw getError(`Invalid value "${str}"`, unit);
              }
              let parsedValues: number[];
              const left = valueParts[0];
              const right = valueParts[1];
              if (left === "*") {
                parsedValues = getRange(unit.min, unit.max);
              } else {
                parsedValues = parseRange(left, str, unit);
              }
              const step = parseStep(right, unit);
              return applyInterval(parsedValues, step);
            }),
        ),
        unit,
      ),
    ),
  );
  assertInRange(values, unit);
  return values;
};

const shiftMonth = (arr: number[][], dateProp: DateTime) => {
  let date = dateProp;

  while (arr[3].indexOf(date.month) === -1) {
    date = date.plus({ months: 1 }).startOf("month");
  }
  return date;
};

const shiftDay = (arr: number[][], dateProp: DateTime): [DateTime, boolean] => {
  let date = dateProp;
  const currentMonth = date.month;
  while (
    arr[2].indexOf(date.day) === -1 ||
    // luxon uses 1-7 for weekdays, but we use 0-6
    arr[4].indexOf(date.weekday === 7 ? 0 : date.weekday) === -1
  ) {
    date = date.plus({ days: 1 }).startOf("day");
    if (currentMonth !== date.month) {
      return [date, true];
    }
  }
  return [date, false];
};

const shiftHour = (
  arr: number[][],
  dateProp: DateTime,
): [DateTime, boolean] => {
  let date = dateProp;

  const currentDay = date.day;
  while (arr[1].indexOf(date.hour) === -1) {
    date = date.plus({ hours: 1 }).startOf("hour");
    if (currentDay !== date.day) {
      return [date, true];
    }
  }
  return [date, false];
};

const shiftMinute = (
  arr: number[][],
  dateProp: DateTime,
): [DateTime, boolean] => {
  let date = dateProp;

  const currentHour = date.hour;
  while (arr[0].indexOf(date.minute) === -1) {
    date = date.plus({ minutes: 1 }).startOf("minute");
    if (currentHour !== date.hour) {
      return [date, true];
    }
  }
  return [date, false];
};

export const findDate = (arr: number[][], dateProp: DateTime) => {
  let retry = 24;
  let monthChanged: boolean;
  let dayChanged: boolean;
  let hourChanged: boolean;
  let date = dateProp;

  while (--retry) {
    date = shiftMonth(arr, date);
    [date, monthChanged] = shiftDay(arr, date);
    if (!monthChanged) {
      [date, dayChanged] = shiftHour(arr, date);
      if (!dayChanged) {
        [date, hourChanged] = shiftMinute(arr, date);
        if (!hourChanged) {
          break;
        }
      }
    }
  }
  if (!retry) {
    throw new Error("Unable to find execution time for schedule");
  }
  return date.set({ second: 0, millisecond: 0 });
};

export const getUnits = (locale?: string) => {
  const units: ReadonlyArray<Unit> = Object.freeze([
    {
      name: "minute",
      min: 0,
      max: 59,
      total: 60,
    },
    {
      name: "hour",
      min: 0,
      max: 23,
      total: 24,
    },
    {
      name: "day",
      min: 1,
      max: 31,
      total: 31,
    },
    {
      name: "month",
      min: 1,
      max: 12,
      total: 12,
      alt: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ],
      altWithTranslation: locale
        ? Info.months("long", { locale }).map(capitalize)
        : undefined,
    },
    {
      name: "weekday",
      min: 0,
      max: 6,
      total: 7,
      alt: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      altWithTranslation: locale
        ? Info.weekdays("long", { locale }).map((_, index, arr) =>
            capitalize(arr[(index + arr.length - 1) % arr.length]),
          )
        : undefined,
    },
  ]);

  return units;
};

export const getLabel = (period: PeriodType, t: TFunction) => {
  switch (period) {
    case "Year":
      return t("EveryYear");
    case "Month":
      return t("EveryMonth");
    case "Week":
      return t("EveryWeek");
    case "Day":
      return t("EveryDay");
    case "Hour":
      return t("EveryHour");
    default:
      return "";
  }
};

export const getOptions = (t: TFunction): PeriodOptionType[] => [
  {
    key: "Year",
    label: getLabel("Year", t),
  },
  {
    key: "Month",
    label: getLabel("Month", t),
  },
  {
    key: "Week",
    label: getLabel("Week", t),
  },
  {
    key: "Day",
    label: getLabel("Day", t),
  },
  {
    key: "Hour",
    label: getLabel("Hour", t), // t("Hour"), - "Skip useless issue in UselessTranslationKeysTest"
  },
];
