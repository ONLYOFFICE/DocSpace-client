import React from "react";

import StyledHeading from "./Heading.styled";
import { HeadingProps } from "./Heading.types";
import { HeadingLevel, HeadingSize } from "./Heading.enums";

export const HeadingPure = ({
  level,
  color,
  className,
  ...rest
}: HeadingProps) => {
  return (
    <StyledHeading
      className={`${className} not-selectable`}
      as={`h${level}`}
      colorProp={color}
      data-testid="heading"
      {...rest}
    />
  );
};

HeadingPure.defaultProps = {
  title: null,
  truncate: false,
  isInline: false,
  size: HeadingSize.large,
  level: HeadingLevel.h1,
  className: "",
};

const Heading = React.memo(HeadingPure);

export { Heading };
