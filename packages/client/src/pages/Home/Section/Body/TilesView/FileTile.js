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

import { useContext } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";
// import { Context } from "@docspace/shared/utils";

import Tile from "./sub-components/Tile";
import FilesTileContent from "./FilesTileContent";
import { FileTileContext } from "./FileTile.provider";

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
    displayShareButton,
    isPrivacy,
    checkedProps,
    getIcon,
    onFilesClick,
    onDoubleClick,

    isActive,
    isEdit,
    inProgress,
    quickButtonsComponent,
    showHotkeyBorder,
    badgesComponent,
    t,
    getContextModel,
    onHideContextMenu,
    // thumbSize,
    setSelection,
    id,
    onSelectTag,
    onSelectOption,
    // columnCount,
    isRooms,
    withCtrlSelect,
    withShiftSelect,
    isHighlight,
    onDragOver,
    onDragLeave,
    badgeUrl,
    icon,
    isDownload,
    selectableRef,
  } = props;

  // const { sectionWidth } = useContext(Context);

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
        !(!!item?.logo?.cover || !!item?.logo?.medium) && item.isRoom
      }
      title={item.title}
      logo={item.logo}
      color={item.logo?.color}
      isArchive={item.isArchive}
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

  return (
    <div ref={selectableRef} id={id}>
      <StyledDragAndDrop
        data-title={item.title}
        value={value}
        className={`files-item ${className} ${activeClass} ${item.id}_${item.fileExst}`}
        onDrop={onDrop}
        onMouseDown={onMouseDown}
        dragging={dragging && isDragging}
        onDragOver={onDragOverEvent}
        onDragLeave={onDragLeaveEvent}
        contextOptions={item.contextOptions}
      >
        <Tile
          key={item.id}
          item={item}
          temporaryIcon={temporaryIcon}
          thumbnail={
            thumbnailUrl && thumbSize
              ? `${thumbnailUrl}&size=${thumbSize}`
              : thumbnailUrl
          }
          element={element}
          // sectionWidth={sectionWidth}
          contentElement={quickButtonsComponent}
          onSelect={onContentFileSelect}
          tileContextClick={fileContextClick}
          isPrivacy={isPrivacy}
          isDragging={dragging}
          dragging={dragging && isDragging}
          // onClick={onMouseClick}
          thumbnailClick={onFilesClick}
          onDoubleClick={onDoubleClick}
          checked={checkedProps}
          contextOptions={item.contextOptions}
          contextButtonSpacerWidth={displayShareButton}
          isActive={isActive}
          inProgress={inProgress}
          isEdit={isEdit}
          getContextModel={getContextModel}
          hideContextMenu={onHideContextMenu}
          t={t}
          showHotkeyBorder={showHotkeyBorder}
          setSelection={setSelection}
          selectTag={onSelectTag}
          selectOption={onSelectOption}
          columnCount={columnCount}
          isRooms={isRooms}
          withCtrlSelect={withCtrlSelect}
          withShiftSelect={withShiftSelect}
          isHighlight={isHighlight}
          iconProgress={icon}
          isDownload={isDownload}
        >
          <FilesTileContent
            item={item}
            // sectionWidth={sectionWidth}
            onFilesClick={onFilesClick}
          />
          {badgesComponent}
        </Tile>
      </StyledDragAndDrop>
    </div>
  );
};

export default inject(
  (
    { filesSettingsStore, filesStore, treeFoldersStore, uploadDataStore },
    { item },
  ) => {
    const { getIcon } = filesSettingsStore;
    const { setSelection, withCtrlSelect, withShiftSelect, highlightFile } =
      filesStore;
    const { icon, isDownload } = uploadDataStore.secondaryProgressDataStore;

    const isHighlight =
      highlightFile.id == item?.id && highlightFile.isExst === !item?.fileExst;

    const { isRoomsFolder, isArchiveFolder } = treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;

    return {
      getIcon,
      setSelection,
      isRooms,
      withCtrlSelect,
      withShiftSelect,
      isHighlight,
      icon,
      isDownload,
    };
  },
)(
  withTranslation(["Files", "InfoPanel", "Notifications"])(
    withFileActions(withBadges(withQuickButtons(observer(FileTile)))),
  ),
);
