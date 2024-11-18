// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
  isFullHeight?: boolean;
  fullHeight?: number;
  // @ts-expect-error error from custom scrollbar
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
      minHeight,
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
  ({
    autoFocus,
    dir,
    minHeight,
  }: {
    autoFocus?: boolean;
    dir?: string;
    minHeight?: string;
  }) => ({
    autoFocus,
    dir,
    style: { minHeight },
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

  padding-inline-start: ${(props) => props.paddingLeftProp};

  font-size: ${(props) => `${props.fontSize}px`};
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

  // doesn't require mirroring for LTR
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

  inset-inline-end: 18px;
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
    margin-inline-end: ${(props) =>
      props.enableCopy ? (props.isJSONField ? "36px" : "8px") : "0"};
  }
`;

const Numeration = styled.pre<{ fontSize: string }>`
  display: block;
  position: absolute;
  font-size: ${(props) => props.fontSize}px;
  font-family: ${(props) => props.theme.fontFamily};
  line-height: 1.5;
  margin: 0;
  top: 6px;
  text-align: end;

  inset-inline-start: 18px;
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
