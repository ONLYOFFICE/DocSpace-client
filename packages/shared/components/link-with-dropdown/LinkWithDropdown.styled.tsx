import React from "react";
import styled, { css } from "styled-components";
import ExpanderDownReactSvg from "PUBLIC_DIR/images/expander-down.react.svg";

import { Base } from "../../themes";
import { Text } from "../text";
import { TextProps } from "../text/Text.types";

// import { transform } from "lodash";
import {
  SimpleLinkWithDropdownProps,
  TDropdownType,
} from "./LinkWithDropdown.types";

const SimpleLinkWithDropdown = ({
  isBold,
  fontSize,
  fontWeight,
  isTextOverflow,
  isHovered,
  isSemitransparent,
  color,
  title,
  dropdownType,
  data,
  isDisabled,
  children,
  ...props
}: SimpleLinkWithDropdownProps) => <a {...props}>{children}</a>;

// eslint-disable-next-line react/prop-types, no-unused-vars
const ExpanderDownIconWrapper = ({
  isSemitransparent,
  dropdownType,
  isOpen,
  isDisabled,
  ...props
}: {
  isSemitransparent: boolean;
  dropdownType: TDropdownType;
  isOpen: boolean;
  isDisabled: boolean;
}) => <ExpanderDownReactSvg {...props} />;

const Caret = styled(ExpanderDownIconWrapper)<{ color?: string }>`
  position: absolute;

  width: ${(props) => props.theme.linkWithDropdown.caret.width};
  min-width: ${(props) => props.theme.linkWithDropdown.caret.minWidth};
  height: ${(props) => props.theme.linkWithDropdown.caret.height};
  min-height: ${(props) => props.theme.linkWithDropdown.caret.minHeight};
  margin-left: ${(props) => props.theme.linkWithDropdown.caret.marginLeft};
  margin-top: ${(props) => props.theme.linkWithDropdown.caret.marginTop};

  right: ${(props) => props.theme.linkWithDropdown.caret.right};
  top: ${(props) => props.theme.linkWithDropdown.caret.top};
  bottom: ${(props) => props.theme.linkWithDropdown.caret.bottom};

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: ${props.theme.linkWithDropdown.caret.marginLeft};
      margin-left: 0;
      left: ${props.theme.linkWithDropdown.caret.right};
      right: 0;
    `}

  margin: ${(props) => props.theme.linkWithDropdown.caret.margin};

  path {
    fill: ${(props) =>
      props.isDisabled
        ? props.theme.linkWithDropdown.disableColor
        : props.color};
  }

  ${(props) =>
    props.dropdownType === "appearDashedAfterHover" &&
    `opacity: ${props.theme.linkWithDropdown.caret.opacity};`}

  ${(props) =>
    props.isOpen &&
    `
      bottom: ${props.theme.linkWithDropdown.caret.isOpenBottom};
      transform: ${props.theme.linkWithDropdown.caret.transform};
    `}
`;
Caret.defaultProps = { theme: Base };

const StyledLinkWithDropdown = styled(SimpleLinkWithDropdown)`
  ${(props) => !props.isDisabled && "cursor: pointer;"}
  text-decoration: none;
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;

  padding-right: ${(props) => props.theme.linkWithDropdown.paddingRight};

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      padding-left: ${props.theme.linkWithDropdown.paddingRight};
      padding-right: 0;
    `}

  color: ${(props) =>
    props.isDisabled ? props.theme.linkWithDropdown.disableColor : props.color};

  ${(props) => props.isSemitransparent && `opacity: 0.5`};
  ${(props) =>
    props.dropdownType === "alwaysDashed" &&
    `text-decoration:  ${props.theme.linkWithDropdown.textDecoration};`};

  &:not([href]):not([tabindex]) {
    ${(props) =>
      props.dropdownType === "alwaysDashed" &&
      `text-decoration:  ${props.theme.linkWithDropdown.textDecoration};`};
    color: ${(props) =>
      props.isDisabled
        ? props.theme.linkWithDropdown.disableColor
        : props.color};

    &:hover {
      text-decoration: ${(props) =>
        props.theme.linkWithDropdown.textDecoration};
      color: ${(props) =>
        props.isDisabled
          ? props.theme.linkWithDropdown.disableColor
          : props.color};
    }
  }

  :hover {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.linkWithDropdown.disableColor
        : props.color};

    svg {
      ${(props) =>
        props.dropdownType === "appearDashedAfterHover" &&
        `position: absolute; opacity: ${props.theme.linkWithDropdown.svg.opacity};`};
      ${(props) =>
        props.isSemitransparent &&
        `opacity: ${props.theme.linkWithDropdown.svg.semiTransparentOpacity};`};
    }
  }
`;
StyledLinkWithDropdown.defaultProps = { theme: Base };

const StyledTextWithExpander = styled.div<{ isOpen?: boolean }>`
  display: flex;
  gap: 4px;

  .expander {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 6.35px;
    svg {
      transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0)")};
      width: 6.35px;
      height: auto;
    }
  }
`;

const SimpleText = ({ c, ...props }: TextProps & { c?: string }) => (
  <Text as="span" {...props} />
);

const StyledText = styled(SimpleText)<{ isTextOverflow?: boolean }>`
  color: inherit;
  ${(props) =>
    props.isTextOverflow &&
    css`
      display: inline-block;
      max-width: ${props.theme.linkWithDropdown.text.maxWidth};
    `};
`;
StyledText.defaultProps = { theme: Base };

// const focusColor = css`
//   color: ${(props) => props.theme.linkWithDropdown.color.focus};
//   background: ${(props) => props.theme.linkWithDropdown.background.focus};
//   .expander {
//     path {
//       fill: ${(props) => props.theme.linkWithDropdown.color.focus};
//     }
//   }
// `;

const StyledSpan = styled.span<{ $isOpen?: boolean; withoutHover?: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  position: relative;

  .drop-down-item {
    display: block;
  }

  .fixed-max-width {
    max-width: ${(props) => props.theme.linkWithDropdown.text.maxWidth};
  }

  color: ${(props) => props.theme.linkWithDropdown.color.default};
  background: ${(props) => props.theme.linkWithDropdown.background.default};
  .expander {
    path {
      fill: ${(props) => props.theme.linkWithDropdown.color.default};
    }
  }

  ${(props) =>
    !props.withoutHover &&
    css`
      :hover {
        color: ${props.theme.linkWithDropdown.color.hover};

        background: ${props.theme.linkWithDropdown.background.hover};
        .expander {
          path {
            fill: ${props.theme.linkWithDropdown.color.hover};
          }
        }
      }
    `}
`;
StyledSpan.defaultProps = { theme: Base };

export {
  StyledSpan,
  StyledTextWithExpander,
  StyledText,
  StyledLinkWithDropdown,
  Caret,
};
