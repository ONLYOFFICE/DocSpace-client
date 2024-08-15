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

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { CSSTransition } from "react-transition-group";
import { useTheme } from "styled-components";
import { isMobileOnly } from "react-device-detect";

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

import {
  ContextMenuModel,
  ContextMenuProps,
  ContextMenuRefType,
} from "./ContextMenu.types";

const marginBorder = 16; // Indentation from the border of the screen

const ContextMenu = React.forwardRef<ContextMenuRefType, ContextMenuProps>(
  (props, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [reshow, setReshow] = React.useState(false);
    const [resetMenu, setResetMenu] = React.useState(false);
    const [model, setModel] = React.useState<ContextMenuModel[] | null>(null);
    const [changeView, setChangeView] = React.useState(false);
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const [mobileSubMenuItems, setMobileSubMenuItems] = React.useState<
      ContextMenuModel[] | undefined
    >([]);
    const [mobileHeader, setMobileHeader] = React.useState<string>("");

    const [articleWidth, setArticleWidth] = React.useState(0);

    const prevReshow = React.useRef(false);
    const menuRef = React.useRef<null | HTMLDivElement>(null);
    const currentEvent = React.useRef<null | React.MouseEvent | MouseEvent>(
      null,
    );
    const currentChangeEvent = React.useRef<
      null | Event | React.ChangeEvent<HTMLInputElement>
    >(null);

    const theme = useTheme();

    const {
      getContextModel,
      onShow,
      onHide,
      autoZIndex = true,
      baseZIndex,
      leftOffset,
      rightOffset,
      containerRef,
      scaled,
      global,
      className,
      header,
      fillIcon = true,
      isRoom,
      id,
      style,
      isArchive,
      ignoreChangeView,
      appendTo,
      withBackdrop,
      model: propsModel,
      badgeUrl,
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

    const toggle = React.useCallback(
      (
        e:
          | React.MouseEvent
          | MouseEvent
          | Event
          | React.ChangeEvent<HTMLInputElement>,
      ) => {
        if (currentChangeEvent.current === e || currentEvent.current === e)
          return;

        if (visible) {
          hide(e);
          return false;
        }
        // @ts-expect-error fix types
        show(e);
        return true;
      },
      [visible, hide, show],
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
        let width =
          menuRef.current && menuRef.current.offsetParent
            ? menuRef.current.offsetWidth
            : DomHelpers.getHiddenElementOuterWidth(menuRef.current);
        const height =
          menuRef.current && menuRef.current.offsetParent
            ? menuRef.current.offsetHeight
            : DomHelpers.getHiddenElementOuterHeight(menuRef.current);
        const viewport = DomHelpers.getViewport();

        const mobileView =
          isMobileUtils() && (height > 210 || ignoreChangeView);

        if (!mobileView) {
          const options =
            menuRef?.current?.getElementsByClassName("p-menuitem");
          const optionsWidth: number[] = [];

          if (options) {
            Array.from(options).forEach((option) =>
              optionsWidth.push(option.clientWidth),
            );

            const widthMaxContent = Math.max(...optionsWidth);

            width = widthMaxContent;
          }
        }

        if (theme.interfaceDirection === "rtl" && !rects && left > width) {
          left = event.pageX - width + 1;
        }

        if (mobileView) {
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
          if (document.body.scrollTop === 0) top = marginBorder;
          else top = document.body.scrollTop;
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
          menuRef.current.style.left = `${left || marginBorder}px`;
          menuRef.current.style.top = `${top}px`;

          if (!mobileView) menuRef.current.style.width = `${width}px`;
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
            menuRef.current.isSameNode(target) ||
            menuRef.current.contains(target)
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
      if (global)
        document.addEventListener("contextmenu", documentContextMenuListener);
      return () => {
        document.removeEventListener(
          "contextmenu",
          documentContextMenuListener,
        );
        document.removeEventListener("click", documentClickListener);
        document.removeEventListener("mousedown", documentClickListener);

        DomHelpers.revertZIndex();
      };
    }, [documentClickListener, documentContextMenuListener, global]);

    React.useEffect(() => {
      return () => {
        if (visible && onHide) {
          onHide();
          setVisible(false);
          setReshow(false);
          prevReshow.current = false;
          setChangeView(false);
          setShowMobileMenu(false);
          setArticleWidth(0);
        }

        window.removeEventListener("resize", documentResizeListener);
      };
    }, [documentResizeListener, onHide, visible]);

    const onMobileItemClick = async (
      e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
      label: string,
      items?: ContextMenuModel[],
      loadFunc?: () => Promise<ContextMenuModel[]>,
    ) => {
      e.stopPropagation();

      setShowMobileMenu(true);

      const res = loadFunc ? await loadFunc() : items;
      setMobileSubMenuItems(res);

      setMobileHeader(label);
    };

    const onBackClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setShowMobileMenu(false);
    };

    React.useImperativeHandle(
      ref,
      () => {
        return { show, hide, toggle, menuRef };
      },
      [hide, show, toggle],
    );

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
                        {header.icon ? (
                          <RoomIcon
                            title={header.title}
                            isArchive={isArchive}
                            showDefault={defaultIcon}
                            imgClassName="drop-down-item_icon"
                            imgSrc={header.icon}
                            badgeUrl={badgeUrl}
                            color={header.color || ""}
                          />
                        ) : (
                          <RoomIcon
                            color={header.color || ""}
                            title={header.title}
                            isArchive={isArchive}
                            showDefault={defaultIcon}
                            badgeUrl={badgeUrl}
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
                    {showMobileMenu ? mobileHeader : header.title}
                  </Text>
                </div>
              )}

              {showMobileMenu ? (
                <MobileSubMenu
                  root
                  resetMenu={resetMenu}
                  onLeafClick={onLeafClick}
                  mobileSubMenuItems={mobileSubMenuItems}
                />
              ) : (
                <SubMenu
                  model={getContextModel ? model || [] : propsModel}
                  root
                  resetMenu={resetMenu}
                  onLeafClick={onLeafClick}
                  onMobileItemClick={onMobileItemClick}
                  changeView={changeView}
                  withHeader={withHeader}
                />
              )}
            </div>
          </CSSTransition>
        </StyledContextMenu>
      );
    };

    const element = renderContextMenu();

    const isMobileUtil = isMobileUtils();

    const contextMenu = (
      <>
        {withBackdrop && (
          <Backdrop
            visible={(visible && (changeView || ignoreChangeView)) || false}
            withBackground
            withoutBlur={false}
            zIndex={baseZIndex}
          />
        )}

        <Portal element={element} appendTo={appendTo} />
      </>
    );

    const root = document.getElementById("root");
    if (root && isMobileUtil) {
      const portal = <Portal element={contextMenu} appendTo={root} />;

      return portal;
    }

    return contextMenu;
  },
);

ContextMenu.displayName = "ContextMenu";

export { ContextMenu };
