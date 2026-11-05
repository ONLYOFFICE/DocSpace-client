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

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import type { TFunction } from "i18next";
import { withTranslation } from "react-i18next";

import { classNames } from "@docspace/shared/utils";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import { DragAndDrop } from "@onlyoffice/apps-ui-kit/components/drag-and-drop";
import {
  DataTableRow,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import type { TTheme } from "@onlyoffice/apps-ui-kit/providers/theme/themes";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import type { LinkProps } from "@docspace/shared/utils/plugin-file-utils";
import type { VDRIndexingAction } from "@docspace/shared/enums";

import withContent from "SRC_DIR/HOCs/withContent";
import withBadges from "SRC_DIR/HOCs/withBadges";
import withQuickButtons from "SRC_DIR/HOCs/withQuickButtons";
import withFileActions from "SRC_DIR/HOCs/withFileActions";
import ItemIcon from "SRC_DIR/components/ItemIcon";

import rowStyles from "../../TableView/StyledTable.module.scss";
import styles from "../DataTableView.module.scss";
import type { TFilesTableItem } from "../DataTableView.types";
import { FilesRowContext, type TFilesRowValue } from "./FilesRowContext";

/** What the view passes; the HOCs add the rest. */
export type TFilesDataTableRowProps = {
  item: TFilesTableItem;
  index: number;
  /** The row's index for `withFileActions`, which ends `value` with it. */
  itemIndex: number;
  /** The DataTable's own row state (`getRowProps`), merged under the HOCs'. */
  rowProps: DataTableRowState;
  theme: TTheme;
  isHighlight: boolean | null;
  selectedFolderTitle: string;
  canCreateSecurity?: boolean;
  disableDrag: boolean;
  setDropTargetPreview: (title: string | null) => void;
  setFirsElemChecked: (checked: boolean) => void;
  setHeaderBorder: (border: boolean) => void;
  /** A room with indexing, whose rows start with their order. */
  isIndexing: boolean;
  /** `filesActionsStore.changeIndex`: moves an item one place up or down. */
  onEditIndex: (
    action: VDRIndexingAction,
    item: TFilesTableItem,
    t: TFunction,
  ) => void;
};

/** The props `withFileActions`, `withContent`, `withQuickButtons` and `withBadges` add. */
type THocProps = {
  t: TFunction;
  checkedProps: boolean;
  isActive: boolean;
  className: string;
  value: string;
  documentTitle: string;
  dragging: boolean;
  isDragging: boolean;
  canDrag: boolean;
  inProgress: boolean;
  showHotkeyBorder: boolean;
  isBlockingOperation: boolean;
  badgeUrl?: string;
  badgeIconColor?: string;
  onDrop: (files: File[]) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onMouseClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  fileContextClick: (withSelect?: boolean) => void;
  getContextModel: () => ContextMenuModel[];
  onHideContextMenu: () => void;
  onContentFileSelect: (checked: boolean, item: TFilesTableItem) => void;
  badgesComponent: React.ReactNode;
  quickButtonsComponent: React.ReactNode;
  linkStyles: LinkProps;
  titleWithoutExt: string;
  displayFileExtension: boolean;
  updatedDate: string;
  createdDate: string;
  lastOpenedDate: string;
  fileOwner: string;
  isIndexEditingMode: boolean;
  /** The item was moved while reordering and is not saved yet. */
  isIndexUpdated: boolean;
};

/**
 * A documents row on the DataTable: the old table's row (`TableView/TableRow`)
 * with its HOCs and its drag-and-drop wrapper, around the ui-kit row in place
 * of the old `TableRow`. The wrapper is the first child of `.window-item` and
 * carries `id="file_<id>"`, `value` and the `files-item` classes the hotkeys,
 * the selection area and drag and drop look for.
 */
const FilesRow = (props: TFilesDataTableRowProps & THocProps) => {
  const {
    item,
    index,
    rowProps,
    theme,
    t,
    checkedProps,
    isActive,
    className,
    value,
    documentTitle,
    dragging,
    isDragging,
    canDrag,
    inProgress,
    showHotkeyBorder,
    isBlockingOperation,
    isHighlight,
    badgeUrl,
    badgeIconColor,
    onDrop,
    onMouseDown,
    onDragOver,
    onDragLeave,
    onMouseClick,
    onDoubleClick,
    fileContextClick,
    getContextModel,
    onHideContextMenu,
    setDropTargetPreview,
    setFirsElemChecked,
    setHeaderBorder,
    selectedFolderTitle,
    canCreateSecurity,
    disableDrag,
    isIndexing,
    isIndexEditingMode,
    isIndexUpdated,
    onEditIndex,
  } = props;

  const [isDragActive, setIsDragActive] = useState(false);
  // The tags of a room under the pointer show in full, as in the old row.
  const [isHovered, setIsHovered] = useState(false);

  const { acceptBackground, background } = theme.dragAndDrop;
  const isDragDisabled = dragging && !isDragging;

  const hasLogo = !!item.logo?.cover || !!item.logo?.medium;

  // The old row's icon, with a room's logo, colour and badges.
  const element = (
    <ItemIcon
      icon={item.icon}
      fileExst={item.fileExst}
      isRoom={item.isRoom}
      isPrivateRoom={item.isPrivateRoom}
      title={item.title}
      showDefault={hasLogo ? undefined : item.isRoom}
      logo={item.logo}
      color={item.logo?.color}
      isArchive={item.isArchive}
      isTemplate={item.isTemplate}
      badgeUrl={badgeUrl}
      encrypted={"encrypted" in item ? item.encrypted : undefined}
      badgeIconColor={badgeIconColor}
      className={classNames({ "icon-with-index-column": isIndexing })}
    />
  );

  // The tint of a folder a drag hovers, and the fade of every other row. A
  // drag while reordering moves the row, so no folder takes the tint.
  const cellStyle = useMemo<React.CSSProperties>(
    () => ({
      background:
        dragging && isDragging && !isIndexEditingMode
          ? isDragActive
            ? acceptBackground
            : background
          : "none",
      opacity: isDragDisabled ? 0.4 : 1,
    }),
    [
      dragging,
      isDragging,
      isIndexEditingMode,
      isDragActive,
      isDragDisabled,
      acceptBackground,
      background,
    ],
  );

  const onMouseEnter = useEventCallback(() => setIsHovered(true));
  const onMouseLeave = useEventCallback(() => setIsHovered(false));

  const onChangeIndex = useEventCallback(
    (e: React.MouseEvent, action: VDRIndexingAction) => {
      e.stopPropagation();
      onEditIndex(action, item, t);
    },
  );

  const onDragOverEvent = useEventCallback(
    (dragActive: boolean, e: React.DragEvent<HTMLElement>) => {
      onDragOver?.(e);
      if (dragActive !== isDragActive) setIsDragActive(dragActive);
    },
  );

  const onDragLeaveEvent = useEventCallback(
    (e: React.DragEvent<HTMLElement>) => {
      onDragLeave?.(e);
      setDropTargetPreview(null);
      setIsDragActive(false);
    },
  );

  // The first row tells the header whether to lengthen its border.
  useEffect(() => {
    if (index !== 0) return;
    setFirsElemChecked(checkedProps || isActive);
    setHeaderBorder(showHotkeyBorder);
  }, [index, checkedProps, isActive, showHotkeyBorder]);

  useEffect(() => {
    if (!dragging) return;

    if (isDragging) {
      if (isDragActive) setDropTargetPreview(item.title);
    } else if (!disableDrag && canCreateSecurity) {
      setDropTargetPreview(selectedFolderTitle);
    } else {
      setDropTargetPreview(null);
    }
  }, [
    dragging,
    isDragging,
    isDragActive,
    selectedFolderTitle,
    setDropTargetPreview,
    disableDrag,
  ]);

  const rowValue = useMemo<TFilesRowValue>(
    () => ({
      item,
      t,
      theme,
      element,
      checked: checkedProps,
      isActive,
      isHovered,
      inProgress,
      linkStyles: props.linkStyles,
      titleWithoutExt: props.titleWithoutExt,
      displayFileExtension: props.displayFileExtension,
      onContentFileSelect: props.onContentFileSelect,
      badgesComponent: props.badgesComponent,
      quickButtonsComponent: props.quickButtonsComponent,
      updatedDate: props.updatedDate,
      createdDate: props.createdDate,
      lastOpenedDate: props.lastOpenedDate,
      fileOwner: props.fileOwner,
      isIndexEditingMode,
      onChangeIndex,
    }),
    // `element` is rebuilt from the item each render, like the old row's.
    [
      item,
      t,
      theme,
      checkedProps,
      isActive,
      isHovered,
      inProgress,
      badgeUrl,
      badgeIconColor,
      props.linkStyles,
      props.titleWithoutExt,
      props.displayFileExtension,
      props.onContentFileSelect,
      props.badgesComponent,
      props.quickButtonsComponent,
      props.updatedDate,
      props.createdDate,
      props.lastOpenedDate,
      props.fileOwner,
      isIndexEditingMode,
      onChangeIndex,
    ],
  );

  // No menu while the rows are reordered: the old row dropped its options.
  const contextMenu = useMemo(
    () =>
      isIndexEditingMode
        ? undefined
        : {
            options: item.contextOptions as ContextMenuModel[] | undefined,
            getModel: getContextModel,
            onOpen: fileContextClick,
            onClose: onHideContextMenu,
            badgeUrl,
            title: item.isFolder
              ? t("Common:TitleShowFolderActions")
              : t("Common:TitleShowActions"),
          },
    [
      isIndexEditingMode,
      item.contextOptions,
      item.isFolder,
      getContextModel,
      fileContextClick,
      onHideContextMenu,
      badgeUrl,
      t,
    ],
  );

  // A moved row stays highlighted until the new order is saved.
  const checked = checkedProps || isIndexUpdated;

  const idWithFileExst = item.fileExst
    ? `${item.id}_${item.fileExst}`
    : `${item.id ?? ""}`;

  return (
    <DragAndDrop
      // Not in DragAndDrop's props, but spread onto its element like the rest:
      // the hotkeys find the row by this id, drag and drop reads the title.
      {...({
        id: `${item.isFolder ? "folder" : "file"}_${item.id}`,
        "data-title": item.title,
      } as object)}
      value={value}
      className={classNames(
        rowStyles.styledDragAndDrop,
        "files-item",
        className,
        idWithFileExst,
        {
          "table-hotkey-border": showHotkeyBorder,
          "table-row-selected": !showHotkeyBorder && (checkedProps || isActive),
        },
      )}
      onDrop={onDrop}
      // Typed without its event, but DragAndDrop spreads it onto its element,
      // so withFileActions gets the mouse event as it did on the old row.
      onMouseDown={onMouseDown as unknown as () => void}
      dragging={dragging ? isDragging : undefined}
      onDragOver={onDragOverEvent}
      onDragLeave={onDragLeaveEvent}
      isDragDisabled={isDragDisabled}
    >
      <FilesRowContext value={rowValue}>
        <DataTableRow
          {...rowProps}
          row={item}
          index={index}
          testId={`table-row-${index}`}
          checked={checked}
          active={isActive}
          className={classNames(
            rowStyles.styledTableRow,
            styles.filesRow,
            "table-row",
            {
              [styles.active]: isActive,
              // A folder the dragged items can be dropped into.
              [styles.dropTarget]: dragging && isDragging,
              [rowStyles.checked]: checked,
              [rowStyles.active]: isActive,
              [rowStyles.isDragging]: dragging,
              [rowStyles.isHighlight]: isHighlight,
              [rowStyles.showHotkeyBorder]: showHotkeyBorder,
              [rowStyles.canDrag]: !item.isThirdPartyFolder && canDrag,
              [rowStyles.isBlockingOperation]: isBlockingOperation,
              [rowStyles.inProgress]: inProgress,
              [rowStyles.isIndexing]: isIndexing,
              [rowStyles.isIndexEditingMode]: isIndexEditingMode,
              [rowStyles.isIndexUpdated]: isIndexUpdated,
              [rowStyles.isRoom]: item.isRoom,
            },
          )}
          cellProps={{
            className: classNames("files-item", className, value),
            value,
            documentTitle,
            style: cellStyle,
          }}
          contextMenu={contextMenu}
          // Reordering: a press starts the drag (withFileActions), a click
          // neither selects nor opens.
          onClick={isIndexEditingMode ? undefined : onMouseClick}
          onDoubleClick={isIndexEditingMode ? undefined : onDoubleClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </FilesRowContext>
    </DragAndDrop>
  );
};

export const FilesDataTableRow = withTranslation([
  "Files",
  "Common",
  "InfoPanel",
  "Notifications",
  "GroupingRooms",
])(
  withFileActions(withContent(withQuickButtons(withBadges(FilesRow)))),
) as unknown as React.ComponentType<TFilesDataTableRowProps>;
