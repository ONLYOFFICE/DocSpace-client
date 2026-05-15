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

import equal from "fast-deep-equal";
import { withTranslation } from "react-i18next";
import React, { useState, useEffect, memo, useCallback, useMemo } from "react";

import { classNames } from "@docspace/shared/utils";
import { FolderType } from "@docspace/shared/enums";
import { EMPTY_OBJECT, FUNCTION_EMPTY } from "@docspace/shared/constants";
import { GuidanceRefKey } from "@docspace/shared/components/guidance/sub-components/Guid.types";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";

import withContent from "../../../../../HOCs/withContent";
import withBadges from "../../../../../HOCs/withBadges";
import withQuickButtons from "../../../../../HOCs/withQuickButtons";
import withFileActions from "../../../../../HOCs/withFileActions";
import ItemIcon from "../../../../../components/ItemIcon";

import RoomsRowDataComponent from "./sub-components/RoomsRowData";
import AIAgentsRowDataComponent from "./sub-components/AIAgentsRowData";
import TrashRowDataComponent from "./sub-components/TrashRowData";
import RecentRowDataComponent from "./sub-components/RecentRowData";
import IndexRowDataComponent from "./sub-components/IndexRowData";
import TemplatesRowData from "./sub-components/TemplatesRowData";
import RowDataComponent from "./sub-components/RowData";
import SharedWithMeRowDataComponent from "./sub-components/SharedWithMeRowData";
import FavoritesRowDataComponent from "./sub-components/FavoritesRowData";

import { StyledTableRow, StyledDragAndDrop } from "./StyledTable";

