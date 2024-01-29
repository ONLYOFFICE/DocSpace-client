import React, { memo } from "react";

import { Select } from "./Select";

import type { MonthsProps } from "../Cron.types";

export const Months = memo(({ months, unit, setMonths, t }: MonthsProps) => {
  return (
    <Select
      unit={unit}
      value={months}
      setValue={setMonths}
      dropDownMaxHeight={300}
      placeholder={t("EveryMonth")}
    />
  );
});

Months.displayName = "Months";
