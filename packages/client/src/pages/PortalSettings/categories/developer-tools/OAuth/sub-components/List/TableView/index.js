import React, { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";

import styled from "styled-components";

import TableContainer from "@docspace/components/table-container/TableContainer";
import TableBody from "@docspace/components/table-container/TableBody";

import Row from "./Row";
import Header from "./Header";

import { Base } from "@docspace/components/themes";

const TableWrapper = styled(TableContainer)`
  margin-top: 16px;

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

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `oauthConfigColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelOauthConfigColumnsSize_ver-${TABLE_VERSION}`;

const TableView = (props) => {
  const {
    items,
    getClients,
    sectionWidth,
    viewAs,
    setViewAs,
    openSettingsModal,
    openDeleteModal,
    userId,
  } = props;

  const tableRef = useRef(null);
  const [hideColumns, setHideColumns] = useState(false);

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
      <Header
        sectionWidth={sectionWidth}
        tableRef={tableRef}
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
        filesLength={items.length}
        fetchMoreFiles={getClients}
        hasMoreFiles={false}
        itemCount={items.length}
      >
        {items.map((item, index) => (
          <Row
            key={item.id}
            item={item}
            index={index}
            openSettingsModal={openSettingsModal}
            openDeleteModal={openDeleteModal}
            hideColumns={hideColumns}
          />
        ))}
      </TableBody>
    </TableWrapper>
  );
};

export default inject(({ oauthStore, setup, auth }) => {
  const { getClients } = oauthStore;

  const { viewAs, setViewAs } = setup;
  const { id: userId } = auth.userStore.user;

  return {
    viewAs,
    setViewAs,
    getClients,
    userId,
  };
})(observer(TableView));
