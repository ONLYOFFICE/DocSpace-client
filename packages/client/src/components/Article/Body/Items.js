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

import PropTypes from "prop-types";
import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  FolderType,
  ShareAccessRights,
  DeviceType,
} from "@docspace/shared/enums";
import { FOLDER_NAMES } from "@docspace/shared/constants";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import { ArticleItem } from "@docspace/ui-kit/components/article/item";
import { DragAndDrop } from "@docspace/ui-kit/components/drag-and-drop";

import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import { toastr } from "@docspace/ui-kit/components/toast";

import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";
import BonusItem from "./BonusItem";

const CatalogDivider = () => {
  return <div style={{ height: "16px" }}></div>;
};

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
  aiAgentsFolderId,
  setDropTargetPreview,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const isDragging =
    dragging && !isIndexEditingMode ? showDragItems(item) : false;

  let value = "";
  if (isDragging) value = `${item.id} dragging`;

  React.useEffect(() => {
    if (isDragging) {
      if (isDragActive) setDropTargetPreview(item.title);
      else setDropTargetPreview(null);
    }
  }, [isDragging, isDragActive]);

  const onDropZoneUpload = React.useCallback(
    (files, uploadToFolder) => {
      const dragged = dragging;

      dragging && setDragging(false);

      createFoldersTree(t, files, uploadToFolder, dragged)
        .then((f) => {
          if (f.length > 0) startUpload(f, uploadToFolder, t);
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
      if (e?.ctrlKey || e?.metaKey || e?.shiftKey || e?.button) return;

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
    item.security?.Create,
  );

  const droppableClassName = isDragging ? "droppable" : "";

  return (
    <DragAndDrop
      style={{ display: "contents" }}
      key={item.id}
      data-title={item.title}
      value={value}
      onDrop={onDrop}
      dragging={dragging ? isDragging : null}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`document-catalog ${droppableClassName}`}
      data-document-title={item.title}
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
            folderId={
              item.id === roomsFolderId
                ? "rooms"
                : item.id === aiAgentsFolderId
                  ? "agents"
                  : item.id
            }
            parentDOMId={folderId}
            onBadgeClick={onBadgeClick}
          />
        }
        linkData={linkData}
        $currentColorScheme={currentColorScheme}
        dataTooltipId={`aiAgentsTooltip${item.id}`}
        LinkRouter={Link}
      />
    </DragAndDrop>
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
  aiAgentsFolderId,
  setDropTargetPreview,
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
      const items = elm.map((item) => {
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
            aiAgentsFolderId={aiAgentsFolderId}
            onHide={onHide}
            isIndexEditingMode={isIndexEditingMode}
            setDropTargetPreview={setDropTargetPreview}
            isLastItem={isTrash}
            currentDeviceType={currentDeviceType}
          />
        );
      });

      // guest doesn't have my documents by default, but has if he was downgraded from another type
      const hasMyDocuments = elm.some(
        (f) => f.rootFolderType === FolderType.USER,
      );

      const hasAIAgents = elm.some(
        (f) => f.rootFolderType === FolderType.AIAgents,
      );

      let dividerAfterAgents = hasAIAgents ? 1 : 0;
      let dividerAfterRooms = hasAIAgents ? 4 : 2;
      let dividerAfterRecent = hasAIAgents ? 8 : 6;

      if (!hasMyDocuments) {
        dividerAfterAgents = hasAIAgents ? 1 : 0;
        dividerAfterRooms = hasAIAgents ? 3 : 1;
        dividerAfterRecent = hasAIAgents ? 7 : 5;
      }

      if (hasAIAgents) {
        items.splice(
          dividerAfterAgents,
          0,
          <CatalogDivider key="ai-agents-divider" />,
        );
      }

      items.splice(
        dividerAfterRooms,
        0,
        <CatalogDivider key="rooms-divider" />,
      );

      items.splice(
        dividerAfterRecent,
        0,
        <CatalogDivider key="recent-divider" />,
      );

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

    const { startUpload, primaryProgressDataStore } = uploadDataStore;
    const { setDropTargetPreview } = primaryProgressDataStore;
    const {
      treeFolders,
      myFolderId,
      commonFolderId,
      isPrivacyFolder,
      roomsFolderId,
      aiAgentsFolderId,
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
      aiAgentsFolderId,
      isIndexEditingMode,
      setDropTargetPreview,
    };
  },
)(withTranslation(["Files", "Common", "Translations"])(observer(Items)));
