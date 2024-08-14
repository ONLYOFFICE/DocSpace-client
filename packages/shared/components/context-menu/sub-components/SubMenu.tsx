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

import React, { useRef, useState, useEffect } from "react";

import { CSSTransition } from "react-transition-group";
import { ReactSVG } from "react-svg";
import { useTheme } from "styled-components";

import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import OutsdideIcon from "PUBLIC_DIR/images/arrow.outside.react.svg";
import { isMobile as isMobileDevice } from "react-device-detect";
import { classNames, ObjectUtils, DomHelpers, isMobile } from "../../../utils";
import { ContextMenuSkeleton } from "../../../skeletons/context-menu";

import { ToggleButton } from "../../toggle-button";
import { Scrollbar } from "../../scrollbar";

import { SubMenuItem, StyledList } from "../ContextMenu.styled";
import {
  ContextMenuModel,
  ContextMenuType,
  SeparatorType,
} from "../ContextMenu.types";

const submenuListMargin = 4; // Indentation of the second level menu from the first level
const sectionPadding = 16; // Screen margin

const SubMenu = (props: {
  model: ContextMenuModel[];
  root?: boolean;
  className?: string;
  resetMenu?: boolean;
  onLeafClick?: (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onMobileItemClick?: (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    label: string,
    items?: ContextMenuModel[],
    loadFunc?: () => Promise<ContextMenuModel[]>,
  ) => void;
  onLoad?: () => Promise<ContextMenuModel[]>;
  changeView?: boolean;
  withHeader?: boolean;
}) => {
  const {
    onLeafClick,
    root,
    resetMenu,
    onMobileItemClick,
    onLoad,
    changeView,
    withHeader,
  } = props;

  const [model, setModel] = useState(props?.model);
  const [isLoading, setIsLoading] = useState(false);
  const [activeItem, setActiveItem] = useState<ContextMenuType | null>(null);
  const [widthSubMenu, setWidthSubMenu] = useState<null | number>(null);

  const subMenuRef = useRef<HTMLUListElement>(null);

  const theme = useTheme();

  const onItemMouseEnter = (e: React.MouseEvent, item: ContextMenuType) => {
    if (isMobileDevice) {
      e.preventDefault();
      return;
    }

    setActiveItem(item);
  };

  const onItemClick = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    item: ContextMenuType,
  ) => {
    const { disabled, url, onClick, items, action, label } = item;

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

    if (!url) {
      e.preventDefault();
    }

    onClick?.({ originalEvent: e, action, item });

    if (items && isMobileDevice) {
      setActiveItem(item);

      e.stopPropagation();
      return;
    }

    onLeafClick?.(e);
  };

  const position = () => {
    const parentItem = subMenuRef.current?.parentElement;

    const containerOffset = DomHelpers.getOffset(parentItem);
    const viewport = DomHelpers.getViewport();

    const options = subMenuRef.current?.getElementsByClassName("p-menuitem");

    let subListWidth = subMenuRef.current?.offsetParent
      ? subMenuRef.current.offsetWidth
      : DomHelpers.getHiddenElementOuterWidth(subMenuRef.current);

    const itemOuterWidth = DomHelpers.getOuterWidth(
      parentItem?.children[0] as HTMLElement,
    );

    const isRtl = theme.interfaceDirection === "rtl";

    if (!isMobile() && options) {
      const optionsWidth: number[] = [];
      Array.from(options).forEach((option) =>
        optionsWidth.push(Math.ceil(option.getBoundingClientRect().width)),
      );

      const widthMaxContent = Math.max(...optionsWidth);

      if (root) subListWidth = subListWidth || widthMaxContent;
      else if (!subMenuRef?.current?.style.width)
        subListWidth = Math.max(subListWidth, widthMaxContent);
    }

    if (subMenuRef.current) {
      let subMenuRefTop = null;

      if (!isMobile()) {
        if (root) subMenuRef.current.style.width = `${subListWidth}px`;
        else if (!subMenuRef?.current?.style.width) {
          subMenuRef.current.style.width = `${subListWidth}px`;
        }
      }

      if (!isMobile() && !root) {
        const firstList = parentItem?.firstChild as HTMLElement;

        const menuItemActive = firstList.querySelector(
          ".p-menuitem-active",
        ) as HTMLElement;

        const top = menuItemActive.offsetTop;
        const scroller = firstList.querySelector(".scroller") as HTMLElement;
        const scrollTop = scroller.scrollTop;
        const positionActiveItem = top - scrollTop;

        subMenuRefTop = positionActiveItem - 2;
        subMenuRef.current.style.top = `${subMenuRefTop}px`;
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

      if (isRtl) {
        if (
          subListWidth < containerOffsetLeft ||
          (!root && freeSpaceLeft > freeSpaceRight)
        ) {
          subMenuRef.current.style.left = `${-1 * subListWidth}px`;

          if (!root && subListWidth > containerOffsetLeft) {
            // If the menu extends beyond the screen
            const newWidth =
              containerOffsetLeft - submenuListMargin - sectionPadding;

            subMenuRef.current.style.width = `${newWidth}px`;
            setWidthSubMenu(newWidth);
          }
        } else {
          subMenuRef.current.style.left = `${itemOuterWidth}px`;

          if (!root) subMenuRef.current.style.marginLeft = `4px`;

          if (!root && subListWidth > freeSpaceRight) {
            // If the menu extends beyond the screen
            const newWidth = freeSpaceRight - 3 * submenuListMargin;

            subMenuRef.current.style.width = `${newWidth}px`;
            setWidthSubMenu(newWidth);
          }
        }
      }

      const notEnoughWidthRight =
        containerOffsetLeft + itemOuterWidth + subListWidth >
        viewport.width - DomHelpers.calculateScrollbarWidth();

      if (!isRtl) {
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
              submenuListMargin -
              sectionPadding;

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
    if (item.disabled) return;
    // TODO: Not render disabled items
    const active = activeItem === item;
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

    const icon =
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
      ));

    const label = item.label && (
      <span className="p-menuitem-text not-selectable" dir="auto">
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
        {subMenuIcon}
        {item.isOutsideLink && (
          <OutsdideIcon className={subMenuIconClassName} />
        )}
      </a>
    );

    if (item.template) {
      const defaultContentOptions = {
        onClick,
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

    if (item.withToggle) {
      return (
        <SubMenuItem
          id={item.id}
          key={item.key}
          role="none"
          className={className || ""}
          style={{ ...item.style, ...style }}
          onClick={onClick}
          onMouseDown={onMouseDown}
          onMouseEnter={(e) => onItemMouseEnter(e, item)}
        >
          {content}
          <ToggleButton
            isChecked={item.checked || false}
            onChange={onClick}
            noAnimation
          />
        </SubMenuItem>
      );
    }

    return (
      <li
        id={item.id}
        key={item.key}
        role="none"
        className={className || ""}
        style={{ ...item.style, ...style }}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseEnter={(e) => onItemMouseEnter(e, item)}
      >
        {content}
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
      if (item?.disabled) return null;
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

      if (contextMenuTypeItem?.items || contextMenuTypeItem?.onLoad) {
        submenu.push(
          <SubMenu
            key={`sub-menu_${item.id}`}
            model={
              contextMenuTypeItem?.onLoad
                ? [loaderItem]
                : contextMenuTypeItem?.items || []
            }
            resetMenu={item !== activeItem}
            onLeafClick={onLeafClick}
            onLoad={contextMenuTypeItem?.onLoad}
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

  if (model.length) {
    const newModel = model.filter(
      (item: ContextMenuModel) => item && !item.disabled,
    );
    const rowHeights: number[] = newModel.map((item: ContextMenuModel) => {
      if (!item) return 0;
      if (item.isSeparator) return 13;
      return 36;
    });

    const height = rowHeights.reduce((a, b) => a + b);
    const viewport = DomHelpers.getViewport();
    const paddingList = 12;
    const marginsList = 32;
    const backdrop = 64;
    const header = 55;

    const listHeight =
      changeView && withHeader
        ? height + paddingList + header > viewport.height
          ? viewport.height - backdrop - header - paddingList
          : height + paddingList
        : height + paddingList + marginsList > viewport.height
          ? viewport.height - marginsList
          : height + paddingList;

    return (
      <CSSTransition
        nodeRef={subMenuRef}
        classNames="p-contextmenusub"
        in={active}
        timeout={{ enter: 0, exit: 0 }}
        unmountOnExit
        onEnter={onEnter}
      >
        <StyledList
          ref={subMenuRef}
          className={`${className} not-selectable`}
          listHeight={height + paddingList}
          widthSubMenu={widthSubMenu}
        >
          <Scrollbar style={{ height: listHeight }}>{submenu}</Scrollbar>
          {submenuLower}
        </StyledList>
      </CSSTransition>
    );
  }
};

export { SubMenu };
