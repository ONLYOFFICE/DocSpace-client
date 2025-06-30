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
import type { TFunction } from "i18next";
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

// export type TFunction = (str: string, options?: unknown) => string;

export type Setter<K extends string, T = number[]> = {
  [P in K as `set${Capitalize<P>}`]: Dispatch<SetStateAction<T>>;
};

export type Property<K extends string, T = number[]> = Setter<K, T> & {
  [P in K]: T;
};

export interface FieldProps {
  t: TFunction;
  unit: Unit;
  isDisabled?: boolean;
}

export interface CronProps {
  /** Cron value */
  value?: string;
  /** Set the cron value, similar to onChange. */
  setValue: (value: string) => void;
  /** Triggered when the cron component detects an error with the value. */
  onError?: (error?: Error) => void;
  /** Disable the cron component. */
  isDisabled?: boolean;
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
  isDisabled?: boolean;
}

export interface PeriodProps extends Property<"period", PeriodType> {
  t: TFunction<"Common", undefined>;
  isDisabled?: boolean;
}

export type PeriodOptionType = {
  key: PeriodType;
  label: string;
};
