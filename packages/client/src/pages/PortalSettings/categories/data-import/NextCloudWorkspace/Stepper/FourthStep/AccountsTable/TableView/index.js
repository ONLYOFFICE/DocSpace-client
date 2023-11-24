import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";
import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";

import EmptyScreenContainer from "@docspace/components/empty-screen-container";
import IconButton from "@docspace/components/icon-button";
import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 20px;

  .table-group-menu {
    height: 69px;
    position: absolute;
    z-index: 201;
    left: 0px;
    width: 100%;

    margin-top: -37.5px;

    .table-container_group-menu {
      border-image-slice: 0;
      border-image-source: none;
      border-bottom: ${(props) => props.theme.client.settings.migration.workspaceBorder};
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
    }

    .table-container_group-menu-checkbox {
      margin-left: 0;
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }
  }

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
      background: ${(props) => props.theme.client.settings.migration.tableRowHoverColor};
    }
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
  } = props;
  const tableRef = useRef(null);
  const [hideColumns, setHideColumns] = useState(false);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const isIndeterminate =
    checkedUsers.result.length > 0 && checkedUsers.result.length !== users.result.length;

  const toggleAll = (isChecked) => toggleAllAccounts(isChecked, users.result, checkedAccountType);

  const onClearFilter = () => {
    setSearchValue("");
  };

  useEffect(() => {
    if (!sectionWidth) return;
    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

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
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
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
            fetchMoreFiles={() => {}}>
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
          descriptionText={t("People:NotFoundUsersDesc")}
          buttons={
            <Box displayProp="flex" alignItems="center">
              <IconButton
                className="clear-icon"
                isFill
                size="12"
                onClick={onClearFilter}
                iconName={ClearEmptyFilterSvgUrl}
              />
              <Link type="action" isHovered={true} fontWeight="600" onClick={onClearFilter}>
                {t("Common:ClearFilter")}
              </Link>
            </Box>
          }
        />
      )}
    </StyledTableContainer>
  );
};

export default inject(({ setup, auth, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const { id: userId } = auth.userStore.user;
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
  };
})(observer(TableView));
