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

import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import {
  clearEdgeScrollingTimer,
  getFormFillingTipsStorageName,
  isMobile,
  isTablet,
  onEdgeScrolling,
} from "@docspace/shared/utils";
import { isElementInViewport } from "@docspace/shared/utils/common";
import {
  DeviceType,
  VDRIndexingAction,
  RoomsType,
} from "@docspace/shared/enums";
import FilesRowContainer from "./RowsView/FilesRowContainer";
import FilesTileContainer from "./TilesView/FilesTileContainer";
import RoomNoAccessContainer from "../../../../components/EmptyContainer/RoomNoAccessContainer";
import EmptyContainer from "../../../../components/EmptyContainer";
import withLoader from "../../../../HOCs/withLoader";
import TableView from "./TableView/TableContainer";
import withHotkeys from "../../../../HOCs/withHotkeys";

const separatorStyles = `width: 100vw;  position: absolute; height: 3px; z-index: 1;`;
const sectionClass = "section-wrapper-content";

let currentDroppable = null;
let droppableSeparator = null;
let isDragActive = false;

const fileViews = {
  tile: FilesTileContainer,
  table: TableView,
  row: FilesRowContainer,
};

const SectionBodyContent = (props) => {
  const {
    t,
    // tReady,
    isEmptyFilesList,
    folderId,
    dragging,
    setDragging,
    startDrag,
    setStartDrag,
    setTooltipPosition,
    isRecycleBinFolder,
    moveDragItems,
    viewAs,
    setSelection,
    setBufferSelection,
    tooltipPageX,
    tooltipPageY,
    setHotkeyCaretStart,
    setHotkeyCaret,
    scrollToItem,
    setScrollToItem,
    filesList,
    uploaded,
    onClickBack,
    isEmptyPage,
    currentDeviceType,
    isIndexEditingMode,
    changeIndex,
    isErrorRoomNotAvailable,
    getSelectedFolder,
    welcomeFormFillingTipsVisible,
    formFillingTipsVisible,
    roomType,
    userId,
    onEnableFormFillingGuid,
    isArchiveFolderRoot,
    setDropTargetPreview,
  } = props;

  useEffect(() => {
    return () => window?.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const storageName = getFormFillingTipsStorageName(userId);

    const closedFormFillingTips = localStorage.getItem(storageName);

    if (isMobile()) {
      return window.localStorage.setItem(storageName, "true");
    }

    if (
      roomType === RoomsType.FormRoom &&
      !closedFormFillingTips &&
      userId &&
      !isArchiveFolderRoot
    ) {
      onEnableFormFillingGuid(t, roomType);
    }
  }, [roomType, onEnableFormFillingGuid]);

  useEffect(() => {
    const customScrollElm = document.querySelector(
      "#customScrollBar > .scroll-wrapper > .scroller",
    );

    if (isTablet() || isMobile() || currentDeviceType !== DeviceType.desktop) {
      customScrollElm && customScrollElm.scrollTo(0, 0);
    }
  }, [currentDeviceType]);

  useEffect(() => {
    if (scrollToItem) {
      const { type, id } = scrollToItem;

      const targetElement = document.getElementById(`${type}_${id}`);

      if (!targetElement) return;

      const isInViewport = isElementInViewport(targetElement);

      if (!isInViewport || viewAs === "table") {
        const bodyScroll =
          isMobile() || currentDeviceType === DeviceType.mobile
            ? document.querySelector(
                "#customScrollBar > .scroll-wrapper > .scroller",
              )
            : document.querySelector(".section-scroll");

        const count =
          filesList.findIndex((elem) => elem.id === scrollToItem.id) *
          (isMobile() || currentDeviceType === DeviceType.mobile
            ? 57
            : viewAs === "table"
              ? 40
              : 48);

        bodyScroll.scrollTo(0, count);
      }
      setScrollToItem(null);
    }
  }, [scrollToItem, currentDeviceType]);

  const onBeforeunload = (e) => {
    if (!uploaded) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  const isHeaderOptionButton = (event) => {
    const parent = document.querySelector("#header_optional-button");

    if (!parent || !event.target) return false;

    return parent.contains(event.target);
  };

  const onMouseDown = (e) => {
    if (
      (e.target.closest(".scroll-body") &&
        !e.target.closest(".files-item") &&
        !e.target.closest(".not-selectable") &&
        !e.target.closest(".info-panel") &&
        !e.target.closest(".table-container_group-menu") &&
        !e.target.closest(".document-catalog")) ||
      e.target.closest(".files-main-button") ||
      e.target.closest(".add-button") ||
      e.target.closest("#filter_search-input") ||
      isHeaderOptionButton(e)
    ) {
      setSelection([]);
      setBufferSelection(null);
      setHotkeyCaretStart(null);
      setHotkeyCaret(null);
    }
  };

  const onMouseMove = (e) => {
    if (
      Math.abs(e.pageX - tooltipPageX) < 5 &&
      Math.abs(e.pageY - tooltipPageY) < 5
    ) {
      return false;
    }

    isDragActive = true;
    if (!dragging) {
      document.body.classList.add("drag-cursor");
      setDragging(true);
    }

    onEdgeScrolling(e);
    setTooltipPosition(e.pageX, e.pageY);
    const wrapperElement = document.elementFromPoint(e.clientX, e.clientY);
    if (!wrapperElement) {
      return;
    }

    droppableSeparator && droppableSeparator.remove();

    const droppable = wrapperElement.closest(".droppable");
    const tableItem = wrapperElement.closest(".table-list-item");
    const styles = tableItem && window.getComputedStyle(tableItem);
    const indexSeparatorNode = document.createElement("div");
    indexSeparatorNode.classList.add("indexing-separator");

    const parent = document.querySelector(
      ".ReactVirtualized__Grid__innerScrollContainer",
    );

    if (styles) {
      indexSeparatorNode.setAttribute("style", separatorStyles);
      indexSeparatorNode.style.top = styles.top;
    }
    if (currentDroppable !== droppable) {
      if (currentDroppable) {
        if (viewAs === "table") {
          const value = currentDroppable.getAttribute("value");

          const documentTitle = currentDroppable.getAttribute(
            "data-document-title",
          );
          setDropTargetPreview(documentTitle);

          const classElements = document.getElementsByClassName(value);

          // add check for column with width = 0, because without it dark theme d`n`d have bug color
          // 30 - it`s column padding
          Array.from(classElements).forEach((cl) => {
            if (cl.clientWidth - 30) {
              cl.classList.remove("droppable-hover");
            }
          });
          if (isIndexEditingMode) {
            droppableSeparator.remove();
          }
        } else {
          const documentTitle = currentDroppable.getAttribute(
            "data-document-title",
          );
          setDropTargetPreview(documentTitle);

          currentDroppable.classList.remove("droppable-hover");
        }
      }
      currentDroppable = droppable;
      droppableSeparator = indexSeparatorNode;
      if (currentDroppable) {
        if (viewAs === "table") {
          const value = currentDroppable.getAttribute("value");

          const documentTitle = currentDroppable.getAttribute(
            "data-document-title",
          );
          setDropTargetPreview(documentTitle);

          const classElements = document.getElementsByClassName(value);

          // add check for column with width = 0, because without it dark theme d`n`d have bug color
          // 30 - it`s column padding
          Array.from(classElements).forEach((cl) => {
            if (cl.clientWidth - 30) {
              cl.classList.add("droppable-hover");
            }
          });
          if (isIndexEditingMode) {
            parent.insertBefore(indexSeparatorNode, tableItem);
          }
        } else {
          currentDroppable.classList.add("droppable-hover");
          currentDroppable = droppable;
          droppableSeparator = indexSeparatorNode;

          const documentTitle = currentDroppable.getAttribute(
            "data-document-title",
          );
          setDropTargetPreview(documentTitle);
        }
      } else {
        setDropTargetPreview(null);
      }
    } else if (isIndexEditingMode) {
      droppableSeparator && droppableSeparator.remove();

      const wrappedClass = wrapperElement && wrapperElement.className;
      droppableSeparator = indexSeparatorNode;

      if (wrappedClass === sectionClass) {
        indexSeparatorNode.setAttribute(
          "style",
          `${separatorStyles}bottom: 0px;`,
        );
        return parent.append(indexSeparatorNode);
      }

      parent.insertBefore(indexSeparatorNode, tableItem);
    }
  };

  const onMoveTo = (destFolderId, title, destFolderInfo) => {
    const id = Number.isNaN(+destFolderId) ? destFolderId : +destFolderId;
    moveDragItems(id, title, destFolderInfo);
  };

  const onMouseUp = (e) => {
    clearEdgeScrollingTimer();
    setStartDrag(false);

    setTimeout(() => {
      isDragActive = false;
      setDragging(false);
      document.body.classList.remove("drag-cursor");
      droppableSeparator && droppableSeparator.remove();
    }, 0);

    const treeElem = e.target.closest(".tree-drag");
    const treeDataValue = treeElem?.dataset?.value;
    const splitValue = treeDataValue && treeDataValue.split(" ");
    const isDragging = splitValue && splitValue.includes("dragging");
    const treeValue = isDragging ? splitValue[0] : null;

    const elem = isIndexEditingMode
      ? e.target.closest(".files-item") || e.target.closest(`.${sectionClass}`)
      : e.target.closest(".droppable");

    const title = elem && elem.dataset.title;
    const value = elem && elem.getAttribute("value");
    if (
      ((!value && !treeValue) || isRecycleBinFolder || !isDragActive) &&
      !isIndexEditingMode
    ) {
      return;
    }

    const selectedFolderId = value
      ? value.split("_").slice(1, -3).join("_")
      : treeValue;

    const selectedFolder = getSelectedFolder();
    const destFolderInfo = selectedFolder.folders.find(
      (folder) => folder.id == selectedFolderId,
    );

    if (!isIndexEditingMode && selectedFolderId) {
      return onMoveTo(selectedFolderId, title, destFolderInfo);
    }
    if (filesList.length === 1) return;

    const replaceableItemId = Number.isNaN(+selectedFolderId)
      ? selectedFolderId
      : +selectedFolderId;

    const replaceableItemType = value && value.split("_").slice(0, 1).join("_");
    const isSectionTarget = elem && elem.className === sectionClass;

    let replaceable;
    if (isSectionTarget) {
      replaceable = filesList[filesList.length - 1];
    } else {
      const replaceableItemIndex = filesList.findIndex((i) =>
        replaceableItemType === "file"
          ? i.id === replaceableItemId && !i.isFolder
          : i.id === replaceableItemId && i.isFolder,
      );

      if (replaceableItemIndex > -1) {
        replaceable = filesList[replaceableItemIndex];
      }
    }

    if (!replaceable) return;

    changeIndex(VDRIndexingAction.MoveIndex, replaceable, t, isSectionTarget);
  };

  const onDropEvent = () => {
    setDragging(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (
      e.dataTransfer.items.length > 0 &&
      e.dataTransfer.dropEffect !== "none"
    ) {
      setDragging(true);
    }
  };

  const onDragLeaveDoc = (e) => {
    e.preventDefault();
    if (!e.relatedTarget || !e.dataTransfer.items.length) {
      setDragging(false);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeunload);
    window.addEventListener("mousedown", onMouseDown);
    startDrag && window.addEventListener("mouseup", onMouseUp);
    startDrag && document.addEventListener("mousemove", onMouseMove);

    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragleave", onDragLeaveDoc);
    document.addEventListener("drop", onDropEvent);

    return () => {
      window.removeEventListener("beforeunload", onBeforeunload);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);

      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("dragleave", onDragLeaveDoc);
      document.removeEventListener("drop", onDropEvent);
    };
  }, [
    onMouseUp,
    onMouseMove,
    onClickBack,
    startDrag,
    folderId,
    viewAs,
    uploaded,
    currentDeviceType,
    filesList,
  ]);

  if (isErrorRoomNotAvailable) return <RoomNoAccessContainer />;

  if (
    isEmptyFilesList &&
    !welcomeFormFillingTipsVisible &&
    !formFillingTipsVisible
  )
    return <EmptyContainer isEmptyPage={isEmptyPage} />;

  const FileViewComponent = fileViews[viewAs] ?? FilesRowContainer;

  return <FileViewComponent />;
};

