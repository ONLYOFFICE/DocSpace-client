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
import { injectDefaultTheme, mobile, tablet } from "../../utils";
import { IconButton } from "../icon-button";
import { Scrollbar } from "../scrollbar";
import { ColorTheme } from "../color-theme";

const reactWindowContainerStyles = css`
  height: 100%;
  display: block;
`;

const reactWindowBodyStyles = css`
  display: block;
  height: 100%;
`;

const StyledTableContainer = styled.div.attrs(injectDefaultTheme)<{
  useReactWindow?: boolean;
}>`
  user-select: none;
  display: grid;
  width: 100%;
  max-width: 100%;
  margin-top: -25px;

  .table-column {
    user-select: none;
    position: relative;
    min-width: 10%;
  }

  .indexing-separator {
    background-color: ${(props) =>
      props.theme.tableContainer.indexingSeparator};
  }

  .resize-handle {
    display: block;
    cursor: ew-resize;
    height: 10px;
    margin-block: 14px 0;
    margin-inline: auto 0;
    z-index: 1;
    border-inline-end: ${({ theme }) => theme.tableContainer.borderRight};

    &:hover {
      border-color: ${(props) => props.theme.tableContainer.hoverBorderColor};
    }
  }

  .table-container_group-menu,
  .table-container_header {
    z-index: 200;
    padding: 0 20px;

    border-bottom: 1px solid;
    border-image-slice: 1;
    border-image-source: ${(props) =>
      props.theme.tableContainer.header.borderImageSource};
    border-top: 0;

    border-inline-start: 0;
  }

  @media (hover: hover) {
    &:has(#table-container_caption-header:not(.hotkeys-lengthen-header)):has(
        .table-list-item:first-child .table-container_row:hover
      ) {
      .table-container_header,
      .table-container_group-menu {
        border-image-source: ${(props) =>
          props.theme.tableContainer.header.borderHoverImageSource};
      }
    }
  }

  .lengthen-header {
    border-image-slice: 1;
    border-image-source: ${(props) =>
      props.theme.tableContainer.header.lengthenBorderImageSource};
  }

  .hotkeys-lengthen-header {
    border-bottom: ${(props) =>
      props.theme.tableContainer.header.hotkeyBorderBottom};
    border-image-source: none;
  }

  .content-container {
    overflow: hidden;
  }

  .children-wrap {
    display: flex;
    flex-direction: column;
  }

  .table-cell {
    height: 47px;
    border-bottom: ${(props) => props.theme.tableContainer.tableCellBorder};
  }

  .table-container_group-menu {
    .table-container_group-menu-checkbox {
      width: 22px;
    }
  }

  ${({ useReactWindow }) => useReactWindow && reactWindowContainerStyles}
`;

const StyledTableGroupMenu = styled.div.attrs(injectDefaultTheme)<{
  checkboxMargin?: string;
}>`
  position: relative;

  background: ${(props) => props.theme.tableContainer.groupMenu.background};
  border-bottom: ${(props) =>
    props.theme.tableContainer.groupMenu.borderBottom};
  box-shadow: ${(props) => props.theme.tableContainer.groupMenu.boxShadow};
  border-end-end-radius: 6px;
  border-end-start-radius: 6px;

  display: flex;
  flex-direction: row;
  align-items: center;

  width: 100%;
  height: 100%;

  z-index: 199;

  margin: 0;

  .table-header_icon {
    display: flex;

    align-items: center;
    align-self: center;
    justify-content: center;
    margin-block: 0;
    margin-inline: auto 20px;
    height: 100%;
    width: auto;

    padding-inline-start: 20px;
    padding-inline-end: 0;

    .table-header_icon-button {
      margin-inline-end: 8px;
    }
  }

  .table-container_label-element,
  .table-container_group-menu-checkbox {
    margin-inline-start: ${({ checkboxMargin }) => checkboxMargin ?? "28px"};

    @media ${tablet} {
      margin-inline-start: 24px;
    }
  }

  .table-container_label-element {
    white-space: nowrap;
  }

  .table-container_group-menu-separator {
    border-inline-end: ${({ theme }) =>
      theme.tableContainer.groupMenu.borderRight};
    width: 1px;
    height: 21px;
    margin-block: 0;
    margin-inline: 20px 16px;

    @media ${tablet} {
      height: 36px;
    }

    @media ${mobile} {
      height: 20px;
    }
  }

  .table-container_group-menu_button {
    margin-inline-end: 8px;
  }

  .table-container_group-menu-combobox {
    height: 24px;
    width: 16px;
    margin-block: 7px 0;
    margin-inline: 9px 2px;
    background: transparent;

    .combo-button {
      .combo-buttons_arrow-icon {
        margin-block: 1px 0;
        margin-inline: 0 16px;
      }
    }
  }

  .scroll-body {
    display: flex;
  }
`;

