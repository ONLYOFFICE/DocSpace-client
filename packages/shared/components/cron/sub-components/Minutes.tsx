import React, { memo } from "react";
import { Select } from "./Select";

import type { MinutesProps } from "../Cron.types";

export const Minutes = memo(
  ({ minutes, setMinutes, period, t, unit }: MinutesProps) => {
    const isHour = period === "Hour";
    const prefix = isHour ? "" : ":";

    return (
      <Select
        unit={unit}
        prefix={prefix}
        value={minutes}
        setValue={setMinutes}
        dropDownMaxHeight={300}
        placeholder={t("EveryMinute")}
      />
    );
  },
);

Minutes.displayName = "Minutes";
