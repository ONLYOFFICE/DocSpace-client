import React, { useMemo, memo } from "react";

import { ComboBox, ComboBoxSize, TOption } from "../../combobox";

import { getLabel, getOptions } from "../Cron.utils";
import type { PeriodProps, PeriodType } from "../Cron.types";

export const Period = memo(({ period = "Hour", setPeriod, t }: PeriodProps) => {
  const onSelect = (arg: TOption) => {
    setPeriod(arg.key as PeriodType);
  };

  const options = useMemo(() => getOptions(t), [t]);
  const selectedOption = useMemo(
    () => ({ key: period, label: getLabel(period, t) }),
    [period, t],
  );

  return (
    <ComboBox
      scaledOptions
      scaled={false}
      noBorder={false}
      options={options}
      showDisabledItems
      onSelect={onSelect}
      size={ComboBoxSize.content}
      selectedOption={selectedOption}
    />
  );
});

Period.displayName = "Period";
