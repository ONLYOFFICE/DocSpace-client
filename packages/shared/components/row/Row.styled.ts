import styled, { css } from "styled-components";
import { isMobile } from "react-device-detect";

import {
  desktop,
  mobile,
  tablet,
  getCorrectFourValuesStyle,
} from "../../utils";
import { Base } from "../../themes";

import { TMode } from "./Row.types";

const StyledRow = styled.div<{
  withoutBorder?: boolean;
  checked?: boolean;
  mode: TMode;
}>`
  cursor: default;
  position: relative;
  min-height: ${(props) => props.theme.row.minHeight};
  width: ${(props) => props.theme.row.width};
  border-bottom: ${(props) =>
    props.withoutBorder ? "none" : "2px solid transparent"};

  ${(props) =>
    !props.withoutBorder &&
    css`
      ::after {
        position: absolute;
        display: block;
        bottom: 0px;
        width: 100%;
        height: 1px;
        background-color: ${props.theme.row.borderBottom};
        content: "";
      }
    `}

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  justify-content: flex-start;
  align-items: center;
  align-content: center;

  .row-progress-loader {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 9px;`
        : `margin-left: 9px;`}
    padding: 0;
    display: flex;
    align-items: center;
    justify-items: center;
    min-width: 32px;
  }

  ${(props) =>
    props.mode === "modern" &&
    css`
      .checkbox {
        display: ${props.checked ? "flex" : "none"};

        padding: ${getCorrectFourValuesStyle(
          "10px 1px 10px 8px",
          props.theme.interfaceDirection,
        )};
        ${props.theme.interfaceDirection === "rtl"
          ? `margin-right: -4px;`
          : `margin-left: -4px;`}
      }

      .styled-element {
        display: ${props.checked ? "none" : "flex"};
      }
    `}
`;
StyledRow.defaultProps = { theme: Base };

const StyledContent = styled.div`
  display: flex;
  flex-basis: 100%;

  min-width: ${(props) => props.theme.row.minWidth};

  @media ${tablet} {
    white-space: nowrap;
    overflow: ${(props) => props.theme.row.overflow};
    text-overflow: ${(props) => props.theme.row.textOverflow};
    height: ${(props) => props.theme.rowContent.height};
  }
`;
StyledContent.defaultProps = { theme: Base };

const StyledCheckbox = styled.div<{ mode: TMode }>`
  display: flex;
  flex: 0 0 16px;
  height: 56px;
  max-height: 56px;
  justify-content: center;
  align-items: center;

  min-width: 41px;
  width: 41px;
  ${(props) =>
    props.mode === "modern" &&
    !isMobile &&
    css`
      :hover {
        .checkbox {
          display: flex;
          opacity: 1;
          user-select: none;
        }
        .styled-element {
          display: none;
        }
      }
    `}
`;

const StyledElement = styled.div`
  flex: 0 0 auto;
  display: flex;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `
      margin-left: ${theme.row.element.marginRight};
      margin-right: ${theme.row.element.marginLeft};
        `
      : `
      margin-right: ${theme.row.element.marginRight};
      margin-left: ${theme.row.element.marginLeft};
        `}
  user-select: none;

  .react-svg-icon svg {
    margin-top: 4px;
  }
  /* .react-svg-icon.is-edit svg {
    margin: 4px 0 0 28px;
  } */
`;
StyledElement.defaultProps = { theme: Base };

const StyledContentElement = styled.div`
  margin-top: 0px;
  user-select: none;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 24px;
        `
      : css`
          margin-left: 24px;
        `}

  :empty, :has(.badges__quickButtons:empty) {
    display: none;
  }
`;

const StyledOptionButton = styled.div<{ spacerWidth?: string }>`
  display: flex;
  width: ${(props) => props.spacerWidth && props.spacerWidth};
  justify-content: flex-end;
  align-items: center;
  height: 100%;

  .expandButton > div:first-child {
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle(
        theme.row.optionButton.padding,
        theme.interfaceDirection,
      )};

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 0px;`
        : `margin-right: 0px;`}

    @media ${desktop} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-left: -1px;`
          : `margin-right: -1px;`}
    }
    @media ${mobile} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `padding-right: 10px;`
          : `padding-left: 10px;`}
    }
  }

  //margin-top: -1px;
  @media ${tablet} {
    margin-top: unset;
  }
`;
StyledOptionButton.defaultProps = { theme: Base };

export {
  StyledOptionButton,
  StyledContentElement,
  StyledElement,
  StyledCheckbox,
  StyledContent,
  StyledRow,
};
