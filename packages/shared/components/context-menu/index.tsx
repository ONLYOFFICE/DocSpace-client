import React, { Component } from "react";
import PropTypes from "prop-types";
import DomHelpers from "../utils/domHelpers";
import { classNames } from "../utils/classNames";
import { trimSeparator } from "../utils/trimSeparator";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { CSSTransition } from "react-transition-group";
import { withTheme } from "styled-components";

import Portal from "../portal";
import StyledContextMenu from "./styled-context-menu";
import SubMenu from "./sub-components/sub-menu";
import MobileSubMenu from "./sub-components/mobile-sub-menu";

import {
  isMobile as isMobileUtils,
  isTablet as isTabletUtils,
} from "../utils/device";

import Backdrop from "../backdrop";
import Text from "../text";
import Avatar from "../avatar";
import IconButton from "../icon-button";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/arrow-left.r... Remove this comment to see the full error message
import ArrowLeftReactUrl from "PUBLIC_DIR/images/arrow-left.react.svg?url";
import RoomIcon from "../room-icon";

import { ContextMenuModel, ContextMenuType, SeparatorType } from "./ContextMenu.types";

export {ContextMenuModel, ContextMenuType, SeparatorType}

class ContextMenu extends Component {
  currentEvent: any;
  documentClickListener: any;
  documentContextMenuListener: any;
  documentResizeListener: any;
  menuRef: any;
  constructor(props: any) {
    super(props);

    this.state = {
      visible: false,
      reshow: false,
      resetMenu: false,
      model: null,
      changeView: false,
      showMobileMenu: false,
      onLoad: null,
      articleWidth: 0,
    };

    this.menuRef = React.createRef();
  }

  onMenuClick = () => {
    this.setState({
      resetMenu: false,
    });
  };

  onMenuMouseEnter = () => {
    this.setState({
      resetMenu: false,
    });
  };

  show = (e: any) => {
    // @ts-expect-error TS(2339): Property 'getContextModel' does not exist on type ... Remove this comment to see the full error message
    if (this.props.getContextModel) {
      // @ts-expect-error TS(2339): Property 'getContextModel' does not exist on type ... Remove this comment to see the full error message
      const model = trimSeparator(this.props.getContextModel());
      this.setState({ model });
    }

    e.stopPropagation();
    e.preventDefault();

    this.currentEvent = e;

    // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
    if (this.state.visible) {
      !isMobileUtils() && this.setState({ reshow: true });
    } else {
      this.setState({ visible: true }, () => {
        // @ts-expect-error TS(2339): Property 'onShow' does not exist on type 'Readonly... Remove this comment to see the full error message
        if (this.props.onShow) {
          // @ts-expect-error TS(2339): Property 'onShow' does not exist on type 'Readonly... Remove this comment to see the full error message
          this.props.onShow(this.currentEvent);
        }
      });
    }
  };

  componentDidUpdate(prevProps: any, prevState: any) {
    // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
    if (this.state.visible && prevState.reshow !== this.state.reshow) {
      let event = this.currentEvent;
      this.setState(
        {
          visible: false,
          reshow: false,
          resetMenu: true,
          changeView: false,
          articleWidth: 0,
        },
        () => this.show(event)
      );
    }
  }

  hide = (e: any) => {
    this.currentEvent = e;

    // @ts-expect-error TS(2339): Property 'onHide' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.props.onHide && this.props.onHide(e);
    this.setState({
      visible: false,
      reshow: false,
      changeView: false,
      showMobileMenu: false,
      articleWidth: 0,
    });
  };

  onEnter = () => {
    // @ts-expect-error TS(2339): Property 'autoZIndex' does not exist on type 'Read... Remove this comment to see the full error message
    if (this.props.autoZIndex) {
      this.menuRef.current.style.zIndex = String(
        // @ts-expect-error TS(2339): Property 'baseZIndex' does not exist on type 'Read... Remove this comment to see the full error message
        this.props.baseZIndex + DomHelpers.generateZIndex()
      );
    }

    this.position(this.currentEvent);
  };

  onEntered = () => {
    this.bindDocumentListeners();
  };

  onExit = () => {
    this.currentEvent = null;
    this.unbindDocumentListeners();
  };

  onExited = () => {
    DomHelpers.revertZIndex();
  };

