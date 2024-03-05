import styled from "styled-components";

import { Base } from "@docspace/shared/themes";

export const StyledContainer = styled.div`
  // width: 100vw;
  // height: 100vh;
  width: 100%;
  height: 100%;
  display: flex;
  align-item: center;
  justify-content: center;
  overflow: hidden;
  background: ${(props) => props.theme.backgroundColor};
  z-index: 5000;
  position: fixed;
  top: 150px;
  left: 0;
`;

StyledContainer.defaultProps = { theme: Base };
