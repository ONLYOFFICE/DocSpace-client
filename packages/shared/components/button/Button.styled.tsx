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

import { NoUserSelect } from "../../utils";
import { Base, TTheme, globalColors } from "../../themes";
import { ButtonProps, ButtonThemeProps } from "./Button.types";
import { ButtonSize } from "./Button.enums";

const activeCss = css<ButtonProps>`
  background-color: ${(props) =>
    props.primary
      ? props.theme.button.backgroundColor.primaryActive
      : props.theme.button.backgroundColor.baseActive};

  color: ${(props) =>
    props.primary
      ? props.theme.button.color.primaryActive
      : props.theme.button.color.baseActive};

  ${(props) =>
    !props.primary
      ? css`
          border: ${props.theme.button.border.baseActive};
          box-sizing: ${props.theme.button.boxSizing};
        `
      : css`
          border: ${props.theme.button.border.primaryActive};
          box-sizing: ${props.theme.button.boxSizing};
        `}

  .btnIcon {
    svg {
      path {
        fill: ${(props) =>
          props.primary
            ? props.theme.button.color.primaryActive
            : props.theme.button.color.baseActive};
      }
    }
  }
`;

const hoverCss = css<ButtonProps>`
  background-color: ${(props) =>
    props.primary
      ? props.theme.button.backgroundColor.primaryHover
      : props.theme.button.backgroundColor.baseHover};

  color: ${(props) =>
    props.primary
      ? props.theme.button.color.primaryHover
      : props.theme.button.color.baseHover};

  ${(props) =>
    !props.primary
      ? css`
          border: ${props.theme.button.border.baseHover};
          box-sizing: ${props.theme.button.boxSizing};
        `
      : css`
          border: ${props.theme.button.border.primaryHover};
          box-sizing: ${props.theme.button.boxSizing};
        `}

  .btnIcon {
    svg {
      path {
        fill: ${(props) =>
          props.primary
            ? props.theme.button.color.primaryHover
            : props.theme.button.color.baseHover};
      }
    }
  }
`;

const disableCss = css<ButtonProps>`
  background-color: ${(props) =>
    props.primary
      ? props.theme.button.backgroundColor.primaryDisabled
      : props.theme.button.backgroundColor.baseDisabled};

  color: ${(props) =>
    props.primary
      ? props.theme.button.color.primaryDisabled
      : props.theme.button.color.baseDisabled};

  ${(props) =>
    !props.primary
      ? css`
          border: ${props.theme.button.border.baseDisabled};
          box-sizing: ${props.theme.button.boxSizing};
        `
      : css`
          border: ${props.theme.button.border.primaryDisabled};
          box-sizing: ${props.theme.button.boxSizing};
        `}

  .btnIcon {
    svg {
      path {
        fill: ${(props) =>
          props.primary
            ? props.theme.button.color.primaryDisabled
            : props.theme.button.color.baseDisabled};
      }
    }
  }
`;

const heightStyle = (props: { size?: ButtonSize; theme: TTheme }) =>
  props.theme.button.height[props.size || ButtonSize.normal];
const fontSizeStyle = (props: { size?: ButtonSize; theme: TTheme }) =>
  props.theme.button.fontSize[props.size || ButtonSize.normal];

const ButtonWrapper = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      primary,
      scale,
      size,
      isHovered,
      isClicked,
      isDisabled,
      disableHover,
      isLoading,
      label,
      minWidth,
      ...props
    },
    ref,
  ) => {
    return <button ref={ref} type="button" {...props} />;
  },
);

ButtonWrapper.displayName = "ButtonWrapper";

