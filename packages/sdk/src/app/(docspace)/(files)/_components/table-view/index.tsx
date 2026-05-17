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
  TableContainer,
  TableBody,
  TableHeader,
} from "@docspace/ui-kit/components/table";
import type { TTableColumn } from "@docspace/ui-kit/components/table";
import { SortByFieldName } from "@docspace/shared/enums";
import { useIsServer } from "@docspace/shared/hooks/useIsServer";

import type { TableViewProps } from "./TableView.types";
import { TableViewRow } from "./sub-components/TableViewRow";

import styles from "./TableView.module.scss";

const COLUMN_STORAGE_NAME = "sdkDocsTableColumns";
const COLUMN_INFO_PANEL_STORAGE_NAME = "sdkDocsTableInfoPanelColumns";

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

  const [columnState, setColumnState] = React.useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`${COLUMN_STORAGE_NAME}_enabled`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { Modified: true, Size: true, Type: true };
  });

  const onColumnChange = React.useCallback(
    (key: string) => {
      setColumnState((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        try {
          localStorage.setItem(
            `${COLUMN_STORAGE_NAME}_enabled`,
            JSON.stringify(next),
          );
        } catch {}
        return next;
      });
    },
    [],
  );

  const lastColumn = React.useMemo(() => {
    const orderedKeys = ["Type", "Size", "Modified", "Name"];
    return orderedKeys.find((key) => key === "Name" || columnState[key] !== false) ?? "Name";
  }, [columnState]);

  const columns: TTableColumn[] = React.useMemo(
    () => [
      {
        key: "Name",
        title: t("Common:Label"),
        sortBy: SortByFieldName.Name,
        enable: true,
        resizable: true,
        default: true,
        minWidth: 210,
        onClick: onColumnSort,
      },
      {
        key: "Modified",
        title: t("Common:LastModifiedDate"),
        sortBy: SortByFieldName.ModifiedDate,
        enable: columnState.Modified !== false,
        resizable: true,
        onClick: onColumnSort,
        onChange: onColumnChange,
      },
      {
        key: "Size",
        title: t("Common:Size"),
        sortBy: SortByFieldName.Size,
        enable: columnState.Size !== false,
        resizable: true,
        onClick: onColumnSort,
        onChange: onColumnChange,
      },
      {
        key: "Type",
        title: t("Common:Type"),
        sortBy: SortByFieldName.Type,
        enable: columnState.Type !== false,
        resizable: true,
        onClick: onColumnSort,
        onChange: onColumnChange,
      },
    ],
    [t, onColumnSort, onColumnChange, columnState],
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
        settingsTitle={t("Files:TableSettingsTitle")}
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
      >
        {items.map((item, index) => (
          <TableViewRow
            key={`${item.id}`}
            index={index}
            item={item}
            timezone={timezone}
            displayFileExtension={displayFileExtension}
            lastColumn={lastColumn}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default observer(TableView);
