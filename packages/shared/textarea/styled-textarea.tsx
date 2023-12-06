import React from "react";
import styled from "styled-components";
import TextareaAutosize from "react-autosize-textarea";

import Scrollbar from "../scrollbar";
import commonInputStyle from "../text-input/common-input-styles";
import Base from "../themes/base";
import { CopyIcon } from "./svg";

const ClearScrollbar = ({
  isDisabled,
  heightScale,
  hasError,
  heightTextArea,
  ...props
}: any) => <Scrollbar {...props} />;

const StyledScrollbar = styled(ClearScrollbar)`
  ${commonInputStyle};
  :focus-within {
    border-color: ${(props) =>
      props.hasError
        ? props.theme.textArea.focusErrorBorderColor
        : props.theme.textArea.focusBorderColor};
  }
  :focus {
    outline: ${(props) => props.theme.textArea.focusOutline};
  }

  width: ${(props) => props.theme.textArea.scrollWidth} !important;
  height: ${(props) => {
    return props.heightScale
      ? "67vh"
      : props.heightTextArea
      ? props.heightTextArea + 2 + "px"
      : "91px";
  }} !important;
  background-color: ${(props) =>
    props.isDisabled && props.theme.textArea.disabledColor};
`;

StyledScrollbar.defaultProps = {
  theme: Base,
};

// eslint-disable-next-line react/prop-types, no-unused-vars
const ClearTextareaAutosize = React.forwardRef(
  (
    {
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type '{}'.
      isDisabled,
      // @ts-expect-error TS(2339): Property 'heightScale' does not exist on type '{}'... Remove this comment to see the full error message
      heightScale,
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type '{}'.
      hasError,
      // @ts-expect-error TS(2339): Property 'color' does not exist on type '{}'.
      color,
      // @ts-expect-error TS(2339): Property 'paddingLeftProp' does not exist on type ... Remove this comment to see the full error message
      paddingLeftProp,
      // @ts-expect-error TS(2339): Property 'isJSONField' does not exist on type '{}'... Remove this comment to see the full error message
      isJSONField,
      // @ts-expect-error TS(2339): Property 'enableCopy' does not exist on type '{}'.
      enableCopy,
      ...props
    },
    ref
  // @ts-expect-error TS(2322): Type 'ForwardedRef<unknown>' is not assignable to ... Remove this comment to see the full error message
  ) => <TextareaAutosize {...props} ref={ref} />
);

const StyledTextarea = styled(ClearTextareaAutosize).attrs(
  // @ts-expect-error TS(2339): Property 'autoFocus' does not exist on type 'RefAt... Remove this comment to see the full error message
  ({ autoFocus, ...props }) => ({
    // @ts-expect-error TS(2339): Property 'autoFocus' does not exist on type '{ ref... Remove this comment to see the full error message
    autoFocus: props.autoFocus,
  })
)`
  ${commonInputStyle};
  // @ts-expect-error TS(2339): Property 'isJSONField' does not exist on type 'The... Remove this comment to see the full error message
  white-space: ${(props) => (props.isJSONField ? "pre" : "pre-line")};
  width: 100%;

  display: table;
  width: -webkit-fill-available;
  height: fit-content;
  border: none;
  outline: none;
  resize: none;
  // @ts-expect-error TS(2339): Property 'isJSONField' does not exist on type 'The... Remove this comment to see the full error message
  overflow: ${(props) => (props.isJSONField ? "visible !important" : "hidden")};
  padding: 5px 8px 2px;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      // @ts-expect-error TS(2339): Property 'paddingLeftProp' does not exist on type ... Remove this comment to see the full error message
      ? `padding-right: ${props.paddingLeftProp};`
      // @ts-expect-error TS(2339): Property 'paddingLeftProp' does not exist on type ... Remove this comment to see the full error message
      : `padding-left: ${props.paddingLeftProp};`}
  // @ts-expect-error TS(2339): Property 'fontSize' does not exist on type 'Themed... Remove this comment to see the full error message
  font-size: ${(props) => props.theme.getCorrectFontSize(props.fontSize)};
  font-family: ${(props) => props.theme.fontFamily};
  line-height: 1.5;

  :focus-within {
    border-color: ${(props) => props.theme.textArea.focusBorderColor};
  }

  :focus {
    outline: ${(props) => props.theme.textArea.focusOutline};
  }

  ::-webkit-input-placeholder {
    color: ${(props) => props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    user-select: none;
  }

  :-moz-placeholder {
    color: ${(props) => props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    user-select: none;
  }

  ::-moz-placeholder {
    color: ${(props) => props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    user-select: none;
  }

  :-ms-input-placeholder {
    color: ${(props) => props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    user-select: none;
  }

  ::placeholder {
    color: ${(props) => props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    user-select: none;
  }

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" &&
    `
      &:placeholder-shown {
        text-align: right;
      }`}
`;

StyledTextarea.defaultProps = { theme: Base };

const StyledCopyIcon = styled(({ isJSONField, heightScale, ...props }) => (
  <CopyIcon {...props} />
))`
  width: 16px;
  height: 16px;
  z-index: 1;
  filter: ${(props) => props.theme.textArea.copyIconFilter};

  :hover {
    cursor: pointer;
  }
`;

StyledCopyIcon.defaultProps = { theme: Base };

const CopyIconWrapper = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  z-index: 2;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      // @ts-expect-error TS(2339): Property 'isJSONField' does not exist on type 'The... Remove this comment to see the full error message
      ? `left: ${props.isJSONField && props.heightScale ? "18px" : "10px"};`
      // @ts-expect-error TS(2339): Property 'isJSONField' does not exist on type 'The... Remove this comment to see the full error message
      : `right: ${props.isJSONField && props.heightScale ? "18px" : "10px"};`}
  top: 6px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

CopyIconWrapper.defaultProps = { theme: Base };

const Wrapper = styled.div`
  position: relative;

  max-width: 1200px;

  .scroll-wrapper {
    margin-right: ${(props) =>
      // @ts-expect-error TS(2339): Property 'enableCopy' does not exist on type 'Them... Remove this comment to see the full error message
      props.enableCopy ? (props.isJSONField ? "36px" : "8px") : "0"};
  }
`;

const Numeration = styled.pre`
  display: block;
  position: absolute;
  // @ts-expect-error TS(2339): Property 'fontSize' does not exist on type 'Themed... Remove this comment to see the full error message
  font-size: ${(props) => props.theme.getCorrectFontSize(props.fontSize)};
  font-family: ${(props) => props.theme.fontFamily};
  line-height: 1.5;
  margin: 0;
  top: 6px;
  text-align: right;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `right: 18px;` : `left: 18px;`}
  color: ${(props) => props.theme.textArea.numerationColor};

  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
`;

Numeration.defaultProps = { theme: Base };

export {
  StyledTextarea,
  StyledScrollbar,
  StyledCopyIcon,
  Wrapper,
  Numeration,
  CopyIconWrapper,
};
