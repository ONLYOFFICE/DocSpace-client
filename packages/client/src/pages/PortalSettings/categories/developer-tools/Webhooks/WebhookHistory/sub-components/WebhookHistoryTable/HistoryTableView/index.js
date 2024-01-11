import styled from "styled-components";
import { useParams } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { useState, useRef } from "react";

import { Base } from "@docspace/shared/themes";
import { TableBody } from "@docspace/shared/components/table";
import { TableContainer } from "@docspace/shared/components/table";

import HistoryTableRow from "./HistoryTableRow";
import HistoryTableHeader from "./HistoryTableHeader";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

const TableWrapper = styled(TableContainer)`
  margin-top: -2px;

  .table-container_header {
    position: absolute;
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
`;

TableWrapper.defaultProps = { theme: Base };

const TABLE_VERSION = "5";
const COLUMNS_SIZE = `webhooksHistoryColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelWebhooksHistoryColumnsSize_ver-${TABLE_VERSION}`;

const HistoryTableView = (props) => {
  const {
    sectionWidth,
    historyItems,
    viewAs,
    setViewAs,
    hasMoreItems,
    totalItems,
    fetchMoreItems,
    formatFilters,
    historyFilters,
    userId,
    currentDeviceType,
  } = props;

  const tableRef = useRef(null);
  const [hideColumns, setHideColumns] = useState(false);

  const { id } = useParams();

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const fetchMoreFiles = () => {
    const params = historyFilters === null ? {} : formatFilters(historyFilters);
    fetchMoreItems({ ...params, configId: id });
  };

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <TableWrapper
      forwardedRef={tableRef}
      style={{
        gridTemplateColumns: "300px 100px 400px 24px",
      }}
      useReactWindow
    >
      <HistoryTableHeader
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
        filesLength={historyItems.length}
        fetchMoreFiles={fetchMoreFiles}
        hasMoreFiles={hasMoreItems}
        itemCount={totalItems}
      >
        {historyItems.map((item) => (
          <HistoryTableRow
            key={item.id}
            item={{ ...item, title: item.id }}
            hideColumns={hideColumns}
          />
        ))}
      </TableBody>
    </TableWrapper>
  );
};

export default inject(({ setup, webhooksStore, auth }) => {
  const { viewAs, setViewAs } = setup;
  const {
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    formatFilters,
    historyFilters,
  } = webhooksStore;
  const { id: userId } = auth.userStore.user;
  const { currentDeviceType } = auth.settingsStore;

  return {
    viewAs,
    setViewAs,
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    formatFilters,
    historyFilters,
    userId,
    currentDeviceType,
  };
})(observer(HistoryTableView));
