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

import { TableRow } from "@docspace/ui-kit/components/table";
import { TableCell } from "@docspace/ui-kit/components/table";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import useFavoritesActions from "@/app/(docspace)/_hooks/useFavoritesActions";
import useContextMenuModel from "../../../../_hooks/useContextMenuModel";
import { ShareContext } from "../../../../_contexts/ShareContext";
import { DeleteContext } from "../../../../_contexts/DeleteContext";
import { FileOperationsContext } from "../../../../_contexts/FileOperationsContext";
import { RenameContext } from "../../../../_contexts/RenameContext";
import { generateFilesItemValue } from "../../../_utils";
import getTitleWithoutExt from "../../../../_utils/get-title-without-ext";

import type { TableViewRowProps } from "../TableView.types";
import styles from "../TableView.module.scss";

const TableViewRow = observer(
  ({ item, index, timezone, displayFileExtension, lastColumn }: TableViewRowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();

    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const { t, i18n } = useTranslation(["Common"]);
    const { openFile } = useFilesActions({ t });
    const { openFolder } = useFolderActions({ t });
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

    const isChecked = filesSelectionStore.isCheckedItem(item);
    const value = generateFilesItemValue(item, false, index);

    const titleWithoutExt =
      "fileExst" in item ? getTitleWithoutExt(item.title, item.fileExst) : item.title;

    const modifiedDate = getCorrectDate(
      i18n.language || "",
      item.updated,
      "L",
      "LT",
      timezone ?? "UTC",
    );

    const fileSize = "contentLength" in item ? item.contentLength : "";
    const fileType =
      "fileType" in item ? getFileTypeName(item.fileType, t) : t("Common:Folder");

    const onCheckboxChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        filesSelectionStore.addSelection(item);
      },
      [filesSelectionStore, item],
    );

    const onRowClick = React.useCallback(() => {
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

    const handleShareClick = React.useCallback(() => {
      onShareClick?.(observableItem);
    }, [onShareClick, observableItem]);

    // Spread observable item to create a new object reference when MobX
    // properties change, so that QuickButtons memo(fast-deep-equal) detects
    // the update (same proxy ref would short-circuit to true).
    const itemSnapshot = { ...observableItem };

    const quickButtonsNode = (
      <div className={styles.quickButtonsContainer}>
        <QuickButtons
          t={t}
          item={itemSnapshot}
          viewAs="table"
          onClickFavorite={onClickFavorite}
          onClickShare={onShareClick ? handleShareClick : undefined}
          openShareTab={onShareClick ? handleShareClick : undefined}
        />
      </div>
    );

    const contextMenuModel = getContextMenuModel(true);

    return (
      <TableRow
        className={classNames({
          "table-row-selected": isChecked,
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
              <RoomIcon
                logo={item.icon}
                title={item.title}
                showDefault={false}
              />
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
          {lastColumn === "Name" ? quickButtonsNode : null}
        </TableCell>
        <TableCell className={lastColumn === "Modified" ? styles.lastCell : undefined}>
          <span className={styles.secondaryCell} suppressHydrationWarning>{modifiedDate}</span>
          {lastColumn === "Modified" ? quickButtonsNode : null}
        </TableCell>
        <TableCell className={lastColumn === "Size" ? styles.lastCell : undefined}>
          <span className={styles.secondaryCell}>{fileSize}</span>
          {lastColumn === "Size" ? quickButtonsNode : null}
        </TableCell>
        <TableCell className={lastColumn === "Type" ? styles.lastCell : undefined}>
          <span className={styles.secondaryCell}>{fileType}</span>
          {lastColumn === "Type" ? quickButtonsNode : null}
        </TableCell>
      </TableRow>
    );
  },
);

export { TableViewRow };
