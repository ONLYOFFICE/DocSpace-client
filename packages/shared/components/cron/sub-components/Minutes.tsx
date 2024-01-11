import React, { memo } from "react";
import { Select } from "./Select";

import type { MinutesProps } from "../Cron.types";

export const Minutes = memo(
  ({ minutes, setMinutes, period, t, unit }: MinutesProps) => {
    const isHour = period === "Hour";
    const prefix = isHour ? t("At") : ":";

    return (
      <Select
        value={minutes}
        setValue={setMinutes}
        placeholder={t("EveryMinute")}
        unit={unit}
        prefix={prefix}
        dropDownMaxHeight={300}
      />
    );
  },
);

Minutes.displayName = "Minutes";
