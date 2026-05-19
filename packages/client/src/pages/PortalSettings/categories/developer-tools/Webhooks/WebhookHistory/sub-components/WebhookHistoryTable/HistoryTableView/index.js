/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useParams } from "react-router";
import { inject, observer } from "mobx-react";
import { useState, useRef } from "react";

import { TableBody, TableContainer } from "@docspace/ui-kit/components/table";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import { formatFilters } from "SRC_DIR/helpers/webhooks";
import HistoryTableRow from "./HistoryTableRow";
import HistoryTableHeader from "./HistoryTableHeader";

import styles from "../../../WebhookHistory.styled.module.scss";

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
    <TableContainer
      className={styles.historyTableWrapper}
      forwardedRef={tableRef}
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
    </TableContainer>
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
