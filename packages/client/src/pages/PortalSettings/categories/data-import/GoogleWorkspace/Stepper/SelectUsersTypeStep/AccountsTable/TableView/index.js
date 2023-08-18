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
    color: #a3a9ae;
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
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [checkbox, setCheckbox] = useState([]);
  const tableRef = useRef(null);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

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
      label: "Change type",
      disabled: false,
      onClick: () => console.log("open-menu"),
      withDropDown: true,
      options: typeOptions,
      iconUrl: ChangeTypeReactSvgUrl,
    },
  ];

  const onCheck = (checked) => {
    setIsChecked(checked);
    if (checked) {
      setCheckbox(accountsData.map((data) => data.id));
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
            checkbox={checkbox}
            isChecked={isChecked}
            onChangeCheckbox={onChangeCheckbox}
            typeOptions={typeOptions}
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
