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
import { TTheme, globalColors } from "../../themes";
import {
  mobile,
  getCorrectFourValuesStyle,
  injectDefaultTheme,
} from "../../utils";

const styledMobileView = css`
  position: fixed;
  width: ${(props) => props.theme.newContextMenu.devices.mobileWidth};
  max-width: ${(props) => props.theme.newContextMenu.devices.mobileWidth};
  max-height: ${(props) => props.theme.newContextMenu.devices.maxHeight};
  inset-inline-start: ${(props) => props.theme.newContextMenu.devices.left};
  bottom: ${(props) => props.theme.newContextMenu.devices.bottom};
  border-radius: ${(props) => props.theme.newContextMenu.mobileBorderRadius};
`;

export const SubMenuItem = styled.li<{ noHover?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  & > div {
    margin-inline-end: 12px;
  }

  & label {
    position: static;
  }

  & > a {
    flex-grow: 1;
  }

  &:hover {
    background-color: ${(props) =>
      props.noHover
        ? props.theme.dropDownItem.backgroundColor
        : props.theme.dropDownItem.hoverBackgroundColor};
  }
`;

const StyledContextMenu = styled.div.attrs(injectDefaultTheme)<{
  changeView?: boolean;
  articleWidth: number;
  theme: TTheme;
  isRoom?: boolean;
  isIconExist?: boolean;
  noHover?: boolean;
  fillIcon?: boolean;
  isCoverExist?: boolean;
}>`
  .p-contextmenu {
    position: absolute;
    background: ${(props) => props.theme.newContextMenu.background};
    border: ${(props) => props.theme.newContextMenu.border};
    border-radius: ${(props) => props.theme.newContextMenu.borderRadius};
    -moz-border-radius: ${(props) => props.theme.newContextMenu.borderRadius};
    -webkit-border-radius: ${(props) =>
      props.theme.newContextMenu.borderRadius};
    box-shadow: ${(props) => props.theme.newContextMenu.boxShadow};
    -moz-box-shadow: ${(props) => props.theme.newContextMenu.boxShadow};
    -webkit-box-shadow: ${(props) => props.theme.newContextMenu.boxShadow};

    .scroll-body {
      display: flex;
      flex-direction: column;
      justify-content: center;

      padding-inline-end: 0 !important;
    }
  }

  .contextmenu-header {
    display: flex;
    align-items: center;
    width: 100%;
    height: ${(props) => props.theme.menuItem.header.height};
    max-height: ${(props) => props.theme.menuItem.header.height};
    border-bottom: ${(props) => props.theme.menuItem.header.borderBottom};
    margin: 0;
    margin-bottom: ${(props) => props.theme.menuItem.header.marginBottom};
    padding: ${(props) => props.theme.menuItem.mobile.padding};

    cursor: default;

    box-sizing: border-box;
    background: none;
    outline: 0 !important;
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};

    .icon-wrapper {
      display: flex;
      align-items: center;
      width: ${(props) =>
        props.isRoom ? "32px" : props.theme.menuItem.iconWrapper.header.width};
      min-width: ${(props) =>
        props.isRoom ? "32px" : props.theme.menuItem.iconWrapper.header.width};
      height: ${(props) =>
        props.isRoom ? "32px" : props.theme.menuItem.iconWrapper.header.height};
      min-height: ${(props) =>
        props.isRoom ? "32px" : props.theme.menuItem.iconWrapper.header.height};

      .drop-down-item_icon {
        display: flex;
        align-items: center;
        border-radius: 6px;
        ${(props) =>
          props.isRoom &&
          css`
            width: 100%;
            height: 100%;
          `}
      }

      ${(props) =>
        !props.isCoverExist &&
        css`
          svg {
            &:not(:root) {
              width: 100%;
              height: 100%;
            }
          }
        `}
    }

    .avatar-wrapper {
      min-width: 32px;
      box-sizing: border-box;
      margin-inline-end: 8px;
    }

    .text {
      width: 100%;
      font-size: ${(props) => props.theme.menuItem.text.header.fontSize};
      font-weight: 600;
      ${(props) =>
        props.isIconExist &&
        css`
          margin: ${({ theme }) =>
            getCorrectFourValuesStyle(
              theme.menuItem.text.margin,
              theme.interfaceDirection,
            )};
        `}

      color: ${(props) => props.theme.menuItem.text.color};

      // logical property won't work because of "dir: auto"
      text-align: ${({ theme }) =>
        theme.interfaceDirection === "rtl" ? `right` : `left`};
      text-transform: none;
      text-decoration: none;
      user-select: none;
    }
  }

  .p-contextmenu ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .p-contextmenu .p-submenu-list {
    position: absolute;
    background: ${(props) => props.theme.dropDown.background};
    border: ${(props) => props.theme.dropDown.border};
    border-radius: ${(props) => props.theme.dropDown.borderRadius};
    -moz-border-radius: ${(props) => props.theme.dropDown.borderRadius};
    -webkit-border-radius: ${(props) => props.theme.dropDown.borderRadius};
    box-shadow: ${(props) => props.theme.dropDown.boxShadow};
    -moz-box-shadow: ${(props) => props.theme.dropDown.boxShadow};
    -webkit-box-shadow: ${(props) => props.theme.dropDown.boxShadow};

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    // doesn't require margin-right in RTL
    margin-left: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? "-4px" : "4px"};
    margin-top: -4px;
  }

  .p-contextmenu .p-menuitem-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    text-decoration: none;
    overflow: hidden;
    position: relative;
    border: ${(props) => props.theme.dropDownItem.border};
    margin: ${(props) => props.theme.dropDownItem.margin};
    padding: 0 16px;
    font-family: ${(props) => props.theme.fontFamily};
    font-style: normal;
    background: none;
    user-select: none;
    outline: 0 !important;
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};

    font-weight: ${(props) => props.theme.dropDownItem.fontWeight};
    font-size: ${(props) => props.theme.dropDownItem.fontSize};
    color: ${(props) => props.theme.dropDownItem.color};
    text-transform: none;

    -webkit-touch-callout: none;

    &:hover {
      background-color: ${(props) =>
        props.noHover
          ? props.theme.dropDownItem.backgroundColor
          : props.theme.dropDownItem.hoverBackgroundColor};
    }

    &.p-disabled {
      color: ${(props) => props.theme.dropDownItem.disableColor};

      &:hover {
        cursor: default;
        background-color: ${(props) =>
          props.theme.dropDownItem.hoverDisabledBackgroundColor};
      }
    }
  }

  .p-contextmenu .p-menuitem-text {
    line-height: 36px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p-contextmenu .p-menu-separator {
    border-bottom: ${(props) => props.theme.menuItem.separator.borderBottom};
    cursor: default !important;
    margin: ${(props) => props.theme.menuItem.separator.margin};
    height: ${(props) => props.theme.menuItem.separator.height};

    &:hover {
      cursor: default !important;
    }
  }

  .p-contextmenu .p-menuitem {
    position: relative;
    margin: ${(props) => props.theme.dropDownItem.margin};

    max-width: calc(-32px + 100vw);
    width: fit-content;
    min-width: inherit;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p-contextmenu .scroll-body .p-menuitem {
    margin-inline-end: ${(props) =>
      `-${props.theme.scrollbar.paddingInlineEnd}`};

    @media ${mobile} {
      margin-inline-end: ${(props) =>
        `-${props.theme.scrollbar.paddingInlineEndMobile}`};
    }
  }

  .p-menuitem-icon {
    max-height: ${(props) => props.theme.dropDownItem.lineHeight};

    width: 16px;
    height: 16px;

    & svg {
      height: 16px;
      width: 16px;
      ${(props) =>
        props.fillIcon &&
        css`
          path[fill],
          circle[fill],
          rect[fill] {
            fill: ${props.theme.dropDownItem.icon.color};
          }

          path[stroke],
          circle[stroke],
          rect[stroke] {
            stroke: ${props.theme.dropDownItem.icon.color};
          }
        `}
    }

    &.p-disabled {
      path[fill] {
        fill: ${(props) => props.theme.dropDownItem.icon.disableColor};
      }

      path[stroke] {
        stroke: ${(props) => props.theme.dropDownItem.icon.disableColor};
      }
    }

    margin-inline-end: 8px;
  }

  .p-submenu-icon {
    margin-inline-start: auto;
    padding-inline-start: 8px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" &&
      css`
        transform-box: content-box;
        transform: scaleX(-1);
      `}
    path[fill] {
      fill: ${(props) => props.theme.dropDownItem.icon.color};
    }

    path[stroke] {
      stroke: ${(props) => props.theme.dropDownItem.icon.color};
    }
  }

  .p-submenu-badge {
    margin: 0;
  }

  .p-contextmenu-enter {
    opacity: 0;
  }

  .p-contextmenu-enter-active {
    opacity: 1;
    transition: opacity 250ms;
  }

  .p-contextmenu {
    @media ${mobile} {
      ${(props) => props.changeView && styledMobileView}
    }

    @media not ${mobile} {
      max-width: calc(100vw - 32px);
    }
  }

  .p-contextmenu ul {
    @media not ${mobile} {
      max-width: calc(100vw - 32px);
    }
  }
`;

export const StyledList = styled.ul<{
  listHeight: number;
  widthSubMenu: null | number;
}>`
  & > :first-child {
    .scroll-body {
      height: ${(props) => `${props.listHeight}px`};
    }
  }

  & > :nth-child(1) {
    ${(props) =>
      props.widthSubMenu &&
      css`
        .p-menuitem {
          max-width: ${`${props.widthSubMenu}px`};
        }
      `}
  }
`;

export { StyledContextMenu };
