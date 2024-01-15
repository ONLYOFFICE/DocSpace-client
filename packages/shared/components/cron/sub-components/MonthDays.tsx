import React, { useMemo, memo } from "react";
import { Select } from "./Select";

import type { MonthDaysProps } from "../Cron.types";

export const MonthDays = memo(
  ({ weekDays, monthDays, unit, setMonthDays, t }: MonthDaysProps) => {
    const placeholder = useMemo(() => {
      const isEmpty = weekDays.length === 0;

      return isEmpty ? t("EveryDayOfTheMonth") : t("DayOfTheMonth");
    }, [weekDays.length, t]);

    return (
      <Select
        value={monthDays}
        setValue={setMonthDays}
        placeholder={placeholder}
        unit={unit}
        prefix={t("On")}
        dropDownMaxHeight={300}
      />
    );
  },
);
MonthDays.displayName = "MonthDays";
