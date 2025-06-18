// (c) Copyright Ascensio System SIA 2009-2025
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
import { injectDefaultTheme, mobile, tablet } from "../../utils";
import { Scrollbar } from "../scrollbar";

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

const StyledInfoPanelToggleColorThemeWrapper = styled.div.attrs(
  injectDefaultTheme,
)<{
  isInfoPanelVisible?: boolean;
  className?: string;
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

export {
  StyledTableContainer,
  StyledTableBody,
  StyledTableGroupMenu,
  StyledInfoPanelToggleColorThemeWrapper,
  StyledScrollbar,
};
