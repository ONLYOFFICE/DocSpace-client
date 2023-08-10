import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";

import { mockData } from "../../mockData";

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;

const StyledTableContainer = styled(TableContainer)`
  margin: 0.5px 0px 20px;

  .header-container-text {
    font-size: 12px;
  }

  .table-container_header {
    position: absolute;
  }

  .table-list-item {
    margin-top: -1px;
    &:hover {
      cursor: pointer;
      background-color: ${(props) => (props.theme.isBase ? "#F8F9F9" : "#282828")};
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const TableView = (props) => {
  const {
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
  } = props;
  const [hideColumns, setHideColumns] = useState(false);
  const tableRef = useRef(null);

  const toggleAll = (e) => toggleAllAccounts(e, mockData);
  const handleToggle = (e, id) => {
    e.stopPropagation();
    toggleAccount(id);
  };

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
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        setHideColumns={setHideColumns}
        isIndeterminate={checkedAccounts.length > 0 && checkedAccounts.length !== mockData.length}
        isChecked={checkedAccounts.length === mockData.length}
        toggleAll={toggleAll}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={mockData.length}
        hasMoreFiles={false}
        itemCount={mockData.length}
        fetchMoreFiles={() => {}}>
        {mockData.map((data) => (
          <UsersTableRow
            key={data.id}
            displayName={data.displayName}
            email={data.email}
            hideColumns={hideColumns}
            isChecked={isAccountChecked(data.id)}
            toggleAccount={(e) => handleToggle(e, data.id)}
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
  } = importAccountsStore;

  return {
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
