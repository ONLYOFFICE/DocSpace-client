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

import { useContext } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";

import Tile from "./sub-components/Tile";
import FilesTileContent from "./FilesTileContent";
import { FileTileContext } from "./FileTile.provider";
import {
  FileTile as FileTileComponent,
  FolderTile,
  RoomTile,
} from "@docspace/shared/components/tiles";
import { getRoomTypeName } from "SRC_DIR/helpers/filesUtils";

import withFileActions from "../../../../../HOCs/withFileActions";
import withQuickButtons from "../../../../../HOCs/withQuickButtons";
import ItemIcon from "../../../../../components/ItemIcon";
import withBadges from "../../../../../HOCs/withBadges";

const StyledDragAndDrop = styled(DragAndDrop)`
  border-radius: 6px;
`;

const FileTile = (props) => {
  const {
    item,
    dragging,
    onContentFileSelect,
    fileContextClick,
    onDrop,
    onMouseDown,
    className,
    isDragging,
    value,
    checkedProps,
    getIcon,
    onFilesClick,

    isActive,
    isEdit,
    inProgress,
    quickButtonsComponent,
    showHotkeyBorder,
    badgesComponent,
    t,
    getContextModel,
    onHideContextMenu,
    setSelection,
    id,
    onSelectTag,
    onSelectOption,
    withCtrlSelect,
    withShiftSelect,
    isHighlight,
    onDragOver,
    onDragLeave,
    badgeUrl,
    selectableRef,
    openUser,
    isBlockingOperation,
  } = props;

  const navigate = useNavigate();

  const { columnCount, thumbSize } = useContext(FileTileContext);

  const temporaryExtension =
    item.id === -1 ? `.${item.fileExst}` : item.fileExst;

  const temporaryIcon = getIcon(
    96,
    temporaryExtension,
    item.providerKey,
    item.contentLength,
  );

  const { thumbnailUrl } = item;

  const element = (
    <ItemIcon
      id={item.id}
      icon={item.icon}
      fileExst={item.fileExst}
      isRoom={item.isRoom}
      showDefault={
        !(!!item?.logo?.cover || !!item?.logo?.medium) ? item.isRoom : null
      }
      title={item.title}
      logo={item.logo}
      color={item.logo?.color}
      isArchive={item.isArchive}
      isTemplate={item.isTemplate}
      badgeUrl={badgeUrl}
    />
  );

  const activeClass = checkedProps || isActive ? "tile-selected" : "";

  const onDragOverEvent = (_, e) => {
    onDragOver && onDragOver(e);
  };

  const onDragLeaveEvent = (e) => {
    onDragLeave && onDragLeave(e);
  };

  const onOpenUser = () => {
    openUser(item.createdBy, navigate);
  };

  const tileContent = (
    <FilesTileContent t={t} item={item} onFilesClick={onFilesClick} />
  );

  const commonProps = {
    key: item.id,
    item,
    element,
    onSelect: onContentFileSelect,
    tileContextClick: fileContextClick,
    isDragging: dragging,
    dragging: dragging ? isDragging : null,
    checked: checkedProps,
    contextOptions: item.contextOptions,
    isActive,
    inProgress,
    isBlockingOperation,
    isEdit,
    getContextModel,
    hideContextMenu: onHideContextMenu,
    showHotkeyBorder,
    setSelection,
    withCtrlSelect,
    withShiftSelect,
    isHighlight,
    badges: badgesComponent,
    children: tileContent,
  };

  const fileTile = (
    <FileTileComponent
      {...commonProps}
      temporaryIcon={temporaryIcon}
      thumbnail={thumbnailUrl}
      thumbSize={thumbSize}
      contentElement={quickButtonsComponent}
      thumbnailClick={onFilesClick}
    />
  );

  const folderTile = <FolderTile {...commonProps} />;

  const roomTile = (
    <RoomTile
      {...commonProps}
      selectTag={onSelectTag}
      selectOption={onSelectOption}
      columnCount={columnCount}
      thumbnailClick={onFilesClick}
      getRoomTypeName={getRoomTypeName}
    />
  );

  const renderTile = () => {
    if (item.isRoom) return roomTile;
    if (item.isFolder) return folderTile;
    return fileTile;
  };

  return (
    <div ref={selectableRef} id={id}>
      <StyledDragAndDrop
        data-title={item.title}
        value={value}
        className={`files-item ${className} ${activeClass} ${item.id}_${item.fileExst}`}
        onDrop={onDrop}
        onMouseDown={onMouseDown}
        dragging={dragging ? isDragging : null}
        onDragOver={onDragOverEvent}
        onDragLeave={onDragLeaveEvent}
        contextOptions={item.contextOptions}
      >
        {renderTile()}
      </StyledDragAndDrop>
    </div>
  );
};

export default inject(
  (
    { filesSettingsStore, filesStore, treeFoldersStore, infoPanelStore },
    { item },
  ) => {
    const { getIcon } = filesSettingsStore;
    const { setSelection, withCtrlSelect, withShiftSelect, highlightFile } =
      filesStore;

    const isHighlight =
      highlightFile.id == item?.id && highlightFile.isExst === !item?.fileExst;

    const { isRoomsFolder, isArchiveFolder, isTemplatesFolder } =
      treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder || isTemplatesFolder;

    return {
      getIcon,
      setSelection,
      isRooms,
      withCtrlSelect,
      withShiftSelect,
      isHighlight,
      openUser: infoPanelStore.openUser,
    };
  },
)(
  withTranslation(["Files", "InfoPanel", "Notifications"])(
    withFileActions(withBadges(withQuickButtons(observer(FileTile)))),
  ),
);
