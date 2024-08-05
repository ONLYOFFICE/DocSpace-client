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
import { Base, TTheme } from "../../themes";
import { getCorrectBorderRadius } from "../../utils";
import { InputSize } from "../text-input";

const paddingRightStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.paddingRight[props.size];
const widthIconStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.icon.width[props.size];
const heightIconStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.icon.height[props.size];
const widthIconButtonStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.iconButton.width[props.size];
const heightInputStyle = (props: { theme: TTheme; size: InputSize }) =>
  props.theme.fileInput.height[props.size];

const StyledFileInput = styled.div<{
  size: InputSize;
  scale?: boolean;
  hasError?: boolean;
  hasWarning?: boolean;
  isDisabled?: boolean;
}>`
  display: flex;
  position: relative;
  outline: none;
  width: ${(props) =>
    (props.scale && "100%") ||
    (props.size === InputSize.base && props.theme.input.width.base) ||
    (props.size === InputSize.middle && props.theme.input.width.middle) ||
    (props.size === InputSize.big && props.theme.input.width.big) ||
    (props.size === InputSize.huge && props.theme.input.width.huge) ||
    (props.size === InputSize.large && props.theme.input.width.large)};

  max-height: ${(props) => heightInputStyle(props)};

  .text-input {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.errorBorderColor) ||
      (props.hasWarning && props.theme.input.warningBorderColor) ||
      (props.isDisabled && props.theme.input.disabledBorderColor) ||
      props.theme.input.borderColor};

    text-overflow: ellipsis;

    // logical property won't work here (dir: auto)
    ${(props) => {
      const side = props.theme.interfaceDirection === "rtl" ? "left" : "right";
      return `padding-${side}: ${paddingRightStyle(props) || "40px"};`;
    }}

    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    margin: 0;
  }

  :hover {
    .icon {
      border-color: ${(props) =>
        (props.hasError && props.theme.input.hoverErrorBorderColor) ||
        (props.hasWarning && props.theme.input.hoverWarningBorderColor) ||
        (props.isDisabled && props.theme.input.hoverDisabledBorderColor) ||
        props.theme.input.hoverBorderColor};
    }
  }

  :active {
    .icon {
      border-color: ${(props) =>
        (props.hasError && props.theme.input.focusErrorBorderColor) ||
        (props.hasWarning && props.theme.input.focusWarningBorderColor) ||
        (props.isDisabled && props.theme.input.focusDisabledBorderColor) ||
        props.theme.input.focusBorderColor};
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;

    width: ${(props) => widthIconStyle(props)};

    height: ${(props) => heightIconStyle(props)};

    margin: 0;
    border: ${(props) => props.theme.fileInput.icon.border};

    border-color: ${(props) =>
      (props.hasError && props.theme.input.errorBorderColor) ||
      (props.hasWarning && props.theme.input.warningBorderColor) ||
      (props.isDisabled && props.theme.input.disabledBorderColor) ||
      props.theme.input.borderColor};

    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};

    .loader {
      padding-top: 5px;
    }

    border-radius: ${({ theme }) =>
      getCorrectBorderRadius(
        theme.fileInput.icon.borderRadius,
        theme.interfaceDirection,
      )};

    inset-inline-end: 0;
  }

  .icon-button {
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    width: ${(props) => widthIconButtonStyle(props)};
  }
`;
StyledFileInput.defaultProps = { theme: Base };

export default StyledFileInput;
