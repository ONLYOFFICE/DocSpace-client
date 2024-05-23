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

import { css } from "styled-components";

const commonInputStyles = css<{
  size?: string;
  scale?: boolean;
  isDisabled?: boolean;
  color?: string;
  hasError?: boolean;
  hasWarning?: boolean;
  isReadOnly?: boolean;
}>`
  width: ${(props) =>
    (props.scale && "100%") ||
    (props.size === "base" && props.theme.input.width.base) ||
    (props.size === "middle" && props.theme.input.width.middle) ||
    (props.size === "big" && props.theme.input.width.big) ||
    (props.size === "huge" && props.theme.input.width.huge) ||
    (props.size === "large" && props.theme.input.width.large)};

  background-color: ${(props) =>
    props.isDisabled
      ? props.theme.input.disableBackgroundColor
      : props.theme.input.backgroundColor};
  color: ${(props) =>
    props.isDisabled
      ? props.theme.input.disableColor
      : props.color
        ? props.color
        : props.theme.input.color};

  border-radius: ${(props) => props.theme.input.borderRadius};
  -moz-border-radius: ${(props) => props.theme.input.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.input.borderRadius};

  box-shadow: ${(props) => props.theme.input.boxShadow};
  box-sizing: ${(props) => props.theme.input.boxSizing};
  border: ${(props) => props.theme.input.border};
  border-color: ${(props) =>
    (props.hasError && props.theme.input.errorBorderColor) ||
    (props.hasWarning && props.theme.input.warningBorderColor) ||
    (props.isDisabled && props.theme.input.disabledBorderColor) ||
    props.theme.input.borderColor};

  :hover {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.hoverErrorBorderColor) ||
      (props.hasWarning && props.theme.input.hoverWarningBorderColor) ||
      (props.isDisabled && props.theme.input.hoverDisabledBorderColor) ||
      props.theme.input.hoverBorderColor};
  }
  :focus {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.focusErrorBorderColor) ||
      (props.hasWarning && props.theme.input.focusWarningBorderColor) ||
      (props.isDisabled && props.theme.input.focusDisabledBorderColor) ||
      props.theme.input.focusBorderColor};
  }

  cursor: ${(props) =>
    props.isReadOnly || props.isDisabled ? "default" : "text"};

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      // If current interface direction is rtl, set cursor in the right side of the input
      // Will work only if placeholder exists (placeholder=" " by default required)
      :placeholder-shown {
        direction: rtl;
      }

      ::placeholder {
        text-align: right;
      }

      &[type="tel"]:placeholder-shown {
        direction: ltr;
      }

      &[type="search"] {
        unicode-bidi: plaintext;
      }
    `}
`;

export { commonInputStyles };
