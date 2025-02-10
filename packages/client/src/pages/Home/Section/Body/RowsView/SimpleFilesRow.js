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

import React from "react";
import { withTranslation } from "react-i18next";
import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";
import { isMobile as isMobileUtile, classNames } from "@docspace/shared/utils";
import {
  StyledWrapper,
  StyledSimpleFilesRow,
} from "@docspace/shared/styles/FilesRow.styled";

import FilesRowContent from "./FilesRowContent";

import withFileActions from "../../../../../HOCs/withFileActions";
import withQuickButtons from "../../../../../HOCs/withQuickButtons";
import withBadges from "../../../../../HOCs/withBadges";
import ItemIcon from "../../../../../components/ItemIcon";

const SimpleFilesRow = (props) => {
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
    icon,
    isDownload,
  } = props;

  const isMobileDevice = isMobileUtile();

  const [isDragActive, setIsDragActive] = React.useState(false);

  const withAccess = item.security?.Lock;
  const isSmallContainer = sectionWidth <= 500;

  const onChangeIndex = (action) => {
    return changeIndex(action, item, t);
  };

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
      badgeUrl={badgeUrl}
    />
  );

  const onDragOverEvent = (dragActive, e) => {
    onDragOver && onDragOver(e);

    if (dragActive !== isDragActive) {
      setIsDragActive(dragActive);
    }
  };

  const onDragLeaveEvent = (e) => {
    onDragLeave && onDragLeave(e);

    setIsDragActive(false);
  };

  const dragStyles =
    dragging && isDragging
      ? {
          marginInline: "-16px",
          paddingInline: "16px",
        }
      : {};

  const idWithFileExst = item.fileExst
    ? `${item.id}_${item.fileExst}`
    : (item.id ?? "");

  return (
    <StyledWrapper
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
      showHotkeyBorder={showHotkeyBorder}
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
      >
        <StyledSimpleFilesRow
          key={item.id}
          data={item}
          isEdit={isEdit}
          element={element}
          mode="modern"
          sectionWidth={sectionWidth}
          contentElement={
            isMobileDevice || isRooms ? null : quickButtonsComponent
          }
          badgesComponent={!isMobileDevice ? badgesComponent : null}
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
          inProgress={
            inProgress && isFolder
              ? icon !== "duplicate" && icon !== "duplicate-room" && !isDownload
              : inProgress
          }
          isThirdPartyFolder={item.isThirdPartyFolder}
          className="files-row"
          withAccess={withAccess}
          getContextModel={getContextModel}
          isRoom={item.isRoom}
          isArchive={item.isArchive}
          isDragOver={isDragActive}
          isSmallContainer={isSmallContainer}
          isRooms={isRooms}
          folderCategory={folderCategory}
          withoutBorder
          isHighlight={isHighlight}
          badgeUrl={badgeUrl}
          canDrag={canDrag}
          isFolder={isFolder}
        >
          <FilesRowContent
            item={item}
            sectionWidth={sectionWidth}
            onFilesClick={onFilesClick}
            quickButtons={
              isMobileDevice || isRooms ? quickButtonsComponent : null
            }
            isRooms={isRooms}
            badgesComponent={isMobileDevice ? badgesComponent : null}
          />
        </StyledSimpleFilesRow>
      </DragAndDrop>
    </StyledWrapper>
  );
};

export default withTranslation([
  "Files",
  "Translations",
  "InfoPanel",
  "Notifications",
])(withFileActions(withQuickButtons(withBadges(SimpleFilesRow))));
