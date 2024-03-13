import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";

import { StyledTableContainer } from "../../../StyledStepper";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import { TableBody } from "@docspace/shared/components/table";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudSecondColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudSecondColumnsSize_ver-${TABLE_VERSION}`;

const checkedAccountType = "withEmail";

const TableView = (props) => {
  const {
    t,
    withEmailUsers,
    userId,
    sectionWidth,
    accountsData,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = props;
  const [hideColumns, setHideColumns] = useState(false);
  const tableRef = useRef(null);

  const toggleAll = (e) =>
    toggleAllAccounts(e.target.checked, withEmailUsers, checkedAccountType);

  const handleToggle = (e, user) => {
    e.stopPropagation();
    toggleAccount(user, checkedAccountType);
  };

  const onClearFilter = () => {
    setSearchValue("");
  };

  const isIndeterminate =
    checkedUsers.withEmail.length > 0 &&
    checkedUsers.withEmail.length !== withEmailUsers.length;

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      {accountsData.length > 0 ? (
        <>
          <UsersTableHeader
            t={t}
            sectionWidth={sectionWidth}
            tableRef={tableRef}
            userId={userId}
            columnStorageName={columnStorageName}
            columnInfoPanelStorageName={columnInfoPanelStorageName}
            setHideColumns={setHideColumns}
            isIndeterminate={isIndeterminate}
            isChecked={checkedUsers.withEmail.length === withEmailUsers.length}
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
                displayName={data.displayName}
                email={data.email}
                isDuplicate={data.isDuplicate}
                hideColumns={hideColumns}
                isChecked={isAccountChecked(data.key, checkedAccountType)}
                toggleAccount={(e) => handleToggle(e, data)}
              />
            ))}
          </TableBody>
        </>
      ) : (
        <EmptyScreenContainer
          imageSrc={EmptyScreenUserReactSvgUrl}
          imageAlt="Empty Screen user image"
          headerText={t("Common:NotFoundUsers")}
          descriptionText={t("Common:NotFoundUsersDescription")}
          buttons={
            <Box displayProp="flex" alignItems="center">
              <IconButton
                className="clear-icon"
                isFill
                size="12"
                onClick={onClearFilter}
                iconName={ClearEmptyFilterSvgUrl}
              />
              <Link
                type="action"
                isHovered={true}
                fontWeight="600"
                onClick={onClearFilter}
              >
                {t("Common:ClearFilter")}
              </Link>
            </Box>
          }
        />
      )}
    </StyledTableContainer>
  );
};

export default inject(({ userStore, importAccountsStore }) => {
  const { id: userId } = userStore.user;

  const {
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    userId,
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  };
})(observer(TableView));
