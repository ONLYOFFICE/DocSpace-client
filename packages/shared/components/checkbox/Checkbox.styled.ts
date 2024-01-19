import styled, { css } from "styled-components";
import { Base } from "../../themes";

const StyledLabel = styled.label<{
  isDisabled: boolean;
  isIndeterminate: boolean;
  hasError: boolean;
}>`
  display: flex;
  align-items: center;
  position: relative;
  margin: 0;

  user-select: none;
  -o-user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .checkbox {
    margin-right: 12px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-right: 0;
        margin-left: 12px;
      `}
    overflow: visible;
    outline: none;
  }

  svg {
    ${(props) =>
      props.hasError &&
      css`
        rect {
          stroke: ${props.theme.checkbox.errorColor} !important;
        }
        path {
          fill: ${props.theme.checkbox.errorColor} !important;
        }
      `}
    ${(props) =>
      !props.isIndeterminate && !props.isDisabled
        ? css`
            rect {
              fill: ${props.theme.checkbox.fillColor};
              stroke: ${props.theme.checkbox.borderColor};
            }
            path {
              fill: ${props.theme.checkbox.arrowColor};
            }
            &:focus {
              outline: none;
              rect {
                stroke: ${props.theme.checkbox.focusColor};
              }
            }
          `
        : !props.isDisabled &&
          css`
            rect {
              fill: ${props.theme.checkbox.fillColor};
              stroke: ${props.theme.checkbox.borderColor};
            }
            }
            rect:last-child {
              fill: ${props.theme.checkbox.indeterminateColor};
              stroke: ${props.theme.checkbox.fillColor};
            }
          `}

    ${(props) =>
      props.isDisabled && !props.isIndeterminate
        ? css`
            rect {
              fill: ${props.theme.checkbox.disableFillColor};
              stroke: ${props.theme.checkbox.disableBorderColor};
            }
            path {
              fill: ${props.theme.checkbox.disableArrowColor};
            }
          `
        : props.isDisabled &&
          css`
            rect {
              fill: ${props.theme.checkbox.disableFillColor};
              stroke: ${props.theme.checkbox.disableBorderColor};
            }
            rect:last-child {
              fill: ${props.theme.checkbox.disableIndeterminateColor};
            }
          `}
  }
  &:hover {
    ${(props) =>
      props.isDisabled
        ? css`
            cursor: not-allowed;
          `
        : !props.isIndeterminate
          ? css`
              cursor: pointer;

              rect:nth-child(1) {
                stroke: ${props.theme.checkbox.hoverBorderColor};
              }
            `
          : css`
          cursor: pointer;
          rect:nth-child(1) {
              stroke: ${props.theme.checkbox.hoverBorderColor};
            }
          rect:last-child {
              fill: ${props.theme.checkbox.hoverIndeterminateColor};
            `}
  }

  &:active {
    ${(props) =>
      props.isDisabled
        ? css`
            cursor: not-allowed;
          `
        : !props.isIndeterminate
          ? css`
              cursor: pointer;

              rect:nth-child(1) {
                stroke: ${props.theme.checkbox.pressedBorderColor};
                fill: ${props.theme.checkbox.pressedFillColor};
              }
            `
          : css`
          cursor: pointer;
          rect:nth-child(1) {
              stroke: ${props.theme.checkbox.pressedBorderColor};
              fill: ${props.theme.checkbox.pressedFillColor};
            }
          rect:last-child {
              fill: ${props.theme.checkbox.hoverIndeterminateColor};
            `}
  }

  .wrapper {
    display: inline-block;
  }

  .checkbox-text {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.text.disableColor
        : props.hasError
          ? props.theme.checkbox.errorColor
          : props.theme.text.color};
    margin-top: -2px;
  }

  .help-button {
    display: inline-block;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 4px;`
        : `margin-left: 4px;`}
  }
`;
StyledLabel.defaultProps = { theme: Base };

const HiddenInput = styled.input`
  opacity: 0.0001;
  position: absolute;
  right: 0;
  z-index: -1;
`;

export { StyledLabel, HiddenInput };
