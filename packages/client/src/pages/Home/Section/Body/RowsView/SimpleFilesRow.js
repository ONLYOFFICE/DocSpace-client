// (c) Copyright Ascensio System SIA 2009-2025
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

import equal from "fast-deep-equal";
import React, { useCallback, useMemo } from "react";
import { isMobile } from "react-device-detect";
import { withTranslation } from "react-i18next";

import { FolderType } from "@docspace/shared/enums";
import { EMPTY_OBJECT } from "@docspace/shared/constants";
import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import { isMobile as isMobileUtile, classNames } from "@docspace/shared/utils";
import { GuidanceRefKey } from "@docspace/shared/components/guidance/sub-components/Guid.types";
import {
  FilesRow,
  FilesRowWrapper,
} from "@docspace/shared/components/files-row";

import FilesRowContent from "./FilesRowContent";

import withFileActions from "../../../../../HOCs/withFileActions";
import withQuickButtons from "../../../../../HOCs/withQuickButtons";
import withBadges from "../../../../../HOCs/withBadges";
import ItemIcon from "../../../../../components/ItemIcon";

const SimpleFilesRow = React.memo((props) => {
  const {
    t,
    item,
    sectionWidth,
    dragging,
    onContentFileSelect,
    fileContextClick,
    onDrop,
    onMouseDown,
    className,
    isDragging,
    value,
    quickButtonsComponent,
    displayShareButton,
    isPrivacy,
    checkedProps,
    onFilesClick,
    onDoubleClick,
    onMouseClick,
    isEdit,
    isActive,
    inProgress,
    getContextModel,
    showHotkeyBorder,
    id,
    isRooms,
    isAIAgentsFolder,
    folderCategory,
    isHighlight,
    badgesComponent,
    onDragOver,
    onDragLeave,
    itemIndex,
    badgeUrl,
    canDrag,
    isIndexEditingMode,
    changeIndex,
    isIndexUpdated,
    isFolder,
    isBlockingOperation,
    isTutorialEnabled,
    setRefMap,
    deleteRefMap,
    selectedFolderTitle,
    setDropTargetPreview,
    disableDrag,
    canCreateSecurity,
  } = props;

  const isMobileDevice = isMobileUtile();

  const [isDragActive, setIsDragActive] = React.useState(false);

  const rowRef = React.useRef(null);

  const withAccess = item.security?.Lock;
  const isSmallContainer = sectionWidth <= 500;

  const onChangeIndex = useCallback(
    (action) => {
      return changeIndex(action, item, t);
    },
    [changeIndex, item, t],
  );

  React.useEffect(() => {
    if (!rowRef?.current) return;

    if (item?.isPDF) {
      setRefMap(GuidanceRefKey.Pdf, rowRef);
    }
    if (item?.type === FolderType.Done) {
      setRefMap(GuidanceRefKey.Ready, rowRef);
    }

    return () => {
      deleteRefMap(GuidanceRefKey.Pdf);
      deleteRefMap(GuidanceRefKey.Ready);
    };
  }, [setRefMap, deleteRefMap]);

  const element = (
    <ItemIcon
      id={item.id}
      icon={item.icon}
      fileExst={item.fileExst}
      isRoom={item.isRoom}
      title={item.title}
      logo={item.logo}
      showDefault={
        !(!!item?.logo?.cover || !!item?.logo?.medium) ? item.isRoom : null
      }
      color={item.logo?.color}
      isArchive={item.isArchive}
      isTemplate={item.isTemplate}
      badgeUrl={badgeUrl}
    />
  );

  const onDragOverEvent = useEventCallback((dragActive, e) => {
    onDragOver && onDragOver(e);

    if (dragActive !== isDragActive) {
      setIsDragActive(dragActive);
    }
  });

  const onDragLeaveEvent = useEventCallback((e) => {
    onDragLeave && onDragLeave(e);

    setIsDragActive(false);
    setDropTargetPreview(null);
  });

  const isDragDisabled = dragging && !isDragging;

  const dragStyles = useMemo(() => {
    return (dragging && isDragging) || isDragDisabled
      ? {
          marginInline: "-16px",
          paddingInline: "16px",
        }
      : EMPTY_OBJECT;
  }, [dragging, isDragging, isDragDisabled]);

  const idWithFileExst = item.fileExst
    ? `${item.id}_${item.fileExst}`
    : (item.id ?? "");

  React.useEffect(() => {
    if (dragging) {
      if (isDragging) {
        setDropTargetPreview(item.title);
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
    isDragDisabled,
    selectedFolderTitle,
    setDropTargetPreview,
  ]);

  const onFilesClickEvent = useCallback(
    (event) => {
      if (isMobile) return;

      onFilesClick(event);
    },
    [isMobile, onFilesClick],
  );

  const onRowClickEvent = useCallback(
    (event) => {
      if (isMobile) return;

      onDoubleClick(event);
    },
    [isMobile, onDoubleClick],
  );

  return (
    <FilesRowWrapper
      ref={rowRef}
      id={id}
      onDragOver={onDragOver}
      className={`row-wrapper ${
        showHotkeyBorder
          ? "row-hotkey-border"
          : checkedProps || isActive
            ? "row-selected"
            : ""
      }`}
      checked={checkedProps}
      isActive={isActive}
      showHotkeyBorder={showHotkeyBorder ? !isTutorialEnabled : false}
      isIndexEditingMode={isIndexEditingMode}
      isIndexUpdated={isIndexUpdated}
      isFirstElem={itemIndex === 0}
      isHighlight={isHighlight}
    >
      <DragAndDrop
        data-title={item.title}
        value={value}
        className={classNames("files-item", className, idWithFileExst)}
        onDrop={onDrop}
        onMouseDown={onMouseDown}
        dragging={dragging ? isDragging : null}
        onDragOver={onDragOverEvent}
        onDragLeave={onDragLeaveEvent}
        style={dragStyles}
        isDragDisabled={isDragDisabled}
      >
        <FilesRow
          onRowClick={onRowClickEvent}
          key={item.id}
          data={item}
          isEdit={isEdit}
          element={element}
          mode="modern"
          contentElement={
            isMobileDevice || isRooms || isAIAgentsFolder
              ? null
              : quickButtonsComponent
          }
          badgesComponent={
            !isMobileDevice || item.isTemplate ? badgesComponent : null
          }
          onSelect={onContentFileSelect}
          onContextClick={fileContextClick}
          isPrivacy={isPrivacy}
          onClick={onMouseClick}
          onDoubleClick={onDoubleClick}
          checked={checkedProps}
          contextOptions={item.contextOptions}
          contextButtonSpacerWidth={displayShareButton}
          dragging={dragging ? isDragging : null}
          isDragging={dragging}
          isIndexEditingMode={isIndexEditingMode}
          onChangeIndex={onChangeIndex}
          isActive={isActive}
          isBlockingOperation={isBlockingOperation}
          inProgress={inProgress}
          isThirdPartyFolder={item.isThirdPartyFolder}
          className="files-row"
          withAccess={withAccess}
          getContextModel={getContextModel}
          isRoom={item.isRoom}
          isArchive={item.isArchive}
          isDragOver={isDragActive}
          isSmallContainer={isSmallContainer}
          isRooms={isRooms}
          isAIAgentsFolder={isAIAgentsFolder}
          folderCategory={folderCategory}
          withoutBorder
          isHighlight={isHighlight}
          badgeUrl={badgeUrl}
          canDrag={canDrag}
          isFolder={isFolder}
          dataTestId={`files_row_${itemIndex}`}
        >
          <FilesRowContent
            item={item}
            sectionWidth={sectionWidth}
            onFilesClick={onFilesClickEvent}
            quickButtons={
              isMobileDevice || isRooms || isAIAgentsFolder
                ? quickButtonsComponent
                : null
            }
            isRooms={isRooms}
            isAIAgentsFolder={isAIAgentsFolder}
            badgesComponent={
              isMobileDevice && !item.isTemplate ? badgesComponent : null
            }
          />
        </FilesRow>
      </DragAndDrop>
    </FilesRowWrapper>
  );
}, equal);

export default withTranslation([
  "Files",
  "Translations",
  "InfoPanel",
  "Notifications",
])(withFileActions(withQuickButtons(withBadges(SimpleFilesRow))));
