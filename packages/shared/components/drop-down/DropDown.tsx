import React from "react";
import { useTheme } from "styled-components";
import { isIOS, isMobileOnly } from "react-device-detect";
import { Portal } from "../portal";
import { DomHelpers, isTablet } from "../../utils";

import StyledDropdown from "./DropDown.styled";

import { VirtualList } from "./sub-components/VirtualList";
import { Row } from "./sub-components/Row";

import { DropDownProps } from "./DropDown.types";
import { DEFAULT_PARENT_HEIGHT } from "./DropDown.constants";

const DropDown = ({
  directionY,
  directionX,
  manualY,
  open,
  enableOnClickOutside,
  isDefaultMode,
  fixedDirection,
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
  clickOutsideAction,
}: DropDownProps) => {
  const theme = useTheme();

  const documentResizeListener = React.useRef<null | (() => void)>(null);
  const dropDownRef = React.useRef<null | HTMLDivElement>(null);

  const [state, setState] = React.useState({
    directionX,
    directionY,
    manualY,
    width: 0,
    borderOffset: theme?.isBase ? 0 : 2, // need to remove the difference in width with the parent in a dark theme
    isDropdownReady: false, // need to avoid scrollbar appearing during dropdown position calculation
  });

  const checkPositionPortal = React.useCallback(() => {
    const parent = forwardedRef;

    if (!parent?.current || fixedDirection) {
      setState((s) => ({ ...s, isDropdownReady: true }));
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
      width: dropDownRef.current
        ? dropDownRef.current.offsetWidth - state.borderOffset
        : 240,
      isDropdownReady: true,
    }));
  }, [
    directionX,
    directionY,
    fixedDirection,
    forwardedRef,
    offsetLeft,
    right,
    state.borderOffset,
    theme?.interfaceDirection,
    top,
  ]);

  const checkPosition = React.useCallback(() => {
    if (!dropDownRef.current || fixedDirection) {
      setState((s) => ({ ...s, isDropdownReady: true }));
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
        width: dropDownRef.current
          ? dropDownRef.current.offsetWidth - state.borderOffset
          : 240,
        isDropdownReady: true,
      }));
    }
  }, [
    fixedDirection,
    forwardedRef,
    smallSectionWidth,
    state.directionX,
    state.borderOffset,
    state.directionY,
    state.manualY,
    theme?.interfaceDirection,
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
    }
  }, [checkPosition, checkPositionPortal, isDefaultMode, open]);

  const unbindDocumentResizeListener = React.useCallback(() => {
    if (documentResizeListener.current) {
      window.removeEventListener("resize", documentResizeListener.current);
      documentResizeListener.current = null;
    }
  }, []);

  const getItemHeight = (item: React.ReactElement) => {
    const isTabletDevice = isTablet();

    const height = item?.props.height;
    const heightTablet = item?.props.heightTablet;

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
    let itemCount =
      children && React.isValidElement(children)
        ? React.Children.toArray(children).length
        : 0;

    if (!showDisabledItems) {
      cleanChildren = hideDisabledItems();
      if (cleanChildren)
        itemCount = React.Children.toArray(cleanChildren).length;
    }

    const rowHeights =
      cleanChildren &&
      React.isValidElement(cleanChildren) &&
      React.Children.map(cleanChildren, (child: React.ReactElement) =>
        getItemHeight(child),
      );

    const getItemSize = (index: number) => rowHeights && rowHeights[index];
    const fullHeight =
      cleanChildren &&
      rowHeights &&
      rowHeights.reduce((a: number, b: number) => a + b, 0);
    let calculatedHeight =
      fullHeight > 0 && maxHeight && fullHeight < maxHeight
        ? fullHeight
        : maxHeight;

    const container = DomHelpers.getViewport();

    if (
      isIOS &&
      isMobileOnly &&
      container?.height !== window.visualViewport?.height
    ) {
      const rects = dropDownRef.current?.getBoundingClientRect();
      const parentRects = forwardedRef?.current?.getBoundingClientRect();

      const parentHeight = parentRects?.height || DEFAULT_PARENT_HEIGHT;

      if (window.visualViewport) {
        const rectsTop = rects?.top || 0;

        const height = window.visualViewport.height - rectsTop - parentHeight;

        if (rects && calculatedHeight > height) calculatedHeight = height;
      }
    }

    const dropDownMaxHeightProp = maxHeight
      ? { height: `${calculatedHeight}px` }
      : {};

    return (
      <StyledDropdown
        ref={dropDownRef}
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

    eventTypes?.forEach((type) => {
      window.addEventListener(type, listener);
    });

    return () => {
      eventTypes?.forEach((type) => {
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
