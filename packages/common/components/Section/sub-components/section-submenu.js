import React from "react";
import styled from "styled-components";

import { tablet, mobile } from "@docspace/shared/utils/device";

const Wrapper = styled.div`
  width: calc(100% - 20px);

  @media ${tablet} {
    width: calc(100% - 16px);
  }

  @media ${mobile} {
    width: 100%;
  }
`;

const SectionSubmenu = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

SectionSubmenu.displayName = "SectionSubmenu";

export default SectionSubmenu;
