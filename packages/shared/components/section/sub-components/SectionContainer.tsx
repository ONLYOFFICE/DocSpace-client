import React from "react";
import { StyledSectionContainer } from "../Section.styled";
import { SectionContainerProps } from "../Section.types";

const SectionContainer = React.forwardRef<
  HTMLDivElement,
  SectionContainerProps
>((props, forwardRef) => {
  return <StyledSectionContainer ref={forwardRef} id="section" {...props} />;
});

SectionContainer.displayName = "SectionContainer";

export default SectionContainer;
