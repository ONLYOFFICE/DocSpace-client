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
import { useTranslation } from "react-i18next";

import {
  TableContainer,
  TableBody,
  TableHeader,
} from "@docspace/ui-kit/components/table";
import type { TTableColumn } from "@docspace/ui-kit/components/table";
import { SortByFieldName } from "@docspace/shared/enums";
import { useIsServer } from "@docspace/shared/hooks/useIsServer";
import type { Nullable, TSortBy } from "@docspace/shared/types";
import type { IndexRange } from "react-virtualized";

import type {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";

import { RoomsTableViewRow } from "./RoomsTableViewRow";

import styles from "@/app/(docspace)/(files)/_components/table-view/TableView.module.scss";

const COLUMN_STORAGE_NAME = "sdkRoomsTableColumns";
const COLUMN_INFO_PANEL_STORAGE_NAME = "sdkRoomsTableInfoPanelColumns";

type RoomsTableViewProps = {
  total: number;
  items: (TFolderItem | TFileItem)[];
  hasMoreFiles: boolean;
  filterSortBy: Nullable<TSortBy>;
  filterSortOrder: string;
  onSort: (sortBy: string, sortDirection: string) => void;
  timezone: string;
  fetchMoreFiles: (params: IndexRange) => Promise<void>;
  onEditRoom?: (item: TFolderItem | TFileItem) => void;
  onChangeOwner?: (item: TFolderItem | TFileItem) => void;
  onTagClick?: (tag: string) => void;
  onRoomChanged?: (id: number) => void;
  onRestoreRoom?: (item: TFolderItem | TFileItem) => void;
  onDeleteRoom?: (item: TFolderItem | TFileItem) => void;
  onDeleteSelected?: (items: (TFolderItem | TFileItem)[]) => void;
  onRestoreSelected?: (items: (TFolderItem | TFileItem)[]) => void;
  onArchiveRoom?: (item: TFolderItem | TFileItem) => void;
  onArchiveSelected?: (items: (TFolderItem | TFileItem)[]) => void;
  onInfoRoom?: (item: TFolderItem | TFileItem) => void;
  onInviteRoom?: (item: TFolderItem | TFileItem) => void;
  isArchive?: boolean;
};

const RoomsTableView = ({
  total,
  items,
  hasMoreFiles,
  filterSortBy,
  filterSortOrder,
  onSort,
  timezone,
  fetchMoreFiles,
  onEditRoom,
  onChangeOwner,
  onTagClick,
  onRoomChanged,
  onRestoreRoom,
  onDeleteRoom,
  onDeleteSelected,
  onRestoreSelected,
  onArchiveRoom,
  onArchiveSelected,
  onInfoRoom,
  onInviteRoom,
  isArchive,
}: RoomsTableViewProps) => {
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

  const [columnState, setColumnState] = React.useState<Record<string, boolean>>(
    () => {
      try {
        const stored = localStorage.getItem(`${COLUMN_STORAGE_NAME}_enabled`);
        if (stored) return JSON.parse(stored);
      } catch {}
      return { Tags: true, Owner: true, Activity: true };
    },
  );

  const onColumnChange = React.useCallback((key: string) => {
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
  }, []);

  const lastColumn = React.useMemo(() => {
    const orderedKeys = ["Activity", "Owner", "Tags", "Name"];
    return (
      orderedKeys.find((key) => key === "Name" || columnState[key] !== false) ??
      "Name"
    );
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
        key: "Tags",
        title: t("Common:Tags"),
        sortBy: SortByFieldName.Tags,
        enable: columnState.Tags !== false,
        resizable: true,
        onClick: onColumnSort,
        onChange: onColumnChange,
      },
      {
        key: "Owner",
        title: t("Common:Owner"),
        sortBy: SortByFieldName.Author,
        enable: columnState.Owner !== false,
        resizable: true,
        onClick: onColumnSort,
        onChange: onColumnChange,
      },
      {
        key: "Activity",
        title: t("Common:LastActivityDate"),
        sortBy: SortByFieldName.ModifiedDate,
        enable: columnState.Activity !== false,
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
          <RoomsTableViewRow
            key={`${item.id}`}
            index={index}
            item={item}
            timezone={timezone}
            lastColumn={lastColumn}
            onEditRoom={onEditRoom}
            onChangeOwner={onChangeOwner}
            onTagClick={onTagClick}
            onRoomChanged={onRoomChanged}
            onRestoreRoom={onRestoreRoom}
            onDeleteRoom={onDeleteRoom}
            onDeleteSelected={onDeleteSelected}
            onRestoreSelected={onRestoreSelected}
            onArchiveRoom={onArchiveRoom}
            onArchiveSelected={onArchiveSelected}
            onInfoRoom={onInfoRoom}
            onInviteRoom={onInviteRoom}
            isArchive={isArchive}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default observer(RoomsTableView);

