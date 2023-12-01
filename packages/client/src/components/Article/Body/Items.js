import PropTypes from "prop-types";
import styled from "styled-components";
import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import {
  FolderType,
  ShareAccessRights,
  FolderNames,
  DeviceType,
} from "@docspace/common/constants";
import { getCatalogIconUrlByType } from "@docspace/common/utils/catalogIcon.helper";

import CatalogItem from "@docspace/components/catalog-item";
import DragAndDrop from "@docspace/components/drag-and-drop";

import BonusItem from "./BonusItem";
import AccountsItem from "./AccountsItem";

import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";

const StyledDragAndDrop = styled(DragAndDrop)`
  display: contents;
`;

const CatalogDivider = styled.div`
  height: 16px;
`;

const Item = ({
  t,
  item,
  dragging,
  getFolderIcon,
  setBufferSelection,
  isActive,
  getEndOfBlock,
  showText,
  onClick,
  onMoveTo,
  onBadgeClick,
  showDragItems,
  startUpload,
  uploadEmptyFolders,
  setDragging,
  showBadge,
  labelBadge,
  iconBadge,
  folderId,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const isDragging = dragging ? showDragItems(item) : false;

  let value = "";
  if (isDragging) value = `${item.id} dragging`;

  const onDropZoneUpload = React.useCallback(
    (files, uploadToFolder) => {
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
    },
    [t, dragging, setDragging, startUpload, uploadEmptyFolders]
  );

  const onDrop = React.useCallback(
    (items) => {
      if (!isDragging) return dragging && setDragging(false);

      const { fileExst, id } = item;

      if (!fileExst) {
        onDropZoneUpload(items, id);
      } else {
        onDropZoneUpload(items);
      }
    },
    [item, startUpload, dragging, setDragging]
  );

  const onDragOver = React.useCallback(
    (dragActive) => {
      if (dragActive !== isDragActive) {
        setIsDragActive(dragActive);
      }
    },
    [isDragActive]
  );

  const onDragLeave = React.useCallback(() => {
    setIsDragActive(false);
  }, []);

  const onClickAction = React.useCallback(
    (folderId) => {
      setBufferSelection(null);
      onClick && onClick(folderId, item.title, item.rootFolderType);
    },
    [onClick, item.title, item.rootFolderType]
  );

  return (
    <StyledDragAndDrop
      key={item.id}
      data-title={item.title}
      value={value}
      onDrop={onDrop}
      dragging={dragging && isDragging}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={"document-catalog"}
    >
      <CatalogItem
        key={item.id}
        id={item.id}
        folderId={folderId}
        className={`tree-drag ${item.folderClassName} document-catalog`}
        icon={getFolderIcon(item)}
        showText={showText}
        text={item.title}
        isActive={isActive}
        onClick={onClickAction}
        onDrop={onMoveTo}
        isEndOfBlock={getEndOfBlock(item)}
        isDragging={isDragging}
        isDragActive={isDragActive && isDragging}
        value={value}
        showBadge={showBadge}
        labelBadge={labelBadge}
        onClickBadge={onBadgeClick}
        iconBadge={iconBadge}
        badgeTitle={t("RecycleBinAction")}
      />
    </StyledDragAndDrop>
  );
};

const Items = ({
  t,
  data,
  showText,

  onClick,
  onBadgeClick,

  dragging,
  setDragging,
  startUpload,
  uploadEmptyFolders,
  isVisitor,
  isCollaborator,
  isAdmin,
  myId,
  commonId,
  currentId,
  draggableItems,
  setBufferSelection,

  moveDragItems,

  docSpace,

  setEmptyTrashDialogVisible,
  trashIsEmpty,

  onHide,
  firstLoad,
  deleteAction,
  startDrag,

  activeItemId,
  emptyTrashInProgress,

  isCommunity,
  isPaymentPageAvailable,
  currentDeviceType,
  folderAccess,
}) => {
  const getEndOfBlock = React.useCallback(
    (item) => {
      switch (item.key) {
        case "0-3":
        case "0-5":
        case "0-6":
          return true;
        default:
          return false;
      }
    },
    [docSpace]
  );

  const getFolderIcon = React.useCallback((item) => {
    return getCatalogIconUrlByType(item.rootFolderType);
  }, []);

  const showDragItems = React.useCallback(
    (item) => {
      if (item.id === currentId) {
        return false;
      }

      if (
        !draggableItems ||
        draggableItems.find(
          (x) => x.id === item.id && x.isFolder === item.isFolder
        )
      )
        return false;

      const isArchive = draggableItems.find(
        (f) => f.rootFolderType === FolderType.Archive
      );

      if (
        item.rootFolderType === FolderType.SHARE &&
        item.access === ShareAccessRights.FullAccess
      ) {
        return true;
      }

      if (
        (item.rootFolderType === FolderType.TRASH && startDrag && !isArchive) ||
        item.rootFolderType === FolderType.USER
      ) {
        return (
          folderAccess === ShareAccessRights.None ||
          folderAccess === ShareAccessRights.FullAccess ||
          folderAccess === ShareAccessRights.RoomManager
        );
      }

      if (isAdmin) {
        if (
          (item.pathParts &&
            (item.pathParts[0].id === myId ||
              item.pathParts[0].id === commonId)) ||
          item.rootFolderType === FolderType.COMMON
        ) {
          return true;
        }
      } else {
        if (item.pathParts && item.pathParts[0].id === myId) {
          return true;
        }
      }

      return false;
    },
    [currentId, draggableItems, isAdmin]
  );

  const onMoveTo = React.useCallback(
    (destFolderId, title) => {
      moveDragItems(destFolderId, title, {
        copy: t("Translations:CopyOperation"),
        move: t("Translations:MoveToOperation"),
      });
    },
    [moveDragItems, t]
  );

  const onRemove = React.useCallback(() => {
    const translations = {
      deleteOperation: t("Translations:DeleteOperation"),
      deleteFromTrash: t("Translations:DeleteFromTrash"),
      deleteSelectedElem: t("Translations:DeleteSelectedElem"),
      FileRemoved: t("Files:FileRemoved"),
      FolderRemoved: t("Files:FolderRemoved"),
    };

    deleteAction(translations);
  }, [deleteAction]);

  const onEmptyTrashAction = () => {
    currentDeviceType === DeviceType.mobile && onHide();
    setEmptyTrashDialogVisible(true);
  };

  const getItems = React.useCallback(
    (data) => {
      const items = data.map((item, index) => {
        const isTrash = item.rootFolderType === FolderType.TRASH;
        const showBadge = emptyTrashInProgress
          ? false
          : item.newItems
          ? item.newItems > 0 && true
          : isTrash && !trashIsEmpty;
        const labelBadge = showBadge ? item.newItems : null;
        const iconBadge = isTrash ? ClearTrashReactSvgUrl : null;

        return (
          <Item
            key={`${item.id}_${index}`}
            t={t}
            setDragging={setDragging}
            startUpload={startUpload}
            uploadEmptyFolders={uploadEmptyFolders}
            item={item}
            setBufferSelection={setBufferSelection}
            dragging={dragging}
            getFolderIcon={getFolderIcon}
            isActive={item.id === activeItemId}
            getEndOfBlock={getEndOfBlock}
            showText={showText}
            onClick={onClick}
            onMoveTo={isTrash ? onRemove : onMoveTo}
            onBadgeClick={isTrash ? onEmptyTrashAction : onBadgeClick}
            showDragItems={showDragItems}
            showBadge={showBadge}
            labelBadge={labelBadge}
            iconBadge={iconBadge}
            folderId={`document_catalog-${FolderNames[item.rootFolderType]}`}
          />
        );
      });

      /*if (!firstLoad && !isVisitor)
        items.splice(
          3,
          0,
          <SettingsItem
            key="settings-item"
            onClick={onClick}
            isActive={activeItemId === "settings"}
          />
        );*/
      if (!isVisitor && !isCollaborator)
        items.splice(
          3,
          0,
          <AccountsItem
            key="accounts-item"
            onClick={onClick}
            isActive={activeItemId === "accounts"}
          />
        );

      if (!isVisitor) items.splice(3, 0, <CatalogDivider key="other-header" />);
      else items.splice(2, 0, <CatalogDivider key="other-header" />);

      if (isCommunity && isPaymentPageAvailable)
        items.push(<BonusItem key="bonus-item" />);

      return items;
    },
    [
      t,
      dragging,
      getFolderIcon,
      onClick,
      onMoveTo,
      getEndOfBlock,
      onBadgeClick,
      showDragItems,
      showText,
      setDragging,
      startUpload,
      uploadEmptyFolders,
      trashIsEmpty,
      isAdmin,
      isVisitor,
      firstLoad,
      activeItemId,
      emptyTrashInProgress,
    ]
  );

  return <>{getItems(data)}</>;
};

Items.propTypes = {
  data: PropTypes.array,
  showText: PropTypes.bool,
  onClick: PropTypes.func,
  onClickBadge: PropTypes.func,
  onHide: PropTypes.func,
};

export default inject(
  ({
    auth,
    treeFoldersStore,
    selectedFolderStore,
    filesStore,
    filesActionsStore,
    uploadDataStore,
    dialogsStore,
    clientLoadingStore,
  }) => {
    const {
      settingsStore,
      isCommunity,
      isPaymentPageAvailable,
      currentDeviceType,
    } = auth;
    const { showText, docSpace } = settingsStore;

    const {
      selection,
      bufferSelection,
      setBufferSelection,
      dragging,
      setDragging,
      trashIsEmpty,

      startDrag,
    } = filesStore;

    const { firstLoad } = clientLoadingStore;

    const { startUpload } = uploadDataStore;

    const { treeFolders, myFolderId, commonFolderId, isPrivacyFolder } =
      treeFoldersStore;

    const { id, access: folderAccess } = selectedFolderStore;
    const {
      moveDragItems,
      uploadEmptyFolders,
      deleteAction,
      emptyTrashInProgress,
    } = filesActionsStore;
    const { setEmptyTrashDialogVisible } = dialogsStore;

    return {
      isAdmin: auth.isAdmin,
      isVisitor: auth.userStore.user.isVisitor,
      isCollaborator: auth.userStore.user.isCollaborator,
      myId: myFolderId,
      commonId: commonFolderId,
      isPrivacy: isPrivacyFolder,
      currentId: id,
      showText,
      docSpace,

      data: treeFolders,

      draggableItems: dragging
        ? bufferSelection
          ? [bufferSelection]
          : selection
        : null,
      dragging,
      setDragging,
      moveDragItems,
      setBufferSelection,
      deleteAction,
      startUpload,
      uploadEmptyFolders,
      setEmptyTrashDialogVisible,
      trashIsEmpty,

      firstLoad,
      startDrag,
      emptyTrashInProgress,
      isCommunity,
      isPaymentPageAvailable,
      currentDeviceType,
      folderAccess,
    };
  }
)(withTranslation(["Files", "Common", "Translations"])(observer(Items)));
