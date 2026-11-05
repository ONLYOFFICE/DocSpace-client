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
import classNames from "classnames";

import { DataTableRow } from "@onlyoffice/apps-ui-kit/components/data-table";
import { DragAndDrop } from "@onlyoffice/apps-ui-kit/components/drag-and-drop";
import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import { EncryptedItemIconWrapper } from "@docspace/shared/components/encrypted-item-icon";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { getDaysRemaining } from "@docspace/shared/utils/common";
import { FolderType } from "@docspace/shared/enums";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import Badges from "@docspace/shared/components/badges";
import EditorsTooltip from "../../editors-tooltip";

import { SDK_TABLE_TEST_IDS } from "@/app/(docspace)/_components/data-table/constants";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import useFavoritesActions from "@/app/(docspace)/_hooks/useFavoritesActions";
import useContextMenuModel from "../../../../_hooks/useContextMenuModel";
import { ShareContext } from "../../../../_contexts/ShareContext";
import { CopyShareLinkContext } from "../../../../_contexts/CopyShareLinkContext";
import { InfoContext } from "../../../../_contexts/InfoContext";
import { DeleteContext } from "../../../../_contexts/DeleteContext";
import { FileOperationsContext } from "../../../../_contexts/FileOperationsContext";
import { RenameContext } from "../../../../_contexts/RenameContext";
import { VersionHistoryContext } from "../../../../_contexts/VersionHistoryContext";
import { ConvertContext } from "../../../../_contexts/ConvertContext";
import { AskAIContext } from "../../../../_contexts/AskAIContext";
import type { TFileItem, TFolderItem } from "../../../../_hooks/useItemList";
import { useDecryptedFilename } from "@/app/(docspace)/_hooks/useDecryptedFilename";
import { generateFilesItemValue } from "../../../_utils";
import getTitleWithoutExt from "../../../../_utils/get-title-without-ext";
import { DragContext } from "../../../../_contexts/DragContext";

import type { TableViewRowProps } from "../TableView.types";
import styles from "../TableView.module.scss";
import AuthorCell from "./AuthorCell";
import LocationCell from "./LocationCell";
import AccessCell from "./AccessCell";
import { ROW_CHECKBOX_CLASS } from "./FilesCells";
import { FilesRowContext, type TFilesRowValue } from "./FilesRowContext";
import type { WithRuntimeFields } from "../columns";

/**
 * A files row on the DataTable: the drag-and-drop wrapper the selection area,
 * the hotkeys and drag and drop find by its `files-item` class and `value`,
 * around the ui-kit row whose cells read this row's context.
 */
