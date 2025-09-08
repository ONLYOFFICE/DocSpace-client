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

import { TableRow, TableContainer } from "@docspace/shared/components/table";

const marginCss = css`
  margin-top: -1px;
  border-top: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
`;

const groupTitleCss = css`
  margin-inline-start: -24px;
  padding-inline-start: 24px;
  ${marginCss}
`;

const contextCss = css`
  margin-inline-end: -20px;
  padding-inline-end: 20px;
  ${marginCss}
`;

export const GroupsTableContainer = styled(TableContainer)`
  :has(
    .table-container_body
      .table-list-item:first-child:first-child
      > .table-row-selected
  ) {
    .table-container_header {
      border-image-slice: 1;
      border-image-source: ${(props) =>
        props.theme.tableContainer.header.lengthenBorderImageSource};
    }
  }
  .table-row-selected {
    .table-container_group-title-cell {
      ${groupTitleCss}
    }
    .table-container_row-context-menu-wrapper {
      ${contextCss}
    }
  }
  .table-row-selected + .table-row-selected {
    .table-row {
      .table-container_group-title-cell {
        ${groupTitleCss}
        border-inline: 0; //for Safari macOS
        border-image-source: ${(props) => `linear-gradient(to right, 
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
      }
      .table-container_row-context-menu-wrapper {
        ${contextCss}
        border-image-source: ${(props) => `linear-gradient(to left,
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
      }
    }
  }
  .group-item:not(.table-row-selected) + .table-row-selected {
    .table-row {
      .table-container_group-title-cell {
        ${groupTitleCss}
      }
      .table-container_row-context-menu-wrapper {
        ${contextCss}
      }
    }
  }
`;

export const GroupsRowWrapper = styled.div<{ value?: string }>`
  display: contents;
`;

export const GroupsRow = styled(TableRow)<{
  checked?: boolean;
  isActive?: boolean;
}>`
  .table-container_cell:not(.table-container_row-checkbox-wrapper) {
    height: auto;
    max-height: 48px;
  }

  .table-container_cell {
    border-top: ${(props) =>
      `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
    margin-top: -1px;

    background: ${(props) =>
      (props.checked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
  }

  .table-container_row-context-menu-wrapper {
    height: 49px !important;
    max-height: none !important;
    box-sizing: border-box;
  }

  .table-container_row-checkbox-wrapper {
    min-width: 48px;
    padding-inline-end: 0;
    .table-container_row-checkbox {
      margin-inline-start: -4px;
      padding-block: 16px;
      padding-inline: 12px 0;
    }
    .table-container_row-loader {
      border-bottom: unset;
      padding-inline-start: 7px;
    }
  }
  .table-cell_group-title {
    margin-inline-end: 12px;
  }
  .table-container_row-context-menu-wrapper {
    justify-content: flex-end;
    padding-inline-end: 0;
  }

  .badges {
    margin-inline-start: 12px;
  }

  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
    }
    .table-container_group-title-cell {
      margin-inline-start: -24px;
      padding-inline-start: 24px;
    }
    .table-container_row-context-menu-wrapper {
      margin-inline-end: -20px;
      padding-inline-end: 20px;
    }
  }
`;
