import React, { memo } from "react";

import { Select } from "./Select";

import type { MonthsProps } from "../Cron.types";

export const Months = memo(({ months, unit, setMonths, t }: MonthsProps) => {
  return (
    <Select
      value={months}
      setValue={setMonths}
      placeholder={t("EveryMonth")}
      unit={unit}
      prefix={t("In")}
      dropDownMaxHeight={300}
    />
  );
});

Months.displayName = "Months";