const TableViewRow = observer(
  ({
    item,
    index,
    rowProps,
    timezone,
    displayFileExtension,
    currentUserId,
    hasEncryptionKeys,
  }: TableViewRowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();
    const { filesSettings } = useFilesSettingsStore();
    const isExtsCustomFilter =
      "fileExst" in item
        ? (filesSettings?.extsWebCustomFilterEditing ?? []).includes(
            item.fileExst,
          )
        : false;

    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const { t, i18n } = useTranslation(["Common"]);
    const { isBase } = useTheme();
    const { openFile, lockFile } = useFilesActions({ t });
    const { openFolder } = useFolderActions({ t });
    const { markAsFavorite, removeFromFavorites } = useFavoritesActions({ t });
    const onShareClick = React.useContext(ShareContext);
    const onCopyShareLink = React.useContext(CopyShareLinkContext);
    const onInfoClick = React.useContext(InfoContext);
    const deleteCtx = React.useContext(DeleteContext);
    const fileOpsCtx = React.useContext(FileOperationsContext);
    const renameCtx = React.useContext(RenameContext);
    const onShowVersionHistory = React.useContext(VersionHistoryContext);
    const onConvert = React.useContext(ConvertContext);
    const onAskAI = React.useContext(AskAIContext);

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
      onShowVersionHistoryClick: onShowVersionHistory ?? undefined,
      onAskAI: onAskAI ?? undefined,
    });

    const dragCtx = React.useContext(DragContext);
    const isDragging = !!dragCtx?.isDragging;
    // An OS drag moves no pointer, so `:hover` does not mark the folder under
    // it; the drag-over events do.
    const [isDragOver, setIsDragOver] = React.useState(false);

    const isChecked = filesSelectionStore.isCheckedItem(item);
    const isDroppable =
      item.isFolder &&
      "security" in item &&
      (item as TFolderItem).security?.MoveTo === true;
    const value = generateFilesItemValue(item, isDroppable, index);

    const title = useDecryptedFilename(
      item.id,
      item.title,
      "encrypted" in item ? item.encrypted : false,
    );

    const titleWithoutExt =
      "fileExst" in item ? getTitleWithoutExt(title, item.fileExst) : title;

    const modifiedDate = getCorrectDate(
      i18n.language || "",
      item.updated,
      "L",
      "LT",
      timezone ?? "UTC",
    );

    const createdDate = getCorrectDate(
      i18n.language || "",
      item.created,
      "L",
      "LT",
      timezone ?? "UTC",
    );

    const fileOwner =
      item.createdBy &&
      ((currentUserId && currentUserId === item.createdBy.id
        ? t("Common:MeLabel")
        : item.createdBy.displayName) ??
        "");

    const fileSize = "contentLength" in item ? item.contentLength : "";
    const fileType =
      "fileType" in item
        ? getFileTypeName(item.fileType, t)
        : t("Common:Folder");

    // `lastOpened` (Recent) and `autoDelete` (Trash) are runtime-only fields —
    // not declared on TFile/TFolder.
    const runtimeItem = item as typeof item & WithRuntimeFields;
    const lastOpenedDate = runtimeItem.lastOpened
      ? getCorrectDate(
          i18n.language || "",
          runtimeItem.lastOpened,
          "L",
          "LT",
          timezone ?? "UTC",
        )
      : "";

    // Erasure: days left until auto-deletion, derived from `autoDelete` the
    // same way the client does (getDaysRemaining returns e.g. "5" or "<1").
    const erasureLabel = runtimeItem.autoDelete
      ? t("Common:DaysRemaining", {
          daysRemaining: getDaysRemaining(
            runtimeItem.autoDelete as unknown as Date,
          ),
        })
      : "";

    const onSelect = () => filesSelectionStore.addSelection(item);

    const onRowClick = (e: React.MouseEvent) => {
      // The checkbox selects the row on its own, as the old one did.
      if ((e.target as Element).closest(`.${ROW_CHECKBOX_CLASS}`)) return;
      if (filesSelectionStore.isCheckedItem(item)) return;
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

    const onClickLock = () => {
      if (!observableItem.isFolder) lockFile(observableItem as TFileItem);
    };

    const handleCopyShareLink = () => onCopyShareLink?.(observableItem);

    // Spread observable item to create a new object reference when MobX
    // properties change, so that QuickButtons memo(fast-deep-equal) detects
    // the update (same proxy ref would short-circuit to true).
    const itemSnapshot = { ...observableItem };

    const editorsTooltip = (
      <EditorsTooltip item={observableItem} currentUserId={currentUserId} />
    );

    const badges = (
      <div className={styles.badgesContainer}>
        <Badges
          t={t}
          themeIsBase={isBase}
          item={observableItem}
          viewAs="table"
          showNew={false}
          isExtsCustomFilter={isExtsCustomFilter}
          editorsTooltip={editorsTooltip}
          onFilesClick={() => {
            if (!observableItem.isFolder) openFile(observableItem);
          }}
          onClickFavorite={onClickFavorite}
          onClickLock={onClickLock}
          setConvertDialogVisible={
            !observableItem.isFolder && onConvert
              ? () => onConvert(observableItem as TFileItem)
              : undefined
          }
          onShowVersionHistory={
            !observableItem.isFolder && onShowVersionHistory
              ? () => onShowVersionHistory(observableItem as TFileItem)
              : undefined
          }
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
          onClickLock={onClickLock}
          onClickShare={onCopyShareLink ? handleCopyShareLink : undefined}
          openShareTab={onCopyShareLink ? handleCopyShareLink : undefined}
          isTrashFolder={filesListStore.rootFolderType === FolderType.TRASH}
        />
      </div>
    );

    const icon = (
      <EncryptedItemIconWrapper
        encrypted={!!("encrypted" in item && (item as TFileItem).encrypted)}
        hasEncryptionKeys={hasEncryptionKeys ?? true}
        isRoom={false}
      >
        <RoomIcon
          logo={"isRoom" in item && item.isRoom ? item.roomLogo : item.icon}
          color={
            "isRoom" in item && item.isRoom ? item.roomIconColor : undefined
          }
          title={title}
          showDefault={
            "isRoom" in item && item.isRoom ? !item.hasRoomImage : false
          }
        />
      </EncryptedItemIconWrapper>
    );

    const renderCell = (key: string): React.ReactNode => {
      switch (key) {
        case "Author":
          return item.createdBy ? (
            <AuthorCell
              fileOwner={fileOwner || ""}
              createdBy={item.createdBy}
            />
          ) : null;
        case "SharedBy":
          return item.sharedBy ? (
            <AuthorCell
              fileOwner={item.sharedBy.displayName ?? ""}
              createdBy={item.sharedBy}
            />
          ) : null;
        case "AccessLevel":
          return <AccessCell t={t} item={item} />;
        case "Location":
          return <LocationCell item={item} />;
        case "Created":
          return (
            <span className={styles.secondaryCell} suppressHydrationWarning>
              {createdDate}
            </span>
          );
        case "Modified":
          return (
            <span className={styles.secondaryCell} suppressHydrationWarning>
              {modifiedDate}
            </span>
          );
        case "LastOpened":
          return (
            <span className={styles.secondaryCell} suppressHydrationWarning>
              {lastOpenedDate}
            </span>
          );
        case "Erasure":
          return (
            <span className={styles.secondaryCell} title={erasureLabel}>
              {erasureLabel}
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
      icon,
      checked: isChecked,
      selectLabel: t("Common:TitleSelectFile"),
      onSelect,
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

    const onDragOver = (
      isDragActive: boolean,
      _e: React.DragEvent<HTMLElement>,
    ) => {
      if (!dragCtx) return;
      const over = isDragActive && isDroppable;
      setIsDragOver(over);
      if (over) dragCtx.onFolderDragOver(item.title);
      else dragCtx.onFolderDragLeave();
    };

    const onDragLeave = () => {
      if (!dragCtx) return;
      setIsDragOver(false);
      dragCtx.onFolderDragLeave();
    };

    const onDrop = (files: File[]) => {
      if (!dragCtx) return;
      setIsDragOver(false);
      if (isDroppable) dragCtx.onFilesDroppedToFolder(files, item.id as number);
      else dragCtx.onFilesDroppedToCurrentFolder(files);
    };

    // DragAndDrop types its handler without the event, but passes it on.
    const onMouseDown = (e: React.MouseEvent) =>
      dragCtx?.onItemMouseDown(e.nativeEvent, item);

    return (
      <DragAndDrop
        data-title={item.title}
        className={classNames(styles.dragAndDropWrapper, "files-item", {
          droppable: isDroppable,
        })}
        value={value}
        onDrop={dragCtx ? onDrop : undefined}
        onDragOver={dragCtx ? onDragOver : undefined}
        onDragLeave={dragCtx ? onDragLeave : undefined}
        onMouseDown={onMouseDown as unknown as () => void}
      >
        <FilesRowContext value={rowValue}>
          <DataTableRow
            {...rowProps}
            row={item}
            index={index}
            testId={SDK_TABLE_TEST_IDS.row}
            checked={isChecked}
            // A drag owns the pointer: the folders it can go into take it.
            hover={!isDragging}
            dropTarget={isDragging && isDroppable}
            dropOver={isDragOver}
            highlight={filesListStore.highlightFileId === item.id}
            cellProps={{ className: "files-item", value }}
            contextMenu={contextMenu}
            onClick={onRowClick}
            onDoubleClick={open}
          />
        </FilesRowContext>
      </DragAndDrop>
    );
  },
);

export { TableViewRow };
