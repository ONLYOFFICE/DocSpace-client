// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { observer } from "mobx-react";

import {
  TableContainer,
  TableBody,
  TableHeader,
} from "@docspace/ui-kit/components/table";
import type { TTableColumn } from "@docspace/ui-kit/components/table";
import { useIsServer } from "@docspace/shared/hooks/useIsServer";
import type { Nullable, TSortBy } from "@docspace/shared/types";
import type { IndexRange } from "react-virtualized";

import type { TFolderItem, TFileItem } from "../../_hooks/useItemList";

import styles from "@/app/(docspace)/(files)/_components/table-view/TableView.module.scss";

export type TableColumnDef = {
  key: string;
  title: string;
  sortBy?: string;
  fixed?: boolean;
  resizable?: boolean;
  minWidth?: number;
  defaultEnabled?: boolean;
};

export type BaseTableViewProps = {
  columnDefs: TableColumnDef[];
  columnStorageName: string;
  columnInfoPanelStorageName: string;
  settingsTitle: string;
  total: number;
  items: (TFolderItem | TFileItem)[];
  hasMoreFiles: boolean;
  filterSortBy: Nullable<TSortBy>;
  filterSortOrder: string;
  onSort: (sortBy: string, sortDirection: string) => void;
  fetchMoreFiles: (params: IndexRange) => Promise<void>;
  renderRow: (
    item: TFolderItem | TFileItem,
    index: number,
    lastColumn: string,
  ) => React.ReactNode;
};

const TableView = ({
  columnDefs,
  columnStorageName,
  columnInfoPanelStorageName,
  settingsTitle,
  total,
  items,
  hasMoreFiles,
  filterSortBy,
  filterSortOrder,
  onSort,
  fetchMoreFiles,
  renderRow,
}: BaseTableViewProps) => {
  const isSSR = useIsServer();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [columnState, setColumnState] = React.useState<Record<string, boolean>>(
    () => {
      try {
        const stored = localStorage.getItem(`${columnStorageName}_enabled`);
        if (stored) return JSON.parse(stored);
      } catch {}
      return Object.fromEntries(
        columnDefs
          .filter((c) => !c.fixed)
          .map((c) => [c.key, c.defaultEnabled ?? true]),
      );
    },
  );

  const onColumnSort = React.useCallback(
    (sortBy: string) => {
      if (filterSortBy === sortBy) {
        onSort(sortBy, filterSortOrder === "ascending" ? "desc" : "asc");
      } else {
        onSort(sortBy, filterSortOrder === "ascending" ? "asc" : "desc");
      }
    },
    [filterSortBy, filterSortOrder, onSort],
  );

  const onColumnChange = React.useCallback(
    (key: string) => {
      setColumnState((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        try {
          localStorage.setItem(
            `${columnStorageName}_enabled`,
            JSON.stringify(next),
          );
        } catch {}
        return next;
      });
    },
    [columnStorageName],
  );

  const lastColumn = React.useMemo(() => {
    const reversed = [...columnDefs].reverse();
    return (
      reversed.find(
        (c) => c.fixed || columnState[c.key] !== false,
      )?.key ?? columnDefs[0].key
    );
  }, [columnDefs, columnState]);

  const columns: TTableColumn[] = React.useMemo(
    () =>
      columnDefs.map((def) => ({
        key: def.key,
        title: def.title,
        sortBy: def.sortBy,
        enable: def.fixed ? true : columnState[def.key] !== false,
        resizable: def.resizable,
        default: def.fixed,
        minWidth: def.minWidth,
        onClick: onColumnSort,
        onChange: def.fixed ? undefined : onColumnChange,
      })),
    [columnDefs, columnState, onColumnSort, onColumnChange],
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
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        sectionWidth={0}
        useReactWindow={!isSSR}
        sortBy={filterSortBy ?? undefined}
        sorted={filterSortOrder === "descending"}
        sortingVisible
        showSettings
        settingsTitle={settingsTitle}
      />
      <TableBody
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        fetchMoreFiles={fetchMoreFiles}
        filesLength={items.length}
        hasMoreFiles={hasMoreFiles}
        itemCount={total}
        itemHeight={48}
        useReactWindow={!isSSR}
      >
        {items.map((item, index) => (
          <React.Fragment key={`${item.id}`}>
            {renderRow(item, index, lastColumn)}
          </React.Fragment>
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default observer(TableView);
