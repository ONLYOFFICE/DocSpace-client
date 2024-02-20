import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { observer, inject } from "mobx-react";
import FilesRowContainer from "./RowsView/FilesRowContainer";
import FilesTileContainer from "./TilesView/FilesTileContainer";
import EmptyContainer from "../../../../components/EmptyContainer";
import withLoader from "../../../../HOCs/withLoader";
import TableView from "./TableView/TableContainer";
import withHotkeys from "../../../../HOCs/withHotkeys";
import { Consumer, isMobile, isTablet } from "@docspace/shared/utils";
import { isElementInViewport } from "@docspace/shared/utils/common";

import { DeviceType } from "@docspace/shared/enums";

let currentDroppable = null;
let isDragActive = false;

const SectionBodyContent = (props) => {
  const {
    t,
    tReady,
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
    movingInProgress,
    currentDeviceType,
  } = props;

  useEffect(() => {
    return () => window?.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const customScrollElm = document.querySelector(
      "#customScrollBar > .scroll-wrapper > .scroller",
    );

    if (isTablet() || isMobile() || currentDeviceType !== DeviceType.desktop) {
      customScrollElm && customScrollElm.scrollTo(0, 0);
    }

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
  ]);

  useEffect(() => {
    if (scrollToItem) {
      const { type, id } = scrollToItem;

      const targetElement = document.getElementById(`${type}_${id}`);

      if (!targetElement) return;

      let isInViewport = isElementInViewport(targetElement);

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
      e.target.closest("#filter_search-input")
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

    setTooltipPosition(e.pageX, e.pageY);
    const wrapperElement = document.elementFromPoint(e.clientX, e.clientY);
    if (!wrapperElement) {
      return;
    }

    const droppable = wrapperElement.closest(".droppable");
    if (currentDroppable !== droppable) {
      if (currentDroppable) {
        if (viewAs === "table") {
          const value = currentDroppable.getAttribute("value");
          const classElements = document.getElementsByClassName(value);

          for (let cl of classElements) {
            cl.classList.remove("droppable-hover");
          }
        } else {
          currentDroppable.classList.remove("droppable-hover");
        }
      }
      currentDroppable = droppable;

      if (currentDroppable) {
        if (viewAs === "table") {
          const value = currentDroppable.getAttribute("value");
          const classElements = document.getElementsByClassName(value);

          // add check for column with width = 0, because without it dark theme d`n`d have bug color
          // 30 - it`s column padding
          for (let cl of classElements) {
            if (cl.clientWidth - 30) {
              cl.classList.add("droppable-hover");
            }
          }
        } else {
          currentDroppable.classList.add("droppable-hover");
          currentDroppable = droppable;
        }
      }
    }
  };

  const onMouseUp = (e) => {
    setStartDrag(false);

    setTimeout(() => {
      isDragActive = false;
      setDragging(false);
      document.body.classList.remove("drag-cursor");
    }, 0);

    const treeElem = e.target.closest(".tree-drag");
    const treeDataValue = treeElem?.dataset?.value;
    const splitValue = treeDataValue && treeDataValue.split(" ");
    const isDragging = splitValue && splitValue.includes("dragging");
    const treeValue = isDragging ? splitValue[0] : null;

    const elem = e.target.closest(".droppable");
    const title = elem && elem.dataset.title;
    const value = elem && elem.getAttribute("value");
    if ((!value && !treeValue) || isRecycleBinFolder || !isDragActive) {
      return;
    }

    const folderId = value ? value.split("_")[1] : treeValue;
    onMoveTo(folderId, title);
    return;
  };

  const onMoveTo = (destFolderId, title) => {
    const id = isNaN(+destFolderId) ? destFolderId : +destFolderId;
    moveDragItems(id, title, {
      copy: t("Common:CopyOperation"),
      move: t("Translations:MoveToOperation"),
    });
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

  if (isEmptyFilesList && movingInProgress) return <></>;

  const showEmptyPage = isEmptyFilesList;

  return (
    <Consumer>
      {(context) =>
        showEmptyPage ? (
          <>
            <EmptyContainer
              sectionWidth={context.sectionWidth}
              isEmptyPage={isEmptyPage}
            />
          </>
        ) : viewAs === "tile" ? (
          <>
            <FilesTileContainer sectionWidth={context.sectionWidth} t={t} />
          </>
        ) : viewAs === "table" ? (
          <>
            <TableView sectionWidth={context.sectionWidth} tReady={tReady} />
          </>
        ) : (
          <>
            <FilesRowContainer
              sectionWidth={context.sectionWidth}
              tReady={tReady}
            />
          </>
        )
      }
    </Consumer>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    selectedFolderStore,
    treeFoldersStore,
    filesActionsStore,
    uploadDataStore,
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
      movingInProgress,
    } = filesStore;
    return {
      dragging,
      startDrag,
      setStartDrag,

      isEmptyFilesList,
      setDragging,
      folderId: selectedFolderStore.id,
      setTooltipPosition,
      isRecycleBinFolder: treeFoldersStore.isRecycleBinFolder,
      moveDragItems: filesActionsStore.moveDragItems,
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
      uploaded: uploadDataStore.uploaded,
      onClickBack: filesActionsStore.onClickBack,
      movingInProgress,
      currentDeviceType: settingsStore.currentDeviceType,
      isEmptyPage,
    };
  },
)(
  withTranslation(["Files", "Common", "Translations"])(
    withHotkeys(withLoader(observer(SectionBodyContent))()),
  ),
);
