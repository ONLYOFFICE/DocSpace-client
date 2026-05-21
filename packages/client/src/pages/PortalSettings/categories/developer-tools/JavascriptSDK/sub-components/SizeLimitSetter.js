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

import { useState, useEffect } from "react";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Label } from "@docspace/ui-kit/components/label";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";

import {
  ControlsGroup,
  LabelGroup,
  RowContainer,
} from "../presets/StyledPresets";

export const SizeLimitSetter = (props) => {
  const {
    labelText,
    tooltipText,
    configKey,
    defaultValue,
    sizeUnits,
    defaultUnit,
    setConfig,
    tabIndex,
    dataTestId,
    hasError,
    errorMessage,
    onSizeChange,
    availableUnits,
    currentValue,
  } = props;

  const [unit, setUnit] = useState(defaultUnit);
  const [value, setValue] = useState(defaultValue);

  const displayedUnits = availableUnits || sizeUnits;

  useEffect(() => {
    if (!currentValue) return;
    const match = currentValue.match(/^(\d+)(kb|mb|gb)$/);
    if (match) {
      const [, val, unitKey] = match;
      setValue(val);
      const foundUnit = sizeUnits.find((u) => u.key === unitKey);
      if (foundUnit) {
        setUnit(foundUnit);
      }
    }
  }, []);

  useEffect(() => {
    if (!availableUnits) return;
    const isCurrentUnitAvailable = availableUnits.some(
      (u) => u.key === unit.key,
    );
    if (!isCurrentUnitAvailable && availableUnits.length > 0) {
      const newUnit = availableUnits[0];
      setUnit(newUnit);
      if (value) {
        setConfig((oldConfig) => ({
          ...oldConfig,
          [configKey]: `${value}${newUnit.key}`,
          init: true,
        }));
      }
      onSizeChange?.({ value: value || defaultValue, unit: newUnit.key });
    }
  }, [availableUnits]);

  const onChangeValue = (e) => {
    const inputValue = e.target.value;

    if (inputValue === "") {
      setValue("");
      setConfig((oldConfig) => {
        const { [configKey]: _, ...rest } = oldConfig;
        return { ...rest, init: true };
      });
      onSizeChange?.({ value: "", unit: unit.key });
      return;
    }

    if (!/^\d+$/.test(inputValue)) {
      return;
    }

    const numericValue = Number.parseInt(inputValue, 10);

    if (numericValue <= 0) {
      return;
    }

    setValue(inputValue);
    setConfig((oldConfig) => ({
      ...oldConfig,
      [configKey]: `${inputValue}${unit.key}`,
      init: true,
    }));
    onSizeChange?.({ value: inputValue, unit: unit.key });
  };

  const onChangeUnit = (item) => {
    setUnit(item);
    if (value) {
      setConfig((oldConfig) => ({
        ...oldConfig,
        [configKey]: `${value}${item.key}`,
        init: true,
      }));
    }
    onSizeChange?.({ value: value || defaultValue, unit: item.key });
  };

  return (
    <ControlsGroup>
      <LabelGroup>
        <Label className="label" text={labelText} />
        <HelpButton
          offsetRight={0}
          size={12}
          place="right"
          tooltipContent={<Text fontSize="12px">{tooltipText}</Text>}
          dataTestId={`${dataTestId}_help_button`}
        />
      </LabelGroup>

      <FieldContainer
        isVertical
        labelVisible={false}
        hasError={hasError}
        errorMessage={errorMessage}
        removeMargin
      >
        <RowContainer combo>
          <TextInput
            onChange={onChangeValue}
            value={value}
            tabIndex={tabIndex}
            testId={`${dataTestId}_input`}
            hasError={hasError}
          />
          <ComboBox
            size="content"
            scaled={false}
            scaledOptions
            onSelect={onChangeUnit}
            options={displayedUnits}
            selectedOption={unit}
            displaySelectedOption
            directionY="bottom"
            dataTestId={`${dataTestId}_unit_combobox`}
            dropDownTestId={`${dataTestId}_unit_dropdown`}
          />
        </RowContainer>
      </FieldContainer>
    </ControlsGroup>
  );
};
