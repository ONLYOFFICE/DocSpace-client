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

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Events } from "@docspace/shared/enums";
import useViewEffect from "@onlyoffice/apps-ui-kit/hooks/useViewEffect";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableApi,
  type DataTableRenderRowProps,
  type DataTableSort,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import type { TTheme } from "@onlyoffice/apps-ui-kit/providers/theme/themes";

import {
  getPersistedString,
  setPersistedString,
} from "SRC_DIR/store/utils/persistence";

import {
  FILES_COLUMN_FLAG,
  filesColumnsRecord,
  getFilesColumns,
} from "./columns/filesColumns";
import type {
  TFilesColumnFlags,
  TFilesColumnsOptions,
  TFilesTableItem,
} from "./DataTableView.types";
import { FilesDataTableRow } from "./row/FilesDataTableRow";
import { FILES_DATA_TABLE_LIST_CLASS } from "./listClass";
import styles from "./DataTableView.module.scss";

const VIRTUALIZE = { innerClassName: FILES_DATA_TABLE_LIST_CLASS };

type InjectedProps = {
  rows: TFilesTableItem[];
  viewAs: string;
  setViewAs: (viewAs: string) => void;
  hasMoreFiles: boolean;
  fetchMoreFiles: () => Promise<unknown>;
  filter: TStore["filesStore"]["filter"];
  currentDeviceType: TStore["settingsStore"]["currentDeviceType"];
  theme: TTheme;
  sideColor: string;
  isPublicRoom: boolean;
  isPersonalReadOnly: boolean;
  showSettings: boolean;
  authorColumnIsEnabled: boolean;
  createdColumnIsEnabled: boolean;
  modifiedColumnIsEnabled: boolean;
  erasureColumnIsEnabled: boolean;
  sizeColumnIsEnabled: boolean;
  typeColumnIsEnabled: boolean;
  tableStorageName: string;
  columnWidthsStorageName: string;
  getColumns: TStore["tableStore"]["getColumns"];
  setColumnEnable: TStore["tableStore"]["setColumnEnable"];
  highlightFile: TStore["filesStore"]["highlightFile"];
  scrollToItem: TStore["filesStore"]["scrollToItem"];
  setScrollToItem: TStore["filesStore"]["setScrollToItem"];
  setFirsElemChecked: (checked: boolean) => void;
  setHeaderBorder: (border: boolean) => void;
  selectedFolderTitle: string;
  canCreateSecurity?: boolean;
  disableDrag: boolean;
  setDropTargetPreview: (title: string | null) => void;
  withContentSelection: boolean;
};

const getRowKey = (item: TFilesTableItem) =>
  `${item.isFolder ? "folder" : "file"}_${item.id}`;

/**
 * The documents list on the ui-kit DataTable, behind `isFilesDataTableEnabled`.
 * Visible columns stay in `tableStore`, under the key the old table uses;
 * widths go to the DataTable's own record, one per section.
 */
