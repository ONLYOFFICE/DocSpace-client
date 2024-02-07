import type { Dispatch, SetStateAction } from "react";

export type PeriodType = "Year" | "Month" | "Week" | "Day" | "Hour" | "Minute";
export type Unit = {
  name: "minute" | "hour" | "day" | "month" | "weekday";
  min: number;
  max: number;
  alt?: ReadonlyArray<string>;
  total: number;
  altWithTranslation?: ReadonlyArray<string>;
};

export type Options = {
  outputHashes: boolean;
  outputWeekdayNames: boolean;
  outputMonthNames: boolean;
};

export type Option<K = unknown, L = unknown> = {
  key: K;
  label: L;
};

export type TFunction = (str: string, options?: unknown) => string;

export type Setter<K extends string, T = number[]> = {
  [P in K as `set${Capitalize<P>}`]: Dispatch<SetStateAction<T>>;
};

export type Property<K extends string, T = number[]> = Setter<K, T> & {
  [P in K]: T;
};

export interface FieldProps {
  t: TFunction;
  unit: Unit;
}

export interface CronProps {
  /** Cron value */
  value?: string;
  /** Set the cron value, similar to onChange. */
  setValue: (value: string) => void;
  /** Triggered when the cron component detects an error with the value. */
  onError?: (error?: Error) => void;
}

export interface HoursProps extends FieldProps, Property<"hours"> {}

export interface MinutesProps extends FieldProps, Property<"minutes"> {
  period: PeriodType;
}

export interface MonthDaysProps extends FieldProps, Property<"monthDays"> {
  weekDays: number[];
}

export interface MonthsProps extends FieldProps, Property<"months"> {}

export interface WeekDaysProps extends FieldProps, Property<"weekDays"> {
  isWeek: boolean;
  monthDays: number[];
}

export interface SelectProps extends Property<"value"> {
  unit: Unit;
  placeholder: string;
  prefix?: string;
  dropDownMaxHeight?: number;
}

export interface PeriodProps extends Property<"period", PeriodType> {
  t: TFunction;
}

export type PeriodOptionType = {
  key: PeriodType;
  label: string;
};
