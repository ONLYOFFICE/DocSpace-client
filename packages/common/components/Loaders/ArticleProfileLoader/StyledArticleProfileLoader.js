import styled, { css } from "styled-components";
import { tablet } from "@docspace/components/utils/device";


const StyledContainer = styled.div`
  z-index: 209;
  position: ${(props) => (props.isVirtualKeyboardOpen ? "absolute" : "fixed")};
  bottom: 0;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}
  min-width: 251px;
  max-width: 251px;
  background-color: ${(props) => props.theme.catalog.profile.background};

  @media ${tablet} {
    min-width: ${(props) => (props.showText ? "243px" : "60px")};
    max-width: ${(props) => (props.showText ? "243px" : "60px")};
  }
`;

const StyledBlock = styled.div`
  padding: 16px 20px;
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;

  border-top: ${(props) => props.theme.catalog.profile.borderTop};

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `border-left: ${theme.catalog.verticalLine};`
      : `border-right: ${theme.catalog.verticalLine};`}
  background-color: ${(props) => props.theme.catalog.profile.background};

  @media ${tablet} {
    padding: 16px 14px;
  }

  .title {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 12px;`
        : `margin-left: 12px;`}
  }

  .option-button {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: auto;`
        : `margin-left: auto;`}
  }
`;

export { StyledContainer, StyledBlock };
