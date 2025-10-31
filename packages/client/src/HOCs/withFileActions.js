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
import { inject, observer } from "mobx-react";

import { DeviceType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import { isMobile } from "react-device-detect";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

export default function withFileActions(WrappedFileItem) {
  class WithFileActions extends React.Component {
    onContentFileSelect = (checked, file) => {
      const { selectRowAction } = this.props;
      if (!file || file.id === -1) return;
      selectRowAction(checked, file);
    };

    fileContextClick = () => {
      const { onSelectItem, item } = this.props;
      const { id, isFolder } = item;

      id !== -1 && onSelectItem({ id, isFolder }, true, false);
    };

    onFileContextClick = (withSelect) => {
      const { onSelectItem, item } = this.props;
      const { id, isFolder } = item;

      id !== -1 && onSelectItem({ id, isFolder }, false, false, !withSelect);
    };

    onHideContextMenu = () => {
      const { setEnabledHotkeys } = this.props;
      // this.props.setSelected("none");
      setEnabledHotkeys(true);
    };

    onDropZoneUpload = (files, uploadToFolder) => {
      const { t, dragging, setDragging, startUpload, createFoldersTree } =
        this.props;

      const dragged = dragging;

      dragging && setDragging(false);

      createFoldersTree(t, files, uploadToFolder, dragged)
        .then((f) => {
          if (f.length > 0) startUpload(f, uploadToFolder, t);
        })
        .catch((err) => {
          toastr.error(err, null, 0, true);
        });
    };

    onDrop = (items) => {
      const {
        isTrashFolder,
        dragging,
        setDragging,
        isDisabledDropItem,
        item,
        isRecentFolder,
      } = this.props;
      const { fileExst, isFolder, id } = item;

      if (isTrashFolder || isRecentFolder || isDisabledDropItem)
        return dragging && setDragging(false);
      if (!fileExst && isFolder) {
        this.onDropZoneUpload(items, id);
      } else {
        this.onDropZoneUpload(items);
      }
    };

    onMouseDown = (e) => {
      const {
        draggable,
        setTooltipPosition,
        setStartDrag,
        isRoomsFolder,
        isArchiveFolder,
        item,
        setBufferSelection,
        isActive,
        isSelected,
        setSelection,
        canDrag,
        viewAs,
        isIndexEditingMode,
        withContentSelection,
      } = this.props;

      if (withContentSelection) return;

      if (isIndexEditingMode) {
        if (
          e.target.closest(".change-index_icon") ||
          e.target.querySelector(".change-index_icon") ||
          isMobile
        ) {
          return;
        }

        setBufferSelection(item);
        setStartDrag(true);
        return;
      }

      const { isThirdPartyFolder } = item;

      const notSelectable = e.target.closest(".not-selectable");
      const isFileName =
        e.target.classList.contains("item-file-name") ||
        e.target.classList.contains("row-content-link") ||
        viewAs === "tile";

      if ((isRoomsFolder || isArchiveFolder) && isFileName && !isSelected)
        setBufferSelection(item);

      if (
        (!canDrag ||
          (!draggable && !isFileName && !isActive) ||
          notSelectable ||
          isThirdPartyFolder) &&
        e.button !== 1
      ) {
        return e;
      }

      const mouseButton = e.which
        ? e.which !== 1
        : e.button
          ? e.button !== 0 && e.button !== 2
          : false;
      const label = e.currentTarget.getAttribute("label");
      if (mouseButton || e.currentTarget.tagName !== "DIV" || label) {
        const canWebEdit = item.viewAccessibility?.WebEdit;
        const canViewedDocs = item.viewAccessibility?.WebView;
        if (
          (item?.isPlugin || !(canWebEdit || canViewedDocs)) &&
          !item?.isFolder
        )
          return this.onFilesClick(e);
        return e;
      }

      e.preventDefault();
      setTooltipPosition(e.pageX, e.pageY);
      setStartDrag(true);

      if (isFileName && !isSelected) {
        setSelection([]);
        setBufferSelection(item);
      }
    };

    onMouseClick = (e) => {
      const {
        viewAs,
        withCtrlSelect,
        withShiftSelect,
        item,
        withContentSelection,
      } = this.props;

      if (withContentSelection) return;

      if (e.ctrlKey || e.metaKey) {
        withCtrlSelect(item);
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        withShiftSelect(item);
        e.preventDefault();
        return;
      }

      if (
        e.target?.tagName === "INPUT" ||
        // e.target?.tagName === "SPAN" ||
        e.target?.tagName === "A" ||
        e.target.closest(".checkbox") ||
        e.target.closest(".table-container_row-checkbox") ||
        e.button !== 0 ||
        e.target.closest(".expandButton") ||
        e.target.querySelector(".expandButton") ||
        e.target.closest(".badges") ||
        e.target.closest(".not-selectable") ||
        e.target.closest(".tag")
      )
        return;

      if (viewAs === "tile") {
        if (e.target.closest(".edit-button") || e.target?.tagName === "IMG")
          return;
        if (e.detail === 1) this.fileContextClick();
      } else this.fileContextClick();
    };

    onDoubleClick = (e) => {
      if (e.ctrlKey || e.shiftKey) {
        return e;
      }

      this.onFilesClick(e);
    };

    onFilesClick = (e) => {
      const {
        t,
        item,
        openFileAction,
        setParentId,
        isTrashFolder,
        isNewBadgePanelVisible,
      } = this.props;

      if (
        (e && e.target?.tagName === "INPUT") ||
        !!e.target.closest(".lock-file") ||
        // !!e.target.closest(".additional-badges") ||
        e.target.closest(".tag") ||
        e.target.closest(".mainIcons") ||
        isNewBadgePanelVisible ||
        isTrashFolder
      )
        return;

      e.preventDefault();

      if (
        item.isFolder &&
        item.parentId !== 0 &&
        item.filesCount === 0 &&
        item.foldersCount === 0
      ) {
        setParentId(item.parentId);
        // setRoomType(item.roomType);
      }

      openFileAction(item, t, e);
    };

    onSelectTag = (tag) => {
      const { selectTag } = this.props;
      selectTag(tag);
    };

    onSelectOption = (selectedOption) => {
      const { selectOption } = this.props;
      selectOption(selectedOption);
    };

    getContextModel = () => {
      const { getModel, item, t } = this.props;
      return getModel(item, t);
    };

    onDragOver = (e) => {
      const { setDragging } = this.props;

      const hasFiles =
        e.dataTransfer.types.includes("Files") ||
        e.dataTransfer.types.includes("application/x-moz-file");

      if (hasFiles && e.dataTransfer.dropEffect !== "none") {
        setDragging(true);
      }
    };

    onDragLeave = (e) => {
      const { setDragging } = this.props;

      const hasFiles =
        e.dataTransfer.types.includes("Files") ||
        e.dataTransfer.types.includes("application/x-moz-file");

      if (!e.relatedTarget || !hasFiles) {
        setDragging(false);
      }
    };

    render() {
      const {
        item,
        isTrashFolder,
        draggable,
        allowShareIn,
        isPrivacy,

        isSelected,
        dragging,
        isFolder,

        itemIndex,
        currentDeviceType,
        isDisabledDropItem,
        isRecentFolder,
        canDrag,
        isIndexUpdated,
      } = this.props;

      const { id, security } = item;

      const isDragging =
        !isDisabledDropItem &&
        isFolder &&
        security?.MoveTo &&
        !isTrashFolder &&
        !isPrivacy;

      let className = isDragging ? " droppable" : "";
      if (draggable) className += " draggable";

      let value = item.isFolder
        ? `folder_${id}`
        : item.isDash
          ? `dash_${id}`
          : `file_${id}`;
      value += draggable ? "_draggable" : "_false";

      value += `_index_${itemIndex}`;

      const isShareable = allowShareIn && item.canShare;

      const isMobileView = currentDeviceType === DeviceType.mobile;

      const displayShareButton = isMobileView
        ? "26px"
        : !isShareable
          ? "38px"
          : "96px";

      const checkedProps = id <= 0 ? false : isSelected;

      const badgeUrl = getRoomBadgeUrl(item);

      return (
        <WrappedFileItem
          onContentFileSelect={this.onContentFileSelect}
          fileContextClick={this.onFileContextClick}
          onDrop={this.onDrop}
          onMouseDown={this.onMouseDown}
          onFilesClick={this.onFilesClick}
          onDoubleClick={this.onDoubleClick}
          onMouseClick={this.onMouseClick}
          onHideContextMenu={this.onHideContextMenu}
          onSelectTag={this.onSelectTag}
          onSelectOption={this.onSelectOption}
          getClassName={this.getClassName}
          className={className}
          isDragging={isDragging}
          value={value}
          documentTitle={item.title}
          displayShareButton={displayShareButton}
          isPrivacy={isPrivacy}
          isIndexUpdated={isIndexUpdated}
          checkedProps={checkedProps}
          dragging={dragging}
          getContextModel={this.getContextModel}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          badgeUrl={badgeUrl}
          isRecentFolder={isRecentFolder}
          canDrag={canDrag}
          {...this.props}
        />
      );
    }
  }

  return inject(
    (
      {
        settingsStore,
        filesActionsStore,
        dialogsStore,
        treeFoldersStore,
        selectedFolderStore,
        filesStore,
        uploadDataStore,
        contextOptionsStore,
        indexingStore,
        hotkeyStore,
      },
      { item, t },
    ) => {
      const {
        selectRowAction,
        selectTag,
        selectOption,
        onSelectItem,
        // setNewBadgeCount,
        openFileAction,
        createFoldersTree,
      } = filesActionsStore;
      const { setSharingPanelVisible, newFilesPanelFolderId } = dialogsStore;
      const { updateSelection, isIndexEditingMode } = indexingStore;
      const {
        isPrivacyFolder,
        isRecycleBinFolder,
        isRoomsFolder,
        isArchiveFolder,
        isTemplatesFolder,
        isRecentFolder,
        isAIAgentsFolder,
      } = treeFoldersStore;
      const {
        dragging,
        setDragging,
        selection,
        setSelection,
        setTooltipPosition,
        setStartDrag,

        getFolderInfo,
        viewAs,
        bufferSelection,
        setBufferSelection,
        hotkeyCaret,
        activeFiles,
        activeFolders,
        setEnabledHotkeys,
        setSelected,
        withCtrlSelect,
        withShiftSelect,
      } = filesStore;
      const { id } = selectedFolderStore;
      const { startUpload, secondaryProgressDataStore } = uploadDataStore;
      const { withContentSelection } = hotkeyStore;
      const { findOperationById } = secondaryProgressDataStore;

      const selectedItem = selection.find(
        (x) => x.id === item.id && x.fileExst === item.fileExst,
      );

      const isIndexUpdated = !!updateSelection.find(
        (x) => x.id === item.id && x.fileExst === item?.fileExst,
      );

      const isDisabledDropItem = item.security?.Create === false;

      const draggable =
        !isRecycleBinFolder && selectedItem && !isDisabledDropItem;

      const isFolder = selectedItem ? false : !!item.isFolder;

      const isProgress = (index, items) => {
        if (index === -1) return false;
        const destFolderId = items[index].destFolderId;

        if (!destFolderId) return true;

        return destFolderId != id;
      };

      const activeFileIndex = activeFiles.findIndex(
        (x) =>
          x.id === item.id &&
          (Boolean(item.fileExst) || item.fileType !== undefined),
      );
      const activeFolderIndex = activeFolders.findIndex(
        (x) =>
          x.id === item.id &&
          (item.isFolder || (!item.fileExst && item.id === -1)),
      );

      const isFileProgress = isProgress(activeFileIndex, activeFiles);
      const isFolderProgress = isProgress(activeFolderIndex, activeFolders);

      const inProgress = isFileProgress || isFolderProgress;

      let isBlockingOperation = inProgress;

      if (inProgress && activeFolderIndex !== -1) {
        const operationInfo = findOperationById(item.id);
        const { operation } = operationInfo;
        isBlockingOperation =
          operation !== OPERATIONS_NAME.duplicate &&
          operation !== OPERATIONS_NAME.download &&
          operation !== OPERATIONS_NAME.copy;
      }

      const dragIsDisabled =
        isPrivacyFolder ||
        isRecycleBinFolder ||
        isRoomsFolder ||
        isArchiveFolder ||
        isTemplatesFolder ||
        isRecentFolder ||
        inProgress ||
        isAIAgentsFolder ||
        isMobile;

      let isActive = false;

      if (
        bufferSelection &&
        bufferSelection.id === item.id &&
        bufferSelection.fileExst === item.fileExst &&
        !selection.length
      )
        isActive = true;

      const showHotkeyBorder =
        hotkeyCaret?.id === item.id && hotkeyCaret?.isFolder === item.isFolder;

      return {
        t,
        item,
        selectRowAction,
        onSelectItem,
        selectTag,
        selectOption,
        setSharingPanelVisible,
        isPrivacy: isPrivacyFolder,
        isRoomsFolder,
        isArchiveFolder,
        isTemplatesFolder,
        dragging,
        setDragging,
        startUpload,
        createFoldersTree,
        draggable,
        setTooltipPosition,
        setStartDrag,
        isFolder,
        allowShareIn: filesStore.canShare,

        isSelected: !!selectedItem,
        // parentFolder: selectedFolderStore.parentId,
        setParentId: selectedFolderStore.setParentId,
        setRoomType: selectedFolderStore.setRoomType,
        isTrashFolder: isRecycleBinFolder,
        getFolderInfo,
        viewAs,
        // setNewBadgeCount,
        isActive,
        inProgress,
        setBufferSelection,
        getModel: contextOptionsStore.getModel,
        showHotkeyBorder,
        openFileAction,
        setEnabledHotkeys,
        setSelected,
        withCtrlSelect,
        withShiftSelect,

        setSelection,
        currentDeviceType: settingsStore.currentDeviceType,
        isDisabledDropItem,
        isRecentFolder,
        isIndexUpdated,

        canDrag: !dragIsDisabled,
        isIndexEditingMode,
        isBlockingOperation,

        withContentSelection,

        isNewBadgePanelVisible:
          newFilesPanelFolderId === item.id &&
          item.isFolder &&
          settingsStore.currentDeviceType === DeviceType.mobile,
      };
    },
  )(observer(WithFileActions));
}
