import styled, { css } from "styled-components";
import Base from "../themes/base";

const StyledDropdown = styled.div`
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;
  font-weight: ${(props) => props.theme.dropDown.fontWeight};
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(props.theme.dropDown.fontSize)};
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'maxHeight' does not exist on type 'Theme... Remove this comment to see the full error message
    props.maxHeight &&
    `
    // @ts-expect-error TS(2339): Property 'maxHeight' does not exist on type 'Theme... Remove this comment to see the full error message
    max-height: ${props.maxHeight}px;
    overflow-y: auto;
  `}
  height: fit-content;
  position: absolute;
  // @ts-expect-error TS(2339): Property 'manualWidth' does not exist on type 'The... Remove this comment to see the full error message
  ${(props) => props.manualWidth && `width: ${props.manualWidth};`}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Them... Remove this comment to see the full error message
    props.directionY === "top" &&
    css`
      // @ts-expect-error TS(2339): Property 'manualY' does not exist on type 'ThemePr... Remove this comment to see the full error message
      bottom: ${(props) => (props.manualY ? props.manualY : "100%")};
    `}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Them... Remove this comment to see the full error message
    props.directionY === "bottom" &&
    css`
      // @ts-expect-error TS(2339): Property 'manualY' does not exist on type 'ThemePr... Remove this comment to see the full error message
      top: ${(props) => (props.manualY ? props.manualY : "100%")};
    `}

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Them... Remove this comment to see the full error message
    props.directionX === "right" &&
    // @ts-expect-error TS(2339): Property 'directionXStylesDisabled' does not exist... Remove this comment to see the full error message
    !props.directionXStylesDisabled &&
    (props.theme.interfaceDirection === "rtl"
      ? css`
          // @ts-expect-error TS(2339): Property 'manualX' does not exist on type 'ThemedS... Remove this comment to see the full error message
          left: ${props.manualX || "0px"};
        `
      : css`
          // @ts-expect-error TS(2339): Property 'manualX' does not exist on type 'ThemedS... Remove this comment to see the full error message
          right: ${props.manualX || "0px"};
        `)}

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Them... Remove this comment to see the full error message
    props.directionX === "left" &&
    // @ts-expect-error TS(2339): Property 'directionXStylesDisabled' does not exist... Remove this comment to see the full error message
    !props.directionXStylesDisabled &&
    (props.theme.interfaceDirection === "rtl"
      ? css`
          // @ts-expect-error TS(2339): Property 'manualX' does not exist on type 'ThemedS... Remove this comment to see the full error message
          right: ${props.manualX || "0px"};
        `
      : css`
          // @ts-expect-error TS(2339): Property 'manualX' does not exist on type 'ThemedS... Remove this comment to see the full error message
          left: ${props.manualX || "0px"};
        `)}

  z-index: ${(props) =>
    // @ts-expect-error TS(2339): Property 'zIndex' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    props.zIndex ? props.zIndex : props.theme.dropDown.zIndex};
  display: ${(props) =>
    // @ts-expect-error TS(2339): Property 'open' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    props.open ? (props.columnCount ? "block" : "table") : "none"};

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isDropdownReady' does not exist on type ... Remove this comment to see the full error message
    !props.isDropdownReady &&
    `
    visibility: hidden;
    top: 0;
  `}}

  background: ${(props) => props.theme.dropDown.background};
  border: ${(props) => props.theme.dropDown.border};
  border-radius: ${(props) => props.theme.dropDown.borderRadius};
  -moz-border-radius: ${(props) => props.theme.dropDown.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.dropDown.borderRadius};
  box-shadow: ${(props) => props.theme.dropDown.boxShadow};
  -moz-box-shadow: ${(props) => props.theme.dropDown.boxShadow};
  -webkit-box-shadow: ${(props) => props.theme.dropDown.boxShadow};
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isMobileView' does not exist on type 'Th... Remove this comment to see the full error message
    props.isMobileView &&
    css`
      box-shadow: ${(props) => props.theme.dropDown.boxShadowMobile};
      -moz-box-shadow: ${(props) => props.theme.dropDown.boxShadowMobile};
      -webkit-box-shadow: ${(props) => props.theme.dropDown.boxShadowMobile};
    `}

  // @ts-expect-error TS(2339): Property 'maxHeight' does not exist on type 'Theme... Remove this comment to see the full error message
  padding: ${(props) => !props.maxHeight && props.itemCount > 1 && `4px 0px`};
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'columnCount' does not exist on type 'The... Remove this comment to see the full error message
    props.columnCount &&
    `
    // @ts-expect-error TS(2339): Property 'columnCount' does not exist on type 'The... Remove this comment to see the full error message
    -webkit-column-count: ${props.columnCount};
    // @ts-expect-error TS(2339): Property 'columnCount' does not exist on type 'The... Remove this comment to see the full error message
    -moz-column-count: ${props.columnCount};
          // @ts-expect-error TS(2339): Property 'columnCount' does not exist on type 'The... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2339): Property 'isMobileView' does not exist on type 'Th... Remove this comment to see the full error message
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
