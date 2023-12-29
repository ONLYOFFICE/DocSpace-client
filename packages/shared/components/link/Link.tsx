import React from "react";

import StyledText from "./Link.styled";
import { LinkProps } from "./Link.types";
import { LinkType, LinkTarget } from "./Link.enums";

export { LinkType, LinkTarget };

const Link = ({
  isTextOverflow,
  children,
  noHover,
  enableUserSelect,
  ...rest
}: LinkProps) => {
  return (
    <StyledText
      tag="a"
      isTextOverflow={isTextOverflow}
      noHover={noHover}
      truncate={isTextOverflow || false}
      enableUserSelect={enableUserSelect}
      data-testid="link"
      {...rest}
    >
      {children}
    </StyledText>
  );
};

Link.defaultProps = {
  className: "",
  fontSize: "13px",
  href: undefined,
  isBold: false,
  isHovered: false,
  isSemitransparent: false,
  isTextOverflow: false,
  noHover: false,
  rel: "noopener noreferrer",
  tabIndex: -1,
  type: LinkType.page,
  enableUserSelect: false,
};

export { Link };
