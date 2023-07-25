import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/components/themes";
import styled from "styled-components";

import GWTableHeader from "./GWTableHeader";
import GWTableRow from "./GWTableRow";
import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";
import SearchInput from "@docspace/components/search-input";

import { mockData } from "../../mockData.js";

const TableWrapper = styled(TableContainer)`
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
      background-color: ${(props) =>
        props.theme.isBase ? "#F8F9F9" : "#282828"};
    }
  }
`;

TableWrapper.defaultProps = { theme: Base };

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `googleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelGoogleWorkspaceColumnsSize_ver-${TABLE_VERSION}`;

const GWTableView = (props) => {
  const { userId, viewAs, setViewAs, sectionWidth } = props;
  const [hideColumns, setHideColumns] = useState(false);
  const tableRef = useRef(null);

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
    <TableWrapper forwardedRef={tableRef} useReactWindow>
      <SearchInput
        id="search-users-input"
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
        placeholder="Search"
      />
      <GWTableHeader
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        userId={userId}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        setHideColumns={setHideColumns}
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
      >
        {mockData.map((data) => (
          <GWTableRow
            key={data.id}
            displayName={data.displayName}
            email={data.email}
            dublicate={data.dublicate}
            hideColumns={hideColumns}
          />
        ))}
      </TableBody>
    </TableWrapper>
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
})(observer(GWTableView));
