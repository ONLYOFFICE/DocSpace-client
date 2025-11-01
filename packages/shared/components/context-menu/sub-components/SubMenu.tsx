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

import React, { useRef, useState, useEffect, type JSX } from "react";

import { CSSTransition } from "react-transition-group";
import { ReactSVG } from "react-svg";
import { isMobile as isMobileDevice } from "react-device-detect";

import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import OutsdideIcon from "PUBLIC_DIR/images/arrow.outside.react.svg";
import CheckIconURL from "PUBLIC_DIR/images/check.edit.react.svg?url";

import { classNames, ObjectUtils, DomHelpers, isMobile } from "../../../utils";
import { ContextMenuSkeleton } from "../../../skeletons/context-menu";

import { ToggleButton } from "../../toggle-button";
import { Scrollbar } from "../../scrollbar";
import { IconButton } from "../../icon-button";

import {
  ContextMenuModel,
  ContextMenuType,
  SeparatorType,
  TOnMobileItemClick,
} from "../ContextMenu.types";
import { Badge } from "../../badge";
import { globalColors } from "../../../themes";
import { useTheme } from "../../../hooks/useTheme";
import { isTouchDevice } from "../../../utils/device";
import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";
import { MCPIcon, MCPIconSize } from "../../mcp-icon";

import { Tooltip } from "../../tooltip";

import styles from "../ContextMenu.module.scss";

const SUBMENU_LIST_MARGIN = 4; // Indentation of the second level menu from the first level
const SECTION_PADDING = 16; // Screen margin
const MIN_SUBMENU_WIDTH = 240; // Minimum width for submenu on mobile devices

