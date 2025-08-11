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

import PropTypes from "prop-types";
import styled from "styled-components";
import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import {
  FolderType,
  ShareAccessRights,
  DeviceType,
} from "@docspace/shared/enums";
import { FOLDER_NAMES } from "@docspace/shared/constants";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import { ArticleItem } from "@docspace/shared/components/article-item/ArticleItemWrapper";
import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";

import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import { toastr } from "@docspace/shared/components/toast";
import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";
import AccountsItem from "./AccountsItem";
import BonusItem from "./BonusItem";

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
  isLastItem,
  showText,
  onClick,
  onMoveTo,
  showDragItems,
  startUpload,
  createFoldersTree,
  setDragging,
  showBadge,
  labelBadge,
  iconBadge,
  folderId,
  currentColorScheme,
  isIndexEditingMode,
  getLinkData,
  onBadgeClick,
  roomsFolderId,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const isDragging =
    dragging && !isIndexEditingMode ? showDragItems(item) : false;

  let value = "";
  if (isDragging) value = `${item.id} dragging`;

  const onDropZoneUpload = React.useCallback(
    (files, uploadToFolder) => {
      dragging && setDragging(false);

      createFoldersTree(t, files, uploadToFolder)
        .then((f) => {
          if (f.length > 0) startUpload(f, null, t);
        })
        .catch((err) => {
          toastr.error(err);
        });
    },
    [t, dragging, setDragging, startUpload, createFoldersTree],
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
    [item, startUpload, dragging, setDragging],
  );

  const onDragOver = React.useCallback(
    (dragActive) => {
      if (dragActive !== isDragActive) {
        setIsDragActive(dragActive);
      }
    },
    [isDragActive],
  );

  const onDragLeave = React.useCallback(() => {
    setIsDragActive(false);
  }, []);

  const onClickAction = React.useCallback(
    (e, selectedFolderId) => {
      setBufferSelection(null);

      onClick?.(
        e,
        selectedFolderId,
        item.title,
        item.rootFolderType,
        item.security.Create,
      );
    },
    [onClick, item.title, item.rootFolderType],
  );

  const linkData = getLinkData(
    item.id,
    item.title,
    item.rootFolderType,
    item.security.Create,
  );

  return (
    <StyledDragAndDrop
      key={item.id}
      data-title={item.title}
      value={value}
      onDrop={onDrop}
      dragging={dragging ? isDragging : null}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className="document-catalog"
    >
      <ArticleItem
        item={item}
        key={item.id}
        id={item.id}
        title={item.title}
        folderId={folderId}
        className={`tree-drag ${item.folderClassName} document-catalog`}
        icon={getFolderIcon(item)}
        showText={showText}
        text={item.title}
        isActive={isActive}
        onClick={onClickAction}
        onDrop={onMoveTo}
        isEndOfBlock={isLastItem}
        isDragging={isDragging}
        isDragActive={isDragActive ? isDragging : null}
        value={value}
        showBadge={showBadge}
        labelBadge={labelBadge}
        onClickBadge={onBadgeClick}
        iconBadge={iconBadge}
        withAnimation
        badgeTitle={
          labelBadge
            ? ""
            : t("EmptySection", { sectionName: t("Common:TrashSection") })
        }
        badgeComponent={
          <NewFilesBadge
            newFilesCount={labelBadge}
            folderId={item.id === roomsFolderId ? "rooms" : item.id}
            parentDOMId={folderId}
            onBadgeClick={onBadgeClick}
          />
        }
        linkData={linkData}
        $currentColorScheme={currentColorScheme}
      />
    </StyledDragAndDrop>
  );
};