const StyledButton = styled(ButtonWrapper).attrs((props: ButtonProps) => ({
  disabled: props.isDisabled || props.isLoading ? "disabled" : "",
  tabIndex: props.tabIndex,
}))`
  position: relative;
  height: ${(props) => heightStyle(props)};
  font-size: ${(props) => fontSizeStyle(props)};

  color: ${(props) =>
    !props.primary
      ? props.theme.button.color.base
      : props.theme.button.color.primary};

  background-color: ${(props) =>
    props.primary
      ? props.theme.button.backgroundColor.primary
      : props.theme.button.backgroundColor.base};

  border: ${(props) =>
    props.primary
      ? props.theme.button.border.primary
      : props.theme.button.border.base};

  ${(props) => props.scale && `width: 100%;`};
  min-width: ${(props) => props.minWidth && props.minWidth};

  padding: ${(props) =>
    `${props.theme.button.padding[props.size || ButtonSize.normal]}`};

  cursor: ${(props) =>
    props.isDisabled || props.isLoading ? "default !important" : "pointer"};

  font-family: ${(props) => props.theme.fontFamily};
  margin: ${(props) => props.theme.button.margin};
  display: ${(props) => props.theme.button.display};
  font-weight: ${(props) => props.theme.button.fontWeight};
  text-align: ${(props) => props.theme.button.textAlign};
  text-decoration: ${(props) => props.theme.button.textDecoration};
  vertical-align: ${(props) => props.theme.button.topVerticalAlign};
  border-radius: ${(props) => props.theme.button.borderRadius};
  -moz-border-radius: ${(props) => props.theme.button.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.button.borderRadius};

  ${NoUserSelect};

  stroke: ${(props) => props.theme.button.stroke};
  overflow: ${(props) => props.theme.button.overflow};
  text-overflow: ${(props) => props.theme.button.textOverflow};
  white-space: ${(props) => props.theme.button.whiteSpace};
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  ${(props) =>
    !props.isDisabled &&
    !props.isLoading &&
    (props.isHovered
      ? hoverCss
      : !props.disableHover &&
        css`
          &:hover {
            ${hoverCss}
          }
        `)}

  ${(props) =>
    !props.isDisabled &&
    !props.isLoading &&
    (props.isClicked
      ? activeCss
      : css`
          &:active {
            ${activeCss}
          }
        `)}

  ${(props) => (props.isDisabled || props.isLoading) && disableCss}

  &:focus {
    outline: ${(props) => props.theme.button.outline};
  }

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    background-color: transparent;
  }

  .button-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};
  }

  .icon {
    width: auto;
    display: flex;
    align-items: center;
  }
`;

StyledButton.defaultProps = { theme: Base };

const themeActiveCss = css<ButtonThemeProps>`
  border-color: ${(props) => props.$currentColorScheme?.main?.buttons};

  background: ${(props) =>
    props.primary && props.$currentColorScheme?.main?.buttons};

  opacity: ${(props) => !props.isDisabled && "1"};

  filter: ${(props) =>
    props.primary &&
    (props.theme.isBase ? "brightness(90%)" : "brightness(82%)")};

  color: ${(props) => props.$currentColorScheme?.text?.buttons};
`;

const themeHoverCss = css<ButtonThemeProps>`
  border-color: ${(props) => props.$currentColorScheme?.main?.buttons};

  background: ${(props) =>
    props.primary && props.$currentColorScheme?.main?.buttons};

  opacity: ${(props) => props.primary && !props.isDisabled && "0.85"};

  color: ${(props) =>
    props.primary && props.$currentColorScheme?.text?.buttons};
`;

const getDefaultStyles = ({
  primary,
  $currentColorScheme,
  isDisabled,
  isLoading,
  isClicked,
  isHovered,
  disableHover,
  title,
}: ButtonThemeProps) =>
  $currentColorScheme &&
  !title &&
  css`
    ${primary &&
    css`
      background: ${$currentColorScheme.main?.buttons};
      opacity: ${isDisabled && "0.6"};
      border: ${`1px solid`} ${$currentColorScheme.main?.buttons};
      color: ${$currentColorScheme.text?.buttons};

      .loader {
        svg {
          color: ${$currentColorScheme.text?.buttons};
        }
        background-color: ${$currentColorScheme.main?.buttons};
      }
    `}

    ${!isDisabled &&
    !isLoading &&
    (isHovered && primary
      ? themeHoverCss
      : !disableHover &&
        primary &&
        css`
          &:hover,
          &:focus {
            ${themeHoverCss}
          }
        `)}


      ${(props) =>
      props.theme.isBase &&
      !primary &&
      !disableHover &&
      !isDisabled &&
      css`
        &:hover,
        &:focus {
          border: ${`1px solid`} ${$currentColorScheme.main?.buttons};
        }

        &:active {
          ${activeCss}
        }
      `}

    ${!isDisabled &&
    !isLoading &&
    (isClicked
      ? primary && themeActiveCss
      : primary &&
        css`
          &:active {
            ${themeActiveCss}
          }
        `)}
  `;

StyledButton.defaultProps = { theme: Base };

const StyledThemeButton = styled(StyledButton)(getDefaultStyles);

export { StyledThemeButton };

export default StyledButton;
