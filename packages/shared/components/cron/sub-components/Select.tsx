/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getFirstDayOfWeek } from "@docspace/ui-kit/utils/date";

import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/ui-kit/components/combobox";

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
      firstDayOfWeek = getFirstDayOfWeek(i18n.language);
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