const StyledInfoPanelToggleColorThemeWrapper = styled(ColorTheme).attrs(
  injectDefaultTheme,
)<{
  isInfoPanelVisible?: boolean;
}>`
  ${(props) =>
    props.isInfoPanelVisible &&
    css`
      .info-panel-toggle-bg {
        height: 30px;
        width: 30px;
        background: ${props.theme.backgroundAndSubstrateColor};
        border: 1px solid ${props.theme.backgroundAndSubstrateColor};
        border-radius: 50%;
        .info-panel-toggle {
          margin: auto;
          margin-top: 25%;
        }
      }
    `}

  @media ${tablet} {
    display: none;
    margin-block: 0;
    margin-inline: auto 16px;
  }

  margin-top: 1px;

  .info-panel-toggle-bg {
    margin-bottom: 1px;
  }

  .info-panel-toggle svg {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && `transform: scaleX(-1);`}
  }
`;

const StyledTableHeader = styled.div.attrs(injectDefaultTheme)<{
  checkboxMargin?: string;
  interfaceDirection?: string;
}>`
  position: fixed;
  background: ${(props) => props.theme.tableContainer.header.background};
  display: grid;
  z-index: 1;
  height: 39px;
  border-bottom: ${(props) => props.theme.tableContainer.header.borderBottom};
  margin: 0 -20px;
  padding: 0 20px;

  .table-container_header-checkbox {
    ${(props) =>
      props.checkboxMargin && `margin-inline-start: ${props.checkboxMargin};`}
  }

  .table-container_header-cell {
    overflow: hidden;
  }
`;

const StyledTableHeaderCell = styled.div.attrs(injectDefaultTheme)<{
  showIcon?: boolean;
  sortingVisible?: boolean;
  isActive?: boolean;
  isShort?: boolean;
  sorted?: boolean;
}>`
  cursor: ${(props) =>
    props.showIcon && props.sortingVisible ? "pointer" : "default"};

  .header-container-text-icon {
    padding-block: 13px 0;
    padding-inline: 4px 0;

    display: ${(props) =>
      props.isActive && props.showIcon ? "block" : "none"};
    ${(props) =>
      !props.sorted &&
      css`
        transform: scale(1, -1);
        padding-block: 14px;
        padding-inline: 4px 0;
      `}

    svg {
      width: 12px;
      height: 12px;
      path {
        fill: ${(props) =>
          props.isActive
            ? props.theme.tableContainer.header.activeIconColor
            : props.theme.tableContainer.header.iconColor} !important;
      }
    }

    &:hover {
      path {
        fill: ${(props) =>
          props.theme.tableContainer.header.hoverIconColor} !important;
      }
    }
  }

  :hover {
    .header-container-text-icon {
      ${(props) =>
        props.showIcon &&
        css`
          display: block;
        `};
    }
  }

  .table-container_header-item {
    display: grid;
    grid-template-columns: 1fr 22px;

    ${(isShort) =>
      isShort &&
      css`
        grid-template-columns: 1fr 12px;
      `};

    margin-inline-end: 8px;

    user-select: none;
  }

  .header-container-text-wrapper {
    display: flex;
    overflow: hidden;
  }

  .header-container-text {
    height: 38px;
    display: block;
    line-height: 38px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    color: ${(props) =>
      props.isActive
        ? props.theme.tableContainer.header.activeTextColor
        : props.theme.tableContainer.header.textColor};

    ${(props) =>
      props.showIcon &&
      props.sortingVisible &&
      css`
        &:hover {
          color: ${props.theme.tableContainer.header.hoverTextColor} !important;
        }
      `}
  }
`;