type SubMenuProps = {
  model: ContextMenuModel[];
  root?: boolean;
  className?: string;
  resetMenu?: boolean;
  onLeafClick?: (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onMobileItemClick?: TOnMobileItemClick;
  onLoad?: () => Promise<ContextMenuModel[]>;
  changeView?: boolean;
  withHeader?: boolean;

  isLowerSubmenu?: boolean;
  maxHeightLowerSubmenu?: number;

  mouseMoveHandler?: (
    index: number,
    model: ContextMenuModel[],
    level: number,
  ) => void;
  currentIndex?: number;
  menuLevel?: number;
  activeLevel: number;
  showDisabledItems?: boolean;
  setActiveHotkeysModel: (
    item: ContextMenuType,
    model: ContextMenuModel[],
    level: number,
  ) => void;
  activeItems: ContextMenuType[] | null;
  setActiveItems: (items: ContextMenuType[]) => void;
};

const SubMenu = (props: SubMenuProps) => {
  const {
    root,
    resetMenu,

    onLeafClick,
    onMobileItemClick,
    onLoad,

    changeView,
    withHeader,
    isLowerSubmenu,
    maxHeightLowerSubmenu,
    mouseMoveHandler,
    currentIndex,
    activeLevel,
    menuLevel = 0,
    setActiveHotkeysModel,

    activeItems,
    setActiveItems,
    showDisabledItems,
  } = props;

  const [model, setModel] = useState(props?.model);
  const [isLoading, setIsLoading] = useState(false);
  const [activeItemKey, setActiveItemKey] = useState<string | number | null>(
    null,
  );
  const [widthSubMenu, setWidthSubMenu] = useState<null | number>(null);

  const prevWidthSubMenu = useRef<number | null>(null);
  const subMenuRef = useRef<HTMLUListElement>(null);

  const { isBase } = useTheme();
  const { isRTL } = useInterfaceDirection();

  const onItemMouseEnter = (e: React.MouseEvent, item: ContextMenuType) => {
    if (isMobileDevice) {
      e.preventDefault();
      return;
    }

    setActiveHotkeysModel(item, model, menuLevel);
  };

  const onItemClick = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    item: ContextMenuType,
  ) => {
    const { disabled, url, onClick, items, action, label, preventNewTab } =
      item;

    if (isMobile() && label && (items || item.onLoad)) {
      e.preventDefault();

      if (items) onMobileItemClick?.(e, label as string, items, undefined);
      else if (item.onLoad)
        onMobileItemClick?.(e, label as string, undefined, item.onLoad);
      return;
    }

    if (disabled) {
      e.preventDefault();
      return;
    }

    if (!url || (onClick && preventNewTab)) {
      e.preventDefault();
    }

    if (items && !isMobileDevice) return;

    onClick?.({ originalEvent: e, action, item });

    if ((items || item.onLoad) && isMobileDevice) {
      setActiveItems([item]);
      setActiveItemKey(item.key);

      e.stopPropagation();
      return;
    }

    if (!item.withToggle) onLeafClick?.(e);
  };

  const position = () => {
    const parentItem = subMenuRef.current?.parentElement;

    const containerOffset = DomHelpers.getOffset(parentItem);
    const viewport = DomHelpers.getViewport();

    const options = subMenuRef.current?.getElementsByClassName("p-menuitem");

    let subListWidth = subMenuRef.current?.offsetParent
      ? subMenuRef.current.clientWidth
      : DomHelpers.getHiddenElementOuterWidth(subMenuRef.current);

    const itemOuterWidth = DomHelpers.getOuterWidth(
      parentItem?.children[0] as HTMLElement,
    );

    if (!isMobile() && options) {
      const optionsWidth: number[] = [];
      Array.from(options).forEach((option) => {
        const isNestedOption =
          option.closest(".p-submenu-list") !== subMenuRef.current;
        if (!isNestedOption) {
          optionsWidth.push(Math.ceil(option.getBoundingClientRect().width));
        }
      });

      const widthMaxContent =
        optionsWidth.length > 0 ? Math.max(...optionsWidth) : 0;

      if (root) subListWidth = subListWidth || widthMaxContent;
      else subListWidth = Math.max(subListWidth, widthMaxContent);
    } else if (isMobile()) {
      subListWidth = subListWidth || MIN_SUBMENU_WIDTH;
    }

    if (subMenuRef.current) {
      let subMenuRefTop = null;

      if (!isMobile()) {
        if (!prevWidthSubMenu.current) {
          prevWidthSubMenu.current = subListWidth;
        }

        subMenuRef.current.style.width = `${prevWidthSubMenu.current}px`;
      } else {
        setWidthSubMenu(subListWidth);
      }

      if (!isMobile() && !root) {
        const firstList = parentItem?.firstChild as HTMLElement;

        const menuItemActive = firstList.querySelector(
          ".p-menuitem-active",
        ) as HTMLElement;

        if (menuItemActive) {
          const top = menuItemActive.offsetTop;
          const scroller = firstList.querySelector(".scroller") as HTMLElement;
          const { scrollTop } = scroller;
          const positionActiveItem = top - scrollTop;

          subMenuRefTop = positionActiveItem - 2;
          subMenuRef.current.style.top = `${subMenuRefTop}px`;
        }
      }

      const submenuRects = subMenuRef.current.getBoundingClientRect();

      if (submenuRects.bottom > viewport.height && subMenuRefTop) {
        const submenuMargin = 16;

        const topOffset =
          subMenuRefTop -
          (submenuRects.bottom - viewport.height) -
          submenuMargin;

        subMenuRef.current.style.top = `${topOffset}px`;
      }

      const containerOffsetLeft = parseInt(`${containerOffset.left}`, 10);
      const freeSpaceRight =
        viewport.width - containerOffsetLeft - itemOuterWidth;
      const freeSpaceLeft = containerOffsetLeft;

      if (isRTL) {
        if (
          subListWidth < containerOffsetLeft ||
          (!root && freeSpaceLeft > freeSpaceRight)
        ) {
          subMenuRef.current.style.left = `${-1 * subListWidth}px`;

          if (!root && subListWidth > containerOffsetLeft) {
            // If the menu extends beyond the screen
            const newWidth =
              containerOffsetLeft - SUBMENU_LIST_MARGIN - SECTION_PADDING;

            subMenuRef.current.style.width = `${newWidth}px`;
            setWidthSubMenu(newWidth);
          }
        } else {
          subMenuRef.current.style.left = `${itemOuterWidth}px`;

          if (!root) subMenuRef.current.style.marginLeft = `4px`;

          if (!root && subListWidth > freeSpaceRight) {
            // If the menu extends beyond the screen
            const newWidth = freeSpaceRight - 3 * SUBMENU_LIST_MARGIN;

            subMenuRef.current.style.width = `${newWidth}px`;
            setWidthSubMenu(newWidth);
          }
        }
      }

      const notEnoughWidthRight =
        containerOffsetLeft + itemOuterWidth + subListWidth >
        viewport.width - DomHelpers.calculateScrollbarWidth();

      if (!isRTL) {
        if (notEnoughWidthRight && freeSpaceLeft > freeSpaceRight) {
          subMenuRef.current.style.left = `${-1 * subListWidth}px`;

          if (!root) subMenuRef.current.style.marginLeft = `-4px`;

          if (
            notEnoughWidthRight &&
            !root &&
            subListWidth > containerOffsetLeft
          ) {
            // If the menu extends beyond the screen
            const newWidth = containerOffsetLeft - 12;

            subMenuRef.current.style.width = `${newWidth}px`;

            setWidthSubMenu(newWidth);
          }
        } else {
          subMenuRef.current.style.left = `${itemOuterWidth}px`;

          if (notEnoughWidthRight && !root) {
            // If the menu extends beyond the screen
            const newWidth =
              viewport.width -
              containerOffsetLeft -
              itemOuterWidth -
              SUBMENU_LIST_MARGIN -
              SECTION_PADDING;

            subMenuRef.current.style.width = `${newWidth}px`;

            setWidthSubMenu(newWidth);
          }
        }
      }
    }
  };

  const onEnter = async () => {
    if (onLoad && model && model.length && model[0].isLoader && !isLoading) {
      setIsLoading(true);
      const res = await onLoad();
      setIsLoading(false);
      if (res) setModel(res);
    }

    position();
  };

  const isActive = () => {
    return !!root || !resetMenu;
  };

  useEffect(() => {
    if (isActive()) {
      position();
    }
  });

  useEffect(() => {
    if (props.model) {
      setModel(props.model);
    }
  }, [props.model]);

  // TODO:
  // useEffect(() => {
  //   if (!activeItemKey) return;

  //   const item = model.find(
  //     (item) => item.key === activeItemKey,
  //   ) as ContextMenuType;

  //   setActiveItem(item || null);
  // }, [model, activeItemKey]);

  const renderSeparator = (index: number, style: React.CSSProperties) => (
    <li
      key={`separator_${index}`}
      className="p-menu-separator not-selectable"
      role="separator"
      style={style}
    />
  );

  const renderMenuitem = (
    item: ContextMenuType,
    index: number,
    style: React.CSSProperties,
  ) => {
    if (showDisabledItems ? false : item.disabled) return;
    // TODO: Not render disabled items

    const activeItemsactiveItems = activeItems?.find((x) => x.id === item.id);

    const active = !!activeItemsactiveItems;

    const className = classNames(
      "p-menuitem",
      { "p-menuitem-active": active },
      item.className || "",
    );

    const linkClassName = classNames("p-menuitem-link", "not-selectable", {
      "p-disabled": item.disabled || item.disableColor,
    });
    const iconClassName = classNames("p-menuitem-icon", {
      "p-disabled": item.disabled || item.disableColor,
    });
    const subMenuIconClassName = "p-submenu-icon";

    const icon = item.withMCPIcon ? (
      <MCPIcon
        title={item.label as string}
        size={MCPIconSize.Small}
        imgSrc={item.icon}
        className={iconClassName || ""}
      />
    ) : (
      item.icon &&
      ((!item.icon.includes("images/") && !item.icon.includes(".svg")) ||
      item.icon.includes("webplugins") ? (
        <img
          src={item.icon}
          alt="plugin icon"
          className={iconClassName || ""}
        />
      ) : (
        <ReactSVG
          wrapper="span"
          className={iconClassName || ""}
          src={item.icon}
        />
      ))
    );

    const label = item.label && (
      <span
        className="p-menuitem-text not-selectable"
        dir="auto"
        data-testid={item.id}
      >
        {item.label}
      </span>
    );
    const subMenuIcon = (item.items || item.onLoad) && (
      <ArrowIcon className={subMenuIconClassName} />
    );

    const dataKeys = Object.fromEntries(
      Object.entries(item).filter((el) => el[0].indexOf("data-") === 0),
    );

    const onClick = (
      e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    ) => {
      onItemClick(e, item);
    };

    const onMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 1) return;

      onClick(e);
    };

    const onDoubleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return;
    };

    const checked =
      item.checked && "isPortal" in item && item.isPortal ? (
        <IconButton
          className={classNames(iconClassName, "p-portal-icon")}
          iconName={CheckIconURL}
        />
      ) : null;

    let content = (
      <a
        href={item.url || "#"}
        className={linkClassName || ""}
        target={item.target}
        {...dataKeys}
        role="menuitem"
      >
        {icon}
        {label}
        {checked}
        {subMenuIcon}
        {item.isOutsideLink ? (
          <OutsdideIcon className={subMenuIconClassName} />
        ) : null}
        {item.badgeLabel || item.isPaidBadge ? (
          <Badge
            label={item.badgeLabel}
            className={`${subMenuIconClassName} p-submenu-badge`}
            backgroundColor={
              item.isPaidBadge
                ? isBase
                  ? globalColors.favoritesStatus
                  : globalColors.favoriteStatusDark
                : globalColors.lightBlueMain
            }
            fontSize="9px"
            fontWeight={700}
            borderRadius="50px"
            noHover
            isPaidBadge={item.isPaidBadge}
            isHovered={false}
          />
        ) : null}
      </a>
    );

    if (item.template) {
      const defaultContentOptions = {
        onClick,
        onDoubleClick,
        className: linkClassName,
        labelClassName: "p-menuitem-text",
        iconClassName,
        subMenuIconClassName,
        element: content,
        props,
        active,
      };

      content = ObjectUtils.getJSXElement(
        item.template,
        item,
        defaultContentOptions,
      );
    }

    const isActiveDescendant =
      currentIndex === index && activeLevel == menuLevel;

    const newIsActiveDescendant = false;

    if (isActiveDescendant !== newIsActiveDescendant) {
      console.log("NONONO isActiveDescendant", isActiveDescendant);
    }

    return (
      <li
        id={item.id}
        key={item.key}
        data-testid={item.dataTestId ?? item.key}
        data-focused={isActiveDescendant}
        data-tooltip-id={
          item.disabled ? `context-menu-item-tooltip-${item.key}` : undefined
        }
        role="none"
        className={
          item.withToggle
            ? classNames(className, styles.subMenuItem, {
                [styles.activeDescendant]: isActiveDescendant,
              })
            : classNames(className, {
                [styles.activeDescendant]: isActiveDescendant,
              })
        }
        style={{ ...item.style, ...style }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
        onMouseEnter={(e) => onItemMouseEnter(e, item)}
        onMouseMove={() => mouseMoveHandler?.(index, model, menuLevel)} // TODO: sub
      >
        {content}
        {item.withToggle ? (
          <ToggleButton
            isChecked={item.checked || false}
            onChange={onClick}
            noAnimation
            isDisabled={item?.disabled ?? false}
          />
        ) : null}
        {item.disabled && item.getTooltipContent ? (
          <Tooltip
            float
            openOnClick={isTouchDevice}
            id={`context-menu-item-tooltip-${item.key}`}
            getContent={item.getTooltipContent}
            place="bottom-end"
            zIndex={1003}
          />
        ) : null}
      </li>
    );
  };

  const renderItem = (
    data:
      | ContextMenuType
      | SeparatorType
      | { data: ContextMenuModel[]; index: number; style: React.CSSProperties },
    idx: number,
  ) => {
    let item: ContextMenuType | SeparatorType | null =
      data && "data" in data ? null : data;
    let index = idx;
    let style = {};

    if (data && "data" in data && Array.isArray(data.data)) {
      item = data.data[data.index] ? data.data[data.index] : null;
      index = data.index;
      style = data.style;
    }

    if (!item) return null;
    if (item.isSeparator || !("label" in item))
      return (
        <React.Fragment key={`fragment_${item.key}`}>
          {renderSeparator(index, style)}
        </React.Fragment>
      );

    return (
      <React.Fragment key={`fragment_${item.key}`}>
        {renderMenuitem(item, index, style)}
      </React.Fragment>
    );
  };

  const renderMenu = () => {
    if (!model) return null;

    return model.map((item: ContextMenuModel, index: number) => {
      if (item?.disabled && !showDisabledItems) return null;
      return renderItem(item, index);
    });
  };

  const renderSubMenuLower = () => {
    if (!model) return null;
    const submenu: JSX.Element[] = [];

    const loaderItem = {
      id: "link-loader-option",
      key: "link-loader",
      isLoader: true,
      label: <ContextMenuSkeleton />,
    };

    model.forEach((item) => {
      const contextMenuTypeItem = item as ContextMenuType;

      const level = menuLevel + 1;

      const activeItemactiveItem = activeItems?.find((x) => x.id === item.id);

      if (contextMenuTypeItem?.items || contextMenuTypeItem?.onLoad) {
        submenu.push(
          <SubMenu
            key={`sub-menu_${item.key}`}
            model={
              contextMenuTypeItem?.onLoad
                ? [loaderItem]
                : contextMenuTypeItem?.items || []
            }
            resetMenu={!activeItemactiveItem}
            onLeafClick={onLeafClick}
            onLoad={contextMenuTypeItem?.onLoad}
            mouseMoveHandler={mouseMoveHandler}
            menuLevel={level}
            activeLevel={activeLevel}
            currentIndex={currentIndex}
            setActiveHotkeysModel={setActiveHotkeysModel}
            activeItems={activeItems}
            setActiveItems={setActiveItems}
            isLowerSubmenu
            maxHeightLowerSubmenu={maxHeightLowerSubmenu}
          />,
        );
      }
    });

    return submenu;
  };

  const className = classNames({ "p-submenu-list": !root });
  const submenu = renderMenu();
  const active = isActive();
  const submenuLower = renderSubMenuLower();

  if (model?.length) {
    const newModel = model.filter((item: ContextMenuModel) =>
      showDisabledItems ? item : item && !item.disabled,
    );
    const rowHeights: number[] = newModel.map((item: ContextMenuModel) => {
      if (!item) return 0;
      if (item.isSeparator) return 13;
      return 36;
    });

    const height = rowHeights.reduce((a, b) => a + b, 0);
    const viewport = DomHelpers.getViewport();
    const paddingList = 12;
    const marginsList = 32;
    const backdrop = 64;
    const header = 55;

    let listHeight =
      changeView && withHeader
        ? height + paddingList + header > viewport.height
          ? viewport.height - backdrop - header - paddingList
          : height + paddingList
        : height + paddingList + marginsList > viewport.height
          ? viewport.height - marginsList
          : height + paddingList;

    if (isLowerSubmenu && maxHeightLowerSubmenu) {
      listHeight = Math.min(listHeight, maxHeightLowerSubmenu);
    }

    return (
      <CSSTransition
        nodeRef={subMenuRef}
        classNames="p-contextmenusub"
        in={active}
        timeout={{ enter: 0, exit: 0 }}
        unmountOnExit
        onEnter={onEnter}
      >
        <ul
          ref={subMenuRef}
          className={classNames(
            className,
            "not-selectable",
            styles.styledList,
            { [styles.withSubMenu]: !!widthSubMenu || isMobile() },
          )}
          style={
            {
              "--list-height": `${height + paddingList}px`,
              "--submenu-width": `${isMobile() ? widthSubMenu || MIN_SUBMENU_WIDTH : widthSubMenu}px`,
              ...(isMobile() &&
                !root && {
                  width: `${widthSubMenu || MIN_SUBMENU_WIDTH}px`,
                  minWidth: `${widthSubMenu || MIN_SUBMENU_WIDTH}px`,
                }),
            } as React.CSSProperties
          }
        >
          <Scrollbar style={{ height: listHeight }}>{submenu}</Scrollbar>
          {submenuLower}
        </ul>
      </CSSTransition>
    );
  }
};

export { SubMenu };
