import React from "react";
import styled, { css } from "styled-components";
import TextareaAutosize from "react-autosize-textarea";

import CopyIcon from "PUBLIC_DIR/images/copy.react.svg";

import { commonInputStyles } from "../../utils";
import { Base, TColorScheme, TTheme } from "../../themes";

import { Scrollbar, ScrollbarProps } from "../scrollbar";
import { TextareaProps } from "./Textarea.types";

const ClearScrollbar = ({
  isDisabled,
  heightScale,
  hasError,
  heightTextAreaProp,
  isFullHeight,
  fullHeight,
  ...props
}: {
  isDisabled?: boolean;
  heightScale?: boolean;
  hasError?: boolean;
  heightTextAreaProp?: string;
  ref?: React.Ref<HTMLDivElement>;
} & ScrollbarProps) => <Scrollbar {...props} />;

const StyledScrollbar = styled(ClearScrollbar)`
  ${commonInputStyles};
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
  height: calc(
    ${(props) => {
        return props.heightScale
          ? "67vh"
          : props.isFullHeight
            ? `${props.fullHeight}px`
            : props.heightTextAreaProp
              ? props.heightTextAreaProp
              : "91px";
      }} + 2px
  ) !important;

  textarea {
    height: ${(props) => {
      return props.heightScale
        ? "65vh"
        : props.isFullHeight
          ? `${props.fullHeight}px`
          : props.heightTextAreaProp
            ? props.heightTextAreaProp
            : "89px";
    }};
  }
  background-color: ${(props) =>
    props.isDisabled && props.theme.textArea.disabledColor};
`;

StyledScrollbar.defaultProps = {
  theme: Base,
};

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
      heightTextArea,
      ...props
    }: TextareaProps & {
      disabled?: boolean;
      readOnly?: boolean;
    },
    ref: React.Ref<HTMLTextAreaElement>,
  ) => <TextareaAutosize {...props} ref={ref} />,
);

ClearTextareaAutosize.displayName = "ClearTextareaAutosize";

const StyledTextarea = styled(ClearTextareaAutosize).attrs(
  ({ autoFocus, dir }: { autoFocus?: boolean; dir?: string }) => ({
    autoFocus,
    dir,
  }),
)`
  ${commonInputStyles};

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

  font-size: ${(props) =>
    props.theme.getCorrectFontSize(`${props.fontSize}px`)};
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

const CopyIconWrapper = styled.div<{
  isJSONField: boolean;
  heightScale?: boolean;
}>`
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

const Wrapper = styled.div<{
  heightScale?: boolean;
  isFullHeight?: boolean;
  fullHeight?: number;
  heightTextArea?: string;
  enableCopy?: boolean;
  isJSONField?: boolean;
}>`
  position: relative;

  max-width: 1200px;
  height: ${(props) => {
    return props.heightScale
      ? "65vh"
      : props.isFullHeight
        ? `${props.fullHeight}px`
        : props.heightTextArea
          ? props.heightTextArea
          : "89px";
  }};

  .scroll-wrapper {
    margin-right: ${(props) =>
      props.enableCopy ? (props.isJSONField ? "36px" : "8px") : "0"};
  }
`;

const Numeration = styled.pre<{ fontSize: string }>`
  display: block;
  position: absolute;
  font-size: ${(props) => props.theme.getCorrectFontSize(props.fontSize)}px;
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

const getDefaultStyles = ({
  $currentColorScheme,
  hasError,
  theme,
}: {
  $currentColorScheme?: TColorScheme;
  hasError?: boolean;
  theme: TTheme;
}) =>
  $currentColorScheme &&
  css`
    :focus-within {
      border-color: ${hasError
        ? theme?.textArea.focusErrorBorderColor
        : theme.textArea.focusBorderColor};
    }
  `;

StyledScrollbar.defaultProps = {
  theme: Base,
};

const StyledThemeTextarea = styled(StyledScrollbar)(getDefaultStyles);

export {
  StyledTextarea,
  StyledScrollbar,
  StyledCopyIcon,
  Wrapper,
  Numeration,
  CopyIconWrapper,
  StyledThemeTextarea,
};