const StyledTableBody = styled.div<{
  useReactWindow?: boolean;
  infoPanelVisible?: boolean;
}>`
  display: contents;

  ${({ useReactWindow }) => useReactWindow && reactWindowBodyStyles}

  .table-container_cell {
    ${({ infoPanelVisible }) =>
      infoPanelVisible &&
      css`
        padding: 0;
      `}
  }
`;

const StyledTableRow = styled.div.attrs(injectDefaultTheme)<{
  dragging?: boolean;
  isIndexEditingMode?: boolean;
  isActive?: boolean;
  checked?: boolean;
}>`
  display: contents;

  @media (hover: hover) {
    .create-share-link {
      display: none;
    }

    &:hover .create-share-link {
      display: block;
    }

    ${({ isActive, checked }) =>
      (isActive || checked) &&
      css`
        .create-share-link {
          display: block;
        }
      `}
  }

  .table-container_header-checkbox {
    svg {
      margin: 0;
    }
  }

  .table-container_header-settings {
    justify-self: flex-end;
  }

  .droppable-hover {
    background: ${(props) =>
      props.dragging && !props.isIndexEditingMode
        ? `${props.theme.dragAndDrop.acceptBackground} !important`
        : "none"};
  }

  .table-container_row-loader {
    display: inline-flex;
  }
`;

const StyledTableCell = styled.div.attrs(injectDefaultTheme)<{
  hasAccess?: boolean;
  checked?: boolean;
}>`
  /* padding-right: 8px; */
  height: 48px;
  max-height: 48px;
  border-bottom: ${(props) => props.theme.tableContainer.tableCell.border};
  overflow: hidden;

  display: flex;
  align-items: center;

  .react-svg-icon svg {
    margin-top: 2px;
  }

  .table-container_element {
    display: ${(props) => (props.checked ? "none" : "flex")};
  }
  .table-container_row-checkbox {
    display: ${(props) => (props.checked ? "flex" : "none")};
    padding: 16px;

    margin-inline-start: -4px;
  }

  ${(props) =>
    props.hasAccess &&
    css`
      :hover {
        .table-container_element {
          display: none;
        }
        .table-container_row-checkbox {
          display: flex;
        }
      }
    `}
`;

const StyledTableSettings = styled.div`
  margin-block: 14px 0px;
  margin-inline: 0 2px;
  display: inline-block;
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .table-container_settings-checkbox {
    padding: 8px 16px;
  }
`;

const StyledEmptyTableContainer = styled.div`
  grid-column-start: 1;
  grid-column-end: -1;
  height: 40px;
`;

const StyledScrollbar = styled(Scrollbar)`
  .scroller {
    display: flex;
  }
  .nav-thumb-vertical {
    display: none !important;
  }
  .nav-thumb-horizontal {
    @media ${tablet} {
      display: none !important;
    }
  }
`;

const StyledSettingsIcon = styled(IconButton).attrs(injectDefaultTheme)`
  ${(props) =>
    props.isDisabled &&
    css`
      svg {
        path {
          fill: ${props.theme.tableContainer.header
            .settingsIconDisableColor} !important;
        }
      }
    `}
`;

export {
  StyledTableContainer,
  StyledTableRow,
  StyledTableBody,
  StyledTableHeader,
  StyledTableHeaderCell,
  StyledTableCell,
  StyledTableSettings,
  StyledTableGroupMenu,
  StyledInfoPanelToggleColorThemeWrapper,
  StyledEmptyTableContainer,
  StyledScrollbar,
  StyledSettingsIcon,
};
