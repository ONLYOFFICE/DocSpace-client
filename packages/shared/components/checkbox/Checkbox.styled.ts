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

import styled, { css } from "styled-components";
import { Base, globalColors } from "../../themes";

const StyledLabel = styled.label<{
  isDisabled: boolean;
  isIndeterminate: boolean;
  hasError: boolean;
}>`
  display: flex;
  align-items: center;
  position: relative;
  margin: 0;

  line-height: 16px;

  user-select: none;
  -o-user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .checkbox {
    margin-inline-end: 12px;
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
    margin-inline-start: 4px;
  }
`;
StyledLabel.defaultProps = { theme: Base };

const HiddenInput = styled.input`
  opacity: 0.0001;
  position: absolute;
  inset-inline-end: 0;
  z-index: -1;
`;

export { StyledLabel, HiddenInput };
