import React from "react";

import { StyledSectionFooter } from "../Section.styled";
import { SectionFooterProps } from "../Section.types";

const SectionFooter = ({ children }: SectionFooterProps) => {
  return <StyledSectionFooter>{children}</StyledSectionFooter>;
};

SectionFooter.displayName = "SectionFooter";

export default SectionFooter;
