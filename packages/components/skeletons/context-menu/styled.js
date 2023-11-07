import styled, { css } from "styled-components";
import { tablet } from "../../utils/device";
import { getCorrectFourValuesStyle } from "../../utils/rtlUtils";

export const StyledContextMenu = styled.div`
  width: 100%;
  height: 32px;
  display: grid;
  grid-template-columns: 16px 1fr;
  grid-column-gap: 8px;
  justify-items: center;
  align-items: center;

  @media ${tablet} {
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("4px 12px 4px 16px", theme.interfaceDirection)};
    grid-column-gap: 0px;
  }

  .context-menu-rectangle {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? css`
            margin-left: auto;
            margin-right: 8px;
          `
        : css`
            margin-right: auto;
            margin-left: 8px;
          `}
  }
`;
