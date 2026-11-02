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

import { useCallback, useLayoutEffect, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Events } from "@docspace/shared/enums";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";
import useViewEffect from "@onlyoffice/apps-ui-kit/hooks/useViewEffect";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableSort,
} from "@onlyoffice/apps-ui-kit/components/data-table";

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

type InjectedProps = {
  rows: TFilesTableItem[];
  viewAs: string;
  setViewAs: (viewAs: string) => void;
  hasMoreFiles: boolean;
  fetchMoreFiles: () => Promise<unknown>;
  filter: TStore["filesStore"]["filter"];
  currentDeviceType: TStore["settingsStore"]["currentDeviceType"];
  sideColor: string;
  linkColor: string;
  culture: string;
  viewerId?: string;
  displayFileExtension: boolean;
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
  sideColor,
  linkColor,
  culture,
  viewerId,
  displayFileExtension,
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
}: InjectedProps) => {
  const { t } = useTranslation(["Files", "Common"]);

  useViewEffect({ view: viewAs, setView: setViewAs, currentDeviceType });

  const locale = getCookie(LANGUAGE) || culture;

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
      linkColor,
      viewerId,
      locale,
      displayFileExtension,
      flags,
      isPublicRoom,
      isPersonalReadOnly,
      showSettings,
    }),
    [
      t,
      sideColor,
      linkColor,
      viewerId,
      locale,
      displayFileExtension,
      flags,
      isPublicRoom,
      isPersonalReadOnly,
      showSettings,
    ],
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
      virtualize
      loadMore={loadMore}
    />
  );
};

export default inject<TStore>(
  ({
    filesStore,
    settingsStore,
    userStore,
    filesSettingsStore,
    publicRoomStore,
    treeFoldersStore,
    tableStore,
  }) => {
    const {
      filter,
      filesList,
      viewAs,
      setViewAs,
      hasMoreFiles,
      fetchMoreFiles,
    } = filesStore;
    const { theme, culture, currentDeviceType, isFrame, frameConfig } =
      settingsStore;

    return {
      rows: filesList as TFilesTableItem[],
      viewAs,
      setViewAs,
      hasMoreFiles,
      fetchMoreFiles,
      filter,
      currentDeviceType,
      sideColor: theme.filesSection.tableView.row.sideColor,
      linkColor: theme.filesSection.tableView.fileName.linkColor,
      culture,
      viewerId: userStore.user?.id,
      displayFileExtension: !!filesSettingsStore.displayFileExtension,
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
    };
  },
)(observer(DataTableView));
