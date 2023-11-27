import React, { memo } from "react";
import PropTypes from "prop-types";

// @ts-expect-error TS(7016): Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import onClickOutside from "react-onclickoutside";
import { isIOS, isMobileOnly, isMobile } from "react-device-detect";
import Portal from "../portal";
import DomHelpers from "../utils/domHelpers";

import DropDownItem from "../drop-down-item";
import Backdrop from "../backdrop";
import StyledDropdown from "./styled-drop-down";
import VirtualList from "./VirtualList";
import { withTheme } from "styled-components";
/* eslint-disable react/prop-types, react/display-name */

const DEFAULT_PARENT_HEIGHT = 42;

// @ts-expect-error TS(2339): Property 'data' does not exist on type '{}'.
const Row = memo(({ data, index, style }) => {
  const { children, theme, activedescendant, handleMouseMove } = data;

  const option = children[index];

  const separator = option?.props?.isSeparator
    ? { width: `calc(100% - 32px)`, height: `1px` }
    : {};
  const newStyle = { ...style, ...separator };

  return (
    <DropDownItem
      theme={theme}
      // eslint-disable-next-line react/prop-types
      {...option?.props}
      noHover
      style={newStyle}
      onMouseMove={() => {
        handleMouseMove(index);
      }}
      isActiveDescendant={activedescendant === index}
    />
  );
});

class DropDown extends React.PureComponent {
  documentResizeListener: any;
  dropDownRef: any;
  constructor(props: any) {
    super(props);

    this.state = {
      directionX: props.directionX,
      directionY: props.directionY,
      manualY: props.manualY,
      borderOffset: props.theme.isBase ? 0 : 2, // need to remove the difference in width with the parent in a dark theme
      isDropdownReady: false, // need to avoid scrollbar appearing during dropdown position calculation
      // @ts-expect-error TS(1117): An object literal cannot have multiple properties ... Remove this comment to see the full error message
      borderOffset: props.theme.isBase ? 0 : 2, // need to remove the difference in width with the parent in a dark theme
    };

    this.dropDownRef = React.createRef();
  }

