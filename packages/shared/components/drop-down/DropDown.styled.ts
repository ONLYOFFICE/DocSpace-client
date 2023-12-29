import styled, { css } from "styled-components";
import Base from "../../themes/base";

const StyledDropdown = styled.div<{
  maxHeight?: number;
  manualWidth?: string;
  directionY?: "top" | "bottom" | "both";
  directionX?: "left" | "right";
  manualY?: string;
  manualX?: string;
  directionXStylesDisabled?: boolean | null;
  columnCount?: string;
  isDropdownReady?: boolean;
  zIndex?: number;
  open?: boolean;
  isMobileView?: boolean;
  itemCount?: number;
}>`
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;
  font-weight: ${(props) => props.theme.dropDown.fontWeight};
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(props.theme.dropDown.fontSize)};
  ${(props) =>
    props.maxHeight &&
    `
    max-height: ${props.maxHeight}px;
    overflow-y: auto;
  `}
  height: fit-content;
  position: absolute;

  ${(props) => props.manualWidth && `width: ${props.manualWidth};`}
  ${(props) =>
    props.directionY === "top" &&
    css`
      bottom: ${props.manualY ? props.manualY : "100%"};
    `}
  ${(props) =>
    props.directionY === "bottom" &&
    css`
      top: ${props.manualY ? props.manualY : "100%"};
    `}

  ${(props) =>
    props.directionX === "right" &&
    !props.directionXStylesDisabled &&
    (props.theme.interfaceDirection === "rtl"
      ? css`
          left: ${props.manualX || "0px"};
        `
      : css`
          right: ${props.manualX || "0px"};
        `)}

  ${(props) =>
    props.directionX === "left" &&
    !props.directionXStylesDisabled &&
    (props.theme.interfaceDirection === "rtl"
      ? css`
          right: ${props.manualX || "0px"};
        `
      : css`
          left: ${props.manualX || "0px"};
        `)}

  z-index: ${(props) =>
    props.zIndex ? props.zIndex : props.theme.dropDown.zIndex};
  display: ${(props) =>
    props.open ? (props.columnCount ? "block" : "table") : "none"};

  ${(props) =>
    !props.isDropdownReady &&
    `
    visibility: hidden;
    top: 0;
  `}

  background: ${(props) => props.theme.dropDown.background};
  border: ${(props) => props.theme.dropDown.border};
  border-radius: ${(props) => props.theme.dropDown.borderRadius};
  -moz-border-radius: ${(props) => props.theme.dropDown.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.dropDown.borderRadius};
  box-shadow: ${(props) => props.theme.dropDown.boxShadow};
  -moz-box-shadow: ${(props) => props.theme.dropDown.boxShadow};
  -webkit-box-shadow: ${(props) => props.theme.dropDown.boxShadow};

  padding: ${(props) =>
    !props.maxHeight && props.itemCount && props.itemCount > 1 && `4px 0px`};
  ${(props) =>
    props.columnCount &&
    `
    -webkit-column-count: ${props.columnCount};
    -moz-column-count: ${props.columnCount};
    column-count: ${props.columnCount};
  `}

  .scroll-drop-down-item {
    .scroll-body {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? `padding-left: 0 !important;`
          : `padding-right: 0 !important;`}
    }
  }
  &.download-dialog-dropDown {
    margin-top: 4px;
  }

  @media (orientation: portrait) {
    ${(props) =>
      props.isMobileView &&
      css`
        top: auto !important;
        bottom: 0;
        ${props.theme.interfaceDirection === "rtl" ? `right: 0;` : `left: 0;`}
        width: 100%;
      `}
  }
`;

StyledDropdown.defaultProps = { theme: Base };

export default StyledDropdown;
