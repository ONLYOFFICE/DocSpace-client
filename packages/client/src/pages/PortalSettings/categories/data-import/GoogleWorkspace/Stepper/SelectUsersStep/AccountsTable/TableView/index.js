import { useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 20px;

  .header-container-text {
    font-size: 12px;
    color: ${(props) => props.theme.client.settings.migration.tableHeaderText};
  }

  .table-container_header {
    position: absolute;
  }

  .table-list-item {
    margin-top: -1px;
    &:hover {
      cursor: pointer;
      background: ${(props) =>
        props.theme.client.settings.migration.tableRowHoverColor};
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `googleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelGoogleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;

const TableView = (props) => {
  const {
    t,
    userId,
    viewAs,
    setViewAs,
    sectionWidth,
    accountsData,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
    users,
  } = props;
  const tableRef = useRef(null);

  const toggleAll = (e) => toggleAllAccounts(e, users);

  const handleToggle = (e, id) => {
    e.stopPropagation();
    toggleAccount(id);
  };

  const isIndeterminate =
    checkedAccounts.length > 0 && checkedAccounts.length !== users.length;

  useEffect(() => {
    if (!sectionWidth) return;
    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
    return cleanCheckedAccounts;
  }, [sectionWidth]);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      <UsersTableHeader
        t={t}
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        userId={userId}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        isIndeterminate={isIndeterminate}
        isChecked={checkedAccounts.length === users.length}
        toggleAll={toggleAll}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={accountsData.length}
        hasMoreFiles={false}
        itemCount={accountsData.length}
      >
        {accountsData.map((data) => (
          <UsersTableRow
            key={data.key}
            displayName={data.displayName}
            email={data.email}
            dublicate={data.dublicate}
            isChecked={isAccountChecked(data.key)}
            toggleAccount={(e) => handleToggle(e, data.key)}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ setup, auth, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const { id: userId } = auth.userStore.user;
  const {
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
    users,
  } = importAccountsStore;

  return {
    users,
    viewAs,
    setViewAs,
    userId,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
  };
})(observer(TableView));
