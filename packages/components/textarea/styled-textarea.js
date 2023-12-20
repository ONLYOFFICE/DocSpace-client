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
}) => <Scrollbar {...props} />;

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

  textarea {
    height: ${(props) => {
      return props.heightScale
        ? "65vh"
        : props.heightTextArea
        ? props.heightTextArea + "px"
        : "89px";
    }};
  }
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
      isDisabled,
      heightScale,
      hasError,
      color,
      paddingLeftProp,
      isJSONField,
      enableCopy,
      ...props
    },
    ref
  ) => <TextareaAutosize {...props} ref={ref} />
);

const StyledTextarea = styled(ClearTextareaAutosize).attrs(
  ({ autoFocus, ...props }) => ({
    autoFocus: props.autoFocus,
  })
)`
  ${commonInputStyle};
  white-space: ${(props) => (props.isJSONField ? "pre" : "pre-line")};
  width: 100%;

  display: table;
  width: -webkit-fill-available;

  border: none;
  outline: none;
  resize: none;
  overflow: ${(props) => (props.isJSONField ? "visible !important" : "hidden")};
  padding: 5px 8px 2px;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? `padding-right: ${props.paddingLeftProp};`
      : `padding-left: ${props.paddingLeftProp};`}
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
      ? `left: ${props.isJSONField && props.heightScale ? "18px" : "10px"};`
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
      props.enableCopy ? (props.isJSONField ? "36px" : "8px") : "0"};
  }
`;

const Numeration = styled.pre`
  display: block;
  position: absolute;
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
