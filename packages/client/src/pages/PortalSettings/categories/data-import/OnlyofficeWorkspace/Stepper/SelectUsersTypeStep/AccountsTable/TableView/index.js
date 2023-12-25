import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/components/themes";
import styled, { css } from "styled-components";

import UsersTypeTableHeader from "./UsersTypeTableHeader";
import UsersTypeTableRow from "./UsersTypeTableRow";

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
  }

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

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;

const checkedAccountType = "result";

const TableView = ({
  t,
  userId,
  sectionWidth,
  accountsData,
  typeOptions,
  users,
  checkedUsers,
  toggleAccount,
  toggleAllAccounts,
  isAccountChecked,
  setSearchValue,
}) => {
  const tableRef = useRef(null);
  const [hideColumns, setHideColumns] = useState(false);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const isIndeterminate =
    checkedUsers.result.length > 0 &&
    checkedUsers.result.length !== users.result.length;

  const isChecked = checkedUsers.result.length === users.result.length;

  const toggleAll = (isChecked) => {
    toggleAllAccounts(isChecked, users.result, checkedAccountType);
  };

  const onClearFilter = () => {
    setSearchValue("");
  };

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
            isChecked={isChecked}
            onChange={toggleAll}
          />
        </div>
      )}
      {accountsData.length > 0 ? (
        <>
          <UsersTypeTableHeader
            t={t}
            sectionWidth={sectionWidth}
            tableRef={tableRef}
            columnStorageName={columnStorageName}
            columnInfoPanelStorageName={columnInfoPanelStorageName}
            isIndeterminate={isIndeterminate}
            isChecked={isChecked}
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
              <UsersTypeTableRow
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
    setSearchValue,
  } = importAccountsStore;

  return {
    userId,
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  };
})(observer(TableView));
