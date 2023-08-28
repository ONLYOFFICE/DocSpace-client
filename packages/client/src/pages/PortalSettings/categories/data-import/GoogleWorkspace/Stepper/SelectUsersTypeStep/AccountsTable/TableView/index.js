import { useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import { mockData } from "../../../mockData";
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
    position: absolute;
    z-index: 201;
    left: 0;
    top: 209px;
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
    checkedAccounts.length > 0 && checkedAccounts.length !== mockData.length;

  const toggleAll = (checked) => {
    onCheckAccounts(checked, mockData);
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
      label: "Change type",
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
            isChecked={checkedAccounts.length === mockData.length}
            onChange={toggleAll}
          />
        </div>
      )}
      <UsersTypeTableHeader
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        isIndeterminate={isIndeterminate}
        isChecked={checkedAccounts.length === mockData.length}
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
            key={data.id}
            id={data.id}
            displayName={data.displayName}
            email={data.email}
            type={data.type}
            typeOptions={typeOptions}
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
    onCheckAccounts,
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
    onCheckAccounts,
  };
})(observer(TableView));
