import React from "react";
import styled from "styled-components";
import { mobile } from "@docspace/components/utils/device";
import { isMobileOnly } from "react-device-detect";

const StyledSectionFooter = styled.div`
  margin-top: 40px;

  @media ${mobile}, ${isMobileOnly} {
    margin-top: 32px;
  }
`;

const SectionFooter = ({ children }) => {
  return <StyledSectionFooter>{children}</StyledSectionFooter>;
};

SectionFooter.displayName = "SectionFooter";

export default SectionFooter;