const DataTableView = ({
  rows,
  viewAs,
  setViewAs,
  hasMoreFiles,
  fetchMoreFiles,
  filter,
  currentDeviceType,
  theme,
  sideColor,
  isPublicRoom,
  isPersonalReadOnly,
  showSettings,
  authorColumnIsEnabled,
  createdColumnIsEnabled,
  modifiedColumnIsEnabled,
  erasureColumnIsEnabled,
  sizeColumnIsEnabled,
  typeColumnIsEnabled,
  tableStorageName,
  columnWidthsStorageName,
  getColumns,
  setColumnEnable,
  highlightFile,
  scrollToItem,
  setScrollToItem,
  setFirsElemChecked,
  setHeaderBorder,
  selectedFolderTitle,
  canCreateSecurity,
  disableDrag,
  setDropTargetPreview,
  withContentSelection,
}: InjectedProps) => {
  const { t } = useTranslation(["Files", "Common"]);

  useViewEffect({ view: viewAs, setView: setViewAs, currentDeviceType });

  const flags: TFilesColumnFlags = useMemo(
    () => ({
      author: authorColumnIsEnabled,
      created: createdColumnIsEnabled,
      modified: modifiedColumnIsEnabled,
      erasure: erasureColumnIsEnabled,
      size: sizeColumnIsEnabled,
      type: typeColumnIsEnabled,
    }),
    [
      authorColumnIsEnabled,
      createdColumnIsEnabled,
      modifiedColumnIsEnabled,
      erasureColumnIsEnabled,
      sizeColumnIsEnabled,
      typeColumnIsEnabled,
    ],
  );

  const options: TFilesColumnsOptions = useMemo(
    () => ({
      t,
      sideColor,
      flags,
      isPublicRoom,
      isPersonalReadOnly,
      showSettings,
    }),
    [t, sideColor, flags, isPublicRoom, isPersonalReadOnly, showSettings],
  );

  // What the old header does on mount: read the stored visible columns into
  // tableStore, and store the defaults when there is nothing yet. Before paint,
  // so the first frame already has the right columns.
  useLayoutEffect(() => {
    getColumns([]);

    if (!getPersistedString(tableStorageName))
      setPersistedString(tableStorageName, filesColumnsRecord(flags, options));
    // Only when the section changes, as in the old header.
  }, [tableStorageName]);

  const columns = useMemo(() => getFilesColumns(options), [options]);

  const widthStorage = useMemo(
    () => createLocalStorageWidths(columnWidthsStorageName),
    [columnWidthsStorageName],
  );

  const sortBy = filter.sortBy ?? "";
  const sortDesc = filter.sortOrder === "descending";

  const sort: DataTableSort = useMemo(
    () => ({ key: sortBy, desc: sortDesc }),
    [sortBy, sortDesc],
  );

  // The old header's onFilter: a new sort key, or the other order of this one.
  const onSortChange = useCallback(
    (nextSortBy: string) => {
      const newFilter = filter.clone();

      if (newFilter.sortBy !== nextSortBy) {
        newFilter.sortBy = nextSortBy as typeof newFilter.sortBy;
      } else {
        newFilter.sortOrder =
          newFilter.sortOrder === "ascending" ? "descending" : "ascending";
      }

      window.DocSpace.navigate(
        `${window.DocSpace.location.pathname}?${newFilter.toUrlParams()}`,
      );
    },
    [filter],
  );

  const onColumnVisibilityChange = useCallback(
    (id: string, visible: boolean) => {
      const flag = FILES_COLUMN_FLAG[id];
      if (!flag || flags[flag] === visible) return;

      setColumnEnable(id);

      setPersistedString(
        tableStorageName,
        filesColumnsRecord({ ...flags, [flag]: visible }, options),
      );

      window.dispatchEvent(new Event(Events.CHANGE_COLUMN));
    },
    [flags, options, setColumnEnable, tableStorageName],
  );

  const loadMore = useMemo(
    () => ({ hasMore: hasMoreFiles, onLoadMore: fetchMoreFiles }),
    [hasMoreFiles, fetchMoreFiles],
  );

  const highlightId = highlightFile.id;
  const highlightIsExst = highlightFile.isExst;

  // The old table's row with the client's HOCs around the ui-kit row.
  const renderRow = useCallback(
    ({ row, index, rowProps }: DataTableRenderRowProps<TFilesTableItem>) => (
      <FilesDataTableRow
        item={row}
        index={index}
        itemIndex={index}
        rowProps={rowProps}
        theme={theme}
        isHighlight={
          // Loose on purpose: ids arrive as strings or numbers, as in the old table.
          highlightId == row.id ? highlightIsExst === !row.fileExst : null
        }
        selectedFolderTitle={selectedFolderTitle}
        canCreateSecurity={canCreateSecurity}
        disableDrag={disableDrag}
        setDropTargetPreview={setDropTargetPreview}
        setFirsElemChecked={setFirsElemChecked}
        setHeaderBorder={setHeaderBorder}
      />
    ),
    [
      theme,
      highlightId,
      highlightIsExst,
      selectedFolderTitle,
      canCreateSecurity,
      disableDrag,
      setDropTargetPreview,
      setFirsElemChecked,
      setHeaderBorder,
    ],
  );

  // A created or moved item is scrolled into view by its index; the old table
  // multiplied the index by 40 while its rows were 48 high.
  const apiRef = useRef<DataTableApi>(null);

  useEffect(() => {
    if (!scrollToItem) return;

    const index = rows.findIndex(
      (row) =>
        row.id === scrollToItem.id &&
        (!scrollToItem.type ||
          (scrollToItem.type === "folder") === !!row.isFolder),
    );
    if (index === -1) return;

    apiRef.current?.scrollToIndex(index, { align: "auto" });
    setScrollToItem(null);
  }, [scrollToItem, rows, setScrollToItem]);

  return (
    <DataTable<TFilesTableItem>
      id="table-container"
      headerId="table-container_caption-header"
      testId="files-data-table"
      ariaLabel={t("Common:Documents")}
      columns={columns}
      rows={rows}
      getRowKey={getRowKey}
      sort={sort}
      onSortChange={onSortChange}
      onColumnVisibilityChange={onColumnVisibilityChange}
      widthStorage={widthStorage}
      renderRow={renderRow}
      virtualize={VIRTUALIZE}
      loadMore={loadMore}
      apiRef={apiRef}
      className={withContentSelection ? undefined : styles.noSelect}
    />
  );
};

