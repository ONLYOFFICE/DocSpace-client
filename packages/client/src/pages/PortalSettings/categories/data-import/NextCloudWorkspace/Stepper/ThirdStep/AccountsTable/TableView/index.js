import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudThirdColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudThirdColumnsSize_ver-${TABLE_VERSION}`;

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

const checkedAccountType = "withoutEmail";

const TableView = (props) => {
  const {
    t,
    userId,
    viewAs,
    setViewAs,
    sectionWidth,
    accountsData,

    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  } = props;
  const [hideColumns, setHideColumns] = useState(false);
  const [openedEmailKey, setOpenedEmailKey] = useState(null);
  const tableRef = useRef(null);

  const toggleAll = (e) =>
    toggleAllAccounts(e.target.checked, users.withoutEmail, checkedAccountType);
  const handleToggle = (e, user) => {
    e.stopPropagation();
    toggleAccount(user, checkedAccountType);
  };

  useEffect(() => {
    if (!sectionWidth) return;
    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      <UsersTableHeader
        t={t}
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        setHideColumns={setHideColumns}
        isIndeterminate={
          checkedUsers.withoutEmail.length > 0 &&
          checkedUsers.withoutEmail.length !== users.withoutEmail.length
        }
        isChecked={checkedUsers.withoutEmail.length === users.withoutEmail.length}
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
        fetchMoreFiles={() => {}}>
        {accountsData.map((data) => (
          <UsersTableRow
            t={t}
            key={data.key}
            id={data.key}
            email={data.email}
            displayName={data.displayName}
            hideColumns={hideColumns}
            isChecked={isAccountChecked(data.key, checkedAccountType)}
            toggleAccount={(e) => handleToggle(e, data)}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ setup, auth, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const { id: userId } = auth.userStore.user;
  const { users, checkedUsers, toggleAccount, toggleAllAccounts, isAccountChecked } =
    importAccountsStore;

  return {
    viewAs,
    setViewAs,
    userId,

    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  };
})(observer(TableView));
