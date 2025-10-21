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
import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import {
  FolderType,
  ShareAccessRights,
  DeviceType,
} from "@docspace/shared/enums";
import { FOLDER_NAMES } from "@docspace/shared/constants";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";
import { isTouchDevice } from "@docspace/shared/utils";

import { ArticleItem } from "@docspace/shared/components/article-item/ArticleItemWrapper";
import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";

import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import { toastr } from "@docspace/shared/components/toast";
import { Badge } from "@docspace/shared/components/badge";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Text } from "@docspace/shared/components/text";

import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";
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
  setDropTargetPreview,
  currentDeviceType,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const isAiAgents = item.rootFolderType === FolderType.AIAgents;
  const isMobile = currentDeviceType === DeviceType.mobile;

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

      if ((isTouchDevice || isMobile) && isTooltipOpen) {
        setIsTooltipOpen(false);
        return;
      }

      if ((isTouchDevice || isMobile) && isAiAgents) {
        setIsTooltipOpen(true);
        return;
      }

      setBufferSelection(null);

      onClick?.(
        e,
        selectedFolderId,
        item.title,
        item.rootFolderType,
        item.security.Create,
      );
    },
    [
      onClick,
      item.title,
      item.rootFolderType,
      isTooltipOpen,
      setIsTooltipOpen,
      isTouchDevice,
      isMobile,
      isAiAgents,
    ],
  );

  const getTooltipAIAgentContent = () => (
    <>
      <Text fontSize="12px" fontWeight={600} noSelect>
        {t("Common:AIAgentsComingSoon")}
      </Text>
      <Text fontSize="12px" fontWeight={400} noSelect>
        {t("Common:AIAgentsDescription")}
      </Text>
    </>
  );

  useEffect(() => {
    if (!isTouchDevice && !isMobile) return;

    const handleClickOutside = (event) => {
      if (isTooltipOpen) {
        const aiAgentElement = event.target.closest(
          `[data-tooltip-id="aiAgentsTooltip${item.id}"]`,
        );

        if (!aiAgentElement) {
          event.stopPropagation();
          event.preventDefault();
          setIsTooltipOpen(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("touchend", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("touchend", handleClickOutside, true);
    };
  }, [isTooltipOpen, item.id, isTouchDevice, isMobile]);

  const onClickAiAgentsBadge = () => {
    if (isTouchDevice || isMobile) {
      setIsTooltipOpen(!isTooltipOpen);
    }
  };

  const linkData = getLinkData(
    item.id,
    item.title,
    item.rootFolderType,
    item.security?.Create,
  );

  const droppableClassName = isDragging ? "droppable" : "";
  const isFloatTooltip = !isTouchDevice && !isMobile;

  return (
    <StyledDragAndDrop
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
        onClickBadge={isAiAgents ? onClickAiAgentsBadge : onBadgeClick}
        iconBadge={iconBadge}
        isDisabled={isAiAgents}
        withAnimation
        badgeTitle={
          labelBadge
            ? ""
            : t("EmptySection", { sectionName: t("Common:TrashSection") })
        }
        badgeComponent={
          isAiAgents ? (
            <Badge
              label={t("Soon")}
              className={item.folderClassName}
              fontSize="9px"
            />
          ) : (
            <NewFilesBadge
              newFilesCount={labelBadge}
              folderId={item.id === roomsFolderId ? "rooms" : item.id}
              parentDOMId={folderId}
              onBadgeClick={onBadgeClick}
            />
          )
        }
        linkData={linkData}
        $currentColorScheme={currentColorScheme}
        dataTooltipId={`aiAgentsTooltip${item.id}`}
      />
      {isAiAgents ? (
        <Tooltip
          id={`aiAgentsTooltip${item.id}`}
          place="bottom-start"
          getContent={getTooltipAIAgentContent}
          maxWidth="320px"
          float={isFloatTooltip}
          isOpen={isTouchDevice || isMobile ? isTooltipOpen : undefined}
        />
      ) : null}
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
        const isAiAgents = item.rootFolderType === FolderType.AIAgents;
        const showBadge = emptyTrashInProgress
          ? false
          : item.newItems
            ? item.newItems > 0 && true
            : (isTrash && !trashIsEmpty) || isAiAgents;

        let labelBadge;
        if (isAiAgents) {
          labelBadge = t("Soon");
        } else {
          labelBadge = showBadge ? item.newItems : null;
        }
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
            onHide={onHide}
            isIndexEditingMode={isIndexEditingMode}
            setDropTargetPreview={setDropTargetPreview}
            isLastItem={isTrash}
            currentDeviceType={currentDeviceType}
          />
        );
      });

      items.splice(1, 0, <CatalogDivider key="ai-agents-divider" />);

      items.splice(6, 0, <CatalogDivider key="doc-other-header" />);

      items.splice(9, 0, <CatalogDivider key="trash-divider" />);

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
      setDropTargetPreview,
    };
  },
)(withTranslation(["Files", "Common", "Translations"])(observer(Items)));
