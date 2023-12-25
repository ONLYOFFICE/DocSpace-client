import styled, { css } from "styled-components";
import TableContainer from "@docspace/components/table-container/TableContainer";
import { Base } from "@docspace/components/themes";

export const Wrapper = styled.div`
  .users-without-email {
    font-size: 12px;
    margin: 0 0 16px;
  }

  .upper-buttons {
    margin-top: 16px;
    margin-bottom: 20px;
  }

  .data-import-progress-bar {
    width: 350px;
    margin: 12px 0 16px;
  }

  .save-cancel-buttons {
    margin-bottom: 16px;
  }

  .mt-8 {
    margin-top: 8px;
  }

  .mb-17 {
    margin-bottom: 17px;
  }

  .importUsersSearch {
    margin-top: 20px;
  }

  .sendLetterBlockWrapper {
    display: flex;
    align-items: center;
    margin: 17px 0 16px;

    .checkbox {
      margin-right: 8px;
    }
  }
`;

export const UsersInfoBlock = styled.div`
  display: flex;
  align-items: center;
  max-width: 660px;
  background: #f8f9f9;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  .selected-users-count {
    margin-right: 24px;
  }

  .selected-admins-count {
    margin-right: 8px;
  }
`;

export const StyledTableContainer = styled(TableContainer)`
  margin: 0.5px 0px 20px;

  .table-container_header {
    position: absolute;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0px 28px 0 15px;
          `
        : css`
            padding: 0px 15px 0 28px;
          `}
  }

  .header-container-text {
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  }

  .checkboxWrapper {
    padding: 0;
    padding-inline-start: 8px;
  }

  .table-list-item {
    cursor: pointer;

    padding-left: 20px;

    &:hover {
      background-color: ${(props) =>
        props.theme.filesSection.tableView.row.backgroundActive};

      .table-container_cell {
        margin-top: -1px;
        border-top: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

        margin-left: -24px;
        padding-left: 24px;
      }

      .checkboxWrapper {
        padding-left: 32px;
      }

      .table-container_row-context-menu-wrapper {
        margin-right: -20px;
        padding-right: 20px;
      }
    }
  }

  .table-list-item:has(.selected-table-row) {
    background-color: ${(props) =>
      props.theme.filesSection.tableView.row.backgroundActive};
  }

  .clear-icon {
    margin-right: 8px;
    margin-top: 2px;
  }

  .ec-desc {
    max-width: 618px;
  }
`;

StyledTableContainer.defaultProps = { theme: Base };
