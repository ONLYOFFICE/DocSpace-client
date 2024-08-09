// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useState } from "react";
import withContent from "../../../../../HOCs/withContent";
import withBadges from "../../../../../HOCs/withBadges";
import withQuickButtons from "../../../../../HOCs/withQuickButtons";
import withFileActions from "../../../../../HOCs/withFileActions";
import ItemIcon from "../../../../../components/ItemIcon";
import { withTranslation } from "react-i18next";
import { classNames } from "@docspace/shared/utils";
import RoomsRowDataComponent from "./sub-components/RoomsRowData";
import TrashRowDataComponent from "./sub-components/TrashRowData";
import RecentRowDataComponent from "./sub-components/RecentRowData";
import RowDataComponent from "./sub-components/RowData";
import { StyledTableRow, StyledDragAndDrop } from "./StyledTable";

const FilesTableRow = (props) => {
  const {
    t,
    fileContextClick,
    item,
    checkedProps,
    className,
    value,
    onMouseClick,
    dragging,
    isDragging,
    onDrop,
    onMouseDown,
    isActive,
    onHideContextMenu,
    onFilesClick,
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
    isTrashFolder,
    isHighlight,
    hideColumns,
    onDragOver,
    onDragLeave,
    badgeUrl,
    isRecentTab,
    canDrag,
    displayFileExtension,
  } = props;
  const { acceptBackground, background } = theme.dragAndDrop;

  const element = (
    <ItemIcon
      id={item.id}
      icon={item.icon}
      fileExst={item.fileExst}
      isRoom={item.isRoom}
      title={item.title}
      logo={item.logo}
      color={item.logo?.color}
      isArchive={item.isArchive}
      badgeUrl={badgeUrl}
    />
  );

  const selectionProp = {
    className: `files-item ${className} ${value}`,
    value,
  };

  const [isDragActive, setIsDragActive] = useState(false);

  const dragStyles = {
    style: {
      background:
        dragging && isDragging
          ? isDragActive
            ? acceptBackground
            : background
          : "none",
    },
  };

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

  React.useEffect(() => {
    if (index === 0) {
      if (checkedProps || isActive) {
        setFirsElemChecked(true);
      } else {
        setFirsElemChecked(false);
      }
      if (showHotkeyBorder) {
        setHeaderBorder(true);
      } else {
        setHeaderBorder(false);
      }
    }
  }, [checkedProps, isActive, showHotkeyBorder]);

  const idWithFileExst = item.fileExst
    ? `${item.id}_${item.fileExst}`
    : item.id ?? "";

  return (
    <StyledDragAndDrop
      id={id}
      data-title={item.title}
      value={value}
      className={classNames("files-item", className, idWithFileExst, {
        ["table-hotkey-border"]: showHotkeyBorder,
        ["table-row-selected"]: !showHotkeyBorder && (checkedProps || isActive),
      })}
      onDrop={onDrop}
      onMouseDown={onMouseDown}
      dragging={dragging && isDragging}
      onDragOver={onDragOverEvent}
      onDragLeave={onDragLeaveEvent}
    >
      <StyledTableRow
        className="table-row"
        {...dragStyles}
        isDragging={dragging}
        dragging={dragging && isDragging}
        selectionProp={selectionProp}
        key={item.id}
        fileContextClick={fileContextClick}
        onClick={onMouseClick}
        isActive={isActive}
        inProgress={inProgress}
        isFolder={item.isFolder}
        onHideContextMenu={onHideContextMenu}
        isThirdPartyFolder={item.isThirdPartyFolder}
        onDoubleClick={onDoubleClick}
        checked={checkedProps}
        contextOptions={item.contextOptions}
        getContextModel={getContextModel}
        showHotkeyBorder={showHotkeyBorder}
        displayFileExtension={displayFileExtension}
        title={
          item.isFolder
            ? t("Translations:TitleShowFolderActions")
            : t("Translations:TitleShowActions")
        }
        isRoom={item.isRoom}
        isHighlight={isHighlight}
        hideColumns={hideColumns}
        badgeUrl={badgeUrl}
        canDrag={canDrag}
      >
        {isRooms ? (
          <RoomsRowDataComponent
            element={element}
            dragStyles={dragStyles}
            {...props}
          />
        ) : isTrashFolder ? (
          <TrashRowDataComponent
            element={element}
            dragStyles={dragStyles}
            {...props}
          />
        ) : isRecentTab ? (
          <RecentRowDataComponent
            element={element}
            dragStyles={dragStyles}
            selectionProp={selectionProp}
            {...props}
          />
        ) : (
          <RowDataComponent
            element={element}
            dragStyles={dragStyles}
            selectionProp={selectionProp}
            {...props}
          />
        )}
      </StyledTableRow>
    </StyledDragAndDrop>
  );
};

export default withTranslation([
  "Files",
  "Common",
  "InfoPanel",
  "Notifications",
])(withFileActions(withContent(withQuickButtons(withBadges(FilesTableRow)))));
