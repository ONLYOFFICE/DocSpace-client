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

import { useState, useCallback } from "react";
import debounce from "lodash.debounce";

import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { ColorInput } from "@docspace/shared/components/color-input";
import { TextInput } from "@docspace/shared/components/text-input";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";

import { globalColors } from "@docspace/shared/themes";
import {
  CategorySubHeader,
  ControlsGroup,
  ControlsSection,
  RowContainer,
} from "../presets/StyledPresets";

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
              onChange={setButtonText}
              placeholder={t("SelectToPortal", {
                productName: t("Common:ProductName"),
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
