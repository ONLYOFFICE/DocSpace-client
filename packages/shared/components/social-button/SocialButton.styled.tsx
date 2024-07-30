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

import React, { PropsWithChildren } from "react";
import styled, { css } from "styled-components";

import { Base, globalColors } from "../../themes";

import type { StyledSocialButtonProps } from "./SocialButton.types";

const ButtonWrapper = ({
  isDisabled,
  noHover,
  isConnect,
  ...props
}: PropsWithChildren<StyledSocialButtonProps>) => (
  <button type="button" {...props} />
);

const StyledSocialButton = styled(ButtonWrapper).attrs((props) => ({
  disabled: props.isDisabled ? "disabled" : "",
  tabIndex: props.tabIndex,
  isConnect: props.isConnect,
}))`
  font-family: ${(props) => props.theme.fontFamily};

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: ${(props) => props.theme.socialButton.fontWeight};
  text-decoration: ${(props) => props.theme.socialButton.textDecoration};
  padding: ${(props) => props.theme.socialButton.padding};

  width: ${(props) => props.theme.socialButton.width};
  height: ${(props) =>
    props.size === "base"
      ? props.theme.socialButton.height
      : props.theme.socialButton.heightSmall};
  text-align: ${(props) => props.theme.socialButton.textAlign};
  border: ${(props) =>
    props.isConnect
      ? props.theme.socialButton.borderConnect
      : props.theme.socialButton.border};
  border-radius: ${(props) => props.theme.socialButton.borderRadius};

  touch-callout: none;
  -o-touch-callout: none;
  -moz-touch-callout: none;
  -webkit-touch-callout: none;

  stroke: ${(props) => props.theme.socialButton.stroke};

  &:focus {
    outline: ${(props) => props.theme.socialButton.outline};
  }

  ${(props) =>
    props.$iconOptions &&
    props.$iconOptions.color &&
    css`
      svg path {
        fill: ${props.$iconOptions.color};
      }
    `}

  ${(props) =>
    !props.isDisabled
      ? css<StyledSocialButtonProps>`
          background: ${({ theme }) =>
            props.isConnect
              ? theme.socialButton.connectBackground
              : theme.socialButton.background};

          ${() =>
            !props.noHover &&
            css`
              :hover,
              :active {
                cursor: pointer;

                .social_button_text {
                  color: ${({ theme }) =>
                    !props.isConnect && theme.socialButton.text.hoverColor};
                }
              }

              :hover {
                background: ${({ theme }) =>
                  props.isConnect
                    ? theme.socialButton.hoverConnectBackground
                    : theme.socialButton.hoverBackground};

                border: ${props.isConnect
                  ? props.theme.socialButton.hoverConnectBorder
                  : props.theme.socialButton.hoverBorder};
              }

              :active {
                background: ${({ theme }) =>
                  props.isConnect
                    ? theme.socialButton.activeConnectBackground
                    : theme.socialButton.activeBackground};
                border: ${props.isConnect
                  ? props.theme.socialButton.activeConnectBorder
                  : props.theme.socialButton.activeBorder};
              }
            `}
        `
      : css`
     
          background: ${({ theme }) =>
            theme.socialButton.disableBackgroundColor};
          color: ${({ theme }) => theme.socialButton.disableColor};

          ${
            props.theme.isBase &&
            css`
              svg path {
                opacity: 60%;
              }
            `
          }
          ${
            !props.theme.isBase &&
            css`
              svg path {
                fill: ${props.theme.socialButton.disabledSvgColor};
              }
            `
          }}
        `};

  .iconWrapper > div {
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .social_button_text {
    position: relative;
    pointer-events: none;
    color: ${(props) =>
      props.isConnect
        ? props.theme.socialButton.text.connectColor
        : props.theme.socialButton.text.color};
    width: ${(props) => props.theme.socialButton.text.width};
    height: ${(props) => props.theme.socialButton.text.height};
    font-family: Roboto, ${(props) => props.theme.fontFamily};
    font-style: normal;
    font-weight: ${(props) => props.theme.socialButton.text.fontWeight};
    font-size: ${(props) => props.theme.socialButton.text.fontSize};
    line-height: ${(props) => props.theme.socialButton.text.lineHeight};
    letter-spacing: ${(props) => props.theme.socialButton.text.letterSpacing};
    user-select: none;
    overflow: ${(props) => props.theme.socialButton.text.overflow};
    text-overflow: ${(props) => props.theme.socialButton.text.textOverflow};
    white-space: ${(props) => props.theme.socialButton.text.whiteSpace};

    padding-inline-end: 16px;
  }

  svg {
    // margin: ${(props) => props.theme.socialButton.svg.margin};
    width: ${(props) => props.theme.socialButton.svg.width};
    height: ${(props) => props.theme.socialButton.svg.height};
    min-width: ${(props) => props.theme.socialButton.svg.minWidth};
    min-height: ${(props) => props.theme.socialButton.svg.minHeight};

    path {
      fill: ${(props) => props.isConnect && props.theme.socialButton.svg.fill};
      fill: ${(props) =>
        !props.theme.isBase && !props.isConnect && globalColors.white};
    }
  }

  .social-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 100%;
    gap: 16px;
  }
`;

StyledSocialButton.defaultProps = { theme: Base };

export default StyledSocialButton;