const FilesTableRow = memo((props) => {
  const {
    t,
    fileContextClick,
    item,
    checkedProps,
    className,
    value,
    documentTitle,
    onMouseClick,
    dragging,
    isDragging,
    onDrop,
    onMouseDown,
    isActive,
    onHideContextMenu,
    onDoubleClick,
    inProgress,
    index,
    setFirsElemChecked,
    setHeaderBorder,
    theme,
    getContextModel,
    showHotkeyBorder,
    id,
    isRooms,
    isTemplates,
    isTrashFolder,
    isIndexEditingMode,
    isIndexing,
    isHighlight,
    hideColumns,
    onDragOver,
    onDragLeave,
    badgeUrl,
    isRecentFolder,
    isFavoritesFolder,
    isSharedWithMeFolder,
    isInSharedFolder,
    isAIAgentsFolder,
    canDrag,
    onEditIndex,
    isIndexUpdated,
    displayFileExtension,
    isBlockingOperation,

    isTutorialEnabled,
    setRefMap,
    deleteRefMap,
    setDropTargetPreview,
    selectedFolderTitle,
    canCreateSecurity,
    disableDrag,
  } = props;

  const { acceptBackground, background } = theme.dragAndDrop;
  const [isHovered, setIsHovered] = useState(false);

  const rowRef = React.useRef();

  const element = (
    <ItemIcon
      id={item.id}
      icon={item.icon}
      fileExst={item.fileExst}
      isRoom={item.isRoom}
      title={item.title}
      showDefault={
        !(!!item?.logo?.cover || !!item?.logo?.medium) ? item.isRoom : null
      }
      logo={item.logo}
      color={item.logo?.color}
      isArchive={item.isArchive}
      isTemplate={item.isTemplate}
      badgeUrl={badgeUrl}
      className={classNames({
        "icon-with-index-column": isIndexing,
      })}
    />
  );

  const selectionProp = useMemo(() => {
    return {
      className: classNames("files-item", className, value),
      value,
      documentTitle,
    };
  }, [className, value, documentTitle]);

  const [isDragActive, setIsDragActive] = useState(false);

  const isDragDisabled = dragging && !isDragging;

  const dragStyles = useMemo(() => {
    return {
      style: {
        background:
          dragging && isDragging && !isIndexEditingMode
            ? isDragActive
              ? acceptBackground
              : background
            : "none",
        opacity: isDragDisabled ? 0.4 : 1,
      },
    };
  }, [
    dragging,
    isDragging,
    isIndexEditingMode,
    isDragActive,
    acceptBackground,
    background,
  ]);

  const onChangeIndex = useCallback(
    (action) => {
      return onEditIndex(action, item, t);
    },
    [onEditIndex, item, t],
  );

  const onDragOverEvent = useEventCallback((dragActive, e) => {
    onDragOver && onDragOver(e);

    if (dragActive !== isDragActive) {
      setIsDragActive(dragActive);
    }
  });

  const onDragLeaveEvent = useEventCallback((e) => {
    onDragLeave && onDragLeave(e);

    setDropTargetPreview(null);
    setIsDragActive(false);
  });

  useEffect(() => {
    if (index === 0) {
      if (checkedProps || isActive) {
        setFirsElemChecked(true);
      } else {
        setFirsElemChecked(false);
      }
      if (showHotkeyBorder && !isTutorialEnabled) {
        setHeaderBorder(true);
      } else {
        setHeaderBorder(false);
      }
    }
  }, [checkedProps, isActive, showHotkeyBorder, isTutorialEnabled]);

  useEffect(() => {
    if (!rowRef?.current) return;

    if (item?.isPDF) {
      setRefMap(GuidanceRefKey.Pdf, rowRef, "firstChildOffset");
    }
    if (item?.type === FolderType.Done) {
      setRefMap(GuidanceRefKey.Ready, rowRef, "firstChildOffset");
    }

    return () => {
      deleteRefMap(GuidanceRefKey.Pdf);
      deleteRefMap(GuidanceRefKey.Ready);
    };
  }, [deleteRefMap, setRefMap]);

  useEffect(() => {
    if (dragging) {
      if (isDragging) {
        if (isDragActive) setDropTargetPreview(item.title);
      } else if (!disableDrag && canCreateSecurity) {
        setDropTargetPreview(selectedFolderTitle);
      } else {
        setDropTargetPreview(null);
      }
    }
  }, [
    dragging,
    isDragging,
    isDragActive,
    selectedFolderTitle,
    setDropTargetPreview,
    disableDrag,
  ]);

  const idWithFileExst = item.fileExst
    ? `${item.id}_${item.fileExst}`
    : (item.id ?? "");

  const contextOptionProps = useMemo(() => {
    return isIndexEditingMode
      ? EMPTY_OBJECT
      : {
          contextOptions: item.contextOptions,
          getContextModel,
        };
  }, [isIndexEditingMode, item.contextOptions, getContextModel]);

  const changeIndex = useCallback(
    (e, action) => {
      e.stopPropagation();
      onChangeIndex(action);
    },
    [onChangeIndex],
  );

  const onMouseEnter = useEventCallback(() => {
    setIsHovered(true);
  });

  const onMouseLeave = useEventCallback(() => {
    setIsHovered(false);
  });

  return (
    <StyledDragAndDrop
      id={id}
      data-title={item.title}
      value={value}
      className={classNames("files-item", className, idWithFileExst, {
        "table-hotkey-border": showHotkeyBorder,
        "table-row-selected": !showHotkeyBorder && (checkedProps || isActive),
      })}
      onDrop={onDrop}
      onMouseDown={onMouseDown}
      dragging={dragging ? isDragging : null}
      onDragOver={onDragOverEvent}
      onDragLeave={onDragLeaveEvent}
      isDragDisabled={isDragDisabled}
    >
      <StyledTableRow
        key={item.id}
        className="table-row"
        forwardedRef={rowRef}
        contextMenuCellStyle={dragStyles.style}
        dataTestId={`table-row-${index}`}
        isDragging={dragging}
        dragging={dragging ? isDragging : null}
        selectionProp={selectionProp}
        fileContextClick={fileContextClick}
        onClick={isIndexEditingMode ? FUNCTION_EMPTY : onMouseClick}
        isActive={isActive}
        isIndexEditingMode={isIndexEditingMode}
        isBlockingOperation={isBlockingOperation}
        inProgress={inProgress}
        isFolder={item.isFolder}
        onHideContextMenu={onHideContextMenu}
        isThirdPartyFolder={item.isThirdPartyFolder}
        onDoubleClick={isIndexEditingMode ? FUNCTION_EMPTY : onDoubleClick}
        checked={checkedProps || isIndexUpdated}
        isIndexing={isIndexing}
        isIndexUpdated={isIndexUpdated}
        showHotkeyBorder={showHotkeyBorder ? !isTutorialEnabled : false}
        displayFileExtension={displayFileExtension}
        title={
          item.isFolder
            ? t("Common:TitleShowFolderActions")
            : t("Common:TitleShowActions")
        }
        isRoom={item.isRoom}
        isHighlight={isHighlight}
        hideColumns={hideColumns}
        badgeUrl={badgeUrl}
        canDrag={canDrag}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...contextOptionProps}
      >
        {isTemplates ? (
          <TemplatesRowData
            t={t}
            element={element}
            dragStyles={dragStyles}
            isHovered={isHovered}
            {...props}
          />
        ) : isRooms ? (
          <RoomsRowDataComponent
            element={element}
            dragStyles={dragStyles}
            isHovered={isHovered}
            {...props}
          />
        ) : isAIAgentsFolder ? (
          <AIAgentsRowDataComponent
            element={element}
            dragStyles={dragStyles}
            isHovered={isHovered}
            {...props}
          />
        ) : isTrashFolder ? (
          <TrashRowDataComponent
            element={element}
            dragStyles={dragStyles}
            {...props}
          />
        ) : isSharedWithMeFolder || isInSharedFolder ? (
          <SharedWithMeRowDataComponent
            element={element}
            dragStyles={dragStyles}
            {...props}
          />
        ) : isRecentFolder ? (
          <RecentRowDataComponent
            element={element}
            dragStyles={dragStyles}
            selectionProp={selectionProp}
            {...props}
          />
        ) : isFavoritesFolder ? (
          <FavoritesRowDataComponent
            element={element}
            dragStyles={dragStyles}
            selectionProp={selectionProp}
            {...props}
          />
        ) : isIndexing ? (
          <IndexRowDataComponent
            element={element}
            dragStyles={dragStyles}
            selectionProp={selectionProp}
            isIndexEditingMode={isIndexEditingMode}
            changeIndex={changeIndex}
            {...props}
          />
        ) : (
          <RowDataComponent
            element={element}
            dragStyles={dragStyles}
            selectionProp={selectionProp}
            isIndexEditingMode={isIndexEditingMode}
            changeIndex={changeIndex}
            {...props}
          />
        )}
      </StyledTableRow>
    </StyledDragAndDrop>
  );
}, equal);

export default withTranslation([
  "Files",
  "Common",
  "InfoPanel",
  "Notifications",
  "GroupingRooms",
])(withFileActions(withContent(withQuickButtons(withBadges(FilesTableRow)))));