export default inject(
  ({
    settingsStore,
    filesStore,
    selectedFolderStore,
    treeFoldersStore,
    filesActionsStore,
    uploadDataStore,
    indexingStore,
    dialogsStore,
    userStore,
    contextOptionsStore,
  }) => {
    const {
      isEmptyFilesList,
      dragging,
      setDragging,
      viewAs,
      setTooltipPosition,
      startDrag,
      setStartDrag,
      setSelection,
      tooltipPageX,
      tooltipPageY,
      setBufferSelection,
      setHotkeyCaretStart,
      setHotkeyCaret,
      scrollToItem,
      setScrollToItem,
      filesList,
      isEmptyPage,
      isErrorRoomNotAvailable,
    } = filesStore;

    const { welcomeFormFillingTipsVisible, formFillingTipsVisible } =
      dialogsStore;

    const { onEnableFormFillingGuid } = contextOptionsStore;
    const { primaryProgressDataStore, uploaded } = uploadDataStore;
    const { setDropTargetPreview } = primaryProgressDataStore;

    return {
      dragging,
      startDrag,
      setStartDrag,

      isEmptyFilesList,
      setDragging,
      folderId: selectedFolderStore.id,
      roomType: selectedFolderStore.roomType,
      setTooltipPosition,
      isRecycleBinFolder: treeFoldersStore.isRecycleBinFolder,
      isArchiveFolderRoot: treeFoldersStore.isArchiveFolderRoot,
      moveDragItems: filesActionsStore.moveDragItems,
      changeIndex: filesActionsStore.changeIndex,
      viewAs,
      setSelection,
      setBufferSelection,
      tooltipPageX,
      tooltipPageY,
      setHotkeyCaretStart,
      setHotkeyCaret,
      scrollToItem,
      setScrollToItem,
      filesList,
      uploaded,
      onClickBack: filesActionsStore.onClickBack,
      currentDeviceType: settingsStore.currentDeviceType,
      isEmptyPage,
      isIndexEditingMode: indexingStore.isIndexEditingMode,
      isErrorRoomNotAvailable,
      getSelectedFolder: selectedFolderStore.getSelectedFolder,
      welcomeFormFillingTipsVisible,
      formFillingTipsVisible,
      userId: userStore?.user?.id,
      onEnableFormFillingGuid,
      setDropTargetPreview,
    };
  },
)(
  withTranslation(["Files", "Common", "Translations", "FormFillingTipsDialog"])(
    withHotkeys(withLoader(observer(SectionBodyContent))()),
  ),
);
