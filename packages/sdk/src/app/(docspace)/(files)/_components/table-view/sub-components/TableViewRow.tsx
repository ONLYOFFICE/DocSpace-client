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

import { TableRow } from "@docspace/ui-kit/components/table";
import { TableCell } from "@docspace/ui-kit/components/table";
import { DragAndDrop } from "@docspace/ui-kit/components/drag-and-drop";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { EncryptedItemIconWrapper } from "@docspace/shared/components/encrypted-item-icon";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { getDaysRemaining } from "@docspace/shared/utils/common";
import { FolderType } from "@docspace/shared/enums";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import Badges from "@docspace/shared/components/badges";
import EditorsTooltip from "../../editors-tooltip";

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
import {
  getSectionColumns,
  type ColumnKey,
  type SectionColumn,
  type WithRuntimeFields,
} from "../columns";

const TableViewRow = observer(
  ({
    item,
    index,
    timezone,
    displayFileExtension,
    lastColumn,
    currentUserId,
    isPrivate,
    hasEncryptionKeys,
  }: TableViewRowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();
    const { filesSettings } = useFilesSettingsStore();
    const isExtsCustomFilter =
      "fileExst" in item
        ? (filesSettings?.extsWebCustomFilterEditing ?? []).includes(item.fileExst)
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
      "fileType" in item ? getFileTypeName(item.fileType, t) : t("Common:Folder");

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

    // Visible columns + order are section-specific (same source as the header).
    const sectionColumns = getSectionColumns(filesListStore.rootFolderType);

    const onCheckboxChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        filesSelectionStore.addSelection(item);
      },
      [filesSelectionStore, item],
    );

    const onRowClick = React.useCallback(() => {
      if (filesSelectionStore.isCheckedItem(item)) return;
      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    }, [filesSelectionStore, item]);

    const onRowDoubleClick = React.useCallback(() => {
      if (item.isFolder) {
        openFolder(item.id, item.title);
      } else {
        openFile(item);
      }
    }, [item, openFolder, openFile]);

    const onNameClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.isFolder) {
          openFolder(item.id, item.title);
        } else {
          openFile(item);
        }
      },
      [item, openFolder, openFile],
    );

    const onClickFavorite = React.useCallback(() => {
      if (observableItem.isFavorite) {
        removeFromFavorites(observableItem);
      } else {
        markAsFavorite(observableItem);
      }
    }, [observableItem, markAsFavorite, removeFromFavorites]);

    const onClickLock = React.useCallback(() => {
      if (!observableItem.isFolder) {
        lockFile(observableItem as TFileItem);
      }
    }, [observableItem, lockFile]);

    const handleCopyShareLink = React.useCallback(() => {
      onCopyShareLink?.(observableItem);
    }, [onCopyShareLink, observableItem]);

    // Spread observable item to create a new object reference when MobX
    // properties change, so that QuickButtons memo(fast-deep-equal) detects
    // the update (same proxy ref would short-circuit to true).
    const itemSnapshot = { ...observableItem };

    const editorsTooltip = (
      <EditorsTooltip item={observableItem} currentUserId={currentUserId} />
    );

    const badgesNode = (
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
            if (!observableItem.isFolder) {
              openFile(observableItem);
            }
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

    const isTrashFolder =
      filesListStore.rootFolderType === FolderType.TRASH;

    const quickButtonsNode = (
      <div className={styles.quickButtonsContainer}>
        <QuickButtons
          t={t}
          item={itemSnapshot}
          viewAs="table"
          onClickFavorite={onClickFavorite}
          onClickLock={onClickLock}
          onClickShare={onCopyShareLink ? handleCopyShareLink : undefined}
          openShareTab={onCopyShareLink ? handleCopyShareLink : undefined}
          isTrashFolder={isTrashFolder}
        />
      </div>
    );

    const contextMenuModel = getContextMenuModel(true);

    // Inner content for a non-Name cell, keyed by column. The section descriptor
    // decides which of these render and in what order (header stays in lockstep).
    const renderCell = (key: ColumnKey): React.ReactNode => {
      switch (key) {
        case "Author":
          return item.createdBy ? (
            <AuthorCell fileOwner={fileOwner || ""} createdBy={item.createdBy} />
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

    return (
      <DragAndDrop
        data-title={item.title}
        className={classNames(styles.dragAndDropWrapper, "files-item", { droppable: isDroppable })}
        value={value}
        onDrop={dragCtx ? (files) => { if (isDroppable) dragCtx.onFilesDroppedToFolder(files, item.id as number); else dragCtx.onFilesDroppedToCurrentFolder(files); } : undefined}
        onDragOver={dragCtx ? (isDragActive: boolean, e: React.DragEvent<HTMLElement>) => { const over = isDragActive && isDroppable; e.currentTarget.classList.toggle("droppable-hover", over); if (over) dragCtx.onFolderDragOver(item.title); else dragCtx.onFolderDragLeave(); } : undefined}
        onDragLeave={dragCtx ? (e: React.DragEvent<HTMLElement>) => { e.currentTarget.classList.remove("droppable-hover"); dragCtx.onFolderDragLeave(); } : undefined}
        // @ts-expect-error: native onMouseDown with event arg passed via ...rest to root div
        onMouseDown={(e: MouseEvent) => dragCtx?.onItemMouseDown(e, item)}
      >
        <TableRow
          className={classNames({
            "table-row-selected": isChecked,
            [styles.isHighlight]: filesListStore.highlightFileId === item.id,
          })}
          checked={isChecked}
          contextOptions={contextMenuModel}
          getContextModel={getContextMenuModel}
          onClick={onRowClick}
          onDoubleClick={onRowDoubleClick}
          selectionProp={{ className: classNames("files-item", "table-container_file-name-cell"), value }}
          fileContextClick={(isRightClick?: boolean) => {
            if (isRightClick && filesSelectionStore.selection.length > 1) return;
            filesSelectionStore.setSelection([]);
            filesSelectionStore.setBufferSelection(item);
          }}
        >
          <TableCell
            className="table-container_file-name-cell table-container_element-wrapper"
            hasAccess
            checked={isChecked}
          >
            <div className="table-container_element-container" onClick={(e) => e.stopPropagation()}>
              <div className="table-container_element">
                <EncryptedItemIconWrapper
                  encrypted={
                    !!("encrypted" in item && (item as TFileItem).encrypted)
                  }
                  hasEncryptionKeys={hasEncryptionKeys ?? true}
                  isRoom={false}
                >
                  <RoomIcon
                    logo={
                      "isRoom" in item && item.isRoom ? item.roomLogo : item.icon
                    }
                    color={
                      "isRoom" in item && item.isRoom
                        ? item.roomIconColor
                        : undefined
                    }
                    title={title}
                    showDefault={
                      "isRoom" in item && item.isRoom ? !item.hasRoomImage : false
                    }
                  />
                </EncryptedItemIconWrapper>
              </div>
              <Checkbox
                className="table-container_row-checkbox"
                onChange={onCheckboxChange}
                isChecked={isChecked}
                title={t("Common:TitleSelectFile")}
              />
            </div>
            <span className={styles.nameCellText} onClick={onNameClick}>
              {titleWithoutExt}
              {displayFileExtension && "fileExst" in item ? (
                <span className={styles.nameCellExst}>{item.fileExst}</span>
              ) : null}
            </span>
            {badgesNode}
            {lastColumn === "Name" ? quickButtonsNode : null}
          </TableCell>
          {sectionColumns
            .filter((column: SectionColumn) => column.key !== "Name")
            .map((column: SectionColumn) => (
              <TableCell
                key={column.key}
                className={
                  lastColumn === column.key ? styles.lastCell : undefined
                }
              >
                {renderCell(column.key)}
                {lastColumn === column.key ? quickButtonsNode : null}
              </TableCell>
            ))}
        </TableRow>
      </DragAndDrop>
    );
  },
);

export { TableViewRow };
