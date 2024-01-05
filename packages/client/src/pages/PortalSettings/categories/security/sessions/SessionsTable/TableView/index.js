import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/components/themes";
import styled, { css } from "styled-components";

import SessionsTableHeader from "./SessionsTableHeader";
import SessionsTableRow from "./SessionsTableRow";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

import TableContainer from "@docspace/components/table-container/TableContainer";
import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import TableBody from "@docspace/components/table-container/TableBody";

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 24px;

  .table-group-menu {
    height: 69px;
    position: absolute;
    z-index: 201;
    top: 0;
    left: 0px;
    width: 100%;

    .table-container_group-menu {
      border-image-slice: 0;
      border-image-source: none;
      border-bottom: ${(props) =>
        props.theme.filesSection.tableView.row.borderColor};
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
      padding: 0px;
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }
  }

  .table-container_header {
    position: absolute;
    padding: 0px 20px;
  }

  .header-container-text {
    color: #a3a9ae;
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

const TABLE_VERSION = "5";
const COLUMNS_SIZE = `sessionsColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelSessionsColumnsSize_ver-${TABLE_VERSION}`;

const TableView = ({
  t,
  sectionWidth,
  userId,
  sessionsData,
  allSessions,
  checkedSessions,
  toggleSession,
  toggleAllSessions,
  isSessionChecked,
}) => {
  const [hideColumns, setHideColumns] = useState(false);
  const tableRef = useRef(null);

  const handleToggle = (e, id) => {
    e.stopPropagation();
    toggleSession(id);
  };

  const handleAllToggles = (checked) => {
    toggleAllSessions(checked, allSessions);
  };

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const headerMenu = [
    {
      id: "sessions",
      key: "Sessions",
      label: t("Common:Sessions"),
      onClick: () => console.log("Sessions"),
      iconUrl: HistoryFinalizedReactSvgUrl,
    },
    {
      id: "logout",
      key: "Logout",
      label: t("Common:Logout"),
      onClick: () => console.log("Logout"),
      iconUrl: RemoveSvgUrl,
    },
    {
      id: "Disable",
      key: "Disable",
      label: t("Common:DisableUserButton"),
      onClick: () => console.log("Disable"),
      iconUrl: TrashReactSvgUrl,
    },
  ];

  const isChecked = checkedSessions.length === allSessions.length;

  const isIndeterminate =
    checkedSessions.length > 0 && checkedSessions.length !== allSessions.length;

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      {checkedSessions.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            sectionWidth={sectionWidth}
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            checkboxOptions={[]}
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            onChange={handleAllToggles}
          />
        </div>
      )}
      <SessionsTableHeader
        t={t}
        sectionWidth={sectionWidth}
        setHideColumns={setHideColumns}
        userId={userId}
        tableRef={tableRef}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        isChecked={isChecked}
        isIndeterminate={isIndeterminate}
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
            key={session.userId}
            avatar={session.avatar}
            displayName={session.displayName}
            status={session.status}
            platform={session.platform}
            browser={session.browser}
            country={session.country}
            city={session.city}
            ip={session.ip}
            hideColumns={hideColumns}
            isChecked={isSessionChecked(session.userId)}
            toggleSession={(e) => handleToggle(e, session.userId)}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ auth, setup }) => {
  const { id: userId } = auth.userStore.user;
  const {
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  } = setup;

  return {
    userId,
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  };
})(observer(TableView));
