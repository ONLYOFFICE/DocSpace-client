import React from "react";
import { StyledSectionPaging } from "../Section.styled";
import { SectionPagingProps } from "../Section.types";

const SectionPaging = React.memo((props: SectionPagingProps) => {
  return <StyledSectionPaging {...props} />;
});

SectionPaging.displayName = "SectionPaging";

export default SectionPaging;
