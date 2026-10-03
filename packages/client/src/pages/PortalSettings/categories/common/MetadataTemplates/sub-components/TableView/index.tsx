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

import { useRef, useState } from "react";
import { observer } from "mobx-react";

import {
  TableBody,
  TableContainer,
} from "@onlyoffice/apps-ui-kit/components/table";

import { useStore } from "SRC_DIR/store/useStore";

import type { TTemplatesListProps } from "../../types";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import styles from "./TableView.module.scss";

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `metadataTemplatesColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelMetadataTemplatesColumnsSize_ver-${TABLE_VERSION}`;

const emptyAsyncCallback = async () => {};

const TableView = ({
  items,
  authors,
  sectionWidth,
  ...actions
}: TTemplatesListProps) => {
  const { user } = useStore("userStore");

  const tableRef = useRef<HTMLDivElement>(null);
  const [hideColumns, setHideColumns] = useState(false);

  const columnStorageName = `${COLUMNS_SIZE}=${user?.id}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${user?.id}`;

  return (
    <TableContainer
      className={styles.tableWrapper}
      forwardedRef={tableRef as React.RefObject<HTMLDivElement>}
      useReactWindow
    >
      <TableHeader
        tableRef={tableRef}
        sectionWidth={sectionWidth}
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
        itemCount={items.length}
        hasMoreFiles={false}
        fetchMoreFiles={emptyAsyncCallback}
      >
        {items.map((item) => (
          <TableRow
            key={item.id}
            item={item}
            author={authors[item.createBy] ?? ""}
            hideColumns={hideColumns}
            {...actions}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default observer(TableView);
