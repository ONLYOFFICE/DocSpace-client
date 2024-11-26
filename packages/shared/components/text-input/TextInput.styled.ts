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

import styled from "styled-components";

import { commonInputStyles, NoUserSelect } from "../../utils";
import { Base } from "../../themes";

import { InputSize } from "./TextInput.enums";

import { Input } from "./sub-components/Input";

const StyledTextInput = styled(Input).attrs((props) => ({
  id: props.id,
  forwardedRef: props.forwardedRef,
  name: props.name,
  type: props.type,
  value: props.value,
  placeholder: props.placeholder,
  maxLength: props.maxLength,
  onChange: props.onChange,
  onBlur: props.onBlur,
  onFocus: props.onFocus,
  readOnly: props.isReadOnly,
  autoFocus: props.isAutoFocussed,
  autoComplete: props.autoComplete,
  tabIndex: props.tabIndex,
  disabled: props.isDisabled ? "disabled" : "",
  theme: props.theme || Base,
}))`
  ${commonInputStyles}
  -webkit-appearance: ${(props) => props.theme.textInput.appearance};

  background-color: ${(props) =>
    props.isDisabled
      ? props.theme.input.disableBackgroundColor
      : props.theme.input.backgroundColor};

  -webkit-background-clip: text !important;

  -webkit-text-fill-color: ${(props) =>
    props.isDisabled
      ? props.theme.input.disableColor
      : props?.value
        ? props.theme.text.color
        : props.theme.textInput.placeholderColor} !important;
  caret-color: ${(props) =>
    props.isDisabled ? props.theme.input.disableColor : props.theme.text.color};

  box-shadow: inset 0 0 0 30px
    ${(props) =>
      props.isDisabled
        ? props.theme.input.disableBackgroundColor
        : props.theme.input.backgroundColor} !important;

  display: ${(props) => props.theme.textInput.display};
  font-family: ${(props) => props.theme.fontFamily};
  line-height: ${(props) =>
    (props.size === InputSize.base && props.theme.textInput.lineHeight.base) ||
    (props.size === InputSize.middle &&
      props.theme.textInput.lineHeight.middle) ||
    (props.size === InputSize.big && props.theme.textInput.lineHeight.big) ||
    (props.size === InputSize.huge && props.theme.textInput.lineHeight.huge) ||
    (props.size === InputSize.large && props.theme.textInput.lineHeight.large)};
  font-size: ${(props) =>
    (props.size === InputSize.base && props.theme.textInput.fontSize.base) ||
    (props.size === InputSize.middle &&
      props.theme.textInput.fontSize.middle) ||
    (props.size === InputSize.big && props.theme.textInput.fontSize.big) ||
    (props.size === InputSize.huge && props.theme.textInput.fontSize.huge) ||
    (props.size === InputSize.large && props.theme.textInput.fontSize.large) ||
    props.theme.textInput.fontSize.base};

  font-weight: ${(props) =>
    props.fontWeight
      ? props.fontWeight
      : props.isBold
        ? 600
        : props.theme.textInput.fontWeight};

  flex: ${(props) => props.theme.textInput.flex};
  outline: ${(props) => props.theme.textInput.outline};
  overflow: ${(props) => props.theme.textInput.overflow};
  opacity: ${(props) => props.theme.textInput.opacity};

  width: ${(props) =>
    (props.scale && "100%") ||
    (props.size === InputSize.base && props.theme.input.width.base) ||
    (props.size === InputSize.middle && props.theme.input.width.middle) ||
    (props.size === InputSize.big && props.theme.input.width.big) ||
    (props.size === InputSize.huge && props.theme.input.width.huge) ||
    (props.size === InputSize.large && props.theme.input.width.large)};
  padding: ${(props) =>
    (props.size === InputSize.base && props.theme.textInput.padding.base) ||
    (props.size === InputSize.middle && props.theme.textInput.padding.middle) ||
    (props.size === InputSize.big && props.theme.textInput.padding.big) ||
    (props.size === InputSize.huge && props.theme.textInput.padding.huge) ||
    (props.size === InputSize.large && props.theme.textInput.padding.large)};

  transition: ${(props) => props.theme.textInput.transition};

  ::-webkit-input-placeholder {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.textInput.disablePlaceholderColor
        : props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    ${NoUserSelect}
  }

  :-moz-placeholder {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.textInput.disablePlaceholderColor
        : props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    ${NoUserSelect}
  }

  ::-moz-placeholder {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.textInput.disablePlaceholderColor
        : props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    ${NoUserSelect}
  }

  :-ms-input-placeholder {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.textInput.disablePlaceholderColor
        : props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    ${NoUserSelect}
  }

  ::placeholder {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.textInput.disablePlaceholderColor
        : props.theme.textInput.placeholderColor};
    font-family: ${(props) => props.theme.fontFamily};
    ${NoUserSelect}
  }

  ${(props) => !props.withBorder && `border: none;`}
`;

export { StyledTextInput };
