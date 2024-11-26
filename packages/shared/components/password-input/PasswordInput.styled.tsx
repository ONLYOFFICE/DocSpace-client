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
import { tablet, mobile, injectDefaultTheme } from "../../utils";
import { globalColors } from "../../themes";

import { Text } from "../text";

import { TPasswordValidation } from "./PasswordInput.types";

const SimpleInput = ({
  onValidateInput,
  $isFullWidth,
  ...props
}: {
  onValidateInput?: (
    progressScore: boolean,
    passwordValidation: TPasswordValidation,
  ) => void;
  $isFullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => <div {...props} />;

const StyledInput = styled(SimpleInput).attrs(injectDefaultTheme)<{
  $isFullWidth?: boolean;
  isDisabled?: boolean;
}>`
  display: ${(props) => (props.$isFullWidth ? "block" : "flex")};
  align-items: center;
  line-height: ${(props) => props.theme.passwordInput.lineHeight};
  flex-direction: row;
  flex-wrap: wrap;
  position: relative;

  input {
    flex: inherit;
    width: calc(100% - 40px);
    // logical property won't work because of dir: auto
    text-align: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? "right" : "left"};
    &::-ms-reveal {
      display: none;
    }
  }

  .input-relative {
    svg {
      path {
        fill: ${(props) =>
          props.isDisabled
            ? props.theme.passwordInput.disableColor
            : props.theme.passwordInput.iconColor} !important;
      }
    }

    &:hover {
      svg {
        path {
          fill: ${(props) =>
            props.isDisabled
              ? props.theme.passwordInput.disableColor
              : props.theme.passwordInput.hoverIconColor} !important;
        }
      }
    }
  }

  @media ${tablet} {
    flex-wrap: wrap;
  }

  .input-block-icon {
    height: 42px;
  }

  .append {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);

    // logical properties won't work correctly here
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
            left: 16px;
          `
        : css`
            padding-right: 2px;
            right: -16px;
          `};
  }

  .prepend-children {
    padding: 0;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  .text-tooltip {
    line-height: ${(props) => props.theme.passwordInput.text.lineHeight};
    margin-top: ${(props) => props.theme.passwordInput.text.marginTop};
  }

  .password-field-wrapper {
    display: flex;
    width: auto;

    @media ${mobile} {
      width: 100%;
    }
  }
`;

const PasswordProgress = styled.div.attrs(injectDefaultTheme)<{
  inputWidth?: string;
}>`
  ${(props) =>
    props.inputWidth ? `width: ${props.inputWidth};` : `flex: auto;`}
  .input-relative {
    position: relative;
    svg {
      overflow: hidden;
      vertical-align: middle;
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

const TooltipStyle = styled.div`
  width: 294px;

  @media ${mobile} {
    width: 320px;
  }

  .__react_component_tooltip {
  }
`;

const StyledTooltipContainer = styled(Text).attrs(injectDefaultTheme)`
  // margin: 8px 16px 16px 16px;
  color: ${(props) => props.theme.passwordInput.tooltipTextColor};

  .generate-btn-container {
    margin-top: 10px;
  }
`;

const StyledTooltipItem = styled(Text)<{ valid?: boolean }>`
  //height: 24px;
  color: ${(props) =>
    props.valid
      ? globalColors.lightStatusPositive
      : globalColors.lightErrorStatus} !important;
`;

export {
  PasswordProgress,
  StyledInput,
  TooltipStyle,
  StyledTooltipContainer,
  StyledTooltipItem,
};
