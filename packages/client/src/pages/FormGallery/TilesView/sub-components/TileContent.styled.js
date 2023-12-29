import styled, { css } from "styled-components";

import { tablet } from "@docspace/shared/utils";

const commonCss = css`
  margin: 0;
  font-family: "Open Sans";
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  font-style: normal;
  font-weight: 600;
`;

const truncateCss = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MainContainer = styled.div`
  height: 20px;

  @media ${tablet} {
    ${truncateCss};
  }
`;

export const MainContainerWrapper = styled.div`
  ${commonCss};

  display: flex;
  align-self: center;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: auto;`
      : `margin-right: auto;`}
`;

export const StyledTileContent = styled.div`
  width: 100%;
  display: inline-flex;
`;
