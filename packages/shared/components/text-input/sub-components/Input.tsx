import React from "react";
import MaskedInput from "react-text-mask";

import { TextInputProps } from "../TextInput.types";

const Input = ({
  isAutoFocussed,
  isDisabled,
  isReadOnly,
  hasError,
  hasWarning,
  scale,
  withBorder,
  keepCharPositions,
  guide,
  fontWeight,
  isBold,
  forwardedRef,
  className,
  dir = "auto",
  size,
  mask,
  ...props
}: TextInputProps) => {
  const rest = {
    autoFocus: isAutoFocussed,
    ref: forwardedRef || null,
  };

  return mask ? (
    <MaskedInput
      className={`${className} input-component not-selectable`}
      keepCharPositions
      guide={false}
      mask={mask}
      {...props}
    />
  ) : (
    <input
      className={`${className} input-component not-selectable`}
      dir={dir}
      {...props}
      {...rest}
    />
  );
};

Input.defaultProps = {
  type: "text",
  // Empty placeholder by default needed for RTL mode to make :placeholder-shown work to put cursor on the right side of input
  placeholder: " ",
  value: "",
  maxLength: 255,
  size: "base",
  scale: false,
  tabIndex: -1,
  hasError: false,
  hasWarning: false,
  autoComplete: "off",
  withBorder: true,
  keepCharPositions: false,
  guide: false,
  isBold: false,
};
export { Input };
