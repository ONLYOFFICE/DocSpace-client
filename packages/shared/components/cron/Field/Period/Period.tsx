import React, { useMemo, memo } from "react";

import { ComboBox, ComboBoxSize, TOption } from "../../../combobox";
import { getLabel, getOptions } from "./Period.helper";

import PeriodProps from "./Period.props";
import { PeriodType } from "../../Cron.types";

function Period({ period = "Hour", setPeriod, t }: PeriodProps) {
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
}

export default memo(Period);
