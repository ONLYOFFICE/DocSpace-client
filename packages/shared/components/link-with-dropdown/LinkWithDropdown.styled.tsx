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

const StyledSpan = styled.span<{ $isOpen?: boolean }>`
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

  :hover {
    color: ${(props) => props.theme.linkWithDropdown.color.hover};

    background: ${(props) => props.theme.linkWithDropdown.background.hover};
    .expander {
      path {
        fill: ${(props) => props.theme.linkWithDropdown.color.hover};
      }
    }
  }

  ${(props) =>
    props.$isOpen &&
    css`
      color: ${props.theme.linkWithDropdown.color.hover};
      background: ${props.theme.linkWithDropdown.background.hover};
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