export default inject<TStore>(
  ({
    filesStore,
    settingsStore,
    publicRoomStore,
    treeFoldersStore,
    tableStore,
    selectedFolderStore,
    uploadDataStore,
    hotkeyStore,
  }) => {
    const {
      filter,
      filesList,
      viewAs,
      setViewAs,
      hasMoreFiles,
      fetchMoreFiles,
      highlightFile,
      scrollToItem,
      setScrollToItem,
      setFirsElemChecked,
      setHeaderBorder,
      disableDrag,
    } = filesStore;
    const { theme, currentDeviceType, isFrame, frameConfig } = settingsStore;

    return {
      rows: filesList as TFilesTableItem[],
      viewAs,
      setViewAs,
      hasMoreFiles,
      fetchMoreFiles,
      filter,
      currentDeviceType,
      theme,
      sideColor: theme.filesSection.tableView.row.sideColor,
      isPublicRoom: publicRoomStore.isPublicRoom,
      isPersonalReadOnly: !!treeFoldersStore.isPersonalReadOnly,
      showSettings: isFrame ? !!frameConfig?.showSettings : true,
      authorColumnIsEnabled: tableStore.authorColumnIsEnabled,
      createdColumnIsEnabled: tableStore.createdColumnIsEnabled,
      modifiedColumnIsEnabled: tableStore.modifiedColumnIsEnabled,
      erasureColumnIsEnabled: tableStore.erasureColumnIsEnabled,
      sizeColumnIsEnabled: tableStore.sizeColumnIsEnabled,
      typeColumnIsEnabled: tableStore.typeColumnIsEnabled,
      tableStorageName: tableStore.tableStorageName,
      columnWidthsStorageName: tableStore.columnWidthsStorageName,
      getColumns: tableStore.getColumns,
      setColumnEnable: tableStore.setColumnEnable,
      highlightFile,
      scrollToItem,
      setScrollToItem,
      setFirsElemChecked,
      setHeaderBorder,
      selectedFolderTitle: selectedFolderStore.title,
      canCreateSecurity: selectedFolderStore.security?.Create,
      disableDrag,
      setDropTargetPreview:
        uploadDataStore.primaryProgressDataStore.setDropTargetPreview,
      withContentSelection: hotkeyStore.withContentSelection,
    };
  },
)(observer(DataTableView));
