import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import { Base } from "@docspace/components/themes";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";

import { StyledTableContainer } from "../../../StyledStepper";
import EmptyScreenContainer from "@docspace/components/empty-screen-container";
import IconButton from "@docspace/components/icon-button";
import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import TableBody from "@docspace/components/table-container/TableBody";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

const UserSelectTableContainer = styled(StyledTableContainer)`
  .table-group-menu {
    height: 69px;
    position: absolute;
    z-index: 201;
    left: 0px;
    width: 100%;

    margin-top: -35.5px;

    .table-container_group-menu {
      border-image-slice: 0;
      border-image-source: none;
      border-bottom: ${(props) =>
        props.theme.client.settings.migration.workspaceBorder};
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
      padding: 0px;
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }

    .table-container_header {
      position: absolute;
      padding: 0px 28px;
      padding-right: 15px;
    }
  }
`;

UserSelectTableContainer.defaultProps = { theme: Base };

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;

const checkedAccountType = "result";

const TableView = (props) => {
  const {
    t,
    userId,
    viewAs,
    setViewAs,
    sectionWidth,
    accountsData,
    typeOptions,

    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    currentDeviceType,
  } = props;
  const tableRef = useRef(null);
  const [hideColumns, setHideColumns] = useState(false);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const isIndeterminate =
    checkedUsers.result.length > 0 &&
    checkedUsers.result.length !== users.result.length;

  const toggleAll = (isChecked) =>
    toggleAllAccounts(isChecked, users.result, checkedAccountType);

  const onClearFilter = () => {
    setSearchValue("");
  };

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const headerMenu = [
    {
      id: "change-type",
      key: "change-type",
      label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
      disabled: false,
      withDropDown: true,
      options: typeOptions,
      iconUrl: ChangeTypeReactSvgUrl,
    },
  ];

  return (
    <UserSelectTableContainer forwardedRef={tableRef} useReactWindow>
      {checkedUsers.result.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            checkboxOptions={[]}
            sectionWidth={sectionWidth}
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            isIndeterminate={isIndeterminate}
            isChecked={checkedUsers.result.length === users.result.length}
            onChange={toggleAll}
          />
        </div>
      )}
      {accountsData.length > 0 ? (
        <>
          <UsersTableHeader
            t={t}
            sectionWidth={sectionWidth}
            tableRef={tableRef}
            columnStorageName={columnStorageName}
            columnInfoPanelStorageName={columnInfoPanelStorageName}
            isIndeterminate={isIndeterminate}
            isChecked={checkedUsers.result.length === users.result.length}
            toggleAll={toggleAll}
            setHideColumns={setHideColumns}
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
                key={data.key}
                id={data.key}
                type={data.userType}
                displayName={data.displayName}
                email={data.email}
                typeOptions={typeOptions}
                hideColumns={hideColumns}
                isChecked={isAccountChecked(data.key, checkedAccountType)}
                toggleAccount={() => toggleAccount(data, checkedAccountType)}
              />
            ))}
          </TableBody>
        </>
      ) : (
        <EmptyScreenContainer
          imageSrc={EmptyScreenUserReactSvgUrl}
          imageAlt="Empty Screen user image"
          headerText={t("People:NotFoundUsers")}
          descriptionText={t("People:NotFoundUsersDescription")}
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
    </UserSelectTableContainer>
  );
};

export default inject(({ setup, auth, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const { id: userId } = auth.userStore.user;
  const { currentDeviceType } = auth.settingsStore;
  const {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    viewAs,
    setViewAs,
    userId,

    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    currentDeviceType,
  };
})(observer(TableView));
