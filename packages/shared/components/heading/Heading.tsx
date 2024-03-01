import React from "react";

import StyledHeading from "./Heading.styled";
import { HeadingProps } from "./Heading.types";
import { HeadingLevel, HeadingSize } from "./Heading.enums";

export const HeadingPure = ({
  level = HeadingLevel.h1,
  color,
  className = "",
  size = HeadingSize.large,
  ...rest
}: HeadingProps) => {
  return (
    <StyledHeading
      className={`${className} not-selectable`}
      as={`h${level}`}
      colorProp={color}
      data-testid="heading"
      size={size}
      {...rest}
    />
  );
};

const Heading = React.memo(HeadingPure);

export { Heading };