  position = (event: any) => {
    if (event) {
      // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type 'Re... Remove this comment to see the full error message
      const rects = this.props.containerRef?.current.getBoundingClientRect();
      let left = rects
        // @ts-expect-error TS(2339): Property 'leftOffset' does not exist on type 'Read... Remove this comment to see the full error message
        ? rects.left - this.props.leftOffset - this.props.rightOffset
        : event.pageX + 1;
      let top = rects ? rects.top : event.pageY + 1;
      let width = this.menuRef.current.offsetParent
        ? this.menuRef.current.offsetWidth
        : DomHelpers.getHiddenElementOuterWidth(this.menuRef.current);
      let height = this.menuRef.current.offsetParent
        ? this.menuRef.current.offsetHeight
        : DomHelpers.getHiddenElementOuterHeight(this.menuRef.current);
      let viewport = DomHelpers.getViewport();
      if (
        // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
        this.props.theme.interfaceDirection === "rtl" &&
        !rects &&
        left > width
      ) {
        left = event.pageX - width + 1;
      }
      if (isTabletUtils() && height > 483) {
        const article = document.getElementById("article-container");

        let articleWidth = 0;
        if (article) {
          articleWidth = article.offsetWidth;
        }

        this.setState({ changeView: true, articleWidth });
        return;
      }

      if (isMobileUtils() && height > 210) {
        this.setState({ changeView: true, articleWidth: 0 });
        return;
      }

      //flip
      if (left + width - document.body.scrollLeft > viewport.width) {
        left -= width;
      }

      //flip
      if (top + height - document.body.scrollTop > viewport.height) {
        top -= height;
      }

      //fit
      if (left < document.body.scrollLeft) {
        left = document.body.scrollLeft;
      }

      //fit
      if (top < document.body.scrollTop) {
        top = document.body.scrollTop;
      }

      // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type 'Re... Remove this comment to see the full error message
      if (this.props.containerRef) {
        top += rects.height + 4;

        // @ts-expect-error TS(2339): Property 'scaled' does not exist on type 'Readonly... Remove this comment to see the full error message
        if (this.props.scaled) {
          this.menuRef.current.style.width = rects.width + "px";
        }
        this.menuRef.current.style.minWidth = "210px";
      }
      this.menuRef.current.style.left = left + "px";
      this.menuRef.current.style.top = top + "px";
    }
  };

  onLeafClick = (e: any) => {
    this.setState({
      resetMenu: true,
    });

    this.hide(e);

    e.stopPropagation();
  };

  isOutsideClicked = (e: any) => {
    return (
      this.menuRef &&
      this.menuRef.current &&
      !(
        this.menuRef.current.isSameNode(e.target) ||
        this.menuRef.current.contains(e.target)
      )
    );
  };

  bindDocumentListeners = () => {
    this.bindDocumentResizeListener();
    this.bindDocumentClickListener();
  };

  unbindDocumentListeners = () => {
    this.unbindDocumentResizeListener();
    this.unbindDocumentClickListener();
  };

  bindDocumentClickListener = () => {
    if (!this.documentClickListener) {
      this.documentClickListener = (e: any) => {
        if (this.isOutsideClicked(e)) {
          //TODO: (&& e.button !== 2) restore after global usage
          this.hide(e);

          this.setState({
            resetMenu: true,
          });
        }
      };

      document.addEventListener("click", this.documentClickListener);
      document.addEventListener("mousedown", this.documentClickListener);
    }
  };

  bindDocumentContextMenuListener = () => {
    if (!this.documentContextMenuListener) {
      this.documentContextMenuListener = (e: any) => {
        this.show(e);
      };

      document.addEventListener(
        "contextmenu",
        this.documentContextMenuListener
      );
    }
  };

  bindDocumentResizeListener = () => {
    if (!this.documentResizeListener) {
      this.documentResizeListener = (e: any) => {
        // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
        if (this.state.visible) {
          this.hide(e);
        }
      };

      window.addEventListener("resize", this.documentResizeListener);
    }
  };

  unbindDocumentClickListener = () => {
    if (this.documentClickListener) {
      document.removeEventListener("click", this.documentClickListener);
      document.removeEventListener("mousedown", this.documentClickListener);
      this.documentClickListener = null;
    }
  };

  unbindDocumentContextMenuListener = () => {
    if (this.documentContextMenuListener) {
      document.removeEventListener(
        "contextmenu",
        this.documentContextMenuListener
      );
      this.documentContextMenuListener = null;
    }
  };

  unbindDocumentResizeListener = () => {
    if (this.documentResizeListener) {
      window.removeEventListener("resize", this.documentResizeListener);
      this.documentResizeListener = null;
    }
  };

  componentDidMount() {
    // @ts-expect-error TS(2339): Property 'global' does not exist on type 'Readonly... Remove this comment to see the full error message
    if (this.props.global) {
      this.bindDocumentContextMenuListener();
    }
  }

