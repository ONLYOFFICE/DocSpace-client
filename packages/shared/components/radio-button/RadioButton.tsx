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

import { IconSizeType } from "../../utils";

import { Text } from "../text";

import {
  RadioButtonIcon,
  RadioButtonCheckedIcon,
  Label,
  Input,
} from "./RadioButton.styled";
import { RadioButtonProps } from "./RadioButton.types";

const RadiobuttonIcon = ({ isChecked }: { isChecked?: boolean }) => {
  const newProps = {
    size: IconSizeType.medium,
    className: "radio-button",
  };

  return !isChecked ? (
    <RadioButtonIcon {...newProps} />
  ) : (
    <RadioButtonCheckedIcon {...newProps} />
  );
};

const RadioButton = ({
  isChecked,
  classNameInput,
  name,
  value,
  onChange,
  onClick,
  orientation,
  spacing,
  isDisabled,
  id,
  className,
  style,
  fontSize,
  fontWeight,
  label,
  autoFocus,
}: RadioButtonProps) => {
  const [isCheckedState, setIsCheckedState] = React.useState(isChecked);

  React.useEffect(() => {
    setIsCheckedState(isChecked);
  }, [isChecked]);

  const setClassNameInput = classNameInput
    ? {
        className: classNameInput,
      }
    : {};

  const onChangeAction = (
    e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsCheckedState((s) => !s);
    onClick?.(e);
  };

  return (
    <Label
      orientation={orientation}
      spacing={spacing}
      isDisabled={isDisabled}
      id={id}
      className={className}
      style={style}
      data-testid="radio-button"
    >
      <Input
        type="radio"
        name={name}
        value={value}
        checked={isCheckedState}
        onChange={onChange || onChangeAction}
        disabled={isDisabled}
        autoFocus={autoFocus}
        {...setClassNameInput}
      />
      <RadiobuttonIcon isChecked={isCheckedState} />
      <Text
        as="span"
        className="radio-button_text"
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {label || value}
      </Text>
    </Label>
  );
};

export { RadioButton };
