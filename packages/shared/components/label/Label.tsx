import React from "react";

import { Text } from "../text";

import { LabelProps } from "./Label.types";

const Label = (props: LabelProps) => {
  const {
    isRequired = false,
    error = false,
    title,
    truncate = false,
    isInline = false,
    htmlFor,
    text,
    display,
    className,
    id,
    style,
    children,
  } = props;
  const errorProp = error ? { color: "#c30" } : {};

  return (
    <Text
      as="label"
      id={id}
      style={style}
      htmlFor={htmlFor}
      isInline={isInline}
      display={display}
      {...errorProp}
      fontWeight={600}
      truncate={truncate}
      title={title}
      className={className}
      data-testid="label"
    >
      {text} {isRequired && " *"} {children}
    </Text>
  );
};

export { Label };
