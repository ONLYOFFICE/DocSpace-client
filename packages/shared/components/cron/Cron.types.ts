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
