import React, { PropsWithChildren } from "react";
import styled, { css } from "styled-components";

import { Base } from "../../themes";

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
  border: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: ${(props) => props.theme.socialButton.fontWeight};
  text-decoration: ${(props) => props.theme.socialButton.textDecoration};
  padding: ${(props) => props.theme.socialButton.padding};
  border-radius: ${(props) => props.theme.socialButton.borderRadius};
  width: ${(props) => props.theme.socialButton.width};
  height: ${(props) =>
    props.size === "base"
      ? props.theme.socialButton.height
      : props.theme.socialButton.heightSmall};
  text-align: ${(props) => props.theme.socialButton.textAlign};
  border: ${(props) => props.theme.socialButton.border};
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
          box-shadow: ${(Cssprops) => Cssprops.theme.socialButton.boxShadow};

          ${() =>
            !props.noHover &&
            css`
              :hover,
              :active {
                cursor: pointer;
                box-shadow: ${(cssProps) =>
                  cssProps.theme.socialButton.boxShadow};

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
              }

              :active {
                background: ${({ theme }) =>
                  theme.socialButton.activeBackground};
                border: none;
              }
            `}
        `
      : css`
          box-shadow: none;
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

  .iconWrapper {
    display: flex;
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
    font-family: Roboto, "Open Sans", sans-serif, Arial;
    font-style: normal;
    font-weight: ${(props) => props.theme.socialButton.text.fontWeight};
    font-size: ${(props) =>
      props.theme.getCorrectFontSize(props.theme.socialButton.text.fontSize)};
    line-height: ${(props) => props.theme.socialButton.text.lineHeight};
    letter-spacing: ${(props) => props.theme.socialButton.text.letterSpacing};
    user-select: none;
    overflow: ${(props) => props.theme.socialButton.text.overflow};
    text-overflow: ${(props) => props.theme.socialButton.text.textOverflow};
    white-space: ${(props) => props.theme.socialButton.text.whiteSpace};

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 16px;
          `
        : css`
            padding-right: 16px;
          `}
  }

  svg {
    margin: ${(props) => props.theme.socialButton.svg.margin};
    width: ${(props) => props.theme.socialButton.svg.width};
    height: ${(props) => props.theme.socialButton.svg.height};
    min-width: ${(props) => props.theme.socialButton.svg.minWidth};
    min-height: ${(props) => props.theme.socialButton.svg.minHeight};

    path {
      fill: ${(props) => props.isConnect && props.theme.socialButton.svg.fill};
      fill: ${(props) => !props.theme.isBase && !props.isConnect && "#FFFFFF"};
    }
  }

  .social-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 100%;
  }
`;

StyledSocialButton.defaultProps = { theme: Base };

export default StyledSocialButton;
