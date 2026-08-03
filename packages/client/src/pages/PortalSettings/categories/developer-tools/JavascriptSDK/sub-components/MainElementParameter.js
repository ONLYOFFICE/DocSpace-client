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

import { useState, useCallback } from "react";
import debounce from "lodash.debounce";

import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { ColorInput } from "@docspace/ui-kit/components/color-input";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Label } from "@docspace/ui-kit/components/label";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import {
  CategorySubHeader,
  ControlsGroup,
  ControlsSection,
  RowContainer,
} from "../presets/StyledPresets";
import { getBrandName } from "@docspace/shared/constants/brands";

export const MainElementParameter = ({
  t,
  config,
  setConfig,
  isButtonMode = false,
}) => {
  const elementDisplayOptions = [
    {
      value: "element",
      label: t("ElementItself"),
      dataTestId: "element_radio_button",
    },
    {
      value: "button",
      label: (
        <RowContainer>
          {t("Common:Button")}
          <Text color="gray">{`(${t("ElementCalledAfterClicking")})`}</Text>
        </RowContainer>
      ),
      dataTestId: "button_radio_button",
    },
  ];

  const [selectedElementType, setSelectedElementType] = useState(
    elementDisplayOptions[Number(isButtonMode)].value,
  );
  const [buttonValue, setButtonValue] = useState(config.buttonText);

  const debouncedSetConfig = useCallback(
    debounce((key, value) => {
      setConfig((oldConfig) => {
        return { ...oldConfig, [key]: value };
      });
    }, 500),
    [setConfig],
  );

  const toggleButtonMode = (e) => {
    setSelectedElementType(e.target.value);
    setConfig((oldConfig) => ({
      ...oldConfig,
      isButtonMode: e.target.value === "button",
    }));
  };

  const setButtonColor = (color) => {
    debouncedSetConfig("buttonColor", color);
  };

  const setButtonText = (e) => {
    setButtonValue(e.target.value);
    debouncedSetConfig("buttonText", e.target.value);
  };

  const toggleWithLogo = () => {
    setConfig((oldConfig) => ({
      ...oldConfig,
      buttonWithLogo: !config.buttonWithLogo,
    }));
  };

  return (
    <ControlsSection>
      <CategorySubHeader>{t("MainElementParameter")}</CategorySubHeader>
      <RadioButtonGroup
        orientation="vertical"
        options={elementDisplayOptions}
        name="elementDisplayInput"
        selected={selectedElementType}
        onClick={toggleButtonMode}
        spacing="8px"
        isDisabled
        dataTestId="element_display_radio_button_group"
      />
      {config.isButtonMode ? (
        <>
          <CategorySubHeader>{t("ButtonCustomization")}</CategorySubHeader>
          <ControlsGroup>
            <Label className="label" text={t("ButtonColor")} />
            <ColorInput
              scale
              handleChange={setButtonColor}
              defaultColor={globalColors.lightSecondMain}
              dataTestId="button_mode_color_input"
            />
          </ControlsGroup>
          <ControlsGroup>
            <Label className="label" text={t("ButtonText")} />
            <TextInput
              scale
              name="button_text"
              onChange={setButtonText}
              placeholder={t("SelectToPortal", {
                productName: getBrandName("ProductName"),
              })}
              value={buttonValue}
              tabIndex={3}
              testId="button_mode_text_input"
            />
            <Checkbox
              className="checkbox"
              label={t("Logo")}
              onChange={toggleWithLogo}
              isChecked={config.buttonWithLogo}
              dataTestId="button_mode_logo_checkbox"
            />
          </ControlsGroup>
        </>
      ) : null}
    </ControlsSection>
  );
};
