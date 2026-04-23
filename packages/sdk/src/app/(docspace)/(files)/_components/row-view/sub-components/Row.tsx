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
import classNames from "classnames";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import {
  FilesRow,
  FilesRowWrapper,
} from "@docspace/shared/components/files-row";
import { DragAndDrop } from "@docspace/ui-kit/components/drag-and-drop";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import Badges from "@docspace/shared/components/badges";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFavoritesActions from "@/app/(docspace)/_hooks/useFavoritesActions";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import useContextMenuModel from "../../../../_hooks/useContextMenuModel";
import { ShareContext } from "../../../../_contexts/ShareContext";
import { DeleteContext } from "../../../../_contexts/DeleteContext";
import { FileOperationsContext } from "../../../../_contexts/FileOperationsContext";
import { RenameContext } from "../../../../_contexts/RenameContext";
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
  }: RowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();
    const { isItemActive } = useActiveItemsStore();

    // Use the observable item from MobX store so isFavorite changes are reactive
    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const { t } = useTranslation(["Common"]);
    const { isBase } = useTheme();
    const { openFile } = useFilesActions({ t });
    const { markAsFavorite, removeFromFavorites } = useFavoritesActions({ t });
    const onShareClick = React.useContext(ShareContext);
    const deleteCtx = React.useContext(DeleteContext);
    const fileOpsCtx = React.useContext(FileOperationsContext);
    const renameCtx = React.useContext(RenameContext);

    const { getContextMenuModel } = useContextMenuModel({
      item: observableItem,
      onShareClick: onShareClick ?? undefined,
      onDeleteClick: deleteCtx?.deleteItem,
      onCopyClick: fileOpsCtx?.copyItem,
      onMoveClick: fileOpsCtx?.moveItem,
      onDuplicateClick: fileOpsCtx?.duplicateItem,
      onRestoreClick: fileOpsCtx?.restoreItem,
      onRenameClick: renameCtx?.renameItem,
    });

    const element = (
      <RoomIcon logo={item.icon} title={item.title} showDefault={false} />
    );

    const onClickFavorite = () => {
      if (observableItem.isFavorite) {
        removeFromFavorites(observableItem);
      } else {
        markAsFavorite(observableItem);
      }
    };

    const badgesComponent = (
      <Badges
        className={styles.badgesComponent}
        t={t}
        themeIsBase={isBase}
        item={observableItem}
        viewAs="row"
        showNew={false}
        onFilesClick={() => {
          if (!observableItem.isFolder) {
            openFile(observableItem);
          }
        }}
        onClickFavorite={onClickFavorite}
      />
    );

    const handleShareClick = React.useCallback(() => {
      onShareClick?.(observableItem);
    }, [onShareClick, observableItem]);

    const quickButtonsComponent = (
      <QuickButtons
        t={t}
        item={observableItem}
        viewAs="row"
        onClickFavorite={onClickFavorite}
        onClickShare={onShareClick ? handleShareClick : undefined}
        openShareTab={onShareClick ? handleShareClick : undefined}
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
        isHighlight={false}
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
