import styled, { css } from "styled-components";

import { TableRow, TableContainer } from "@docspace/shared/components/table";
import { Base } from "@docspace/shared/themes";

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

const StyledTableRow = styled(TableRow)`
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

StyledTableRow.defaultProps = { theme: Base };

export { StyledRowWrapper, StyledTableRow };
