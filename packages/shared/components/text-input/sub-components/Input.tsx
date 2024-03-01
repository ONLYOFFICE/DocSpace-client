import React from "react";
import MaskedInput from "react-text-mask";

import { TextInputProps } from "../TextInput.types";
import { InputType } from "../TextInput.enums";

const Input = ({
  isAutoFocussed,
  isDisabled,
  isReadOnly,
  fontWeight,
  forwardedRef,
  className,
  dir = "auto",
  mask,
  type = InputType.text,
  placeholder = " ",
  value = "",
  maxLength = 255,
  scale,
  tabIndex = -1,
  hasError,
  hasWarning,
  autoComplete = "off",
  withBorder,
  keepCharPositions,
  guide = "false",
  isBold,
  size,
  ...props
}: TextInputProps) => {
  const rest = {
    autoFocus: isAutoFocussed,
    ref: forwardedRef || null,
    value,
    maxLength,
    tabIndex,
    autoComplete,
    guide,
  };

  return mask ? (
    <MaskedInput
      className={`${className} input-component not-selectable`}
      keepCharPositions
      guide={false}
      mask={mask}
      type={type}
      placeholder={placeholder}
      {...props}
    />
  ) : (
    <input
      className={`${className} input-component not-selectable`}
      dir={dir}
      type={type}
      placeholder={placeholder}
      {...props}
      {...rest}
    />
  );
};

export { Input };
