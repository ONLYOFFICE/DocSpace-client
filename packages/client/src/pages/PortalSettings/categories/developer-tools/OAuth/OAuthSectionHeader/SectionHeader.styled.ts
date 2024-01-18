import styled, { css } from "styled-components";
import { isMobile, isMobileOnly } from "react-device-detect";

import { Base } from "@docspace/shared/themes";
import { tablet } from "@docspace/shared/utils/device";

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: ${(props) => props.theme.backgroundColor};
  z-index: 201;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 70px;
  flex-wrap: wrap;

  ${() =>
    isMobile &&
    css`
      margin-bottom: 11px;
    `}

  ${() =>
    isMobileOnly &&
    css`
      margin-top: 7px;
      margin-left: -14px;
      padding-left: 14px;
      margin-right: -14px;
      padding-right: 14px;
    `}

  .arrow-button {
    margin-inline-end: 18.5px;

    @media ${tablet} {
      padding-block: 8px;
      padding-inline: 8px 0;
      margin-inline-start: -8px;
    }

    ${() =>
      isMobileOnly &&
      css`
        margin-inline-end: 13px;
      `}

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }

  .headline {
    font-size: 18px;
    margin-inline-end: 16px;
  }
`;

HeaderContainer.defaultProps = { theme: Base };

export { HeaderContainer };
