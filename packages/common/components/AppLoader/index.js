import React from "react";
import styled from "styled-components";
import { Loader } from "@docspace/shared/components";

import { Base } from "@docspace/shared/themes";

const StyledContainer = styled.div`
  // width: 100vw;
  // height: 100vh;
  overflow: hidden;
  background: ${(props) => props.theme.backgroundColor};
  z-index: 5000;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

StyledContainer.defaultProps = { theme: Base };

const AppLoader = () => (
  <StyledContainer>
    <Loader className="pageLoader" type="rombs" size="40px" />
  </StyledContainer>
);

export default AppLoader;
