import React, { memo } from "react";
import { Select } from "./Select";

import type { HoursProps } from "../Cron.types";

export const Hours = memo(({ hours, setHours, unit, t }: HoursProps) => {
  return (
    <Select
      unit={unit}
      value={hours}
      setValue={setHours}
      dropDownMaxHeight={300}
      placeholder={t("EveryHour")}
    />
  );
});

Hours.displayName = "Hours";
