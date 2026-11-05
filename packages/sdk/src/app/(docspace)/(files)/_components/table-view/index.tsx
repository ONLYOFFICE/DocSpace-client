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
  type DataTableRenderRowProps,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import {
  SDK_DATA_TABLE_VIRTUALIZE,
  SdkDataTable,
  getColumnWidthsStorageName,
  useColumnVisibility,
  useTableSort,
} from "@/app/(docspace)/_components/data-table";

import type { TableViewProps } from "./TableView.types";
import { TableViewRow } from "./sub-components/TableViewRow";
import {
  getColumnStorageKey,
  getSectionColumns,
  type TableItem,
} from "./columns";
import { getFilesColumns } from "./filesColumns";

const COLUMN_STORAGE_NAME = "sdkDocsTableColumns";
const COLUMN_WIDTHS_PREFIX = "sdkDocsTable";

const getRowKey = (item: TableItem) =>
  `${item.isFolder ? "folder" : "file"}_${item.id}`;

/**
 * The SDK's documents list on the ui-kit DataTable. Visible columns stay in
 * the per-section record the old header kept; widths go to the DataTable's
 * own record, one per section and user.
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
  currentUserId,
  hasEncryptionKeys,
  rootFolderType,
}: TableViewProps) => {
  const { t } = useTranslation(["Common", "Files"]);

  // Visible columns and their order are section-specific (single source of
  // truth in columns.ts).
  const sectionColumns = React.useMemo(
    () => getSectionColumns(rootFolderType),
    [rootFolderType],
  );

  // Column visibility is kept per section, so hiding a column in one section
  // doesn't affect another.
  const { isVisible, setVisible } = useColumnVisibility(
    getColumnStorageKey(`${COLUMN_STORAGE_NAME}_enabled`, rootFolderType),
  );

  const { sort, onSortChange } = useTableSort(
    filterSortBy,
    filterSortOrder,
    onSort,
  );

  const columns = React.useMemo(
    () => getFilesColumns(sectionColumns, t, isVisible),
    [sectionColumns, t, isVisible],
  );

  const widthStorage = React.useMemo(
    () =>
      createLocalStorageWidths(
        getColumnWidthsStorageName(
          COLUMN_WIDTHS_PREFIX,
          currentUserId,
          String(rootFolderType ?? "default"),
        ),
      ),
    [currentUserId, rootFolderType],
  );

  const loadMore = React.useMemo(
    () => ({ hasMore: hasMoreFiles, onLoadMore: fetchMoreFiles }),
    [hasMoreFiles, fetchMoreFiles],
  );

  const renderRow = React.useCallback(
    ({ row, index, rowProps }: DataTableRenderRowProps<TableItem>) => (
      <TableViewRow
        item={row}
        index={index}
        rowProps={rowProps}
        timezone={timezone}
        displayFileExtension={displayFileExtension}
        currentUserId={currentUserId}
        hasEncryptionKeys={hasEncryptionKeys}
      />
    ),
    [timezone, displayFileExtension, currentUserId, hasEncryptionKeys],
  );

  return (
    <SdkDataTable<TableItem>
      ariaLabel={t("Common:Documents")}
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
