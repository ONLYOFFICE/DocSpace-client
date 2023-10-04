import React from "react";
import styled from "styled-components";

import { tablet, hugeMobile } from "@docspace/components/utils/device";

const Wrapper = styled.div`
  width: calc(100% - 20px);

  @media ${tablet} {
    width: calc(100% - 16px);
  }

  @media ${hugeMobile} {
    width: 100%;
  }
`;

const SectionSubmenu = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

SectionSubmenu.displayName = "SectionSubmenu";

export default SectionSubmenu;
