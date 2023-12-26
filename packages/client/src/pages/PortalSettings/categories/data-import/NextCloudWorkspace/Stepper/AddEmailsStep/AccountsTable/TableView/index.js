import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import TableBody from "@docspace/components/table-container/TableBody";
import { StyledTableContainer } from "../../../StyledStepper";

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudThirdColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudThirdColumnsSize_ver-${TABLE_VERSION}`;

const checkedAccountType = "withoutEmail";

const TableView = (props) => {
  const {
    t,
    userId,
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

  const usersWithFilledEmails = users.withoutEmail.filter(
    (user) => user.email.length > 0
  );

  const toggleAll = (e) =>
    toggleAllAccounts(
      e.target.checked,
      usersWithFilledEmails,
      checkedAccountType
    );

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
          checkedUsers.withoutEmail.length !== usersWithFilledEmails.length
        }
        isChecked={
          usersWithFilledEmails.length > 0 &&
          checkedUsers.withoutEmail.length === usersWithFilledEmails.length
        }
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
        fetchMoreFiles={() => {}}
      >
        {accountsData.map((data) => (
          <UsersTableRow
            t={t}
            key={data.key}
            id={data.key}
            email={data.email}
            displayName={data.displayName}
            hideColumns={hideColumns}
            isChecked={isAccountChecked(data.key, checkedAccountType)}
            toggleAccount={() => toggleAccount(data, checkedAccountType)}
            isEmailOpen={openedEmailKey === data.key}
            setOpenedEmailKey={setOpenedEmailKey}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ auth, importAccountsStore }) => {
  const { id: userId } = auth.userStore.user;
  const {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  } = importAccountsStore;

  return {
    userId,
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  };
})(observer(TableView));