  componentDidMount() {
    // @ts-expect-error TS(2339): Property 'open' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    if (this.props.open) {
      // @ts-expect-error TS(2339): Property 'enableOnClickOutside' does not exist on ... Remove this comment to see the full error message
      this.props.enableOnClickOutside();
      // @ts-expect-error TS(2339): Property 'isDefaultMode' does not exist on type 'R... Remove this comment to see the full error message
      if (this.props.isDefaultMode) {
        return setTimeout(() => this.checkPositionPortal(), 0); // ditry, but need after render for ref
      }
      return this.checkPosition();
    }
  }

  componentWillUnmount() {
    // @ts-expect-error TS(2339): Property 'disableOnClickOutside' does not exist on... Remove this comment to see the full error message
    this.props.disableOnClickOutside();
    this.unbindDocumentResizeListener();
  }

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'open' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    if (this.props.open !== prevProps.open) {
      // @ts-expect-error TS(2339): Property 'open' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      if (this.props.open) {
        // @ts-expect-error TS(2339): Property 'enableOnClickOutside' does not exist on ... Remove this comment to see the full error message
        this.props.enableOnClickOutside(); //fixed main-button-mobile click, remove !isMobile if have dd problem
        this.bindDocumentResizeListener();
        // @ts-expect-error TS(2339): Property 'isDefaultMode' does not exist on type 'R... Remove this comment to see the full error message
        if (this.props.isDefaultMode) {
          return this.checkPositionPortal();
        }
        return this.checkPosition();
      } else {
        // @ts-expect-error TS(2339): Property 'disableOnClickOutside' does not exist on... Remove this comment to see the full error message
        this.props.disableOnClickOutside();
      }
    }
  }

  handleClickOutside = (e: any) => {
    if (e.type !== "touchstart") {
      e.preventDefault();
    }

    this.toggleDropDown(e);
  };

  toggleDropDown = (e: any) => {
    // @ts-expect-error TS(2339): Property 'clickOutsideAction' does not exist on ty... Remove this comment to see the full error message
    this.props.clickOutsideAction &&
      // @ts-expect-error TS(2339): Property 'clickOutsideAction' does not exist on ty... Remove this comment to see the full error message
      this.props.clickOutsideAction(e, !this.props.open);
  };

  bindDocumentResizeListener() {
    if (!this.documentResizeListener) {
      this.documentResizeListener = (e: any) => {
        // @ts-expect-error TS(2339): Property 'open' does not exist on type 'Readonly<{... Remove this comment to see the full error message
        if (this.props.open) {
          // @ts-expect-error TS(2339): Property 'isDefaultMode' does not exist on type 'R... Remove this comment to see the full error message
          if (this.props.isDefaultMode) {
            this.checkPositionPortal();
          } else {
            this.checkPosition();
          }
        }
      };

      window.addEventListener("resize", this.documentResizeListener);
    }
  }

  unbindDocumentResizeListener() {
    if (this.documentResizeListener) {
      window.removeEventListener("resize", this.documentResizeListener);
      this.documentResizeListener = null;
    }
  }

  checkPosition = () => {
    // @ts-expect-error TS(2339): Property 'fixedDirection' does not exist on type '... Remove this comment to see the full error message
    if (!this.dropDownRef.current || this.props.fixedDirection) {
      this.setState({ isDropdownReady: true });
      return;
    }
    // @ts-expect-error TS(2339): Property 'smallSectionWidth' does not exist on typ... Remove this comment to see the full error message
    const { smallSectionWidth, forwardedRef } = this.props;
    // @ts-expect-error TS(2339): Property 'manualY' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { manualY, borderOffset } = this.state;

    // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const isRtl = this.props.theme.interfaceDirection === "rtl";
    const rects = this.dropDownRef.current.getBoundingClientRect();
    const parentRects = forwardedRef?.current?.getBoundingClientRect();

    const container = DomHelpers.getViewport();

    const dimensions = parentRects
      ? {
          toTopCorner: parentRects.top,
          parentHeight: parentRects.height,
          containerHeight: !parentRects.top,
        }
      : {
          toTopCorner: rects.top,
          parentHeight: DEFAULT_PARENT_HEIGHT,
          containerHeight: container.height,
        };

    let left;
    let right;

    if (isRtl) {
      right = rects.right > container.width && rects.width < container.width;
      left =
        rects.width &&
        rects.right > (container.width - rects.width || 250) &&
        rects.right < container.width - rects.width &&
        rects.width < container.width;
    } else {
      left = rects.left < 0 && rects.width < container.width;
      right =
        rects.width &&
        rects.left < (rects.width || 250) &&
        rects.left > rects.width &&
        rects.width < container.width;
    }

    const top =
      rects.bottom > dimensions.containerHeight &&
      dimensions.toTopCorner > rects.height;
    const bottom = rects.top < 0;

    const x = left
      ? "left"
      : right || smallSectionWidth
      ? "right"
      // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Read... Remove this comment to see the full error message
      : this.state.directionX;
    // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Read... Remove this comment to see the full error message
    const y = bottom ? "bottom" : top ? "top" : this.state.directionY;

    const mY = top ? `${dimensions.parentHeight}px` : manualY;

    this.setState({
      directionX: x,
      directionY: y,
      manualY: mY,
      width: this.dropDownRef
        ? this.dropDownRef.current.offsetWidth - borderOffset
        : 240,
      isDropdownReady: true,
    });
  };

  checkPositionPortal = () => {
    // @ts-expect-error TS(2339): Property 'forwardedRef' does not exist on type 'Re... Remove this comment to see the full error message
    const parent = this.props.forwardedRef;
    // @ts-expect-error TS(2339): Property 'fixedDirection' does not exist on type '... Remove this comment to see the full error message
    if (!parent?.current || this.props.fixedDirection) {
      this.setState({ isDropdownReady: true });
      return;
    }
    const dropDown = this.dropDownRef.current;
    // @ts-expect-error TS(2339): Property 'borderOffset' does not exist on type 'Re... Remove this comment to see the full error message
    const { borderOffset } = this.state;

    const parentRects = parent.current.getBoundingClientRect();

    let dropDownHeight = this.dropDownRef.current?.offsetParent
      ? this.dropDownRef.current.offsetHeight
      : DomHelpers.getHiddenElementOuterHeight(this.dropDownRef.current);

    let bottom = parentRects.bottom;

    const viewport = DomHelpers.getViewport();
    const scrollBarWidth =
      viewport.width - document.documentElement.clientWidth;
    const dropDownRects = this.dropDownRef.current.getBoundingClientRect();

    if (
      // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Read... Remove this comment to see the full error message
      this.props.directionY === "top" ||
      // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Read... Remove this comment to see the full error message
      (this.props.directionY === "both" &&
        parentRects.bottom + dropDownHeight > viewport.height)
    ) {
      bottom -= parent.current.clientHeight + dropDownHeight;
    }

    // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
    if (this.props.theme.interfaceDirection === "ltr") {
      // @ts-expect-error TS(2339): Property 'right' does not exist on type 'Readonly<... Remove this comment to see the full error message
      if (this.props.right) {
        // @ts-expect-error TS(2339): Property 'right' does not exist on type 'Readonly<... Remove this comment to see the full error message
        dropDown.style.right = this.props.right;
      // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Read... Remove this comment to see the full error message
      } else if (this.props.directionX === "right") {
        dropDown.style.left = parentRects.right - dropDown.clientWidth + "px";
      } else if (parentRects.left + dropDownRects.width > viewport.width) {
        if (parentRects.right - dropDownRects.width < 0) {
          dropDown.style.left = 0 + "px";
        } else {
          dropDown.style.left = parentRects.right - dropDown.clientWidth + "px";
        }
      } else {
        // @ts-expect-error TS(2339): Property 'offsetLeft' does not exist on type 'Read... Remove this comment to see the full error message
        dropDown.style.left = parentRects.left + this.props.offsetLeft + "px";
      }
    } else {
      // @ts-expect-error TS(2339): Property 'right' does not exist on type 'Readonly<... Remove this comment to see the full error message
      if (this.props.right) {
        // @ts-expect-error TS(2339): Property 'right' does not exist on type 'Readonly<... Remove this comment to see the full error message
        dropDown.style.left = this.props.right;
      // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Read... Remove this comment to see the full error message
      } else if (this.props.directionX === "right") {
        dropDown.style.left = parentRects.left - scrollBarWidth + "px";
      } else if (parentRects.right - dropDownRects.width < 0) {
        if (parentRects.left + dropDownRects.width > viewport.width) {
          dropDown.style.left =
            viewport.width - dropDown.clientWidth - scrollBarWidth + "px";
        } else {
          dropDown.style.left = parentRects.left - scrollBarWidth + "px";
        }
      } else {
        dropDown.style.left =
          parentRects.right -
          dropDown.clientWidth -
          // @ts-expect-error TS(2339): Property 'offsetLeft' does not exist on type 'Read... Remove this comment to see the full error message
          this.props.offsetLeft -
          scrollBarWidth +
          "px";
      }
    }

    // @ts-expect-error TS(2339): Property 'top' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
    this.dropDownRef.current.style.top = this.props.top || bottom + "px";

    this.setState({
      // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Read... Remove this comment to see the full error message
      directionX: this.props.directionX,
      // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Read... Remove this comment to see the full error message
      directionY: this.props.directionY,
      width: this.dropDownRef
        ? this.dropDownRef.current.offsetWidth - borderOffset
        : 240,
      isDropdownReady: true,
    });
  };

  getItemHeight = (item: any) => {
    const isTablet = window.innerWidth < 1024; //TODO: Make some better

    //if (item && item.props.disabled) return 0;

    let height = item?.props.height;
    let heightTablet = item?.props.heightTablet;

    if (item && item.props.isSeparator) {
      return isTablet ? 16 : 12;
    }

    return isTablet ? heightTablet : height;
  };
  hideDisabledItems = () => {
    // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
    if (React.Children.count(this.props.children) > 0) {
      // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
      const { children } = this.props;
      const enabledChildren = React.Children.map(children, (child) => {
        if (child && !child.props.disabled) return child;
      });

      const sizeEnabledChildren = enabledChildren.length;

      const cleanChildren = React.Children.map(
        enabledChildren,
        (child, index) => {
          if (!child.props.isSeparator) return child;
          if (index !== 0 && index !== sizeEnabledChildren - 1) return child;
        }
      );

      return cleanChildren;
    }
  };

  renderDropDown() {
    const {
      // @ts-expect-error TS(2339): Property 'maxHeight' does not exist on type 'Reado... Remove this comment to see the full error message
      maxHeight,
      // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
      children,
      // @ts-expect-error TS(2339): Property 'showDisabledItems' does not exist on typ... Remove this comment to see the full error message
      showDisabledItems,
      // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
      theme,
      // @ts-expect-error TS(2339): Property 'isMobileView' does not exist on type 'Re... Remove this comment to see the full error message
      isMobileView,
      // @ts-expect-error TS(2339): Property 'isNoFixedHeightOptions' does not exist o... Remove this comment to see the full error message
      isNoFixedHeightOptions,
      // @ts-expect-error TS(2339): Property 'open' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      open,
      // @ts-expect-error TS(2339): Property 'enableKeyboardEvents' does not exist on ... Remove this comment to see the full error message
      enableKeyboardEvents,
    } = this.props;
    // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Read... Remove this comment to see the full error message
    const { directionX, directionY, width, manualY } = this.state;

    // Need to avoid conflict between inline styles from checkPositionPortal and styled-component styles
    const directionXStylesDisabled =
      // @ts-expect-error TS(2339): Property 'isDefaultMode' does not exist on type 'R... Remove this comment to see the full error message
      this.props.isDefaultMode &&
      // @ts-expect-error TS(2339): Property 'forwardedRef' does not exist on type 'Re... Remove this comment to see the full error message
      this.props.forwardedRef.current &&
      // @ts-expect-error TS(2339): Property 'fixedDirection' does not exist on type '... Remove this comment to see the full error message
      !this.props.fixedDirection;

    let cleanChildren = children;
    let itemCount = children.length;

    if (!showDisabledItems) {
      cleanChildren = this.hideDisabledItems();
      if (cleanChildren) itemCount = cleanChildren.length;
    }

    const rowHeights = React.Children.map(cleanChildren, (child) =>
      this.getItemHeight(child)
    );
    const getItemSize = (index: any) => rowHeights[index];
    const fullHeight = cleanChildren && rowHeights.reduce((a: any, b: any) => a + b, 0);
    let calculatedHeight =
      fullHeight > 0 && fullHeight < maxHeight ? fullHeight : maxHeight;

    const container = DomHelpers.getViewport();

    if (
      isIOS &&
      isMobileOnly &&
      container?.height !== window.visualViewport.height
    ) {
      const rects = this.dropDownRef?.current?.getBoundingClientRect();
      const parentRects =
        // @ts-expect-error TS(2339): Property 'forwardedRef' does not exist on type 'Re... Remove this comment to see the full error message
        this.props.forwardedRef?.current?.getBoundingClientRect();

      const parentHeight = parentRects?.height || DEFAULT_PARENT_HEIGHT;

      const height = window.visualViewport.height - rects?.top - parentHeight;

      if (rects && calculatedHeight > height) calculatedHeight = height;
    }

    const dropDownMaxHeightProp = maxHeight
      ? { height: calculatedHeight + "px" }
      : {};

    return (
      <StyledDropdown
        ref={this.dropDownRef}
        {...this.props}
        directionX={directionX}
        directionY={directionY}
        manualY={manualY}
        isMobileView={isMobileView}
        itemCount={itemCount}
        {...dropDownMaxHeightProp}
        // @ts-expect-error TS(2769): No overload matches this call.
        directionXStylesDisabled={directionXStylesDisabled}
        // @ts-expect-error TS(2339): Property 'isDropdownReady' does not exist on type ... Remove this comment to see the full error message
        isDropdownReady={this.state.isDropdownReady}
      >
        // @ts-expect-error TS(2786): 'VirtualList' cannot be used as a JSX component.
        <VirtualList
          Row={Row}
          theme={theme}
          width={width}
          itemCount={itemCount}
          maxHeight={maxHeight}
          cleanChildren={cleanChildren}
          calculatedHeight={calculatedHeight}
          isNoFixedHeightOptions={isNoFixedHeightOptions}
          getItemSize={getItemSize}
          children={children}
          isOpen={open}
          enableKeyboardEvents={enableKeyboardEvents}
        />
      </StyledDropdown>
    );
  }
  render() {
    // @ts-expect-error TS(2339): Property 'isDefaultMode' does not exist on type 'R... Remove this comment to see the full error message
    const { isDefaultMode } = this.props;
    const element = this.renderDropDown();

    if (isDefaultMode) {
      // @ts-expect-error TS(2322): Type '{ element: Element; appendTo: any; }' is not... Remove this comment to see the full error message
      return <Portal element={element} appendTo={this.props.appendTo} />;
    }

    return element;
  }
}