const Items = ({
  t,
  data,
  showText,

  onClick,

  dragging,
  setDragging,
  startUpload,
  createFoldersTree,
  isVisitor,
  isCollaborator,
  isAdmin,

  currentId,
  draggableItems,
  setBufferSelection,

  moveDragItems,

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
  currentColorScheme,
  isIndexEditingMode,

  getLinkData,
  roomsFolderId,
}) => {
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
          (x) => x.id === item.id && x.isFolder === item.isFolder,
        )
      )
        return false;

      const isArchive = draggableItems.find(
        (f) => f.rootFolderType === FolderType.Archive,
      );

      if (
        item.rootFolderType === FolderType.SHARE &&
        item.access === ShareAccessRights.FullAccess
      ) {
        return true;
      }

      if (item.rootFolderType === FolderType.TRASH && startDrag && !isArchive) {
        return draggableItems.some(
          (draggableItem) => draggableItem?.security?.Delete,
        );
      }

      if (item.rootFolderType === FolderType.USER) {
        return (
          folderAccess === ShareAccessRights.None ||
          folderAccess === ShareAccessRights.FullAccess ||
          folderAccess === ShareAccessRights.RoomManager
        );
      }

      return false;
    },
    [currentId, draggableItems, isAdmin],
  );

  const onMoveTo = React.useCallback(
    (destFolderId, title, destFolderInfo) => {
      moveDragItems(destFolderId, title, destFolderInfo);
    },
    [moveDragItems],
  );

  const onRemove = React.useCallback(() => {
    const translations = {
      deleteFromTrash: t("Translations:TrashItemsDeleteSuccess", {
        sectionName: t("Common:TrashSection"),
      }),
    };

    deleteAction(translations);
  }, [deleteAction]);

  const onEmptyTrashAction = () => {
    currentDeviceType === DeviceType.mobile && onHide();
    setEmptyTrashDialogVisible(true);
  };

  const onBadgeClick = () => {
    if (currentDeviceType === DeviceType.mobile) onHide();
  };

  const getItems = React.useCallback(
    (elm) => {
      const items = elm.map((item, index) => {
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
            key={item.id}
            t={t}
            setDragging={setDragging}
            startUpload={startUpload}
            createFoldersTree={createFoldersTree}
            item={item}
            setBufferSelection={setBufferSelection}
            dragging={dragging}
            getFolderIcon={getFolderIcon}
            isActive={item.id === activeItemId}
            isLastItem={index === elm.length - 1}
            showText={showText}
            onClick={onClick}
            getLinkData={getLinkData}
            onMoveTo={isTrash ? onRemove : onMoveTo}
            onBadgeClick={isTrash ? onEmptyTrashAction : onBadgeClick}
            showDragItems={showDragItems}
            showBadge={showBadge}
            labelBadge={labelBadge}
            iconBadge={iconBadge}
            folderId={`document_catalog-${FOLDER_NAMES[item.rootFolderType]}`}
            currentColorScheme={currentColorScheme}
            roomsFolderId={roomsFolderId}
            onHide={onHide}
            isIndexEditingMode={isIndexEditingMode}
          />
        );
      });

      items.splice(1, 0, <CatalogDivider key="recent-divider" />);

      if (!isVisitor && !isCollaborator)
        items.splice(
          5,
          0,
          <AccountsItem
            key="accounts-item"
            onClick={onClick}
            getLinkData={getLinkData}
            isActive={activeItemId === "accounts"}
          />,
        );

      if (!isVisitor) items.splice(5, 0, <CatalogDivider key="other-header" />);
      else items.splice(4, 0, <CatalogDivider key="other-header" />);

      if (isCommunity && isPaymentPageAvailable)
        items.push(<BonusItem key="bonus-item" />);

      return items;
    },
    [
      t,
      dragging,
      getFolderIcon,
      onClick,
      getLinkData,
      onMoveTo,
      showDragItems,
      showText,
      setDragging,
      startUpload,
      createFoldersTree,
      trashIsEmpty,
      isAdmin,
      isVisitor,
      isCollaborator,
      firstLoad,
      activeItemId,
      emptyTrashInProgress,
      isIndexEditingMode,
    ],
  );

  return <>{getItems(data)}</>;
};

Items.propTypes = {
  data: PropTypes.array,
  showText: PropTypes.bool,
  onClick: PropTypes.func,
  onHide: PropTypes.func,
};

export default inject(
  ({
    authStore,
    treeFoldersStore,
    selectedFolderStore,
    filesStore,
    filesActionsStore,
    uploadDataStore,
    dialogsStore,
    clientLoadingStore,
    userStore,
    settingsStore,
    indexingStore,
    currentTariffStatusStore,
  }) => {
    const { isPaymentPageAvailable } = authStore;

    const { isCommunity } = currentTariffStatusStore;

    const { showText, currentColorScheme, currentDeviceType } = settingsStore;

    const {
      selection,
      bufferSelection,
      setBufferSelection,
      dragging,
      setDragging,
      trashIsEmpty,

      startDrag,
    } = filesStore;

    const { isIndexEditingMode } = indexingStore;

    const { firstLoad } = clientLoadingStore;

    const { startUpload } = uploadDataStore;

    const {
      treeFolders,
      myFolderId,
      commonFolderId,
      isPrivacyFolder,
      roomsFolderId,
    } = treeFoldersStore;

    const { id, access: folderAccess } = selectedFolderStore;
    const {
      moveDragItems,
      createFoldersTree,
      deleteAction,
      emptyTrashInProgress,
    } = filesActionsStore;
    const { setEmptyTrashDialogVisible } = dialogsStore;

    return {
      isAdmin: authStore.isAdmin,
      isVisitor: userStore.user.isVisitor,
      isCollaborator: userStore.user.isCollaborator,
      myId: myFolderId,
      commonId: commonFolderId,
      isPrivacy: isPrivacyFolder,
      currentId: id,
      showText,

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
      createFoldersTree,
      setEmptyTrashDialogVisible,
      trashIsEmpty,

      firstLoad,
      startDrag,
      emptyTrashInProgress,
      isCommunity,
      isPaymentPageAvailable,
      currentDeviceType,
      folderAccess,
      currentColorScheme,
      roomsFolderId,
      isIndexEditingMode,
    };
  },
)(withTranslation(["Files", "Common", "Translations"])(observer(Items)));
