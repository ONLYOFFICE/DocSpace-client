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
  createLocalStorageWidths,
  settingsColumn,
  type DataTableColumn,
  type DataTableRenderRowProps,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { SortByFieldName } from "@docspace/shared/enums";
import type { Nullable, TSortBy } from "@docspace/shared/types";

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
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";
import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";

import {
  RoomsTableViewRow,
  type RoomsTableViewRowProps,
} from "./RoomsTableViewRow";

type TRoomItem = TFolderItem | TFileItem;

const COLUMN_STORAGE_NAME = "sdkRoomsTableColumns";
const COLUMN_WIDTHS_PREFIX = "sdkRoomsTable";
const DEFAULT_VISIBILITY = { Tags: true, Owner: true, Activity: true };

type RoomsTableViewProps = Omit<
  RoomsTableViewRowProps,
  "item" | "index" | "rowProps"
> & {
  items: TRoomItem[];
  hasMoreFiles: boolean;
  filterSortBy: Nullable<TSortBy>;
  filterSortOrder: string;
  onSort: (sortBy: string, sortDirection: string) => void;
  fetchMoreFiles: () => Promise<void>;
};

const getRowKey = (item: TRoomItem) => item.id;

const cellTestId = () => SDK_TABLE_TEST_IDS.cell;

/**
 * The SDK's rooms list on the ui-kit DataTable. Visible columns stay in the
 * record the old header kept; widths go to the DataTable's own record.
 */
const RoomsTableView = ({
  items,
  hasMoreFiles,
  filterSortBy,
  filterSortOrder,
  onSort,
  fetchMoreFiles,
  timezone,
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
  hasEncryptionKeys,
}: RoomsTableViewProps) => {
  const { t } = useTranslation(["Common", "Files"]);
  const { user } = useDocsUserStore();

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
    ): DataTableColumn<TRoomItem> => ({
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
      column("Tags", t("Common:Tags"), SortByFieldName.Tags),
      column("Owner", t("Common:Owner"), SortByFieldName.Author),
      column(
        "Activity",
        t("Common:LastActivityDate"),
        SortByFieldName.ModifiedDate,
      ),
      settingsColumn<TRoomItem>({
        title: t("Common:TableSettingsTitle"),
        withContextMenu: true,
        contextMenuButtonTestId: SDK_TABLE_TEST_IDS.contextMenuButton,
      }),
    ] satisfies DataTableColumn<TRoomItem>[];
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
    ({ row, index, rowProps }: DataTableRenderRowProps<TRoomItem>) => (
      <RoomsTableViewRow
        item={row}
        index={index}
        rowProps={rowProps}
        timezone={timezone}
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
        hasEncryptionKeys={hasEncryptionKeys}
      />
    ),
    [
      timezone,
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
      hasEncryptionKeys,
    ],
  );

  return (
    <SdkDataTable<TRoomItem>
      ariaLabel={t("Common:Rooms")}
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

export default observer(RoomsTableView);
