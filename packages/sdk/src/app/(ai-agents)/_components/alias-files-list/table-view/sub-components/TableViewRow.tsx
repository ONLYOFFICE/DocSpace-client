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

import { DataTableRow } from "@onlyoffice/apps-ui-kit/components/data-table";
import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import Badges from "@docspace/shared/components/badges";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";

import { SDK_TABLE_TEST_IDS } from "@/app/(docspace)/_components/data-table/constants";
import { ROW_CHECKBOX_CLASS } from "@/app/(docspace)/(files)/_components/table-view/sub-components/FilesCells";
import {
  FilesRowContext,
  type TFilesRowValue,
} from "@/app/(docspace)/(files)/_components/table-view/sub-components/FilesRowContext";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import useFavoritesActions from "@/app/(docspace)/_hooks/useFavoritesActions";
import useContextMenuModel from "@/app/(docspace)/_hooks/useContextMenuModel";
import useVectorizationActions from "../../../../_hooks/useVectorizationActions";
import { ShareContext } from "@/app/(docspace)/_contexts/ShareContext";
import { InfoContext } from "@/app/(docspace)/_contexts/InfoContext";
import { DeleteContext } from "@/app/(docspace)/_contexts/DeleteContext";
import { FileOperationsContext } from "@/app/(docspace)/_contexts/FileOperationsContext";
import { RenameContext } from "@/app/(docspace)/_contexts/RenameContext";
import { generateFilesItemValue } from "../../utils";
import getTitleWithoutExt from "@/app/(docspace)/_utils/get-title-without-ext";

import type { TableViewRowProps } from "../TableView.types";
import styles from "../TableView.module.scss";

/**
 * A row of an AI agent's files on the DataTable. The cells carry the
 * `files-item` class and the `value`, as the old row's menu cell did.
 */
const TableViewRow = observer(
  ({
    item,
    index,
    rowProps,
    timezone,
    displayFileExtension,
  }: TableViewRowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();

    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const { t, i18n } = useTranslation(["Common"]);
    const { isBase } = useTheme();
    const { openFile } = useFilesActions({ t });
    const { openFolder } = useFolderActions({ t });
    const { markAsFavorite, removeFromFavorites } = useFavoritesActions({ t });
    const onShareClick = React.useContext(ShareContext);
    const onInfoClick = React.useContext(InfoContext);
    const deleteCtx = React.useContext(DeleteContext);
    const fileOpsCtx = React.useContext(FileOperationsContext);
    const renameCtx = React.useContext(RenameContext);

    const { retry: retryVectorize } = useVectorizationActions();
    const onRetryVectorization = React.useCallback(
      () => void retryVectorize([observableItem]),
      [retryVectorize, observableItem],
    );

    const { getContextMenuModel } = useContextMenuModel({
      item: observableItem,
      onShareClick: onShareClick ?? undefined,
      onInfoClick: onInfoClick ?? undefined,
      onDeleteClick: deleteCtx?.deleteItem,
      onCopyClick: fileOpsCtx?.copyItem,
      onMoveClick: fileOpsCtx?.moveItem,
      onDuplicateClick: fileOpsCtx?.duplicateItem,
      onRestoreClick: fileOpsCtx?.restoreItem,
      onRenameClick: renameCtx?.renameItem,
      onRetryVectorization,
    });

    const isChecked = filesSelectionStore.isCheckedItem(item);
    const value = generateFilesItemValue(item, false, index);

    const titleWithoutExt =
      "fileExst" in item
        ? getTitleWithoutExt(item.title, item.fileExst)
        : item.title;

    const modifiedDate = getCorrectDate(
      i18n.language || "",
      item.updated,
      "L",
      "LT",
      timezone ?? "UTC",
    );

    const fileSize = "contentLength" in item ? item.contentLength : "";
    const fileType =
      "fileType" in item
        ? getFileTypeName(item.fileType, t)
        : t("Common:Folder");

    const onRowClick = (e: React.MouseEvent) => {
      // The checkbox selects the row on its own, as the old one did.
      if ((e.target as Element).closest(`.${ROW_CHECKBOX_CLASS}`)) return;
      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    };

    const open = () => {
      if (item.isFolder) openFolder(item.id, item.title);
      else openFile(item);
    };

    const onNameClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      open();
    };

    const onClickFavorite = () => {
      if (observableItem.isFavorite) removeFromFavorites(observableItem);
      else markAsFavorite(observableItem);
    };

    const handleShareClick = () => onShareClick?.(observableItem);

    // Spread observable item to create a new object reference when MobX
    // properties change, so that QuickButtons memo(fast-deep-equal) detects
    // the update (same proxy ref would short-circuit to true).
    const itemSnapshot = { ...observableItem };

    const badges = (
      <div className={styles.badgesContainer}>
        <Badges
          t={t}
          themeIsBase={isBase}
          item={observableItem}
          viewAs="table"
          showNew={false}
          onFilesClick={() => {
            if (!observableItem.isFolder) openFile(observableItem);
          }}
          onClickFavorite={onClickFavorite}
          onRetryVectorization={onRetryVectorization}
        />
      </div>
    );

    const quickButtons = (
      <div className={styles.quickButtonsContainer}>
        <QuickButtons
          t={t}
          item={itemSnapshot}
          viewAs="table"
          onClickFavorite={onClickFavorite}
          onClickShare={onShareClick ? handleShareClick : undefined}
          openShareTab={onShareClick ? handleShareClick : undefined}
          onRetryVectorization={onRetryVectorization}
        />
      </div>
    );

    const renderCell = (key: string): React.ReactNode => {
      switch (key) {
        case "Modified":
          return (
            <span className={styles.secondaryCell} suppressHydrationWarning>
              {modifiedDate}
            </span>
          );
        case "Size":
          return <span className={styles.secondaryCell}>{fileSize}</span>;
        case "Type":
          return <span className={styles.secondaryCell}>{fileType}</span>;
        default:
          return null;
      }
    };

    const rowValue: TFilesRowValue = {
      icon: (
        <RoomIcon logo={item.icon} title={item.title} showDefault={false} />
      ),
      checked: isChecked,
      selectLabel: t("Common:TitleSelectFile"),
      onSelect: () => filesSelectionStore.addSelection(item),
      onOpen: onNameClick,
      titleWithoutExt,
      fileExst: displayFileExtension && "fileExst" in item ? item.fileExst : "",
      badges,
      quickButtons,
      renderCell,
    };

    const contextMenu = {
      options: getContextMenuModel(true),
      getModel: () => getContextMenuModel(),
      onOpen: (isRightClick: boolean) => {
        if (isRightClick && filesSelectionStore.selection.length > 1) return;
        filesSelectionStore.setSelection([]);
        filesSelectionStore.setBufferSelection(item);
      },
      title: item.isFolder
        ? t("Common:TitleShowFolderActions")
        : t("Common:TitleShowActions"),
    };

    return (
      <FilesRowContext value={rowValue}>
        <DataTableRow
          {...rowProps}
          row={item}
          index={index}
          testId={SDK_TABLE_TEST_IDS.row}
          checked={isChecked}
          cellProps={{ className: "files-item", value }}
          contextMenu={contextMenu}
          onClick={onRowClick}
          onDoubleClick={open}
        />
      </FilesRowContext>
    );
  },
);

export { TableViewRow };
