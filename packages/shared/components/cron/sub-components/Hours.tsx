import React, { memo } from "react";
import { Select } from "./Select";

import type { HoursProps } from "../Cron.types";

export const Hours = memo(({ hours, setHours, unit, t }: HoursProps) => {
  return (
    <Select
      value={hours}
      setValue={setHours}
      placeholder={t("EveryHour")}
      unit={unit}
      prefix={t("At")}
      dropDownMaxHeight={300}
    />
  );
});

Hours.displayName = "Hours";
