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

import { commonInputStyles } from "../../utils";
import { Base, globalColors } from "../../themes";

const StyledIconBlock = styled.div<{
  isDisabled?: boolean;
  isClickable?: boolean;
}>`
  display: ${(props) => props.theme.inputBlock.display};
  align-items: ${(props) => props.theme.inputBlock.alignItems};
  cursor: ${(props) =>
    props.isDisabled || !props.isClickable ? "default" : "pointer"};

  height: ${(props) => props.theme.inputBlock.height};
  padding-inline-end: ${(props) => props.theme.inputBlock.paddingRight};
  padding-inline-start: ${(props) => props.theme.inputBlock.paddingLeft};
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};
`;
StyledIconBlock.defaultProps = { theme: Base };

const StyledChildrenBlock = styled.div`
  display: ${(props) => props.theme.inputBlock.display};
  align-items: ${(props) => props.theme.inputBlock.alignItems};
  padding: ${(props) => props.theme.inputBlock.padding};
`;
StyledChildrenBlock.defaultProps = { theme: Base };

const CustomInputGroup = ({
  isIconFill,
  hasError,
  hasWarning,
  isDisabled,
  scale,
  hoverColor,
  ...props
}: {
  hasError?: boolean;
  hasWarning?: boolean;
  isIconFill?: boolean;
  isDisabled?: boolean;
  scale?: boolean;
  hoverColor?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => <div {...props} />;

const StyledInputGroup = styled(CustomInputGroup)`
  display: ${(props) => props.theme.inputBlock.display};

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-background-clip: text;
    -webkit-text-fill-color: ${globalColors.white};
    transition: background-color 5000s ease-in-out 0s;
    box-shadow: inset 0 0 20px 20px #23232329;
  }

  .prepend {
    display: ${(props) => props.theme.inputBlock.display};
    align-items: ${(props) => props.theme.inputBlock.alignItems};
  }

  .append {
    align-items: ${(props) => props.theme.inputBlock.alignItems};
    margin: ${(props) => props.theme.inputBlock.margin};
  }

  ${commonInputStyles}

  :focus-within {
    border-color: ${(props) =>
      (props.hasError && props.theme.input.focusErrorBorderColor) ||
      props.theme.inputBlock.borderColor};
  }

  svg {
    path {
      fill: ${(props) =>
        props.color
          ? props.color
          : props.theme.inputBlock.iconColor} !important;
    }
  }

  &:hover {
    svg {
      path {
        fill: ${(props) =>
          props.hoverColor
            ? props.hoverColor
            : props.theme.inputBlock.hoverIconColor} !important;
      }
    }
  }
`;
StyledInputGroup.defaultProps = { theme: Base };

export { StyledInputGroup, StyledChildrenBlock, StyledIconBlock };
