import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { ComboBox, ComboBoxSize } from "../../combobox";
import { Option } from "../Cron.types";
import { fixFormatValue } from "../Cron.util";
import { SelectWrapper } from "./Select.styled";
import SelectProps from "./Select.props";

function Select({
  unit,
  value,
  placeholder,
  setValue,
  prefix,
  dropDownMaxHeight,
}: SelectProps) {
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

  const onSelect = (option: Option<number, string>) => {
    setValue([option.key]);
  };

  const onReset = (option: Option<number, string>) => {
    if (option.key === value[0]) {
      setValue([]);
    }
  };

  return (
    <SelectWrapper>
      <span>{prefix}</span>
      <ComboBox
        scaledOptions
        scaled={false}
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
}

export default Select;
