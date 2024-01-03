import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/components/themes";
import styled, { css } from "styled-components";

import SessionsTableHeader from "./SessionsTableHeader";
import SessionsTableRow from "./SessionsTableRow";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 24px;

  .header-container-text {
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  }

  .table-list-item {
    cursor: pointer;

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

  .table-container_row-context-menu-wrapper {
    justify-content: flex-end;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `sessionsColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelSessionsColumnsSize_ver-${TABLE_VERSION}`;

const TableView = ({ t, sectionWidth, userId, sessionsData }) => {
  const [hideColumns, setHideColumns] = useState(false);
  const tableRef = useRef(null);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      <SessionsTableHeader
        t={t}
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        userId={userId}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        setHideColumns={setHideColumns}
        // isIndeterminate={isIndeterminate}
        // isChecked={checkedUsers.withEmail.length === withEmailUsers.length}
        // toggleAll={toggleAll}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={sessionsData.length}
        hasMoreFiles={false}
        itemCount={sessionsData.length}
        fetchMoreFiles={() => {}}
      >
        {sessionsData.map((session) => (
          <SessionsTableRow
            t={t}
            key={session.id}
            avatar={session.avatar}
            displayName={session.displayName}
            status={session.status}
            platform={session.platform}
            browser={session.browser}
            country={session.country}
            city={session.city}
            ip={session.ip}
            userId={session.userId}
            hideColumns={hideColumns}
            // isChecked={isAccountChecked(data.key, checkedAccountType)}
            // toggleAccount={(e) => handleToggle(e, data)}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ auth }) => {
  const { id: userId } = auth.userStore.user;

  return {
    userId,
  };
})(observer(TableView));
