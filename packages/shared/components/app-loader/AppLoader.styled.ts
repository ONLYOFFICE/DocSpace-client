import styled from "styled-components";

import { Base } from "@docspace/shared/themes";

export const StyledContainer = styled.div`
  width: 100vw;
  height: 100vh;

  display: flex;
  align-item: center;
  justify-content: center;
  overflow: hidden;
  background: ${(props) => props.theme.backgroundColor};
  z-index: 5000;
  position: fixed;
  top: 0;
  left: 0;

  .pageLoader {
    position: fixed;
    inset-inline-start: calc(50%-20px);
    top: 35%;
  }
`;

StyledContainer.defaultProps = { theme: Base };
