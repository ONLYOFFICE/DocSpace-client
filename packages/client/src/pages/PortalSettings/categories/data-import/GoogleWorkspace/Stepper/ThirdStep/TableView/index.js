import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import UsersTypeTableHeader from "./UsersTypeTableHeader";
import UsersTypeTableRow from "./UsersTypeTableRow";

import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";
import SearchInput from "@docspace/components/search-input";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";

const StyledTableContainer = styled(TableContainer)`
  margin: 20px 0;

  .table-group-menu {
    height: 69px;
    position: absolute;
    z-index: 201;
    left: 0;
    top: 214px;
    width: 100%;

    .table-container_group-menu {
      border-image-slice: 0;
      box-shadow: rgba(0, 0, 0, 0.07) 0px 4px 4px;
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
  }

  .table-container_header {
    position: absolute;
  }

  .table-list-item {
    margin-top: -1px;
    &:hover {
      cursor: pointer;
      background-color: ${(props) =>
        props.theme.isBase ? "#F8F9F9" : "#282828"};
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const data = [
  {
    key: "docspace-admin",
    label: "DocSpace admin",
    onClick: () => console.log("changed-type"),
  },
  {
    key: "room-admin",
    label: "Room admin",
    onClick: () => console.log("changed-type"),
  },
  {
    key: "power-user",
    label: "Power user",
    onClick: () => console.log("changed-type"),
  },
];

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `googleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelGoogleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;

const TableView = (props) => {
  const { userId, viewAs, setViewAs, sectionWidth, usersData } = props;
  const [isChecked, setIsChecked] = useState(false);
  const [checkbox, setCheckbox] = useState([]);
  const tableRef = useRef(null);

  const onCheck = (checked) => {
    setIsChecked(checked);
    if (checked) {
      setCheckbox(usersData.map((data) => data.id));
    } else {
      setCheckbox([]);
    }
  };

  const onChangeAllCheckbox = (e) => {
    onCheck(e.target.checked);
  };

  const onChangeCheckbox = (id, checked) => {
    if (checked) {
      setCheckbox([...checkbox, id]);
    } else {
      setCheckbox([...checkbox.filter((item) => item !== id)]);
    }
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

  const headerMenu = [
    {
      id: "change-type",
      key: "change-type",
      label: "Change type",
      disabled: false,
      onClick: () => console.log("open-menu"),
      withDropDown: true,
      options: data,
      iconUrl: ChangeTypeReactSvgUrl,
    },
  ];

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      {checkbox.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            onChange={onCheck}
            headerMenu={headerMenu}
            isChecked={isChecked}
            isIndeterminate={checkbox.length && !isChecked}
            withoutInfoPanelToggler
            sectionWidth={sectionWidth}
            withComboBox={false}
          />
        </div>
      )}

      <SearchInput
        id="search-users-input"
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
        placeholder="Search"
      />
      <UsersTypeTableHeader
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        userId={userId}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        onChangeAllCheckbox={onChangeAllCheckbox}
        isChecked={isChecked}
        isIndeterminate={checkbox.length && !isChecked}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={usersData.length}
        hasMoreFiles={false}
        itemCount={usersData.length}
      >
        {usersData.map((data) => (
          <UsersTypeTableRow
            key={data.id}
            id={data.id}
            displayName={data.displayName}
            email={data.email}
            type={data.type}
            checkbox={checkbox}
            isChecked={isChecked}
            onChangeCheckbox={onChangeCheckbox}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ setup, auth }) => {
  const { viewAs, setViewAs } = setup;
  const { id: userId } = auth.userStore.user;

  return {
    viewAs,
    setViewAs,
    userId,
  };
})(observer(TableView));