  componentWillUnmount() {
    this.unbindDocumentListeners();
    this.unbindDocumentContextMenuListener();

    DomHelpers.revertZIndex();
  }

  onMobileItemClick = (e: any, onLoad: any) => {
    e.stopPropagation();
    this.setState({
      showMobileMenu: true,
      onLoad,
    });
  };

  onBackClick = (e: any) => {
    e.stopPropagation();
    this.setState({
      showMobileMenu: false,
    });
  };

  renderContextMenu = () => {
    const className = classNames(
      "p-contextmenu p-component",
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      this.props.className
    );

    // @ts-expect-error TS(2339): Property 'changeView' does not exist on type 'Read... Remove this comment to see the full error message
    const changeView = this.state.changeView;
    // @ts-expect-error TS(2339): Property 'articleWidth' does not exist on type 'Re... Remove this comment to see the full error message
    const articleWidth = this.state.articleWidth;
    // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
    const isIconExist = this.props.header?.icon;
    // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
    const isAvatarExist = this.props.header?.avatar;

    // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
    const withHeader = !!this.props.header?.title;
    // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
    const defaultIcon = !!this.props.header?.color;

    return (
      <>
        <StyledContextMenu
          // @ts-expect-error TS(2769): No overload matches this call.
          changeView={changeView}
          articleWidth={articleWidth}
          // @ts-expect-error TS(2339): Property 'isRoom' does not exist on type 'Readonly... Remove this comment to see the full error message
          isRoom={this.props.isRoom}
          // @ts-expect-error TS(2339): Property 'fillIcon' does not exist on type 'Readon... Remove this comment to see the full error message
          fillIcon={this.props.fillIcon}
          isIconExist={isIconExist}
          isAvatarExist={isAvatarExist}
        >
          <CSSTransition
            nodeRef={this.menuRef}
            classNames="p-contextmenu"
            // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
            in={this.state.visible}
            timeout={{ enter: 250, exit: 0 }}
            unmountOnExit
            onEnter={this.onEnter}
            onEntered={this.onEntered}
            onExit={this.onExit}
            onExited={this.onExited}
          >
            <div
              ref={this.menuRef}
              // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
              id={this.props.id}
              className={className}
              // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
              style={this.props.style}
              onClick={this.onMenuClick}
              onMouseEnter={this.onMenuMouseEnter}
            >
              {changeView && withHeader && (
                <div className="contextmenu-header">
                  {isIconExist &&
                    // @ts-expect-error TS(2339): Property 'showMobileMenu' does not exist on type '... Remove this comment to see the full error message
                    (this.state.showMobileMenu ? (
                      <IconButton
                        // @ts-expect-error TS(2322): Type '{ className: string; iconName: any; onClick:... Remove this comment to see the full error message
                        className="edit_icon"
                        iconName={ArrowLeftReactUrl}
                        onClick={this.onBackClick}
                        size={16}
                      />
                    ) : (
                      <div className="icon-wrapper">
                        {defaultIcon ? (
                          // @ts-expect-error TS(2786): 'RoomIcon' cannot be used as a JSX component.
                          <RoomIcon
                            // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
                            color={this.props.header.color}
                            // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
                            title={this.props.header.title}
                            // @ts-expect-error TS(2339): Property 'isArchive' does not exist on type 'Reado... Remove this comment to see the full error message
                            isArchive={this.props.isArchive}
                          />
                        ) : (
                          <img
                            // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
                            src={this.props.header.icon}
                            className="drop-down-item_icon"
                            alt="drop-down_icon"
                          />
                        )}
                      </div>
                    ))}
                  {isAvatarExist && (
                    <div className="avatar-wrapper">
                      <Avatar
                        // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
                        source={this.props.header.avatar}
                        size={"min"}
                        className="drop-down-item_avatar"
                      />
                    </div>
                  )}
                  // @ts-expect-error TS(2322): Type '{ children: any; className: string; truncate... Remove this comment to see the full error message
                  <Text className="text" truncate={true}>
                    // @ts-expect-error TS(2339): Property 'header' does not exist on type 'Readonly... Remove this comment to see the full error message
                    {this.props.header.title}
                  </Text>
                </div>
              )}

              // @ts-expect-error TS(2339): Property 'showMobileMenu' does not exist on type '... Remove this comment to see the full error message
              {this.state.showMobileMenu ? (
                <MobileSubMenu
                  root
                  // @ts-expect-error TS(2339): Property 'resetMenu' does not exist on type 'Reado... Remove this comment to see the full error message
                  resetMenu={this.state.resetMenu}
                  onLeafClick={this.onLeafClick}
                  changeView={true}
                  // @ts-expect-error TS(2339): Property 'onLoad' does not exist on type 'Readonly... Remove this comment to see the full error message
                  onLoad={this.state.onLoad}
                />
              ) : (
                <SubMenu
                  model={
                    // @ts-expect-error TS(2339): Property 'getContextModel' does not exist on type ... Remove this comment to see the full error message
                    this.props.getContextModel
                      // @ts-expect-error TS(2339): Property 'model' does not exist on type 'Readonly<... Remove this comment to see the full error message
                      ? this.state.model
                      // @ts-expect-error TS(2339): Property 'model' does not exist on type 'Readonly<... Remove this comment to see the full error message
                      : this.props.model
                  }
                  root
                  // @ts-expect-error TS(2339): Property 'resetMenu' does not exist on type 'Reado... Remove this comment to see the full error message
                  resetMenu={this.state.resetMenu}
                  onLeafClick={this.onLeafClick}
                  changeView={changeView}
                  // @ts-expect-error TS(2322): Type '{ model: any; root: true; resetMenu: any; on... Remove this comment to see the full error message
                  onMobileItemClick={this.onMobileItemClick}
                />
              )}
            </div>
          </CSSTransition>
        </StyledContextMenu>
      </>
    );
  };

