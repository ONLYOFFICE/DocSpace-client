import React from "react";
import { inject, observer } from "mobx-react";

import { DeviceType, RoomsType } from "@docspace/shared/enums";
import Planet12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/planet.react.svg?url";

export default function withFileActions(WrappedFileItem) {
  class WithFileActions extends React.Component {
    constructor(props) {
      super(props);
    }

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
      const { onSelectItem } = this.props;
      const { id, isFolder } = this.props.item;

      id !== -1 && onSelectItem({ id, isFolder }, false, false, !withSelect);
    };

    onHideContextMenu = () => {
      //this.props.setSelected("none");
      this.props.setEnabledHotkeys(true);
    };

    onDropZoneUpload = (files, uploadToFolder) => {
      const { t, dragging, setDragging, startUpload, uploadEmptyFolders } =
        this.props;

      dragging && setDragging(false);

      const emptyFolders = files.filter((f) => f.isEmptyDirectory);

      if (emptyFolders.length > 0) {
        uploadEmptyFolders(emptyFolders, uploadToFolder).then(() => {
          const onlyFiles = files.filter((f) => !f.isEmptyDirectory);
          if (onlyFiles.length > 0) startUpload(onlyFiles, uploadToFolder, t);
        });
      } else {
        startUpload(files, uploadToFolder, t);
      }
    };

    onDrop = (items) => {
      const { isTrashFolder, dragging, setDragging, isDisabledDropItem } =
        this.props;
      const { fileExst, id } = this.props.item;

      if (isTrashFolder || isDisabledDropItem)
        return dragging && setDragging(false);

      if (!fileExst) {
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
        isPrivacy,
        isTrashFolder,
        isRoomsFolder,
        isArchiveFolder,
        item,
        setBufferSelection,
        isActive,
        inProgress,
        isSelected,
        setSelection,
        currentDeviceType,
        isDisabledItemId,
      } = this.props;

      const { isThirdPartyFolder } = item;

      const notSelectable = e.target.closest(".not-selectable");
      const isFileName =
        e.target.classList.contains("item-file-name") ||
        e.target.classList.contains("row-content-link");

      if ((isRoomsFolder || isArchiveFolder) && isFileName && !isSelected)
        setBufferSelection(item);

      if (
        isPrivacy ||
        isTrashFolder ||
        isRoomsFolder ||
        isArchiveFolder ||
        (!draggable && !isFileName && !isActive) ||
        currentDeviceType !== DeviceType.desktop ||
        notSelectable ||
        isThirdPartyFolder ||
        inProgress
      ) {
        return e;
      }

      const mouseButton = e.which
        ? e.which !== 1
        : e.button
          ? e.button !== 0
          : false;
      const label = e.currentTarget.getAttribute("label");
      if (mouseButton || e.currentTarget.tagName !== "DIV" || label) {
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
      const { viewAs, withCtrlSelect, withShiftSelect, item } = this.props;

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
        e.target?.tagName === "SPAN" ||
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
        setRoomType,
        isTrashFolder,
        isArchiveFolder,
      } = this.props;

      if (
        (e && e.target?.tagName === "INPUT") ||
        !!e.target.closest(".lock-file") ||
        // !!e.target.closest(".additional-badges") ||
        e.target.closest(".tag") ||
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

      openFileAction(item, t);
    };

    onSelectTag = (tag) => {
      this.props.selectTag(tag);
    };

    onSelectOption = (selectedOption) => {
      this.props.selectOption(selectedOption);
    };

    getContextModel = () => {
      const { getModel, item, t } = this.props;
      return getModel(item, t);
    };

    onDragOver = (e) => {
      if (
        e.dataTransfer.items.length > 0 &&
        e.dataTransfer.dropEffect !== "none"
      ) {
        this.props.setDragging(true);
      }
    };

    onDragLeave = (e) => {
      if (!e.relatedTarget || !e.dataTransfer.items.length) {
        this.props.setDragging(false);
      }
    };

    render() {
      const {
        item,
        isTrashFolder,
        draggable,
        allowShareIn,
        isPrivacy,

        sectionWidth,
        isSelected,
        dragging,
        isFolder,

        itemIndex,
        currentDeviceType,
        isDisabledDropItem,
        isRecentTab,
      } = this.props;
      const { access, id } = item;

      const isDragging =
        !isDisabledDropItem &&
        isFolder &&
        access < 2 &&
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

      const showPlanetIcon =
        (item.roomType === RoomsType.PublicRoom ||
          item.roomType === RoomsType.CustomRoom) &&
        item.shared;

      const badgeUrl = showPlanetIcon ? Planet12ReactSvgUrl : null;

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
          displayShareButton={displayShareButton}
          isPrivacy={isPrivacy}
          checkedProps={checkedProps}
          dragging={dragging}
          getContextModel={this.getContextModel}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          badgeUrl={badgeUrl}
          isRecentTab={isRecentTab}
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
      },
      { item, t },
    ) => {
      const {
        selectRowAction,
        selectTag,
        selectOption,
        onSelectItem,
        //setNewBadgeCount,
        openFileAction,
        uploadEmptyFolders,
      } = filesActionsStore;
      const { setSharingPanelVisible } = dialogsStore;
      const {
        isPrivacyFolder,
        isRecycleBinFolder,
        isRoomsFolder,
        isArchiveFolder,
        isRecentTab,
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
      const { startUpload } = uploadDataStore;

      const selectedItem = selection.find(
        (x) => x.id === item.id && x.fileExst === item.fileExst,
      );

      const isDisabledDropItem = !item.security.Create;

      const draggable =
        !isRecycleBinFolder && selectedItem && !isDisabledDropItem;

      const isFolder = selectedItem ? false : !item.isFolder ? false : true;

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
        dragging,
        setDragging,
        startUpload,
        uploadEmptyFolders,
        draggable,
        setTooltipPosition,
        setStartDrag,
        isFolder,
        allowShareIn: filesStore.canShare,

        isSelected: !!selectedItem,
        //parentFolder: selectedFolderStore.parentId,
        setParentId: selectedFolderStore.setParentId,
        setRoomType: selectedFolderStore.setRoomType,
        isTrashFolder: isRecycleBinFolder,
        getFolderInfo,
        viewAs,
        //setNewBadgeCount,
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
        isRecentTab,
      };
    },
  )(observer(WithFileActions));
}
