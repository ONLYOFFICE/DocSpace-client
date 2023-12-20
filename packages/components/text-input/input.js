import React from "react";
import MaskedInput from "react-text-mask";

/* eslint-disable no-unused-vars, react/prop-types */
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
  theme,
  dir = "auto",
  ...props
}) => {
  const rest = {};

  if (isAutoFocussed) rest.autoFocus = true;

  if (forwardedRef) rest.ref = forwardedRef;

  return props.mask != null ? (
    <MaskedInput
      className={`${className} input-component not-selectable`}
      keepCharPositions={true}
      guide={false}
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
export default Input;
