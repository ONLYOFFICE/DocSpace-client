import styled, { css } from "styled-components";
import { Base } from "@docspace/shared/themes";
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

GroupsTableContainer.defaultProps = { theme: Base };

export const GroupsRowWrapper = styled.div`
  display: contents;
`;

export const GroupsRow = styled(TableRow)`
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
    .table-container_element {
    }
  }
  .table-cell_group-title {
    margin-inline-end: 12px;
  }
  .table-container_row-context-menu-wrapper {
    justify-content: flex-end;
    padding-inline-end: 0;
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

GroupsRow.defaultProps = { theme: Base };
