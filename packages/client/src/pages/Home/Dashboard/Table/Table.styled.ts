import styled from "styled-components";
import TableRow from "@docspace/components/table-container/TableRow";

import NoUserSelect from "@docspace/components/utils/commonStyles";

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
