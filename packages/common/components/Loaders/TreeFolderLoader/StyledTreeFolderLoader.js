import styled from "styled-components";
import { desktop } from "@docspace/shared/utils";

const StyledTreeFolder = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 8px 1fr;
  grid-template-rows: 1fr;
  grid-column-gap: 6px;
  margin-bottom: 24px;
`;

const StyledContainer = styled.div`
  margin-top: 48px;
  width: 100%;
`;

const StyledBox = styled.div`
  @media ${desktop} {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 8px;`
        : `margin-right: 8px;`}
  }
`;

export { StyledTreeFolder, StyledContainer, StyledBox };
