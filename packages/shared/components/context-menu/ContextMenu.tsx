/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { CSSTransition } from "react-transition-group";
import { useTheme } from "styled-components";

import ArrowLeftReactUrl from "PUBLIC_DIR/images/arrow-left.react.svg?url";

import {
  classNames,
  DomHelpers,
  trimSeparator,
  isMobile as isMobileUtils,
  isTablet as isTabletUtils,
} from "../../utils";

import { Portal } from "../portal";
import { Backdrop } from "../backdrop";
import { Text } from "../text";
import { Avatar, AvatarRole, AvatarSize } from "../avatar";
import { IconButton } from "../icon-button";
import { RoomIcon } from "../room-icon";

import { StyledContextMenu } from "./ContextMenu.styled";
import { SubMenu } from "./sub-components/SubMenu";
import { MobileSubMenu } from "./sub-components/MobileSubMenu";

import { ContextMenuModel, ContextMenuProps } from "./ContextMenu.types";

const ContextMenu = React.forwardRef((props: ContextMenuProps, ref) => {
  const [visible, setVisible] = React.useState(false);
  const [reshow, setReshow] = React.useState(false);
  const [resetMenu, setResetMenu] = React.useState(false);
  const [model, setModel] = React.useState<ContextMenuModel[] | null>(null);
  const [changeView, setChangeView] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [onLoad, setOnLoad] = React.useState<
    undefined | (() => Promise<ContextMenuModel[]>)
  >(undefined);
  const [articleWidth, setArticleWidth] = React.useState(0);

  const prevReshow = React.useRef(false);
  const menuRef = React.useRef<null | HTMLDivElement>(null);
  const currentEvent = React.useRef<null | React.MouseEvent | MouseEvent>(null);
  const currentChangeEvent = React.useRef<
    null | Event | React.ChangeEvent<HTMLInputElement>
  >(null);

  const theme = useTheme();

  const {
    getContextModel,
    onShow,
    onHide,
    autoZIndex,
    baseZIndex,
    leftOffset,
    rightOffset,
    containerRef,
    scaled,
    global,
    className,
    header,
    fillIcon,
    isRoom,
    id,
    style,
    isArchive,
    ignoreChangeView,
    appendTo,
    withBackdrop,
    model: propsModel,
  } = props;

  const onMenuClick = () => {
    setResetMenu(false);
  };

  const onMenuMouseEnter = () => {
    setResetMenu(false);
  };

  const show = React.useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (getContextModel) {
        const m = trimSeparator(getContextModel());
        setModel(m);
      }
      e.stopPropagation();
      e.preventDefault();
      currentEvent.current = e;
      if (visible) {
        if (!isMobileUtils()) {
          setReshow(true);
          prevReshow.current = true;
        }
      } else {
        setVisible(true);
        if (currentEvent.current) onShow?.(currentEvent.current);
      }
    },
    [visible, onShow, getContextModel],
  );

  const hide = React.useCallback(
    (
      e:
        | React.MouseEvent
        | MouseEvent
        | Event
        | React.ChangeEvent<HTMLInputElement>,
    ) => {
      if (e instanceof Event) {
        currentChangeEvent.current = e;
      } else {
        // @ts-expect-error need fix
        currentEvent.current = e;
      }

      onHide?.(e);

      setVisible(false);
      setReshow(false);
      prevReshow.current = false;
      setChangeView(false);
      setShowMobileMenu(false);
      setArticleWidth(0);
    },
    [onHide],
  );

  React.useEffect(() => {
    if (visible && prevReshow.current !== reshow) {
      setVisible(false);
      setReshow(false);
      prevReshow.current = false;
      setResetMenu(true);
      setChangeView(false);
      setArticleWidth(0);

      if (currentEvent.current) show(currentEvent.current);
    }
  }, [visible, reshow, show]);

  const position = (event: React.MouseEvent | MouseEvent) => {
    if (event) {
      const rects = containerRef?.current?.getBoundingClientRect();

      const currentLeftOffset = leftOffset ?? 0;
      const currentRightOffset = rightOffset ?? 0;

      let left = rects
        ? rects.left - currentLeftOffset - currentRightOffset
        : event.pageX + 1;
      let top = rects ? rects.top : event.pageY + 1;
      const width =
        menuRef.current && menuRef.current.offsetParent
          ? menuRef.current.offsetWidth
          : DomHelpers.getHiddenElementOuterWidth(menuRef.current);
      const height =
        menuRef.current && menuRef.current.offsetParent
          ? menuRef.current.offsetHeight
          : DomHelpers.getHiddenElementOuterHeight(menuRef.current);
      const viewport = DomHelpers.getViewport();

      if (theme.interfaceDirection === "rtl" && !rects && left > width) {
        left = event.pageX - width + 1;
      }

      if (isTabletUtils() && height > 483) {
        const article = document.getElementById("article-container");

        let currentArticleWidth = 0;
        if (article) {
          currentArticleWidth = article.offsetWidth;
        }

        setChangeView(true);
        setArticleWidth(currentArticleWidth);

        return;
      }

      if (isMobileUtils() && height > 210) {
        setChangeView(true);
        setArticleWidth(0);

        return;
      }

      // flip
      if (left + width - document.body.scrollLeft > viewport.width) {
        left -= width;
      }

      // flip
      if (top + height - document.body.scrollTop > viewport.height) {
        top -= height;
      }

      // fit
      if (left < document.body.scrollLeft) {
        left = document.body.scrollLeft;
      }

      // fit
      if (top < document.body.scrollTop) {
        top = document.body.scrollTop;
      }

      if (containerRef) {
        if (rects) top += rects.height + 4;

        if (menuRef.current) {
          if (scaled && rects) {
            menuRef.current.style.width = `${rects.width}px`;
          }
          menuRef.current.style.minWidth = "210px";
        }
      }
      if (menuRef.current) {
        menuRef.current.style.left = `${left}px`;
        menuRef.current.style.top = `${top}px`;
      }
    }
  };

  const onEnter = () => {
    if (autoZIndex && menuRef.current) {
      const zIndex = baseZIndex || 0;
      menuRef.current.style.zIndex = String(
        zIndex + DomHelpers.generateZIndex(),
      );
    }

    if (currentChangeEvent.current) {
      currentChangeEvent.current = null;
    }
    if (currentEvent.current) position(currentEvent.current);
  };

  const onExited = () => {
    DomHelpers.revertZIndex();
  };

  const onLeafClick = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    setResetMenu(true);

    hide(e);

    e.stopPropagation();
  };

  const isOutsideClicked = React.useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const target = e.target as HTMLElement;
      return (
        menuRef.current &&
        !(
          menuRef.current.isSameNode(target) || menuRef.current.contains(target)
        )
      );
    },
    [],
  );

  const documentClickListener = React.useCallback(
    (e: MouseEvent) => {
      if (isOutsideClicked(e)) {
        // TODO: (&& e.button !== 2) restore after global usage
        hide(e);

        setResetMenu(true);
      }
    },
    [setResetMenu, isOutsideClicked, hide],
  );

  const documentContextMenuListener = React.useCallback(
    (e: MouseEvent) => {
      show(e);
    },
    [show],
  );

  const documentResizeListener = React.useCallback(
    (e: Event) => {
      if (visible) {
        hide(e);
      }
    },
    [visible, hide],
  );

  const bindDocumentListeners = () => {
    window.addEventListener("resize", documentResizeListener);
    document.addEventListener("click", documentClickListener);
    document.addEventListener("mousedown", documentClickListener);
  };

  const unbindDocumentListeners = () => {
    window.removeEventListener("resize", documentResizeListener);
    document.removeEventListener("click", documentClickListener);
    document.removeEventListener("mousedown", documentClickListener);
  };

  const onEntered = () => {
    bindDocumentListeners();
  };

  const onExit = () => {
    currentEvent.current = null;
    unbindDocumentListeners();
  };

  React.useEffect(() => {
    document.addEventListener("contextmenu", documentContextMenuListener);
    return () => {
      document.removeEventListener("contextmenu", documentContextMenuListener);
      document.removeEventListener("click", documentClickListener);
      document.removeEventListener("mousedown", documentClickListener);
      window.removeEventListener("resize", documentResizeListener);

      DomHelpers.revertZIndex();
    };
  }, [
    documentClickListener,
    documentContextMenuListener,
    documentResizeListener,
    global,
  ]);

  const onMobileItemClick = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    loadFunc?: () => Promise<ContextMenuModel[]>,
  ) => {
    e.stopPropagation();

    setShowMobileMenu(true);
    if (loadFunc) setOnLoad(loadFunc);
  };

  const onBackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowMobileMenu(false);
  };

  const renderContextMenu = () => {
    const currentClassName = className
      ? classNames("p-contextmenu p-component", className) ||
        "p-contextmenu p-component"
      : "p-contextmenu p-component";

    const isIconExist = !!header?.icon;
    const isAvatarExist = header?.avatar;
    const withHeader = !!header?.title;
    const defaultIcon = !!header?.color;

    return (
      <StyledContextMenu
        changeView={changeView}
        articleWidth={articleWidth}
        isRoom={isRoom}
        fillIcon={fillIcon}
        isIconExist={isIconExist}
        data-testid="context-menu"
      >
        <CSSTransition
          nodeRef={menuRef}
          classNames="p-contextmenu"
          in={visible}
          timeout={{ enter: 250, exit: 0 }}
          unmountOnExit
          onEnter={onEnter}
          onEntered={onEntered}
          onExit={onExit}
          onExited={onExited}
        >
          <div
            ref={menuRef}
            id={id}
            className={currentClassName}
            style={style}
            onClick={onMenuClick}
            onMouseEnter={onMenuMouseEnter}
          >
            {changeView && withHeader && (
              <div className="contextmenu-header">
                {isIconExist &&
                  (showMobileMenu ? (
                    <IconButton
                      className="edit_icon"
                      iconName={ArrowLeftReactUrl}
                      onClick={onBackClick}
                      size={16}
                    />
                  ) : (
                    <div className="icon-wrapper">
                      {defaultIcon ? (
                        <RoomIcon
                          color={header.color || ""}
                          title={header.title}
                          isArchive={isArchive}
                        />
                      ) : (
                        <img
                          src={header.icon}
                          className="drop-down-item_icon"
                          alt="drop-down_icon"
                        />
                      )}
                    </div>
                  ))}
                {isAvatarExist && (
                  <div className="avatar-wrapper">
                    <Avatar
                      role={AvatarRole.none}
                      source={header.avatar || ""}
                      size={AvatarSize.min}
                      className="drop-down-item_avatar"
                    />
                  </div>
                )}

                <Text className="text" truncate dir="auto">
                  {header.title}
                </Text>
              </div>
            )}

            {showMobileMenu ? (
              <MobileSubMenu
                root
                resetMenu={resetMenu}
                onLeafClick={onLeafClick}
                onLoad={onLoad}
              />
            ) : (
              <SubMenu
                model={getContextModel ? model || [] : propsModel}
                root
                resetMenu={resetMenu}
                onLeafClick={onLeafClick}
                changeView={changeView}
                onMobileItemClick={onMobileItemClick}
              />
            )}
          </div>
        </CSSTransition>
      </StyledContextMenu>
    );
  };

  const element = renderContextMenu();

  const isMobile = isMobileUtils();

  const contextMenu = (
    <>
      {withBackdrop && (
        <Backdrop
          visible={visible && (changeView || ignoreChangeView)}
          withBackground
          withoutBlur={false}
          zIndex={baseZIndex}
        />
      )}

      <Portal element={element} appendTo={appendTo} />
    </>
  );

  const root = document.getElementById("root");
  if (root && isMobile) {
    const portal = <Portal element={contextMenu} appendTo={root} />;

    return portal;
  }

  return contextMenu;
});

ContextMenu.displayName = "ContextMenu";

export { ContextMenu };
