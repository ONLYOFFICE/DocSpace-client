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
import { injectDefaultTheme } from "@docspace/shared/utils";

export const TableWrapper = styled(TableContainer)`
  margin-top: 0px;

  .header-container-text {
    font-size: 12px;
  }

  .table-container_header {
    position: absolute;
  }
`;

const StyledRowWrapper = styled.div`
  display: contents;
`;

const StyledTableRow = styled(TableRow).attrs(injectDefaultTheme)`
  .table-container_cell {
    text-overflow: ellipsis;

    padding-inline-end: 8px;
  }

  .mr-8 {
    margin-inline-end: 8px;
  }

  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .description-text {
    color: ${(props) => props.theme.oauth.list.descriptionColor};
  }

  .toggleButton {
    display: contents;

    input {
      position: relative;

      margin-inline-start: -8px;
    }
  }

  .table-container_row-loader {
    margin-left: 8px;
    margin-right: 16px;
  }

  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};

      margin-top: -1px;

      border-top: ${(props) =>
        `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
    }

    .table-container_file-name-cell {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -24px;
              padding-right: 24px;
            `
          : css`
              margin-left: -24px;
              padding-left: 24px;
            `}
    }
    .table-container_row-context-menu-wrapper {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: -20px;
              padding-left: 18px;
            `
          : css`
              margin-right: -20px;
              padding-right: 18px;
            `}
    }
  }
`;

export { StyledRowWrapper, StyledTableRow };
