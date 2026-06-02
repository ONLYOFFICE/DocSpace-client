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

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { FolderType } from "@docspace/shared/enums";
import {
  FilesRow,
  FilesRowWrapper,
} from "@docspace/shared/components/files-row";
import { DragAndDrop } from "@docspace/ui-kit/components/drag-and-drop";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import Badges from "@docspace/shared/components/badges";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import EditorsTooltip from "../../editors-tooltip";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";

import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFavoritesActions from "@/app/(docspace)/_hooks/useFavoritesActions";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
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
import type { TFileItem } from "../../../../_hooks/useItemList";
import { generateFilesItemValue } from "../../../_utils";

import { RowContent } from "./RowContent";
import { RowProps } from "../RowView.types";

import styles from "../RowView.module.scss";

const Row = observer(
  ({
    item,
    index,
    filterSortBy,
    timezone,
    displayFileExtension,
    isSSR,
    currentUserId,
  }: RowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();
    const { filesSettings } = useFilesSettingsStore();
    const { isItemActive } = useActiveItemsStore();
    const isExtsCustomFilter =
      "fileExst" in item
        ? (filesSettings?.extsWebCustomFilterEditing ?? []).includes(item.fileExst)
        : false;

    // Use the observable item from MobX store so isFavorite changes are reactive
    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const { t } = useTranslation(["Common"]);
    const { isBase } = useTheme();
    const { openFile, lockFile } = useFilesActions({ t });
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

    const element = (
      <RoomIcon
        logo={"isRoom" in item && item.isRoom ? item.roomLogo : item.icon}
        color={"isRoom" in item && item.isRoom ? item.roomIconColor : undefined}
        title={item.title}
        showDefault={"isRoom" in item && item.isRoom ? !item.hasRoomImage : false}
      />
    );

    const onClickFavorite = () => {
      if (observableItem.isFavorite) {
        removeFromFavorites(observableItem);
      } else {
        markAsFavorite(observableItem);
      }
    };

    const onClickLock = () => {
      if (!observableItem.isFolder) {
        lockFile(observableItem as TFileItem);
      }
    };

    const editorsTooltip = (
      <EditorsTooltip item={observableItem} currentUserId={currentUserId} />
    );

    const badgesComponent = (
      <Badges
        className={styles.badgesComponent}
        t={t}
        themeIsBase={isBase}
        item={observableItem}
        viewAs="row"
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
    );

    const handleCopyShareLink = React.useCallback(() => {
      onCopyShareLink?.(observableItem);
    }, [onCopyShareLink, observableItem]);

    const isTrashFolder =
      filesListStore.rootFolderType === FolderType.TRASH;

    const quickButtonsComponent = (
      <QuickButtons
        t={t}
        item={observableItem}
        viewAs="row"
        onClickFavorite={onClickFavorite}
        onClickLock={onClickLock}
        onClickShare={onCopyShareLink ? handleCopyShareLink : undefined}
        openShareTab={onCopyShareLink ? handleCopyShareLink : undefined}
        isTrashFolder={isTrashFolder}
      />
    );

    const onContextClick = (isRightMouseButtonClick?: boolean) => {
      if (isRightMouseButtonClick && filesSelectionStore.selection.length > 1) {
        return;
      }

      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    };

    const contextMenuModel = getContextMenuModel(true);

    const isChecked = filesSelectionStore.isCheckedItem(item);
    const inProgress = isItemActive(item);

    const value = generateFilesItemValue(item, false, index);

    return (
      <FilesRowWrapper
        isActive={false}
        isFirstElem={index === 0}
        checked={isChecked}
        isDragging={false}
        isIndexEditingMode={false}
        isIndexUpdated={false}
        showHotkeyBorder={false}
        isHighlight={filesListStore.highlightFileId === item.id}
        className={classNames(styles.rowWrapper, "row-wrapper")}
      >
        <DragAndDrop
          data-title={item.title}
          className="files-item"
          value={value}
        >
          <FilesRow
            key={item.id}
            checked={isChecked}
            mode="modern"
            withoutBorder
            isIndexEditingMode={false}
            folderCategory={false}
            isActive={false}
            isIndexUpdated={false}
            isDragging={false}
            isThirdPartyFolder={false}
            withAccess={false}
            className={classNames("files-row", {
              "row-list-item": isSSR,
            })}
            onSelect={() => filesSelectionStore.addSelection(item)}
            onContextClick={onContextClick}
            element={element}
            contextOptions={contextMenuModel}
            getContextModel={getContextMenuModel}
            badgesComponent={badgesComponent}
            contentElement={quickButtonsComponent}
            inProgress={inProgress}
          >
            <RowContent
              item={item}
              filterSortBy={filterSortBy}
              timezone={timezone}
              displayFileExtension={displayFileExtension}
              badgesComponent={badgesComponent}
            />
          </FilesRow>
        </DragAndDrop>
      </FilesRowWrapper>
    );
  },
);

export { Row };