  render() {
    const element = this.renderContextMenu();

    const isMobile = isMobileUtils();

    const contextMenu = (
      <>
        // @ts-expect-error TS(2339): Property 'withBackdrop' does not exist on type 'Re... Remove this comment to see the full error message
        {this.props.withBackdrop && (
          <Backdrop
            // @ts-expect-error TS(2322): Type '{ visible: any; withBackground: boolean; wit... Remove this comment to see the full error message
            visible={
              // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
              this.state.visible &&
              // @ts-expect-error TS(2339): Property 'changeView' does not exist on type 'Read... Remove this comment to see the full error message
              (this.state.changeView || this.props.ignoreChangeView)
            }
            withBackground={true}
            withoutBlur={false}
            // @ts-expect-error TS(2339): Property 'baseZIndex' does not exist on type 'Read... Remove this comment to see the full error message
            zIndex={this.props.baseZIndex}
          />
        )}
        // @ts-expect-error TS(2322): Type '{ element: Element; appendTo: any; }' is not... Remove this comment to see the full error message
        <Portal element={element} appendTo={this.props.appendTo} />
      </>
    );

    const root = document.getElementById("root");

    // @ts-expect-error TS(2322): Type '{ element: Element; appendTo: HTMLElement | ... Remove this comment to see the full error message
    const portal = <Portal element={contextMenu} appendTo={root} />;

    return isMobile && root ? portal : contextMenu;
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ContextMenu.propTypes = {
  /** Unique identifier of the element */
  id: PropTypes.string,
  /** An array of menuitems */
  model: PropTypes.array,
  /** An object of header with icon and label */
  header: PropTypes.object,
  /** Inline style of the component */
  style: PropTypes.object,
  /** Style class of the component */
  className: PropTypes.string,
  /** Attaches the menu to document instead of a particular item */
  global: PropTypes.bool,
  /** Sets the context menu to be rendered with a backdrop */
  withBackdrop: PropTypes.bool,
  /** Ignores changeView restrictions for rendering backdrop */
  ignoreChangeView: PropTypes.bool,
  /** Sets zIndex layering value automatically */
  autoZIndex: PropTypes.bool,
  /** Sets automatic layering management */
  baseZIndex: PropTypes.number,
  /** DOM element instance where the menu is mounted */
  appendTo: PropTypes.any,
  /** Specifies a callback function that is invoked when a popup menu is shown */
  onShow: PropTypes.func,
  /** Specifies a callback function that is invoked when a popup menu is hidden */
  onHide: PropTypes.func,
  /** Displays a reference to another component */
  containerRef: PropTypes.any,
  /** Scales width by the container component */
  scaled: PropTypes.bool,
  /** Fills the icons with default colors */
  fillIcon: PropTypes.bool,
  /** Function that returns an object containing the elements of the context menu */
  getContextModel: PropTypes.func,
  /** Specifies the offset  */
  leftOffset: PropTypes.number,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ContextMenu.defaultProps = {
  id: null,
  style: null,
  className: null,
  global: false,
  autoZIndex: true,
  baseZIndex: 0,
  appendTo: null,
  onShow: null,
  onHide: null,
  scaled: false,
  containerRef: null,
  leftOffset: 0,
  rightOffset: 0,
  fillIcon: true,
};

export default withTheme(ContextMenu);
