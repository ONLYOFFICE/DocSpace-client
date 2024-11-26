// (c) Copyright Ascensio System SIA 2009-2024
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

import { Portal } from "../portal";
import { DomHelpers, isTablet } from "../../utils";

import StyledDropdown from "./DropDown.styled";

import { VirtualList } from "./sub-components/VirtualList";
import { Row } from "./sub-components/Row";

import { DropDownProps } from "./DropDown.types";
import { DEFAULT_PARENT_HEIGHT } from "./DropDown.constants";
import { isIOS, isMobile } from "react-device-detect";

const DropDown = ({
  directionY = "bottom",
  directionX = "left",

  open,
  enableOnClickOutside,
  isDefaultMode = true,
  fixedDirection = false,
  smallSectionWidth,
  forwardedRef,
  disableOnClickOutside,
  right,
  offsetLeft = 0,
  top,
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
}: DropDownProps) => {
  const theme = useTheme();

  const documentResizeListener = React.useRef<null | (() => void)>(null);
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

    const dropDownHeight = dropDownRef.current?.offsetParent
      ? dropDownRef.current.offsetHeight
      : DomHelpers.getHiddenElementOuterHeight(dropDownRef.current);

    let bottom = parentRects.bottom;

    const viewport = DomHelpers.getViewport();
    const scrollBarWidth =
      viewport.width - document.documentElement.clientWidth;

    const dropDownRects = dropDownRef.current?.getBoundingClientRect();

    if (
      directionY === "top" ||
      (directionY === "both" &&
        parentRects.bottom + dropDownHeight > viewport.height)
    ) {
      bottom -= parent.current.clientHeight + dropDownHeight;
      if (topSpace && bottom < 0) bottom = topSpace;
    }

    if (dropDown) {
      if (theme?.interfaceDirection === "ltr") {
        if (right) {
          dropDown.style.right = right;
        } else if (directionX === "right") {
          dropDown.style.left = `${parentRects.right - dropDown.clientWidth}px`;
        } else if (
          dropDownRects &&
          parentRects.left + dropDownRects.width > viewport.width
        ) {
          if (parentRects.right - dropDownRects.width < 0) {
            dropDown.style.left = "0px";
          } else {
            dropDown.style.left = `${
              parentRects.right - dropDown.clientWidth
            }px`;
          }
        } else {
          dropDown.style.left = `${parentRects.left + offsetLeft}px`;
        }
      } else if (right) {
        dropDown.style.left = right;
      } else if (directionX === "right") {
        dropDown.style.left = `${parentRects.left - scrollBarWidth}px`;
      } else if (dropDownRects && parentRects.right - dropDownRects.width < 0) {
        if (parentRects.left + dropDownRects.width > viewport.width) {
          dropDown.style.left = `${
            viewport.width - dropDown.clientWidth - scrollBarWidth
          }px`;
        } else {
          dropDown.style.left = `${parentRects.left - scrollBarWidth}px`;
        }
      } else {
        dropDown.style.left = `${
          parentRects.right - dropDown.clientWidth - offsetLeft - scrollBarWidth
        }px`;
      }
    }
    if (dropDownRef.current)
      dropDownRef.current.style.top = top || `${bottom}px`;

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
    offsetLeft,
    right,
    theme?.interfaceDirection,
    top,
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

    if (dropDownRef.current) {
      const isRtl = theme?.interfaceDirection === "rtl";
      const rects = dropDownRef.current.getBoundingClientRect();
      const parentRects = forwardedRef?.current?.getBoundingClientRect();

      const container = DomHelpers.getViewport();

      const dimensions = parentRects
        ? {
            toTopCorner: parentRects.top,
            parentHeight: parentRects.height,
            containerHeight: parentRects.top,
          }
        : {
            toTopCorner: rects.top,
            parentHeight: DEFAULT_PARENT_HEIGHT,
            containerHeight: container.height,
          };

      let left;
      let rightVar;

      if (isRtl) {
        rightVar =
          rects.right > container.width && rects.width < container.width;
        left =
          rects.width &&
          rects.right > (container.width - rects.width || 250) &&
          rects.right < container.width - rects.width &&
          rects.width < container.width;
      } else {
        left = rects.left < 0 && rects.width < container.width;
        rightVar =
          rects.width &&
          rects.left < (rects.width || 250) &&
          rects.left > rects.width &&
          rects.width < container.width;
      }

      const topVar =
        rects.bottom > dimensions.containerHeight &&
        dimensions.toTopCorner > rects.height;
      const bottom = rects.top < 0;

      const x = left
        ? "left"
        : rightVar || smallSectionWidth
          ? "right"
          : state.directionX;

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
    }
  }, [
    fixedDirection,
    theme?.interfaceDirection,
    forwardedRef,
    smallSectionWidth,
    state.directionX,
    state.directionY,
    state.manualY,
  ]);

  // const handleClickOutside = (e: any) => {
  //   if (e.type !== "touchstart") {
  //     e.preventDefault();
  //   }

  //   toggleDropDown(e);
  // };

  // const toggleDropDown = (e: any) => {
  //   clickOutsideAction?.(e, open);
  // };

  const bindDocumentResizeListener = React.useCallback(() => {
    if (!documentResizeListener.current) {
      documentResizeListener.current = () => {
        if (open) {
          if (isDefaultMode) {
            checkPositionPortal();
          } else {
            checkPosition();
          }
        }
      };

      window.addEventListener("resize", documentResizeListener.current);

      if (isIOS && isMobile)
        window.visualViewport?.addEventListener(
          "resize",
          documentResizeListener.current,
        );
    }
  }, [checkPosition, checkPositionPortal, isDefaultMode, open]);

  const unbindDocumentResizeListener = React.useCallback(() => {
    if (documentResizeListener.current) {
      window.removeEventListener("resize", documentResizeListener.current);

      if (isIOS && isMobile)
        window.visualViewport?.removeEventListener(
          "resize",
          documentResizeListener.current,
        );

      documentResizeListener.current = null;
    }
  }, []);

  const getItemHeight = (item: React.ReactElement) => {
    const isTabletDevice = isTablet();

    const height = item?.props.height ?? 32;
    const heightTablet = item?.props.heightTablet ?? 36;

    if (item && item.props.isSeparator) {
      return isTabletDevice ? 16 : 12;
    }

    return isTabletDevice ? heightTablet : height;
  };

  const hideDisabledItems = () => {
    if (React.Children.count(children) > 0) {
      const enabledChildren = React.Children.map(children, (child) => {
        const props =
          child &&
          React.isValidElement(child) &&
          (child.props as { disabled?: boolean });
        if (props && !props?.disabled) return child;
      });

      const sizeEnabledChildren = enabledChildren?.length;

      const cleanChildren = React.Children.map(
        enabledChildren,
        (child, index) => {
          const props =
            child &&
            React.isValidElement(child) &&
            (child.props as { isSeparator?: boolean });
          if (props && !props?.isSeparator) return child;
          if (
            index !== 0 &&
            sizeEnabledChildren &&
            index !== sizeEnabledChildren - 1
          )
            return child;
        },
      );

      return cleanChildren;
    }
  };

  const renderDropDown = () => {
    // Need to avoid conflict between inline styles from checkPositionPortal and styled-component styles
    const directionXStylesDisabled =
      isDefaultMode && forwardedRef?.current && !fixedDirection;

    let cleanChildren = children;
    let itemCount = children ? React.Children.toArray(children).length : 0;

    if (!showDisabledItems) {
      cleanChildren = hideDisabledItems();
      if (cleanChildren)
        itemCount = React.Children.toArray(cleanChildren).length;
    }

    const rowHeights =
      cleanChildren &&
      Array.isArray(cleanChildren) &&
      React.Children.map(cleanChildren, (child: React.ReactElement) => {
        return getItemHeight(child);
      });

    const getItemSize = (index: number) => rowHeights && rowHeights[index];
    const fullHeight =
      cleanChildren &&
      rowHeights &&
      rowHeights.reduce((a: number, b: number) => a + b, 0);
    const calculatedHeight =
      fullHeight > 0 && maxHeight && fullHeight < maxHeight
        ? fullHeight
        : maxHeight;

    const dropDownMaxHeightProp = maxHeight
      ? { height: `${calculatedHeight}px` }
      : {};

    return (
      <>
        {/* {withBackdrop ? ( //TODO: consider a solution when there will be a structure of correct z index for components
          <Backdrop
            visible={open || false}
            zIndex={199} // TODO: zIndex should almost be equal to the dropdown index
            onClick={toggleDropDown}
            withoutBlur={!withBlur}
            isAside={isAside}
            withBackground={withBackground}
            withoutBackground={withoutBackground}
          />
        ) : null} */}
        <StyledDropdown
          ref={dropDownRef}
          style={style}
          // {...this.props}
          directionX={state.directionX}
          directionY={state.directionY}
          manualY={state.manualY}
          isMobileView={isMobileView}
          itemCount={itemCount}
          {...dropDownMaxHeightProp}
          directionXStylesDisabled={directionXStylesDisabled}
          isDropdownReady={state.isDropdownReady}
          open={open}
          maxHeight={maxHeight}
          zIndex={zIndex}
          manualWidth={manualWidth}
          className={className}
          manualX={manualX}
        >
          <VirtualList
            Row={Row}
            theme={theme}
            width={state.width}
            itemCount={itemCount}
            maxHeight={maxHeight}
            cleanChildren={cleanChildren}
            calculatedHeight={calculatedHeight}
            isNoFixedHeightOptions={isNoFixedHeightOptions || false}
            getItemSize={getItemSize}
            isOpen={open || false}
            enableKeyboardEvents={enableKeyboardEvents || false}
          >
            {children}
          </VirtualList>
        </StyledDropdown>
      </>
    );
  };

  React.useEffect(() => {
    if (open) {
      enableOnClickOutside?.();
      bindDocumentResizeListener();
      if (isDefaultMode) {
        setTimeout(() => checkPositionPortal?.(), 0);
        return;
      }
      checkPosition?.();
    } else {
      // disableOnClickOutside;
    }
  }, [
    checkPosition,
    checkPositionPortal,
    enableOnClickOutside,
    // disableOnClickOutside,
    isDefaultMode,
    open,
    bindDocumentResizeListener,
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

  React.useEffect(() => {
    return () => {
      // disableOnClickOutside?.();
      unbindDocumentResizeListener();
    };
  }, [disableOnClickOutside, unbindDocumentResizeListener]);

  const element = renderDropDown();

  if (isDefaultMode) {
    return <Portal element={element} appendTo={appendTo} />;
  }

  return element;
};

const EnhancedComponent = DropDown;

export { EnhancedComponent };
