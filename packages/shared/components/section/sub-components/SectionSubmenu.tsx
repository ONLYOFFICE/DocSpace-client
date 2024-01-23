import React from "react";

import { SectionSubmenuProps } from "../Section.types";
import { StyledSectionSubmenu } from "../Section.styled";

const SectionSubmenu = ({ children }: SectionSubmenuProps) => {
  return <StyledSectionSubmenu>{children}</StyledSectionSubmenu>;
};

SectionSubmenu.displayName = "SectionSubmenu";

export default SectionSubmenu;
