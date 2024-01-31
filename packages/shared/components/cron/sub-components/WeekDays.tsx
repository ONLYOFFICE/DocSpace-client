import React, { useMemo, memo } from "react";

import { Select } from "./Select";

import type { WeekDaysProps } from "../Cron.types";

export const WeekDays = memo(
  ({ setWeekDays, unit, isWeek, weekDays, monthDays, t }: WeekDaysProps) => {
    const placeholder = useMemo(() => {
      const isEmpty = monthDays.length === 0;

      return isEmpty || isWeek ? t("EveryDayOfTheWeek") : t("DayOfTheWeek");
    }, [monthDays.length, isWeek, t]);

    return (
      <Select
        unit={unit}
        value={weekDays}
        setValue={setWeekDays}
        dropDownMaxHeight={300}
        placeholder={placeholder}
      />
    );
  },
);

WeekDays.displayName = "WeekDays";
