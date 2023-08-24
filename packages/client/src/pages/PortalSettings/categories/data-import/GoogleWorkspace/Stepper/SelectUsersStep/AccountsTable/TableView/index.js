import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 20px;

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

const TableView = (props) => {
  const { userId, viewAs, setViewAs, sectionWidth, accountsData } = props;
  const [isChecked, setIsChecked] = useState(false);
  const [checkbox, setCheckbox] = useState([]);
  const tableRef = useRef(null);

  const onChangeAllCheckbox = (e) => {
    setIsChecked(e.target.checked);
    if (e.target.checked) {
      setCheckbox(accountsData.map((data) => data.id));
    } else {
      setCheckbox([]);
    }
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

  return (
    <StyledTableContainer forwardedRef={tableRef} useReactWindow>
      <UsersTableHeader
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
          <UsersTableRow
            key={data.id}
            id={data.id}
            displayName={data.displayName}
            email={data.email}
            dublicate={data.dublicate}
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
