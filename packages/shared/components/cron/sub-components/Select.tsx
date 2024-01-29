import moment from "moment";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ComboBox, ComboBoxSize, TOption } from "../../combobox";

import { fixFormatValue } from "../Cron.utils";
import { SelectWrapper } from "../Cron.styled";

import type { SelectProps } from "../Cron.types";

export const Select = ({
  unit,
  value,
  placeholder,
  setValue,
  prefix,
  dropDownMaxHeight,
}: SelectProps) => {
  const { i18n } = useTranslation();

  const options = useMemo(() => {
    const { altWithTranslation } = unit;
    let firstDayOfWeek = 0;

    const isWeek = unit.name === "weekday";

    if (isWeek) {
      firstDayOfWeek = moment.localeData(i18n.language).firstDayOfWeek();
    }

    if (altWithTranslation) {
      return altWithTranslation.map((item, index, array) => {
        const number = unit.min === 0 ? index : index + 1;

        const key = isWeek ? (number + firstDayOfWeek) % unit.total : number;
        const label = isWeek ? array[key] : item;

        return {
          key,
          label,
        };
      });
    }

    return [...Array(unit.total)].map((_, index) => {
      const number = unit.min === 0 ? index : index + 1;

      return {
        key: number,
        label: fixFormatValue(number, i18n.language),
      };
    });
  }, [i18n.language, unit]);

  const selectedOption = useMemo(() => {
    const isEmpty = value.length === 0;

    return {
      key: isEmpty ? -1 : value[0],
      label: isEmpty
        ? placeholder
        : unit.altWithTranslation
          ? unit.altWithTranslation[value[0] - unit.min]
          : fixFormatValue(value[0], i18n.language),
    };
  }, [value, placeholder, unit.altWithTranslation, unit.min, i18n.language]);

  const onSelect = (option: TOption) => {
    setValue([option.key as number]);
  };

  const onReset = (option: TOption) => {
    if (option.key === value[0]) {
      setValue([]);
    }
  };

  return (
    <SelectWrapper>
      {prefix && <span>{prefix}</span>}
      <ComboBox
        scaled
        scaledOptions
        noBorder={false}
        showDisabledItems
        options={options}
        onSelect={onSelect}
        size={ComboBoxSize.content}
        onClickSelectedItem={onReset}
        selectedOption={selectedOption}
        dropDownMaxHeight={dropDownMaxHeight}
      />
    </SelectWrapper>
  );
};
