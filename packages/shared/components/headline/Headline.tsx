import React from "react";
import { classNames } from "@docspace/shared/utils";

import StyledHeading from "./Headline.styled";
import { HeadlineProps } from "./Headline.types";

const Headline = ({
  id,
  color,
  isInline = false,
  level = 1,
  title,
  truncate = false,
  type,
  children,
  className,
}: HeadlineProps) => {
  return (
    <StyledHeading
      id={id}
      level={level}
      title={title}
      color={color}
      headlineType={type}
      truncate={truncate}
      isInline={isInline}
      className={classNames("headline-heading", className)}
    >
      {children}
    </StyledHeading>
  );
};

export default Headline;
