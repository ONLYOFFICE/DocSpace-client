import styled, { css } from "styled-components";
import Base from "../themes/base";
import { getCorrectBorderRadius } from "../utils/rtlUtils";

const paddingRightStyle = (props: any) => props.theme.fileInput.paddingRight[props.size];

const widthIconStyle = (props: any) => props.theme.fileInput.icon.width[props.size];
const heightIconStyle = (props: any) => props.theme.fileInput.icon.height[props.size];
const widthIconButtonStyle = (props: any) => props.theme.fileInput.iconButton.width[props.size];

const heightInputStyle = (props: any) => props.theme.fileInput.height[props.size];

const StyledFileInput = styled.div`
  display: flex;
  position: relative;
  outline: none;
  width: ${(props) =>
    // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'ThemedSty... Remove this comment to see the full error message
    (props.scale && "100%") ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "base" && props.theme.input.width.base) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "middle" && props.theme.input.width.middle) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "big" && props.theme.input.width.big) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "huge" && props.theme.input.width.huge) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "large" && props.theme.input.width.large)};

  max-height: ${(props) => heightInputStyle(props)};

  .text-input {
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
      (props.hasError && props.theme.input.errorBorderColor) ||
      // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Them... Remove this comment to see the full error message
      (props.hasWarning && props.theme.input.warningBorderColor) ||
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      (props.isDisabled && props.theme.input.disabledBorderColor) ||
      props.theme.input.borderColor};

    text-overflow: ellipsis;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `padding-left: ${paddingRightStyle(props) || "40px"};`
        : `padding-right: ${paddingRightStyle(props) || "40px"};`}

    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    margin: 0;
  }

  :hover {
    .icon {
      border-color: ${(props) =>
        // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
        (props.hasError && props.theme.input.hoverErrorBorderColor) ||
        // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Them... Remove this comment to see the full error message
        (props.hasWarning && props.theme.input.hoverWarningBorderColor) ||
        // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
        (props.isDisabled && props.theme.input.hoverDisabledBorderColor) ||
        props.theme.input.hoverBorderColor};
    }
  }

  :active {
    .icon {
      border-color: ${(props) =>
        // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
        (props.hasError && props.theme.input.focusErrorBorderColor) ||
        // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Them... Remove this comment to see the full error message
        (props.hasWarning && props.theme.input.focusWarningBorderColor) ||
        // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
        (props.isDisabled && props.theme.input.focusDisabledBorderColor) ||
        props.theme.input.focusBorderColor};
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;

    width: ${(props) => widthIconStyle(props)};

    height: ${(props) => heightIconStyle(props)};

    margin: 0;
    border: ${(props) => props.theme.fileInput.icon.border};

    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
      (props.hasError && props.theme.input.errorBorderColor) ||
      // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Them... Remove this comment to see the full error message
      (props.hasWarning && props.theme.input.warningBorderColor) ||
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      (props.isDisabled && props.theme.input.disabledBorderColor) ||
      props.theme.input.borderColor};
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};

    .loader {
      padding-top: 5px;
    }

    border-radius: ${({ theme }) =>
      getCorrectBorderRadius(
        theme.fileInput.icon.borderRadius,
        theme.interfaceDirection
      )};

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0;
          `
        : css`
            right: 0;
          `}
  }

  .icon-button {
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    width: ${(props) => widthIconButtonStyle(props)};
  }
`;
StyledFileInput.defaultProps = { theme: Base };

export default StyledFileInput;
