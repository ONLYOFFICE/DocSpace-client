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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  createLocalStorageWidths,
  settingsColumn,
  type DataTableColumn,
  type DataTableRenderRowProps,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { SortByFieldName } from "@docspace/shared/enums";

import {
  SDK_DATA_TABLE_VIRTUALIZE,
  SDK_TABLE_TEST_IDS,
  SdkDataTable,
  getColumnWidthsStorageName,
  useColumnVisibility,
  useTableSort,
} from "@/app/(docspace)/_components/data-table";
import {
  ColumnCell,
  NameCell,
} from "@/app/(docspace)/(files)/_components/table-view/sub-components/FilesCells";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

import { useAgentsUserStore } from "../../../_store";
import type { TableViewProps } from "./TableView.types";
import { TableViewRow } from "./sub-components/TableViewRow";

type TItem = TFolderItem | TFileItem;

const COLUMN_STORAGE_NAME = "sdkDocsTableColumns";
const COLUMN_WIDTHS_PREFIX = "sdkDocsTable";
const DEFAULT_VISIBILITY = { Modified: true, Size: true, Type: true };

const getRowKey = (item: TItem) =>
  `${item.isFolder ? "folder" : "file"}_${item.id}`;

const cellTestId = () => SDK_TABLE_TEST_IDS.cell;

/**
 * An AI agent's files (and the Recent, Favorites and Trash aliases) on the
 * ui-kit DataTable. Visible columns stay in the record the old header kept;
 * widths go to the DataTable's own record.
 */
const TableView = ({
  items,
  hasMoreFiles,
  filterSortBy,
  filterSortOrder,
  onSort,
  timezone,
  displayFileExtension,
  fetchMoreFiles,
}: TableViewProps) => {
  const { t } = useTranslation(["Common", "Files"]);
  const { user } = useAgentsUserStore();

  const { isVisible, setVisible } = useColumnVisibility(
    `${COLUMN_STORAGE_NAME}_enabled`,
    DEFAULT_VISIBILITY,
  );

  const { sort, onSortChange } = useTableSort(
    filterSortBy,
    filterSortOrder,
    onSort,
  );

  const columns = React.useMemo(() => {
    const column = (
      id: string,
      title: string,
      sortKey: string,
    ): DataTableColumn<TItem> => ({
      id,
      title,
      sortKey,
      width: { type: "flex" },
      visible: isVisible(id),
      hideable: true,
      cellTestId,
      cell: (_, { isLast }) => <ColumnCell columnKey={id} isLast={isLast} />,
    });

    return [
      {
        id: "Name",
        title: t("Common:Label"),
        sortKey: SortByFieldName.Name,
        width: { type: "fill" },
        cellClassName: "table-container_file-name-cell",
        cellTestId,
        cell: (_, { isLast }) => <NameCell isLast={isLast} />,
      },
      column(
        "Modified",
        t("Common:LastModifiedDate"),
        SortByFieldName.ModifiedDate,
      ),
      column("Size", t("Common:Size"), SortByFieldName.Size),
      column("Type", t("Common:Type"), SortByFieldName.Type),
      settingsColumn<TItem>({
        title: t("Common:TableSettingsTitle"),
        withContextMenu: true,
        contextMenuButtonTestId: SDK_TABLE_TEST_IDS.contextMenuButton,
      }),
    ] satisfies DataTableColumn<TItem>[];
  }, [t, isVisible]);

  const widthStorage = React.useMemo(
    () =>
      createLocalStorageWidths(
        getColumnWidthsStorageName(COLUMN_WIDTHS_PREFIX, user?.id),
      ),
    [user?.id],
  );

  const loadMore = React.useMemo(
    () => ({ hasMore: hasMoreFiles, onLoadMore: fetchMoreFiles }),
    [hasMoreFiles, fetchMoreFiles],
  );

  const renderRow = React.useCallback(
    ({ row, index, rowProps }: DataTableRenderRowProps<TItem>) => (
      <TableViewRow
        item={row}
        index={index}
        rowProps={rowProps}
        timezone={timezone}
        displayFileExtension={displayFileExtension}
      />
    ),
    [timezone, displayFileExtension],
  );

  return (
    <SdkDataTable<TItem>
      ariaLabel={t("Common:Files")}
      columns={columns}
      rows={items}
      getRowKey={getRowKey}
      sort={sort}
      onSortChange={onSortChange}
      onColumnVisibilityChange={setVisible}
      widthStorage={widthStorage}
      renderRow={renderRow}
      virtualize={SDK_DATA_TABLE_VIRTUALIZE}
      loadMore={loadMore}
    />
  );
};

export default observer(TableView);
