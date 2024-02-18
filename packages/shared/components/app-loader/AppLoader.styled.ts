import styled from "styled-components";

import { Base } from "@docspace/shared/themes";

export const StyledContainer = styled.div`
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
