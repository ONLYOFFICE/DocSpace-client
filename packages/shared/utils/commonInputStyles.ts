/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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

  // doesn't require mirroring for LTR
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