const EnhancedComponent = withTheme(onClickOutside(DropDown));

class DropDownContainer extends React.Component {
  toggleDropDown = () => {
    // @ts-expect-error TS(2339): Property 'clickOutsideAction' does not exist on ty... Remove this comment to see the full error message
    this.props.clickOutsideAction({}, !this.props.open);
  };
  render() {
    const {
      // @ts-expect-error TS(2339): Property 'withBackdrop' does not exist on type 'Re... Remove this comment to see the full error message
      withBackdrop = true,
      // @ts-expect-error TS(2339): Property 'withBlur' does not exist on type 'Readon... Remove this comment to see the full error message
      withBlur = false,
      // @ts-expect-error TS(2339): Property 'open' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      open,
      // @ts-expect-error TS(2339): Property 'isAside' does not exist on type 'Readonl... Remove this comment to see the full error message
      isAside,
      // @ts-expect-error TS(2339): Property 'withBackground' does not exist on type '... Remove this comment to see the full error message
      withBackground,
      // @ts-expect-error TS(2339): Property 'eventTypes' does not exist on type 'Read... Remove this comment to see the full error message
      eventTypes,
      // @ts-expect-error TS(2339): Property 'forceCloseClickOutside' does not exist o... Remove this comment to see the full error message
      forceCloseClickOutside,
      // @ts-expect-error TS(2339): Property 'withoutBackground' does not exist on typ... Remove this comment to see the full error message
      withoutBackground,
    } = this.props;
    const eventTypesProp = forceCloseClickOutside
      ? {}
      : isMobile
      ? { eventTypes: ["click, touchend"] }
      : eventTypes
      ? { eventTypes }
      : {};

    return (
      <>
        {withBackdrop ? (
          <Backdrop
            // @ts-expect-error TS(2322): Type '{ visible: any; zIndex: number; onClick: () ... Remove this comment to see the full error message
            visible={open}
            zIndex={199}
            onClick={this.toggleDropDown}
            withoutBlur={!withBlur}
            isAside={isAside}
            withBackground={withBackground}
            withoutBackground={withoutBackground}
          />
        ) : null}
        <EnhancedComponent
          {...eventTypesProp}
          disableOnClickOutside={true}
          {...this.props}
        />
      </>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DropDown.propTypes = {
  disableOnClickOutside: PropTypes.func,
  enableOnClickOutside: PropTypes.func,
};

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DropDownContainer.propTypes = {
  /** Children elements */
  children: PropTypes.any,
  /** Accepts class */
  className: PropTypes.string,
  /** Required for determining a click outside DropDown with the withBackdrop parameter */
  clickOutsideAction: PropTypes.func,
  /** Sets the opening direction relative to the parent */
  directionX: PropTypes.oneOf(["left", "right"]), //TODO: make more informative
  /** Sets the opening direction relative to the parent */
  directionY: PropTypes.oneOf(["bottom", "top", "both"]),
  /** Accepts id */
  id: PropTypes.string,
  /** Required for specifying the exact width of the component, for example, 100% */
  manualWidth: PropTypes.string,
  /** Required for specifying the exact distance from the parent component */
  manualX: PropTypes.string,
  /** Required for specifying the exact distance from the parent component */
  manualY: PropTypes.string,
  /** Required if the scrollbar is displayed */
  maxHeight: PropTypes.number,
  /** Sets the dropdown to be opened */
  open: PropTypes.bool,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Used to display backdrop */
  withBackdrop: PropTypes.bool,
  /** Count of columns */
  columnCount: PropTypes.number,
  /** Sets the disabled items to display */
  showDisabledItems: PropTypes.bool,
  forwardedRef: PropTypes.shape({ current: PropTypes.any }),
  /** Sets the operation mode of the component. The default option is set to portal mode */
  isDefaultMode: PropTypes.bool,
  /** Used to open people and group selectors correctly when the section width is small */
  smallSectionWidth: PropTypes.bool,
  /** Disables check position. Used to set the direction explicitly */
  fixedDirection: PropTypes.bool,
  /** Enables blur for backdrop */
  withBlur: PropTypes.bool,
  /** Specifies the offset */
  offsetLeft: PropTypes.number,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
DropDownContainer.defaultProps = {
  directionX: "left",
  directionY: "bottom",
  withBackdrop: true,
  showDisabledItems: false,
  isDefaultMode: true,
  fixedDirection: false,
  offsetLeft: 0,
  enableKeyboardEvents: true,
};

export default DropDownContainer;
