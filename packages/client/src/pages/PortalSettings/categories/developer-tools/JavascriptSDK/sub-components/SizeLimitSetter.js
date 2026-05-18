// (c) Copyright Ascensio System SIA 2009-2026
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
