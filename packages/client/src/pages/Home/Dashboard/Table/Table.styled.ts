import styled, { css } from "styled-components";
import TableRow from "@docspace/components/table-container/TableRow";
import TableContainer from "@docspace/components/table-container";

import NoUserSelect from "@docspace/components/utils/commonStyles";

const marginCss = css`
  margin-top: -1px;
  border-top: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
`;

const userNameCss = css`
  margin-left: -24px;
  padding-left: 24px;
  ${marginCss}
`;

const contextCss = css`
  margin-right: -20px;
  padding-right: 18px;
  ${marginCss}
`;

export const StyledTableContainer = styled(TableContainer)`
  .table-row-selected {
    .table-container_role-name-cell {
      ${userNameCss}
    }

    .table-container_row-context-menu-wrapper {
      ${contextCss}
    }
  }

  .table-row-selected + .table-row-selected {
    .table-row {
      .table-container_role-name-cell,
      .table-container_row-context-menu-wrapper {
        margin-top: -1px;
        border-image-slice: 1;
        border-top: 1px solid;
      }
      .table-container_role-name-cell {
        ${userNameCss}
        border-left: 0; //for Safari macOS
        border-right: 0; //for Safari macOS

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

  .role-item:not(.table-row-selected) + .table-row-selected {
    .table-row {
      .table-container_role-name-cell {
        ${userNameCss}
      }

      .table-container_row-context-menu-wrapper {
        ${contextCss}
      }

      .table-container_role-name-cell,
      .table-container_row-context-menu-wrapper {
        border-bottom: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
      }
    }
  }
`;

export const TableRowContainer = styled.div`
  display: contents;
`;

export const TableCellQueue = styled.span`
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  padding-left: 8px;

  color: ${(props) => props.theme.filesSection.tableView.row.sideColor};

  ${NoUserSelect}

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BoardTableRow = styled(TableRow)`
  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
      border-top: ${(props) =>
        `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
      margin-top: -1px;
    }

    .table-container_role-name-cell {
      margin-left: -24px;
      padding-left: 24px;
    }
    .table-container_row-context-menu-wrapper {
      margin-right: -20px;
      padding-right: 18px;
    }
  }

  .table-container_cell {
    height: 48px;
    max-height: 48px;

    background: ${(props) =>
      (props.checked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
  }

  .table-container_row-checkbox-wrapper {
    padding-right: 0px;
    min-width: 40px;

    .table-container_row-checkbox {
      margin-left: -4px;
      padding: 16px 0px 16px 12px;
    }
  }

  .link-with-dropdown-group {
    margin-right: 12px;
  }

  .table-cell_role {
    margin-right: 12px;
  }

  .table-container_row-context-menu-wrapper {
    padding-right: 0px;
  }

  .table-cell_queue-number {
    margin-left: -8px;
  }

  .table-container_element {
    padding-left: 4px;
  }
`;
