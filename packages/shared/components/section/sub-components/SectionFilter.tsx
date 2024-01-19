import React from "react";

import { SectionFilterProps } from "../Section.types";
import { StyledSectionFilter } from "../Section.styled";

const SectionFilter = React.memo((props: SectionFilterProps) => {
  return <StyledSectionFilter className="section-filter" {...props} />;
});

SectionFilter.displayName = "SectionFilter";

export default SectionFilter;
