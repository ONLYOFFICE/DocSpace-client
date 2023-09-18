import { useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import UsersTypeTableHeader from "./UsersTypeTableHeader";
import UsersTypeTableRow from "./UsersTypeTableRow";

import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 20px;

  .table-group-menu {
    height: 69px;
    position: relative;
    z-index: 201;
    left: -20px;
    top: 28px;
    width: 100%;

    .table-container_group-menu {
      border-image-slice: 0;
      border-image-source: none;
      border-bottom: ${(props) =>
        props.theme.client.settings.migration.workspaceBorder};
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
      background: ${(props) =>
        props.theme.client.settings.migration.tableRowHoverColor};
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `googleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelGoogleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;

const TableView = ({
  t,
  users,
  userId,
  viewAs,
  setViewAs,
  sectionWidth,
  accountsData,
  typeOptions,
  checkedAccounts,
  toggleAccount,
  onCheckAccounts,
  isAccountChecked,
  cleanCheckedAccounts,
}) => {
  const tableRef = useRef(null);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const isIndeterminate =
    checkedAccounts.length > 0 && checkedAccounts.length !== users.length;

  const toggleAll = (checked) => {
    onCheckAccounts(checked, users);
  };

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

  const headerMenu = [
    {
      id: "change-type",
      key: "change-type",
      label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
      disabled: false,
      onClick: () => console.log("open-menu"),
      withDropDown: true,
      options: typeOptions,
      iconUrl: ChangeTypeReactSvgUrl,
    },
  ];

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      {checkedAccounts.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            sectionWidth={sectionWidth}
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            isIndeterminate={isIndeterminate}
            isChecked={checkedAccounts.length === users.length}
            onChange={toggleAll}
          />
        </div>
      )}
      <UsersTypeTableHeader
        t={t}
        sectionWidth={sectionWidth}
        tableRef={tableRef}
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
          <UsersTypeTableRow
            key={data.key}
            displayName={data.displayName}
            email={data.email}
            typeOptions={typeOptions}
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
    users,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
    onCheckAccounts,
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
    onCheckAccounts,
  };
})(observer(TableView));
