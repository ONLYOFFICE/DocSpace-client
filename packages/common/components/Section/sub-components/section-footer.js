import React from "react";
import styled from "styled-components";
import { mobile } from "@docspace/components/utils/device";

const StyledSectionFooter = styled.div`
  margin-top: 40px;

  @media ${mobile} {
    margin-top: 32px;
  }
`;

const SectionFooter = ({ children }) => {
  return <StyledSectionFooter>{children}</StyledSectionFooter>;
};

SectionFooter.displayName = "SectionFooter";

export default SectionFooter;
