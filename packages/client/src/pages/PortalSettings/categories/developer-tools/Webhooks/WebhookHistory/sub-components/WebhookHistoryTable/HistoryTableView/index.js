// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled from "styled-components";
import { useParams } from "react-router";
import { inject, observer } from "mobx-react";
import { useState, useRef } from "react";

import { TableBody, TableContainer } from "@docspace/shared/components/table";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import { injectDefaultTheme } from "@docspace/shared/utils";
import { formatFilters } from "SRC_DIR/helpers/webhooks";
import HistoryTableRow from "./HistoryTableRow";
import HistoryTableHeader from "./HistoryTableHeader";

const TableWrapper = styled(TableContainer).attrs(injectDefaultTheme)`
  margin-top: -2px;

  .table-container_header {
    position: absolute;
  }

  .header-container-text {
    font-size: 12px;
  }

  .checkboxWrapper {
    padding: 0;
    padding-inline-start: 8px;
  }

  .table-list-item {
    cursor: pointer;

    padding-inline-start: 20px;

    &:hover {
      background-color: ${(props) =>
        props.theme.filesSection.tableView.row.backgroundActive};

      .table-container_cell {
        margin-top: -1px;
        border-top: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

        margin-inline-start: -24px;
        padding-inline-start: 24px;
      }

      .checkboxWrapper {
        padding-inline-start: 32px;
      }

      .table-container_row-context-menu-wrapper {
        margin-inline-end: -20px;
        padding-inline-end: 20px;
      }
    }
  }

  .table-list-item:has(.selected-table-row) {
    background-color: ${(props) =>
      props.theme.filesSection.tableView.row.backgroundActive};
  }
`;

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

export default inject(({ setup, webhooksStore, settingsStore, userStore }) => {
  const { viewAs, setViewAs } = setup;
  const {
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    historyFilters,
  } = webhooksStore;
  const { id: userId } = userStore.user;
  const { currentDeviceType } = settingsStore;

  return {
    viewAs,
    setViewAs,
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    historyFilters,
    userId,
    currentDeviceType,
  };
})(observer(HistoryTableView));
