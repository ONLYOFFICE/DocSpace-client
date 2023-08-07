import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";

import { mockData } from "../../mockData.js";

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudSecondColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudSecondColumnsSize_ver-${TABLE_VERSION}`;

const StyledTableContainer = styled(TableContainer)`
  margin: 20px 0;

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
      background-color: ${(props) => (props.theme.isBase ? "#F8F9F9" : "#282828")};
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const TableView = (props) => {
  const { userId, viewAs, setViewAs, sectionWidth } = props;
  const [hideColumns, setHideColumns] = useState(false);
  const tableRef = useRef(null);

  const [checkedAccounts, setCheckedAccounts] = useState([]);

  const toggleAll = (e) => {
    if (e.target.checked) {
      setCheckedAccounts(mockData.map((data) => data.id));
    } else {
      setCheckedAccounts([]);
    }
  };

  const toggleAccount = (id) => {
    setCheckedAccounts((prevCheckedAccounts) =>
      prevCheckedAccounts.includes(id)
        ? prevCheckedAccounts.filter((item) => item !== id)
        : [...prevCheckedAccounts, id],
    );
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
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        setHideColumns={setHideColumns}
        isIndeterminate={checkedAccounts.length > 0 && checkedAccounts.length !== mockData.length}
        isChecked={checkedAccounts.length === mockData.length}
        toggleAll={toggleAll}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={mockData.length}
        hasMoreFiles={false}
        itemCount={mockData.length}
        fetchMoreFiles={() => {}}>
        {mockData.map((data) => (
          <UsersTableRow
            key={data.id}
            displayName={data.displayName}
            email={data.email}
            isDuplicate={data.isDuplicate}
            hideColumns={hideColumns}
            isChecked={checkedAccounts.includes(data.id)}
            toggleAccount={() => toggleAccount(data.id)}
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
