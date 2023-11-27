import styled, { css } from "styled-components";
import Base from "../themes/base";

const StyledLabel = styled.label`
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

  /* ${(props) =>
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    props.isDisabled
      ? css`
          cursor: not-allowed;
        `
      : css`
          cursor: pointer;

          &:hover {
            svg {
              rect:first-child {
                stroke: ${(props) => props.theme.text.hoverColor};
              }
            }
          }
        `} */

  svg {
    ${(props) =>
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
      props.hasError &&
      css`
        rect {
          stroke: ${(props) => props.theme.checkbox.errorColor} !important;
        }
        path {
          fill: ${(props) => props.theme.checkbox.errorColor} !important;
        }
      `}
    ${(props) =>
      // @ts-expect-error TS(2339): Property 'isIndeterminate' does not exist on type ... Remove this comment to see the full error message
      !props.isIndeterminate && !props.isDisabled
        ? css`
            rect {
              fill: ${(props) => props.theme.checkbox.fillColor};
              stroke: ${(props) => props.theme.checkbox.borderColor};
            }
            path {
              fill: ${(props) => props.theme.checkbox.arrowColor};
            }
            &:focus {
              outline: none;
              rect {
                stroke: ${(props) => props.theme.checkbox.focusColor};
              }
            }
          `
        // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
        : !props.isDisabled &&
          css`
            rect {
              fill: ${(props) => props.theme.checkbox.fillColor};
              stroke: ${(props) => props.theme.checkbox.borderColor};
            }
            }
            rect:last-child {
              fill: ${(props) => props.theme.checkbox.indeterminateColor};
              stroke: ${(props) => props.theme.checkbox.fillColor};
            }
          `}

    ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled && !props.isIndeterminate
        ? css`
            rect {
              fill: ${(props) => props.theme.checkbox.disableFillColor};
              stroke: ${(props) => props.theme.checkbox.disableBorderColor};
            }
            path {
              fill: ${(props) => props.theme.checkbox.disableArrowColor};
            }
          `
        // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
        : props.isDisabled &&
          css`
            rect {
              fill: ${(props) => props.theme.checkbox.disableFillColor};
              stroke: ${(props) => props.theme.checkbox.disableBorderColor};
            }
            rect:last-child {
              fill: ${(props) =>
                props.theme.checkbox.disableIndeterminateColor};
            }
          `}
  }
  &:hover {
    ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled
        ? css`
            cursor: not-allowed;
          `
        // @ts-expect-error TS(2339): Property 'isIndeterminate' does not exist on type ... Remove this comment to see the full error message
        : !props.isIndeterminate
        ? css`
            cursor: pointer;

            rect:nth-child(1) {
              stroke: ${(props) => props.theme.checkbox.hoverBorderColor};
            }
          `
        : css`
          cursor: pointer;
          rect:nth-child(1) {
              stroke: ${(props) => props.theme.checkbox.hoverBorderColor};
            }
          rect:last-child {
              fill: ${(props) => props.theme.checkbox.hoverIndeterminateColor};
            `}
  }

  &:active {
    ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled
        ? css`
            cursor: not-allowed;
          `
        // @ts-expect-error TS(2339): Property 'isIndeterminate' does not exist on type ... Remove this comment to see the full error message
        : !props.isIndeterminate
        ? css`
            cursor: pointer;

            rect:nth-child(1) {
              stroke: ${(props) => props.theme.checkbox.pressedBorderColor};
              fill: ${(props) => props.theme.checkbox.pressedFillColor};
            }
          `
        : css`
          cursor: pointer;
          rect:nth-child(1) {
              stroke: ${(props) => props.theme.checkbox.pressedBorderColor};
              fill: ${(props) => props.theme.checkbox.pressedFillColor};
            }
          rect:last-child {
              fill: ${(props) => props.theme.checkbox.hoverIndeterminateColor};
            `}
  }

  .wrapper {
    display: inline-block;
  }

  .checkbox-text {
    color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled
        ? props.theme.text.disableColor
        // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Themed... Remove this comment to see the full error message
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
