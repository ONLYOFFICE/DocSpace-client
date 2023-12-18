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

  return isChecked ? (
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

  const onChangeAction = (e: React.MouseEvent<HTMLInputElement>) => {
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
