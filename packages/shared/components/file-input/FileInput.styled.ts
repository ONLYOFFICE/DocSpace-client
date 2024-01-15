import styled, { css } from "styled-components";
import { Base, TTheme } from "../../themes";
import { getCorrectBorderRadius } from "../../utils";
import { InputSize } from "../text-input";

const paddingRightStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.paddingRight[props.size];
const widthIconStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.icon.width[props.size];
const heightIconStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.icon.height[props.size];
const widthIconButtonStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.iconButton.width[props.size];
const heightInputStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.height[props.size];

const StyledFileInput = styled.div<{
  size: InputSize;
  scale?: boolean;
  hasError?: boolean;
  hasWarning?: boolean;
  isDisabled?: boolean;
}>`
  display: flex;
  position: relative;
  outline: none;
  width: ${(props) =>
    (props.scale && "100%") ||
    (props.size === InputSize.base && props.theme.input.width.base) ||
    (props.size === InputSize.middle && props.theme.input.width.middle) ||
    (props.size === InputSize.big && props.theme.input.width.big) ||
    (props.size === InputSize.huge && props.theme.input.width.huge) ||
    (props.size === InputSize.large && props.theme.input.width.large)};

  max-height: ${(props) => heightInputStyle(props)};

  .text-input {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.errorBorderColor) ||
      (props.hasWarning && props.theme.input.warningBorderColor) ||
      (props.isDisabled && props.theme.input.disabledBorderColor) ||
      props.theme.input.borderColor};

    text-overflow: ellipsis;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `padding-left: ${paddingRightStyle(props) || "40px"};`
        : `padding-right: ${paddingRightStyle(props) || "40px"};`}

    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    margin: 0;
  }

  :hover {
    .icon {
      border-color: ${(props) =>
        (props.hasError && props.theme.input.hoverErrorBorderColor) ||
        (props.hasWarning && props.theme.input.hoverWarningBorderColor) ||
        (props.isDisabled && props.theme.input.hoverDisabledBorderColor) ||
        props.theme.input.hoverBorderColor};
    }
  }

  :active {
    .icon {
      border-color: ${(props) =>
        (props.hasError && props.theme.input.focusErrorBorderColor) ||
        (props.hasWarning && props.theme.input.focusWarningBorderColor) ||
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
      (props.hasError && props.theme.input.errorBorderColor) ||
      (props.hasWarning && props.theme.input.warningBorderColor) ||
      (props.isDisabled && props.theme.input.disabledBorderColor) ||
      props.theme.input.borderColor};

    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};

    .loader {
      padding-top: 5px;
    }

    border-radius: ${({ theme }) =>
      getCorrectBorderRadius(
        theme.fileInput.icon.borderRadius,
        theme.interfaceDirection,
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
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    width: ${(props) => widthIconButtonStyle(props)};
  }
`;
StyledFileInput.defaultProps = { theme: Base };

export default StyledFileInput;
