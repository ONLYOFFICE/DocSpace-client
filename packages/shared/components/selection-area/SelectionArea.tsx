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
import { useTheme } from "styled-components";

import styles from "./SelectionArea.module.scss";
import { frames } from "./SelectionArea.utils";
import { SelectionAreaProps, TArrayTypes } from "./SelectionArea.types";
import { onEdgeScrolling, clearEdgeScrollingTimer } from "../../utils";

const SelectionArea = ({
  onMove,
  selectableClass = "",
  scrollClass,
  viewAs,
  itemsContainerClass,
  isRooms,
  folderHeaderHeight,
  countTilesInRow,
  defaultHeaderHeight,
  arrayTypes,
  containerClass,
  itemClass,
}: SelectionAreaProps) => {
  const areaLocation = React.useRef({ x1: 0, x2: 0, y1: 0, y2: 0 });
  const areaRect = React.useRef(new DOMRect());
  const areaRef = React.useRef<null | HTMLDivElement>(null);
  const arrayOfTypes = React.useRef<TArrayTypes[]>([]);
  const elemRect = React.useRef({ top: 0, left: 0, width: 0, height: 0 });
  const scrollDelta = React.useRef({ x: 0, y: 0 });
  const scrollElement = React.useRef<null | Element>(null);
  const scrollSpeed = React.useRef({ x: 0, y: 0 });
  const selectableNodes = React.useRef(new Set<Element>());

  const theme = useTheme();

  const isIntersects = React.useCallback(
    (itemIndex: number, itemType: string) => {
      const { right, left, bottom, top } = areaRect.current;
      if (!scrollElement.current) return;
      const { scrollTop } = scrollElement.current;

      const isRtl = theme.interfaceDirection === "rtl";

      let itemTop;
      let itemBottom;
      let itemLeft;
      let itemRight;

      if (viewAs === "tile") {
        let countOfMissingTiles = 0;
        const itemGap =
          arrayTypes?.find((x) => x.type === itemType)?.rowGap || 0;

        // TOP/BOTTOM item position
        if (itemIndex === 0) {
          itemTop = elemRect.current.top - scrollTop;
          itemBottom = itemTop + elemRect.current.height;
        } else {
          const indexOfType = arrayOfTypes.current.findIndex(
            (x) => x.type === itemType,
          );
          const headersCount = indexOfType === 0 ? 0 : indexOfType;

          itemTop = defaultHeaderHeight
            ? headersCount * defaultHeaderHeight
            : 0;
          const itemHeight =
            arrayOfTypes.current[indexOfType].itemHeight + itemGap;

          if (!headersCount) {
            const rowIndex = Math.trunc(itemIndex / countTilesInRow!);

            itemTop += elemRect.current.top + itemHeight * rowIndex - scrollTop;
            itemBottom = itemTop + itemHeight - itemGap;
          } else {
            let prevRowsCount = 0;

            for (let i = 0; i < indexOfType; i += 1) {
              const item = arrayTypes?.find(
                (x) => x.type === arrayOfTypes.current[i].type,
              );

              if (item) {
                countOfMissingTiles += item.countOfMissingTiles || 0;
                prevRowsCount += item.rowCount || 0;

                if (item.rowGap && item.rowCount)
                  itemTop +=
                    (arrayOfTypes.current[i].itemHeight + item.rowGap) *
                    item.rowCount;
              }
            }

            const nextRow =
              Math.floor((itemIndex + countOfMissingTiles) / countTilesInRow!) -
              prevRowsCount;

            itemTop += elemRect.current.top + itemHeight * nextRow - scrollTop;
            itemBottom = itemTop + itemHeight - itemGap;
          }
        }

        let columnIndex = (itemIndex + countOfMissingTiles) % countTilesInRow!;

        // Mirror fileIndex for RTL interface (2, 1, 0 => 0, 1, 2)
        if (isRtl && viewAs === "tile") {
          columnIndex = countTilesInRow! - 1 - columnIndex;
        }

        // LEFT/RIGHT item position
        if (columnIndex === 0) {
          itemLeft = elemRect.current.left;
          itemRight = itemLeft + elemRect.current.width;
        } else {
          itemLeft =
            elemRect.current.left +
            (elemRect.current.width + itemGap) * columnIndex;
          itemRight = itemLeft + elemRect.current.width;
        }

        return (
          right > itemLeft &&
          left < itemRight &&
          bottom > itemTop &&
          top < itemBottom
        );
      }

      const itemHeight = elemRect.current.height;
      if (itemIndex === 0) {
        itemTop = elemRect.current.top - scrollTop;
        itemBottom = itemTop + itemHeight;
      } else {
        itemTop = elemRect.current.top + itemHeight * itemIndex - scrollTop;
        itemBottom = itemTop + itemHeight;
      }

      return bottom > itemTop && top < itemBottom;
    },
    [
      arrayTypes,
      countTilesInRow,
      defaultHeaderHeight,
      theme.interfaceDirection,
      viewAs,
    ],
  );

  const recalculateSelectionAreaRect = React.useCallback(() => {
    const targetElement =
      document.getElementsByClassName(containerClass)[0] ??
      document.querySelectorAll("html")[0];

    if (!targetElement) return;

    const {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = targetElement;

    const targetRect = targetElement.getBoundingClientRect();

    const { x1, y1 } = areaLocation.current;
    let { x2, y2 } = areaLocation.current;

    if (x2 < targetRect.left) {
      scrollSpeed.current.x = scrollLeft ? -Math.abs(targetRect.left - x2) : 0;
      x2 = x2 < targetRect.left ? targetRect.left : x2;
    } else if (x2 > targetRect.right) {
      scrollSpeed.current.x =
        scrollWidth - scrollLeft - clientWidth
          ? Math.abs(targetRect.left + targetRect.width - x2)
          : 0;
      x2 = x2 > targetRect.right ? targetRect.right : x2;
    } else {
      scrollSpeed.current.x = 0;
    }

    if (y2 < targetRect.top) {
      scrollSpeed.current.y = scrollTop ? -Math.abs(targetRect.top - y2) : 0;
      y2 = y2 < targetRect.top ? targetRect.top : y2;
    } else if (y2 > targetRect.bottom) {
      scrollSpeed.current.y =
        scrollHeight - scrollTop - clientHeight
          ? Math.abs(targetRect.top + targetRect.height - y2)
          : 0;
      y2 = y2 > targetRect.bottom ? targetRect.bottom : y2;
    } else {
      scrollSpeed.current.y = 0;
    }

    const x3 = Math.min(x1, x2);
    const y3 = Math.min(y1, y2);
    const x4 = Math.max(x1, x2);
    const y4 = Math.max(y1, y2);

    areaRect.current.x = x3 + 1;
    areaRect.current.y = y3 + 1;
    areaRect.current.width = x4 - x3 - 3;
    areaRect.current.height = y4 - y3 - 3;
  }, [containerClass]);

  const updateElementSelection = React.useCallback(() => {
    const added = [];
    const removed = [];
    const newSelected = [];

    const selectableItems = document.getElementsByClassName(selectableClass);

    const selectables = [...selectableItems, ...selectableNodes.current];

    for (let i = 0; i < selectables.length; i += 1) {
      const node = selectables[i];

      const splitItem =
        viewAs === "tile"
          ? node?.getAttribute("value")?.split("_")
          : node
              ?.getElementsByClassName(itemClass)[0]
              ?.getAttribute("value")
              ?.split("_");

      const itemType = splitItem?.[0];
      const itemIndex = splitItem?.[splitItem.length - 1];

      // TODO: maybe do this line little bit better
      if (arrayOfTypes.current.findIndex((x) => x.type === itemType) === -1) {
        arrayOfTypes.current.push({
          type: itemType || "",
          itemHeight: node.getBoundingClientRect().height,
        });
      }

      const isInter = isIntersects(itemIndex ? +itemIndex : 0, itemType || "");

      if (isInter) {
        added.push(node);

        newSelected.push(node);
      } else {
        removed.push(node);
      }
    }

    onMove?.({ added, removed });
  }, [isIntersects, itemClass, onMove, selectableClass, viewAs]);

  const redrawSelectionArea = () => {
    if (!areaRect.current || !areaRef?.current) return;

    const { x, y, width, height } = areaRect.current;
    const { style } = areaRef.current;

    style.left = `${x}px`;
    style.top = `${y}px`;
    style.width = `${width}px`;
    style.height = `${height}px`;
  };

  const frame = React.useCallback(
    () =>
      frames(() => {
        recalculateSelectionAreaRect();
        updateElementSelection();
        redrawSelectionArea();
      }),
    [recalculateSelectionAreaRect, updateElementSelection],
  );

  const onTapMove = React.useCallback(
    (e: MouseEvent) => {
      areaLocation.current.x2 = e.clientX;
      areaLocation.current.y2 = e.clientY;

      onEdgeScrolling(e);

      frame().next();
    },
    [frame],
  );

  const onScroll = React.useCallback<EventListener>(
    (e: Event) => {
      const { scrollTop, scrollLeft } = e.target as HTMLElement;

      areaLocation.current.x1 += scrollDelta.current.x - scrollLeft;
      areaLocation.current.y1 += scrollDelta.current.y - scrollTop;
      scrollDelta.current.x = scrollLeft;
      scrollDelta.current.y = scrollTop;

      const selectables = document.getElementsByClassName(selectableClass);

      for (let i = 0; i < selectables.length; i += 1) {
        const node = selectables[i];
        selectableNodes.current.add(node);
      }

      frame().next();
    },
    [frame, selectableClass],
  );

  const onMoveAction = React.useCallback(
    (e: MouseEvent) => {
      const threshold = 10;
      const { x1, y1 } = areaLocation.current;

      if (!areaRef.current) return;

      if (
        Math.abs(e.clientX - x1) >= threshold ||
        Math.abs(e.clientY - y1) >= threshold
      ) {
        document.removeEventListener("mousemove", onMoveAction);

        document.addEventListener("mousemove", onTapMove, {
          passive: false,
        });

        areaRef.current.style.display = "block";

        onTapMove(e);
      }
    },
    [onTapMove],
  );

  const removeListeners = React.useCallback(() => {
    document.removeEventListener("mousemove", onMoveAction);
    document.removeEventListener("mousemove", onTapMove);

    if (scrollElement.current)
      scrollElement.current.removeEventListener("scroll", onScroll);
  }, [onMoveAction, onScroll, onTapMove]);

  const onTapStop = React.useCallback(() => {
    clearEdgeScrollingTimer();
    removeListeners();
    document.removeEventListener("mouseup", onTapStop);
    window.removeEventListener("blur", onTapStop);

    scrollSpeed.current.x = 0;
    scrollSpeed.current.y = 0;

    selectableNodes.current = new Set();

    frame()?.cancel();

    if (areaRef.current) {
      const { style } = areaRef.current;

      style.display = "none";
      style.left = "0px";
      style.top = "0px";
      style.width = "0px";
      style.height = "0px";
    }
  }, [frame, removeListeners]);

  const addListeners = React.useCallback(() => {
    document.addEventListener("mousemove", onMoveAction, {
      passive: false,
    });
    document.addEventListener("mouseup", onTapStop);

    window.addEventListener("blur", onTapStop);

    if (scrollElement.current)
      scrollElement.current.addEventListener("scroll", onScroll);
  }, [onMoveAction, onScroll, onTapStop]);

  const onTapStart = React.useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        (target && target.closest(".not-selectable")) ||
        target.closest(".tile-selected") ||
        target.closest(".table-row-selected") ||
        target.closest(".row-selected") ||
        !target.closest("#sectionScroll") ||
        target.closest(".table-container_row-checkbox") ||
        target.closest(".item-file-name")
      )
        return;

      const selectables = document.getElementsByClassName(selectableClass);

      if (!selectables.length) return;

      areaLocation.current = { x1: e.clientX, y1: e.clientY, x2: 0, y2: 0 };

      const scroll =
        scrollClass && document.getElementsByClassName(scrollClass)
          ? document.getElementsByClassName(scrollClass)[0]
          : document;

      if (scroll instanceof Element) {
        scrollElement.current = scroll;
      }

      if (scroll instanceof Element)
        scrollDelta.current = {
          x: scroll.scrollLeft,
          y: scroll.scrollTop,
        };

      const threshold = 10;
      const { x1, y1 } = areaLocation.current;

      if (
        Math.abs(e.clientX - x1) >= threshold ||
        Math.abs(e.clientY - y1) >= threshold
      ) {
        onMove?.({ added: [], removed: [], clear: true });
      }

      addListeners();

      const itemsContainer =
        document.getElementsByClassName(itemsContainerClass);

      if (!itemsContainer?.length) return;

      try {
        const itemsContainerRect = itemsContainer[0].getBoundingClientRect();

        if (scroll instanceof Element) {
          if (!isRooms && viewAs === "tile") {
            elemRect.current.top =
              scroll.scrollTop + itemsContainerRect.top + folderHeaderHeight!;
            elemRect.current.left = scroll.scrollLeft + itemsContainerRect.left;
          } else {
            elemRect.current.top = scroll.scrollTop + itemsContainerRect.top;
            elemRect.current.left = scroll.scrollLeft + itemsContainerRect.left;
          }
        }
      } catch (err) {
        console.error("Error getting container bounds:", err);
        return;
      }

      const newElemRect = itemsContainer[0]
        .getElementsByClassName(selectableClass)[0]
        .getBoundingClientRect();

      elemRect.current.width = newElemRect.width;
      elemRect.current.height = newElemRect.height;
    },
    [
      addListeners,
      folderHeaderHeight,
      isRooms,
      itemsContainerClass,
      onMove,
      scrollClass,
      selectableClass,
      viewAs,
    ],
  );

  React.useEffect(() => {
    document.addEventListener("mousedown", onTapStart);

    return () => {
      document.removeEventListener("mousedown", onTapStart);
    };
  }, [onTapStart]);

  React.useEffect(() => {
    arrayOfTypes.current = [];
  }, [isRooms, viewAs]);

  return (
    <div
      ref={areaRef}
      className={`${styles.selectionArea} selection-area`}
      data-testid="selection-area"
    />
  );
};

export { SelectionArea };
