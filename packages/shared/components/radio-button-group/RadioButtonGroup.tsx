// (c) Copyright Ascensio System SIA 2009-2024
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

import React from "react";

import { RadioButton } from "../radio-button";
import { Text } from "../text";

import StyledDiv from "./RadioButtonGroup.styled";
import {
  RadioButtonGroupProps,
  TRadioButtonOption,
} from "./RadioButtonGroup.types";

const RadioButtonGroup = ({
  id,
  className,
  style,
  orientation = "horizontal",
  width,
  options,
  name,
  selected,
  fontSize,
  fontWeight,
  onClick,
  isDisabled,
  spacing,
}: RadioButtonGroupProps) => {
  const [selectedOption, setSelectedOption] = React.useState(selected);

  const handleOptionChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedOption(changeEvent.target.value);
  };

  React.useEffect(() => {
    setSelectedOption(selected);
  }, [selected]);

  return (
    <StyledDiv
      id={id}
      className={className}
      style={style}
      orientation={orientation}
      width={width}
      data-testid="radio-button-group"
    >
      {options.map((option: TRadioButtonOption) => {
        if (option.type === "text")
          return (
            <Text key="radio-text" className="subtext">
              {option.label}
            </Text>
          );

        return (
          <RadioButton
            id={option.id}
            key={option.value}
            name={name || ""}
            value={option.value}
            isChecked={`${selectedOption}` === `${option.value}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleOptionChange(e);
              onClick(e);
            }}
            isDisabled={isDisabled || option.disabled}
            label={option.label}
            fontSize={fontSize}
            fontWeight={fontWeight}
            spacing={spacing}
            orientation={orientation}
            autoFocus={option.autoFocus}
          />
        );
      })}
    </StyledDiv>
  );
};

export { RadioButtonGroup };
