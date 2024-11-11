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

import { globalColors } from "../../themes";
import { injectDefaultTheme, tablet } from "../../utils";

const itemTruncate = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const fontStyle = css`
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;
`;

const disabledAndHeaderStyle = css`
  color: ${(props) => props.theme.dropDownItem.disableColor};

  &:hover {
    cursor: default;
    background-color: ${(props) =>
      props.theme.dropDownItem.hoverDisabledBackgroundColor};
  }
`;

const WrapperBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin-inline-start: auto;
`;

const WrapperToggle = styled.div`
  display: flex;
  align-items: center;
  margin-inline-start: auto;
  width: 36px;

  & label {
    position: static;
  }
`;

const StyledDropdownItem = styled.div.attrs(injectDefaultTheme)<{
  textOverflow?: boolean;
  minWidth?: string;
  isModern?: boolean;
  disabled?: boolean;
  noHover?: boolean;
  noActive?: boolean;
  isHeader?: boolean;
  isSeparator?: boolean;
  isActiveDescendant?: boolean;
  isSelected?: boolean;
  isActive?: boolean;
}>`
  display: ${(props) => (props.textOverflow ? "block" : "flex")};
  width: ${(props) => props.theme.dropDownItem.width};
  max-width: ${(props) => props.theme.dropDownItem.maxWidth};
  ${(props) =>
    props.minWidth &&
    css`
      min-width: ${props.minWidth};
    `};
  border: ${(props) => props.theme.dropDownItem.border};
  cursor: pointer;
  margin: ${(props) => props.theme.dropDownItem.margin};
  padding: ${(props) =>
    props.isModern ? "0 8px" : props.theme.dropDownItem.padding};
  line-height: ${(props) => props.theme.dropDownItem.lineHeight};
  box-sizing: border-box;
  background: none;
  text-decoration: none;
  user-select: none;
  outline: 0 !important;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .drop-down-item_icon {
    svg {
      path[fill] {
        fill: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }

      path[stroke] {
        stroke: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }

      circle[fill] {
        fill: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }

      rect[fill] {
        fill: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }
    }
  }

  ${fontStyle}

  font-weight: ${(props) => props.theme.dropDownItem.fontWeight};
  font-size: ${(props) => props.theme.dropDownItem.fontSize};
  color: ${(props) => props.theme.dropDownItem.color};
  text-transform: none;

  ${itemTruncate}

  &:hover {
    ${(props) =>
      !props.noHover &&
      !props.isHeader &&
      css`
        background-color: ${props.theme.dropDownItem.hoverBackgroundColor};

        // logical property won't work because of "dir: auto"
        text-align: ${({ theme }) =>
          theme.interfaceDirection === "rtl" ? "right" : "left"};
      `}
  }

  &:active {
    ${({ isHeader, theme, noActive }) =>
      !isHeader &&
      !noActive &&
      css`
        background-color: ${theme.dropDownItem.hoverBackgroundColor};
      `}
  }

  ${(props) =>
    props.isSeparator &&
    css`
      padding: ${props.theme.dropDownItem.separator.padding};
      border-bottom: ${props.theme.dropDownItem.separator.borderBottom};
      cursor: default;
      margin: ${props.theme.dropDownItem.separator.margin};
      line-height: ${props.theme.dropDownItem.separator.lineHeight};
      height: ${props.theme.dropDownItem.separator.height};
      width: ${props.theme.dropDownItem.separator.width};

      &:hover {
        cursor: default;
      }
    `}

  .back-arrow {
    cursor: pointer;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  ${({ isHeader, theme }) =>
    isHeader &&
    css`
      align-items: center;
      height: 48px;
      padding: 13px 16px 18.2px;
      margin: 0 0 6px;
      border-bottom: ${theme.dropDownItem.separator.borderBottom};
      font-size: 15px;
      font-weight: 600;
      line-height: 16px !important;
      cursor: default;
      &:hover {
        background-color: none !important;
      }
    `}

  @media ${tablet} {
    line-height: ${(props) => props.theme.dropDownItem.tabletLineHeight};
    padding: ${(props) => props.theme.dropDownItem.tabletPadding};
  }

  ${(props) =>
    props.isActiveDescendant &&
    !props.disabled &&
    css`
      background-color: ${props.theme.dropDownItem.hoverBackgroundColor};
    `}

  ${(props) => props.disabled && !props.isSelected && disabledAndHeaderStyle}

  ${(props) =>
    ((props.disabled && props.isSelected) || props.isActive) &&
    css`
      background-color: ${props.theme.dropDownItem.selectedBackgroundColor};
    `}

  .submenu-arrow {
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        transform-box: content-box;
        transform: scaleX(-1);
      `}
    margin-inline-start: auto;
    ${(props) =>
      props.isActive &&
      css`
        transform: rotate(90deg);
        height: auto;
      `}
    width:12px;
    height: 12px;
    margin-inline-end: 0;
    align-self: center;
    line-height: normal;

    .drop-down-item_icon {
      height: 12px;
    }
  }

  max-width: 100%;
`;

const IconWrapper = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;
  width: ${(props) => props.theme.dropDownItem.icon.width};
  margin-inline-end: ${(props) => props.theme.dropDownItem.icon.marginRight};

  height: 20px;

  div {
    height: 16px;
  }
  svg {
    &:not(:root) {
      width: 100%;
      height: 100%;
    }
  }
  img {
    width: 100%;
    max-width: 16px;
    height: 100%;
    max-height: 16px;
    margin-top: 12px;
  }
`;

const ElementWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-inline-start: auto;
`;

export {
  StyledDropdownItem,
  IconWrapper,
  WrapperToggle,
  WrapperBadge,
  ElementWrapper,
};
