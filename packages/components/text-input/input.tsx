import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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
}: any) => {
  const rest = {};

  // @ts-expect-error TS(2339): Property 'autoFocus' does not exist on type '{}'.
  if (isAutoFocussed) rest.autoFocus = true;

  // @ts-expect-error TS(2339): Property 'ref' does not exist on type '{}'.
  if (forwardedRef) rest.ref = forwardedRef;

  return props.mask != null ? (
    <MaskedInput
      className={`${className} not-selectable`}
      keepCharPositions={true}
      guide={false}
      {...props}
    />
  ) : (
    <input
      className={`${className} not-selectable`}
      dir={dir}
      {...props}
      {...rest}
    />
  );
};
export default Input;
