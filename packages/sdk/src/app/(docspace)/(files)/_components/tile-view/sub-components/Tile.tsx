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

import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import classNames from "classnames";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { FileTile } from "@docspace/ui-kit/components/tiles/file-tile";
import { FolderTile } from "@docspace/ui-kit/components/tiles/folder-tile";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import Badges from "@docspace/shared/components/badges";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";

import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFavoritesActions from "@/app/(docspace)/_hooks/useFavoritesActions";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";
import type { TGetIcon } from "@/app/(docspace)/_hooks/useItemIcon";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { generateFilesItemValue } from "@/app/(docspace)/(files)/_utils";
import useContextMenuModel from "@/app/(docspace)/_hooks/useContextMenuModel";
import useDownloadActions from "@/app/(docspace)/_hooks/useDownloadActions";
import { ShareContext } from "@/app/(docspace)/_contexts/ShareContext";
import { CopyShareLinkContext } from "@/app/(docspace)/_contexts/CopyShareLinkContext";
import { InfoContext } from "@/app/(docspace)/_contexts/InfoContext";
import { DeleteContext } from "@/app/(docspace)/_contexts/DeleteContext";
import { FileOperationsContext } from "@/app/(docspace)/_contexts/FileOperationsContext";
import { RenameContext } from "@/app/(docspace)/_contexts/RenameContext";
import { VersionHistoryContext } from "@/app/(docspace)/_contexts/VersionHistoryContext";
import { ConvertContext } from "@/app/(docspace)/_contexts/ConvertContext";

import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import type { TileProps } from "../TileView.types";

import TileContent from "./TileContent";

const getTemporaryIcon = (item: TFileItem | TFolderItem, getIcon: TGetIcon) => {
  if (item.isFolder) return undefined;

  const temporaryExtension =
    item.id === -1 ? `.${item.fileExst}` : item.fileExst;

  return getIcon(temporaryExtension, 96, item.contentLength);
};

const Tile = ({ item, getIcon, index }: TileProps) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("Common");
  const { isBase } = useTheme();
  const { filesSettings } = useFilesSettingsStore();
  const filesListStore = useFilesListStore();

  const {
    isCheckedItem,
    addSelection,
    selection,
    setSelection,
    setBufferSelection,
  } = useFilesSelectionStore();

  // Use the observable item from MobX store so isFavorite changes are reactive
  const storeItem = filesListStore.items.find((i) => i.id === item.id);
  const observableItem = storeItem ?? item;

  const { openFile, lockFile } = useFilesActions({ t });
  const { openFolder } = useFolderActions({ t });
  const onShareClick = React.useContext(ShareContext);
  const onCopyShareLink = React.useContext(CopyShareLinkContext);
  const onInfoClick = React.useContext(InfoContext);
  const deleteCtx = React.useContext(DeleteContext);
  const fileOpsCtx = React.useContext(FileOperationsContext);
  const renameCtx = React.useContext(RenameContext);
  const onShowVersionHistory = React.useContext(VersionHistoryContext);
  const onConvert = React.useContext(ConvertContext);
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
  });
  const { downloadAction } = useDownloadActions();
  const { markAsFavorite, removeFromFavorites } = useFavoritesActions({ t });
  const { isItemActive } = useActiveItemsStore();

  const displayFileExtension = Boolean(filesSettings?.displayFileExtension);
  const isExtsCustomFilter =
    "fileExst" in item
      ? (filesSettings?.extsWebCustomFilterEditing ?? []).includes(
          item.fileExst,
        )
      : false;
  const temporaryIcon = getTemporaryIcon(item, getIcon);
  const isChecked = isCheckedItem(item);
  const inProgress = isItemActive(item);
  const value = generateFilesItemValue(item, false, index);

  const openItem = (e: React.MouseEvent) => {
    const { target } = e;
    if (
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        !!target.closest(".lock-file") ||
        target.closest(".tag"))
    )
      return;

    e.preventDefault();

    if (item.isFolder) {
      openFolder(item.id, item.title);
    } else {
      openFile(item);
    }
  };

  const tileContextClick = (isRightMouseButtonClick?: boolean) => {
    if (isRightMouseButtonClick && selection.length > 1) {
      return;
    }

    setSelection([]);
    setBufferSelection(item);
  };

  const contextMenuModel = getContextMenuModel(true);

  const element = (
    <RoomIcon
      logo={"isRoom" in item && item.isRoom ? item.roomLogo : item.icon}
      color={"isRoom" in item && item.isRoom ? item.roomIconColor : undefined}
      title={item.title}
      showDefault={"isRoom" in item && item.isRoom ? !item.hasRoomImage : false}
    />
  );

  const tileContent = (
    <TileContent
      item={item}
      displayFileExtension={displayFileExtension}
      onTitleClick={openItem}
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

  const badgesComponent = (
    <Badges
      t={t}
      themeIsBase={isBase}
      item={observableItem}
      viewAs="tile"
      showNew={false}
      isExtsCustomFilter={isExtsCustomFilter}
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

  const quickButtonsComponent = (
    <QuickButtons
      t={t}
      item={observableItem}
      viewAs="tile"
      onClickDownload={() => downloadAction(observableItem)}
      onClickFavorite={onClickFavorite}
      onClickLock={onClickLock}
      onClickShare={onCopyShareLink ? handleCopyShareLink : undefined}
      openShareTab={onCopyShareLink ? handleCopyShareLink : undefined}
    />
  );

  const commonTileProps = {
    item,
    contextOptions: contextMenuModel,
    isHighlight: filesListStore.highlightFileId === item.id,
    checked: isChecked,
    isActive: false,
    inProgress,
    isBlockingOperation: false,
    isEdit: false,
    showHotkeyBorder: false,

    onSelect: () => addSelection(item),
    getContextModel: getContextMenuModel,
    tileContextClick,
    element,
    badges: badgesComponent,
    children: tileContent,
    forwardRef: tileRef,
  };

  return (
    <div>
      <div
        className={classNames("files-item", {
          "tile-selected": isChecked,
        })}
        // @ts-expect-error: value required for SelectionArea
        value={value}
      >
        {item.isFolder ? (
          <FolderTile {...commonTileProps} />
        ) : (
          <FileTile
            {...commonTileProps}
            thumbnailClick={openItem}
            temporaryIcon={temporaryIcon}
            thumbnail={
              !item.providerItem && item.thumbnailUrl ? item.thumbnailUrl : ""
            }
            contentElement={quickButtonsComponent}
          />
        )}
      </div>
    </div>
  );
};

export default observer(Tile);

