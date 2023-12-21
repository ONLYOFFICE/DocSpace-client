import type { Dispatch, SetStateAction } from "react";

export type PeriodType = "Year" | "Month" | "Week" | "Day" | "Hour" | "Minute";
export type Unit = {
  name: "minute" | "hour" | "day" | "month" | "weekday";
  min: number;
  max: number;
  alt?: ReadonlyArray<string>;
  fullLabel?: ReadonlyArray<string>;
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

export type TFunction = Function;

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

export interface HoursProps extends FieldProps {
  hours: number[];
  setHours: Dispatch<SetStateAction<number[]>>;
}

export interface MinutesProps extends FieldProps {
  minutes: number[];
  setMinutes: Dispatch<SetStateAction<number[]>>;
  period: PeriodType;
}

export interface MonthDaysProps extends FieldProps {
  monthDays: number[];
  weekDays: number[];
  setMonthDays: Dispatch<SetStateAction<number[]>>;
}

export interface MonthsProps extends FieldProps {
  months: number[];
  setMonths: Dispatch<SetStateAction<number[]>>;
}

export interface WeekDaysProps extends FieldProps {
  isWeek: boolean;
  period: PeriodType;
  weekDays: number[];
  monthDays: number[];
  setWeekDays: Dispatch<SetStateAction<number[]>>;
}

export interface SelectProps {
  unit: Unit;
  value: number[];
  placeholder: string;
  setValue: Dispatch<SetStateAction<number[]>>;
  prefix: string;
  dropDownMaxHeight?: number;
}

export interface PeriodProps {
  t: TFunction;
  period?: PeriodType;
  setPeriod: Dispatch<SetStateAction<PeriodType>>;
}

export type PeriodOptionType = {
  key: PeriodType;
  label: string;
};
