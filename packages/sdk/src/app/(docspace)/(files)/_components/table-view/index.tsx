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
import type { TFunction } from "i18next";

import {
  TableContainer,
  TableBody,
  TableHeader,
} from "@docspace/ui-kit/components/table";
import type { TTableColumn } from "@docspace/ui-kit/components/table";
import { useIsServer } from "@docspace/shared/hooks/useIsServer";

import type { TableViewProps } from "./TableView.types";
import { TableViewRow } from "./sub-components/TableViewRow";
import {
  getSectionColumns,
  getColumnStorageKey,
  type ColumnKey,
  type SectionColumn,
} from "./columns";

import styles from "./TableView.module.scss";

const COLUMN_STORAGE_NAME = "sdkDocsTableColumns";
const COLUMN_INFO_PANEL_STORAGE_NAME = "sdkDocsTableInfoPanelColumns";

// Resolve a column's header title. Literal `t()` calls (not a dynamic key) so
// the i18n usage scanner sees every key. All keys live in the Common namespace
// (the only namespace the SDK bundles).
const getColumnTitle = (key: ColumnKey, t: TFunction): string => {
  switch (key) {
    case "Name":
      return t("Common:Label");
    case "Author":
      return t("Common:ByAuthor");
    case "Created":
      return t("Common:ByCreation");
    case "Modified":
      return t("Common:LastModifiedDate");
    case "Size":
      return t("Common:Size");
    case "Type":
      return t("Common:Type");
    case "Location":
      return t("Common:Location");
    case "LastOpened":
      return t("Common:LastOpened");
    case "Erasure":
      return t("Common:ByErasure");
    case "AccessLevel":
      return t("Common:AccessLevel");
    case "SharedBy":
      return t("Common:SharedBy");
    default:
      return "";
  }
};

const TableView = ({
  total,
  items,
  hasMoreFiles,
  filterSortBy,
  filterSortOrder,
  onSort,
  timezone,
  displayFileExtension,
  fetchMoreFiles,
  currentUserId,
  infoPanelVisible,
  isPrivate,
  hasEncryptionKeys,
  rootFolderType,
}: TableViewProps) => {
  const { t } = useTranslation(["Common", "Files"]);
  const isSSR = useIsServer();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const onColumnSort = React.useCallback(
    (sortBy: string) => {
      if (filterSortBy === sortBy) {
        const newDirection = filterSortOrder === "ascending" ? "desc" : "asc";
        onSort(sortBy, newDirection);
      } else {
        onSort(sortBy, filterSortOrder === "ascending" ? "asc" : "desc");
      }
    },
    [filterSortBy, filterSortOrder, onSort],
  );

  // Visible columns and their order are section-specific (single source of
  // truth in columns.ts), so header and row never drift.
  const sectionColumns = React.useMemo(
    () => getSectionColumns(rootFolderType),
    [rootFolderType],
  );

  // Column-visibility (gear toggle) is persisted per section so hiding a column
  // in one section doesn't affect another.
  const storageKey = getColumnStorageKey(
    `${COLUMN_STORAGE_NAME}_enabled`,
    rootFolderType,
  );

  const [columnState, setColumnState] = React.useState<Record<string, boolean>>(
    {},
  );

  // Load the persisted visibility for the current section (and reload when the
  // section changes — TableView is reused across sections).
  React.useEffect(() => {
    let next: Record<string, boolean> = {};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) next = JSON.parse(stored);
    } catch {}
    setColumnState(next);
  }, [storageKey]);

  const onColumnChange = React.useCallback(
    (key: string) => {
      setColumnState((prev) => {
        const next = { ...prev, [key]: prev[key] === false };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [storageKey],
  );

  // Last visible column hosts the quick-action buttons — compute it from the
  // section's actual column order (reversed), honouring hidden columns.
  const lastColumn = React.useMemo(() => {
    const reversed = [...sectionColumns].reverse();
    const last = reversed.find(
      (c) => c.key === "Name" || columnState[c.key] !== false,
    );
    return last?.key ?? "Name";
  }, [sectionColumns, columnState]);

  const columns: TTableColumn[] = React.useMemo(
    () =>
      sectionColumns.map((column: SectionColumn) => {
        const isName = column.key === "Name";
        // A column is sortable iff the descriptor gives it a sortBy (client
        // model). Only then wire sortBy + onClick so the header is clickable.
        const sortProps = column.sortBy
          ? { sortBy: column.sortBy, onClick: onColumnSort }
          : {};
        return {
          key: column.key,
          title: getColumnTitle(column.key, t),
          enable: isName ? true : columnState[column.key] !== false,
          resizable: true,
          ...(isName ? { default: true, minWidth: 210 } : {}),
          ...(isName ? {} : { onChange: onColumnChange }),
          ...sortProps,
        } satisfies TTableColumn;
      }),
    [sectionColumns, t, onColumnSort, onColumnChange, columnState],
  );

  return (
    <TableContainer
      forwardedRef={containerRef}
      useReactWindow={!isSSR}
      className={styles.tableViewContainer}
    >
      <TableHeader
        containerRef={containerRef}
        columns={columns}
        columnStorageName={COLUMN_STORAGE_NAME}
        columnInfoPanelStorageName={COLUMN_INFO_PANEL_STORAGE_NAME}
        sectionWidth={0}
        useReactWindow={!isSSR}
        sortBy={filterSortBy ?? undefined}
        sorted={filterSortOrder === "descending"}
        sortingVisible
        showSettings
        settingsTitle={t("Common:TableSettingsTitle")}
        infoPanelVisible={infoPanelVisible}
      />
      <TableBody
        columnStorageName={COLUMN_STORAGE_NAME}
        columnInfoPanelStorageName={COLUMN_INFO_PANEL_STORAGE_NAME}
        fetchMoreFiles={fetchMoreFiles}
        filesLength={items.length}
        hasMoreFiles={hasMoreFiles}
        itemCount={total}
        itemHeight={48}
        useReactWindow={!isSSR}
        infoPanelVisible={infoPanelVisible}
      >
        {items.map((item, index) => (
          <TableViewRow
            key={`${item.id}`}
            index={index}
            item={item}
            timezone={timezone}
            displayFileExtension={displayFileExtension}
            lastColumn={lastColumn}
            currentUserId={currentUserId}
            isPrivate={isPrivate}
            hasEncryptionKeys={hasEncryptionKeys}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default observer(TableView);
