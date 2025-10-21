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
import classNames from "classnames";
import { isIOS, isMobile } from "react-device-detect";

import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";

import { Portal } from "../portal";
import { DomHelpers } from "../../utils";

import { VirtualList } from "./sub-components/VirtualList";
import { Row } from "./sub-components/Row";

import { DropDownProps } from "./DropDown.types";
import { DEFAULT_PARENT_HEIGHT } from "./DropDown.constants";
import { getItemHeight, hideDisabledItems } from "./DropDown.utils";
import styles from "./DropDown.module.scss";
import type { TDirectionX } from "../../types";

const DropDown = ({
  directionY = "bottom",
  directionX = "right",

  open,
  enableOnClickOutside,
  isDefaultMode = true,
  fixedDirection = false,
  forwardedRef,
  offsetX = 0,
  children,
  maxHeight,
  showDisabledItems,
  isMobileView,
  isNoFixedHeightOptions,
  enableKeyboardEvents,
  appendTo,
  eventTypes,
  zIndex,
  clickOutsideAction,
  manualWidth,
  manualX,
  manualY,
  className,
  style,
  topSpace,
  backDrop,
  dataTestId,
}: DropDownProps) => {
  const { isRTL } = useInterfaceDirection();

  const dropDownRef = React.useRef<null | HTMLDivElement>(null);

  const [state, setState] = React.useState({
    directionX,
    directionY,
    manualY,
    width: 0,
    isDropdownReady: false, // need to avoid scrollbar appearing during dropdown position calculation
  });

  const checkPositionPortal = React.useCallback(() => {
    const parent = forwardedRef;

    if (!parent?.current || fixedDirection) {
      setState((s) => ({
        ...s,
        isDropdownReady: true,
        width: dropDownRef.current?.offsetWidth || 0,
      }));
      return;
    }

    const dropDown = dropDownRef.current;

    const parentRects = parent.current.getBoundingClientRect();

    const dropDownHeight = dropDown?.offsetParent
      ? dropDown.offsetHeight
      : DomHelpers.getHiddenElementOuterHeight(dropDown);

    let { bottom } = parentRects;

    const viewport = DomHelpers.getViewport();
    const scrollBarWidth =
      viewport.width - document.documentElement.clientWidth;

    const dropDownRects = dropDown?.getBoundingClientRect();

    if (
      directionY === "top" ||
      (directionY === "both" &&
        parentRects.bottom + dropDownHeight > viewport.height)
    ) {
      bottom -= parent.current.clientHeight + dropDownHeight;
      if (topSpace && bottom < 0) bottom = topSpace;
    }

    if (dropDown && dropDownRects) {
      // directionX logic

      // Check available space around the parent
      const hasRightSpace =
        parentRects.left + dropDownRects.width + offsetX < viewport.width;
      const hasLeftSpace =
        parentRects.right - dropDownRects.width - offsetX > 0;
      const hasNoSpace = !hasRightSpace && !hasLeftSpace;

      // Determine if start/end alignment is possible
      const canAlignStart = isRTL ? hasLeftSpace : hasRightSpace;
      const canAlignEnd = isRTL ? hasRightSpace : hasLeftSpace;

      // Alignment functions
      const alignToParentStart = () => {
        const left = isRTL
          ? parentRects.right - dropDownRects.width - scrollBarWidth - offsetX
          : parentRects.left + offsetX;

        dropDown.style.left = `${left}px`;
      };

      const alignToParentEnd = () => {
        const left = isRTL
          ? parentRects.left - scrollBarWidth + offsetX
          : parentRects.right - dropDownRects.width - offsetX;

        dropDown.style.left = `${left}px`;
      };

      const alignToViewportStart = () => {
        const left = isRTL ? viewport.width - dropDownRects.width : 0;

        dropDown.style.left = `${left}px`;
      };

      // Alignment logic based on direction and space
      const alignMap: Record<TDirectionX | "hasNoSpace", () => void> = {
        right: canAlignStart ? alignToParentStart : alignToParentEnd,
        left: canAlignEnd ? alignToParentEnd : alignToParentStart,
        hasNoSpace: alignToViewportStart,
      };

      // Apply alignment
      const setAlignment = alignMap[hasNoSpace ? "hasNoSpace" : directionX];
      setAlignment();
    }
    if (dropDownRef.current)
      dropDownRef.current.style.top = `${bottom + window.scrollY}px`;

    setState((s) => ({
      ...s,
      directionX,
      directionY,
      width: dropDownRef.current ? dropDownRef.current.offsetWidth : 240,
      isDropdownReady: true,
    }));
  }, [
    directionX,
    directionY,
    fixedDirection,
    forwardedRef,
    offsetX,
    isRTL,
    topSpace,
  ]);

  const checkPosition = React.useCallback(() => {
    if (!dropDownRef.current || fixedDirection) {
      setState((s) => ({
        ...s,
        isDropdownReady: true,
        width: dropDownRef.current?.offsetWidth || 0,
      }));
      return;
    }

    const rects = dropDownRef.current.getBoundingClientRect();
    const parentRects = forwardedRef?.current?.getBoundingClientRect();

    const container = DomHelpers.getViewport();

    const dimensions = parentRects
      ? {
          toTopCorner: parentRects.top,
          parentHeight: parentRects.height,
          containerHeight: container.height,
        }
      : {
          toTopCorner: rects.top,
          parentHeight: DEFAULT_PARENT_HEIGHT,
          containerHeight: container.height,
        };

    let left;
    let rightVar;

    if (isRTL) {
      left = rects.left < 0 && rects.width < container.width;
      rightVar = rects.right > container.width && rects.width < container.width;
    } else {
      left = rects.right > container.width && rects.width < container.width;
      rightVar = rects.left < 0 && rects.width < container.width;
    }

    const topVar =
      rects.bottom > dimensions.containerHeight &&
      dimensions.toTopCorner > rects.height;
    const bottom = rects.top < 0;

    const x = left ? "left" : rightVar ? "right" : state.directionX;

    const y = bottom ? "bottom" : topVar ? "top" : state.directionY;

    const mY = topVar ? `${dimensions.parentHeight}px` : state.manualY;

    setState((s) => ({
      ...s,
      directionX: x,
      directionY: y,
      manualY: mY,
      width: dropDownRef.current ? dropDownRef.current.offsetWidth : 240,
      isDropdownReady: true,
    }));
  }, [fixedDirection, isRTL, forwardedRef, directionX, directionY, manualY]);

  const renderDropDown = () => {
    const directionXStylesDisabled =
      isDefaultMode && forwardedRef?.current && !fixedDirection;

    let cleanChildren = children;
    let itemCount = children ? React.Children.toArray(children).length : 0;

    if (!showDisabledItems) {
      cleanChildren = hideDisabledItems(cleanChildren);
      if (cleanChildren)
        itemCount = React.Children.toArray(cleanChildren).length;
    }

    const rowHeights =
      cleanChildren &&
      Array.isArray(cleanChildren) &&
      React.Children.map(cleanChildren, (child: React.ReactElement) => {
        return getItemHeight(child);
      });

    const getItemSize = (index: number) =>
      (rowHeights && rowHeights[index]) as number;
    const fullHeight =
      (cleanChildren &&
        rowHeights &&
        rowHeights.reduce((a: number, b: number) => a + b, 0)) ||
      0;
    const calculatedHeight =
      fullHeight > 0 && maxHeight && fullHeight < maxHeight
        ? fullHeight
        : maxHeight;

    const dropDownMaxHeightProp = maxHeight
      ? { height: `${calculatedHeight}px` }
      : {};

    const dropDownStyles: React.CSSProperties = {
      ...dropDownMaxHeightProp,
      ...style,
      ["--z-index" as string]: zIndex,
      ["--max-height" as string]: maxHeight && `${maxHeight}px`,
      ["--manual-width" as string]: manualWidth,
      ["--manual-x" as string]: manualX,
      ["--manual-y" as string]: state.manualY,
    };

    const dropDownClasses = classNames(styles.dropDown, className, {
      "dropdown-container": true,
      [styles.directionTop]: state.directionY === "top",
      [styles.directionBottom]: state.directionY === "bottom",
      [styles.directionRight]:
        state.directionX === "right" && !directionXStylesDisabled,
      [styles.directionLeft]:
        state.directionX === "left" && !directionXStylesDisabled,
      [styles.open]: open,
      [styles.mobileView]: isMobileView,
      [styles.directionXStylesDisabled]: directionXStylesDisabled,
      [styles.maxHeight]: maxHeight,
      [styles.withManualWidth]: manualWidth,
      [styles.notReady]: !state.isDropdownReady,
    });

    return (
      <>
        {isDefaultMode ? backDrop : null}

        <div
          ref={dropDownRef}
          style={dropDownStyles}
          className={dropDownClasses}
          data-testid={dataTestId ?? "dropdown"}
          role="listbox"
        >
          <VirtualList
            Row={Row}
            width={state.width}
            itemCount={itemCount}
            maxHeight={maxHeight}
            cleanChildren={cleanChildren}
            calculatedHeight={calculatedHeight || 0}
            isNoFixedHeightOptions={isNoFixedHeightOptions ?? false}
            getItemSize={getItemSize}
            isOpen={open ?? false}
            enableKeyboardEvents={enableKeyboardEvents ?? false}
          >
            {children}
          </VirtualList>
        </div>
      </>
    );
  };

  React.useLayoutEffect(() => {
    const resizeListener = () => {
      if (isDefaultMode) {
        checkPositionPortal();
      } else {
        checkPosition();
      }
    };

    if (open) {
      enableOnClickOutside?.();

      window.addEventListener("resize", resizeListener);

      if (isIOS && isMobile)
        window.visualViewport?.addEventListener("resize", resizeListener);

      if (isDefaultMode) {
        setTimeout(checkPositionPortal, 0);
      } else checkPosition();
    } else {
      window.removeEventListener("resize", resizeListener);

      if (isIOS && isMobile)
        window.visualViewport?.removeEventListener("resize", resizeListener);
    }

    return () => {
      setState((s) => ({ ...s, isDropdownReady: false }));
      window.removeEventListener("resize", resizeListener);

      if (isIOS && isMobile)
        window.visualViewport?.removeEventListener("resize", resizeListener);
    };
  }, [
    checkPosition,
    checkPositionPortal,
    enableOnClickOutside,

    isDefaultMode,
    open,
  ]);

  React.useEffect(() => {
    if (!dropDownRef.current) return;

    const listener = (evt: Event) => {
      const target = evt.target as HTMLElement;

      if (dropDownRef.current && dropDownRef.current.contains(target)) return;

      clickOutsideAction?.(evt, !open);
    };

    const types: string[] = !eventTypes
      ? []
      : Array.isArray(eventTypes)
        ? eventTypes
        : [eventTypes];

    if (!open) {
      types?.forEach((type) => {
        window.removeEventListener(type, listener);
      });

      return;
    }

    types?.forEach((type) => {
      window.addEventListener(type, listener);
    });

    return () => {
      types?.forEach((type) => {
        window.removeEventListener(type, listener);
      });
    };
  }, [clickOutsideAction, eventTypes, open]);

  const element = renderDropDown();

  if (isDefaultMode) {
    return <Portal element={element} appendTo={appendTo} />;
  }

  return element;
};

const EnhancedComponent = DropDown;

export { EnhancedComponent };
