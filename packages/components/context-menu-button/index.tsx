import React from "react";
import throttle from "lodash/throttle";
import PropTypes from "prop-types";

import DropDownItem from "../drop-down-item";
import DropDown from "../drop-down";
import IconButton from "../icon-button";
import Backdrop from "../backdrop";
import Aside from "../aside";
import Heading from "../heading";
import Link from "../link";
import { desktop, isTablet, isMobile } from "../utils/device";
import {  isTablet as Tablet } from "react-device-detect";

import {
  StyledBodyContent,
  StyledHeaderContent,
  StyledContent,
  StyledOuter,
} from "./styled-context-menu-button";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/vertical-dot... Remove this comment to see the full error message
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";

class ContextMenuButton extends React.Component {
  ref: any;
  throttledResize: any;
  constructor(props: any) {
    super(props);

    this.ref = React.createRef();
    const displayType =
      props.displayType === "auto" ? this.getTypeByWidth() : props.displayType;

    this.state = {
      isOpen: props.opened,
      data: props.data,
      displayType,
    };
    this.throttledResize = throttle(this.resize, 300);
  }

  getTypeByWidth = () => {
    // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
    if (this.props.displayType !== "auto") return this.props.displayType;
    // @ts-expect-error TS(2365): Operator '<' cannot be applied to types 'number' a... Remove this comment to see the full error message
    return window.innerWidth < desktop.match(/\d+/)[0] ? "aside" : "dropdown";
  };

  resize = () => {
    // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
    if (this.props.displayType !== "auto") return;
    const type = this.getTypeByWidth();
    // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
    if (type === this.state.displayType) return;
    this.setState({ displayType: type });
  };

  popstate = () => {
    window.removeEventListener("popstate", this.popstate, false);
    this.onClose();
    window.history.go(1);
  };

  componentDidMount() {
    window.addEventListener("resize", this.throttledResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.throttledResize);
    window.removeEventListener("popstate", this.popstate, false);
    this.throttledResize.cancel();
  }

  stopAction = (e: any) => e.preventDefault();
  toggle = (isOpen: any) => this.setState({ isOpen: isOpen });
  onClose = () => {
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.setState({ isOpen: !this.state.isOpen });
    // @ts-expect-error TS(2339): Property 'onClose' does not exist on type 'Readonl... Remove this comment to see the full error message
    this.props.onClose && this.props.onClose();
  };

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'opened' does not exist on type 'Readonly... Remove this comment to see the full error message
    if (this.props.opened !== prevProps.opened) {
      // @ts-expect-error TS(2339): Property 'opened' does not exist on type 'Readonly... Remove this comment to see the full error message
      this.toggle(this.props.opened);
    }

    // @ts-expect-error TS(2339): Property 'opened' does not exist on type 'Readonly... Remove this comment to see the full error message
    if (this.props.opened && this.state.displayType === "aside") {
      window.addEventListener("popstate", this.popstate, false);
    }

    // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
    if (this.props.displayType !== prevProps.displayType) {
      this.setState({ displayType: this.getTypeByWidth() });
    }
  }

  onIconButtonClick = (e: any) => {
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
    if (this.props.isDisabled || this.state.displayType === "toggle") {
      this.stopAction;
      return;
    }

    this.setState(
      {
        // @ts-expect-error TS(2339): Property 'getData' does not exist on type 'Readonl... Remove this comment to see the full error message
        data: this.props.getData(),
        // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
        isOpen: !this.state.isOpen,
      },
      () =>
        // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
        !this.props.isDisabled &&
        // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
        this.state.isOpen &&
        // @ts-expect-error TS(2339): Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
        this.props.onClick &&
        // @ts-expect-error TS(2339): Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
        this.props.onClick(e)
    ); // eslint-disable-line react/prop-types
  };

  clickOutsideAction = (e: any) => {
    const path = e.path || (e.composedPath && e.composedPath());
    const dropDownItem = path ? path.find((x: any) => x === this.ref.current) : null;
    if (dropDownItem) return;

    this.onClose();
  };

  onDropDownItemClick = (item: any, e: any) => {
    // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
    const open = this.state.displayType === "dropdown";
    item.onClick && item.onClick(e, open, item);
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.toggle(!this.state.isOpen);
  };

  shouldComponentUpdate(nextProps: any, nextState: any) {
    if (
      // @ts-expect-error TS(2339): Property 'opened' does not exist on type 'Readonly... Remove this comment to see the full error message
      this.props.opened === nextProps.opened &&
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
      this.state.isOpen === nextState.isOpen &&
      // @ts-expect-error TS(2339): Property 'displayType' does not exist on type 'Rea... Remove this comment to see the full error message
      this.props.displayType === nextProps.displayType &&
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      this.props.isDisabled === nextProps.isDisabled
    ) {
      return false;
    }
    return true;
  }

  callNewMenu = (e: any) => {
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
    if (this.props.isDisabled || this.state.displayType !== "toggle") {
      this.stopAction;
      return;
    }

    this.setState(
      {
        // @ts-expect-error TS(2339): Property 'getData' does not exist on type 'Readonl... Remove this comment to see the full error message
        data: this.props.getData(),
      },
      // @ts-expect-error TS(2339): Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
      () => this.props.onClick(e)
    );
  };

  render() {
    //console.log("ContextMenuButton render", this.props);
    const {
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'clickColor' does not exist on type 'Read... Remove this comment to see the full error message
      clickColor,
      // @ts-expect-error TS(2339): Property 'color' does not exist on type 'Readonly<... Remove this comment to see the full error message
      color,
      // @ts-expect-error TS(2339): Property 'columnCount' does not exist on type 'Rea... Remove this comment to see the full error message
      columnCount,
      // @ts-expect-error TS(2339): Property 'directionX' does not exist on type 'Read... Remove this comment to see the full error message
      directionX,
      // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Read... Remove this comment to see the full error message
      directionY,
      // @ts-expect-error TS(2339): Property 'hoverColor' does not exist on type 'Read... Remove this comment to see the full error message
      hoverColor,
      // @ts-expect-error TS(2339): Property 'iconClickName' does not exist on type 'R... Remove this comment to see the full error message
      iconClickName,
      // @ts-expect-error TS(2339): Property 'iconHoverName' does not exist on type 'R... Remove this comment to see the full error message
      iconHoverName,
      // @ts-expect-error TS(2339): Property 'iconName' does not exist on type 'Readon... Remove this comment to see the full error message
      iconName,
      // @ts-expect-error TS(2339): Property 'iconOpenName' does not exist on type 'Re... Remove this comment to see the full error message
      iconOpenName,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'onMouseEnter' does not exist on type 'Re... Remove this comment to see the full error message
      onMouseEnter,
      // @ts-expect-error TS(2339): Property 'onMouseLeave' does not exist on type 'Re... Remove this comment to see the full error message
      onMouseLeave,
      // @ts-expect-error TS(2339): Property 'onMouseOut' does not exist on type 'Read... Remove this comment to see the full error message
      onMouseOut,
      // @ts-expect-error TS(2339): Property 'onMouseOver' does not exist on type 'Rea... Remove this comment to see the full error message
      onMouseOver,
      // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'isFill' does not exist on type 'Readonly... Remove this comment to see the full error message
      isFill, // eslint-disable-line react/prop-types
      // @ts-expect-error TS(2339): Property 'asideHeader' does not exist on type 'Rea... Remove this comment to see the full error message
      asideHeader, // eslint-disable-line react/prop-types
      // @ts-expect-error TS(2339): Property 'title' does not exist on type 'Readonly<... Remove this comment to see the full error message
      title,
      // @ts-expect-error TS(2339): Property 'zIndex' does not exist on type 'Readonly... Remove this comment to see the full error message
      zIndex,
      // @ts-expect-error TS(2339): Property 'usePortal' does not exist on type 'Reado... Remove this comment to see the full error message
      usePortal,
      // @ts-expect-error TS(2339): Property 'dropDownClassName' does not exist on typ... Remove this comment to see the full error message
      dropDownClassName,
      // @ts-expect-error TS(2339): Property 'iconClassName' does not exist on type 'R... Remove this comment to see the full error message
      iconClassName,
      // @ts-expect-error TS(2339): Property 'displayIconBorder' does not exist on typ... Remove this comment to see the full error message
      displayIconBorder,
    } = this.props;

    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { isOpen, displayType, offsetX, offsetY } = this.state;
    const iconButtonName = isOpen && iconOpenName ? iconOpenName : iconName;
    return (
      <StyledOuter
        ref={this.ref}
        className={className}
        id={id}
        style={style}
        onClick={this.callNewMenu}
        // @ts-expect-error TS(2769): No overload matches this call.
        displayIconBorder={displayIconBorder}
      >
        <IconButton
          // @ts-expect-error TS(2322): Type '{ className: any; color: any; hoverColor: an... Remove this comment to see the full error message
          className={iconClassName}
          color={color}
          hoverColor={hoverColor}
          clickColor={clickColor}
          size={size}
          iconName={iconButtonName}
          iconHoverName={iconHoverName}
          iconClickName={iconClickName}
          isFill={isFill}
          isDisabled={isDisabled}
          onClick={this.onIconButtonClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          title={title}
        />
        {displayType === "dropdown" ? (
          // @ts-expect-error TS(2769): No overload matches this call.
          <DropDown
            className={dropDownClassName}
            directionX={directionX}
            directionY={directionY}
            open={isOpen}
            forwardedRef={this.ref}
            clickOutsideAction={this.clickOutsideAction}
            columnCount={columnCount}
            withBackdrop={isTablet() || isMobile() || Tablet}
            zIndex={zIndex}
            isDefaultMode={usePortal}
          >
            // @ts-expect-error TS(2339): Property 'data' does not exist on type 'Readonly<{... Remove this comment to see the full error message
            {this.state.data?.map(
              (item: any, index: any) =>
                item &&
                (item.label || item.icon || item.key) && (
                  <DropDownItem
                    {...item}
                    id={item.id}
                    key={item.key || index}
                    onClick={this.onDropDownItemClick.bind(this, item)}
                  />
                )
            )}
          </DropDown>
        ) : (
          displayType === "aside" && (
            <>
              <Backdrop
                // @ts-expect-error TS(2322): Type '{ onClick: () => void; visible: any; zIndex:... Remove this comment to see the full error message
                onClick={this.onClose}
                visible={isOpen}
                zIndex={310}
                isAside={true}
              />
              <Aside
                visible={isOpen}
                scale={false}
                zIndex={310}
                onClose={this.onClose}
              >
                <StyledContent>
                  <StyledHeaderContent>
                    // @ts-expect-error TS(2322): Type '{ children: any; className: string; size: st... Remove this comment to see the full error message
                    <Heading className="header" size="medium" truncate={true}>
                      {asideHeader}
                    </Heading>
                  </StyledHeaderContent>
                  <StyledBodyContent>
                    // @ts-expect-error TS(2339): Property 'data' does not exist on type 'Readonly<{... Remove this comment to see the full error message
                    {this.state.data.map(
                      (item: any, index: any) =>
                        item &&
                        (item.label || item.icon || item.key) && (
                          <Link
                            className={`context-menu-button_link${
                              item.isHeader ? "-header" : ""
                            }`}
                            key={item.key || index}
                            fontSize={item.isHeader ? "15px" : "13px"}
                            noHover={item.isHeader}
                            fontWeight={600}
                            onClick={this.onDropDownItemClick.bind(this, item)}
                          >
                            {item.label}
                          </Link>
                        )
                    )}
                  </StyledBodyContent>
                </StyledContent>
              </Aside>
            </>
          )
        )}
      </StyledOuter>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ContextMenuButton.propTypes = {
  /** Sets the button to present an opened state */
  opened: PropTypes.bool,
  /** Array of options for display */
  data: PropTypes.array,
  /** Function for converting to inner data */
  getData: PropTypes.func.isRequired,
  /** Specifies the icon title */
  title: PropTypes.string,
  /** Specifies the icon name */
  iconName: PropTypes.string,
  /** Specifies the icon size */
  size: PropTypes.number,
  /** Specifies the icon color */
  color: PropTypes.string,
  /** Sets the button to present a disabled state */
  isDisabled: PropTypes.bool,
  /** Specifies the icon hover color */
  hoverColor: PropTypes.string,
  /** Specifies the icon click color */
  clickColor: PropTypes.string,
  /** Specifies the icon hover name */
  iconHoverName: PropTypes.string,
  /** Specifies the icon click name */
  iconClickName: PropTypes.string,
  /** Specifies the icon open name */
  iconOpenName: PropTypes.string,
  /** Triggers a callback function when the mouse enters the button borders */
  onMouseEnter: PropTypes.func,
  /** Triggers a callback function when the mouse leaves the button borders */
  onMouseLeave: PropTypes.func,
  /** Triggers a callback function when the mouse moves over the button borders */
  onMouseOver: PropTypes.func,
  /** Triggers a callback function when the mouse moves out of the button borders */
  onMouseOut: PropTypes.func,
  /** Direction X */
  directionX: PropTypes.string,
  /** Direction Y */
  directionY: PropTypes.string,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets the number of columns */
  columnCount: PropTypes.number,
  /** Sets the display type */
  displayType: PropTypes.oneOf(["dropdown", "toggle", "aside", "auto"]),
  /** Closing event */
  onClose: PropTypes.func,
  /** Sets the drop down open with the portal */
  usePortal: PropTypes.bool,
  /** Sets the class of the drop down element */
  dropDownClassName: PropTypes.string,
  /** Sets the class of the icon button */
  iconClassName: PropTypes.string,
  /** Enables displaying the icon borders  */
  displayIconBorder: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ContextMenuButton.defaultProps = {
  opened: false,
  data: [],
  title: "",
  iconName: VerticalDotsReactSvgUrl,
  size: 16,
  isDisabled: false,
  directionX: "left",
  isFill: false,
  displayType: "dropdown",
  usePortal: true,
  displayIconBorder: false,
};

export default ContextMenuButton;
