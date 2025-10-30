// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import moment from "moment";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ComboBox, ComboBoxSize, TOption } from "../../combobox";

import { fixFormatValue } from "../Cron.utils";

import type { SelectProps } from "../Cron.types";
import styles from "../Cron.module.scss";

export const Select = ({
  unit,
  value,
  placeholder,
  setValue,
  prefix,
  dropDownMaxHeight,
  isDisabled,
  dataTestId,
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
    <div className={styles.selectWrapper}>
      {prefix ? <span>{prefix}</span> : null}
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
        isDisabled={isDisabled}
        directionY="both"
        dataTestId={dataTestId}
        dropDownTestId={dataTestId ? `${dataTestId}_dropdown` : undefined}
      />
    </div>
  );
};
