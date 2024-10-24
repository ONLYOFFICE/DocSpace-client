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

import { classNames, ObjectUtils, DomHelpers } from "../../../utils";
import { ContextMenuSkeleton } from "../../../skeletons/context-menu";

import { Scrollbar } from "../../scrollbar";
import { ToggleButton } from "../../toggle-button";

import { SubMenuItem } from "../ContextMenu.styled";
import {
  ContextMenuModel,
  ContextMenuType,
  SeparatorType,
} from "../ContextMenu.types";

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
    loadFunc: () => Promise<ContextMenuModel[]>,
  ) => void;
  changeView?: boolean;
  onLoad?: () => Promise<ContextMenuModel[]>;
}) => {
  const {
    onLeafClick,
    root,
    resetMenu,
    changeView,
    onMobileItemClick,
    onLoad,
  } = props;

  const [model, setModel] = useState(props?.model);
  const [isLoading, setIsLoading] = useState(false);
  const [activeItem, setActiveItem] = useState<ContextMenuType | null>(null);

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
    const { url, onClick, items, action } = item;

    if (item.onLoad) {
      e.preventDefault();

      if (!isMobileDevice) return;

      onMobileItemClick?.(e, item.onLoad);

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

    const subListWidth = subMenuRef.current?.offsetParent
      ? subMenuRef.current.offsetWidth
      : DomHelpers.getHiddenElementOuterWidth(subMenuRef.current);

    const itemOuterWidth = DomHelpers.getOuterWidth(
      parentItem?.children[0] as HTMLElement,
    );

    const isRtl = theme.interfaceDirection === "rtl";

    if (subMenuRef.current) {
      subMenuRef.current.style.top = "0px";

      const submenuRects = subMenuRef.current.getBoundingClientRect();

      if (submenuRects.bottom > viewport.height) {
        const submenuMargin = 16;
        const topOffset = submenuRects.bottom - viewport.height + submenuMargin;

        subMenuRef.current.style.top = `${-1 * topOffset}px`;
      }

      const containerOffsetLeft = parseInt(`${containerOffset.left}`, 10);
      const freeSpaceRight =
        viewport.width - containerOffsetLeft - itemOuterWidth;
      const freeSpaceLeft = containerOffsetLeft;
      const submenuListMargin = 4;
      const sectionPadding = 17;

      if (isRtl) {
        if (
          !root &&
          freeSpaceLeft > freeSpaceRight &&
          subListWidth > containerOffsetLeft
        ) {
          // If the menu extends beyond the screen
          subMenuRef.current.style.width = `${containerOffsetLeft - submenuListMargin - sectionPadding}px`;
        }

        if (
          subListWidth < containerOffsetLeft ||
          (!root && freeSpaceLeft > freeSpaceRight)
        ) {
          subMenuRef.current.style.left = `${-1 * subListWidth}px`;
        } else {
          subMenuRef.current.style.left = `${itemOuterWidth}px`;
        }
      }

      const notEnoughWidthRight =
        containerOffsetLeft + itemOuterWidth + subListWidth >
        viewport.width - DomHelpers.calculateScrollbarWidth();

      if (!isRtl) {
        if (notEnoughWidthRight && containerOffsetLeft > subListWidth) {
          subMenuRef.current.style.left = `${-1 * subListWidth}px`;
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

  const renderSubMenu = (item: ContextMenuType) => {
    const loaderItem = {
      id: "link-loader-option",
      key: "link-loader",
      isLoader: true,
      label: <ContextMenuSkeleton />,
    };

    if (item.items || item.onLoad) {
      return (
        <SubMenu
          model={item.onLoad ? [loaderItem] : item.items || []}
          resetMenu={item !== activeItem}
          onLeafClick={onLeafClick}
          // onEnter={onEnter}
          onLoad={item.onLoad}
        />
      );
    }

    return null;
  };

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
    const subMenu = renderSubMenu(item);
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
          {subMenu}
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
        {subMenu}
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
    if (model) {
      if (changeView) {
        const newModel = model.filter(
          (item: ContextMenuModel) => item && !item.disabled,
        );
        const rowHeights: number[] = newModel.map((item: ContextMenuModel) => {
          if (!item) return 0;
          if (item.isSeparator) return 13;
          return 36;
        });

        // const getItemSize = (index) => rowHeights[index];

        const height = rowHeights.reduce((a, b) => a + b);
        const viewport = DomHelpers.getViewport();

        const listHeight =
          height + 61 > viewport.height - 64
            ? viewport.height - 125
            : height + 5;

        return (
          <Scrollbar style={{ height: listHeight }}>
            {model.map((item: ContextMenuModel, index: number) => {
              if (!item || item?.disabled) return null;

              return renderItem(item, index);
            })}
          </Scrollbar>
        );

        // return (
        //   <VariableSizeList
        //     height={listHeight}
        //     width={"auto"}
        //     itemCount={newModel.length}
        //     itemSize={getItemSize}
        //     itemData={newModel}
        //     outerElementType={CustomScrollbarsVirtualList}
        //   >
        //     {renderItem}
        //   </VariableSizeList>
        // );
      }

      return model.map((item: ContextMenuModel, index: number) => {
        if (item?.disabled) return null;
        return renderItem(item, index);
      });
    }

    return null;
  };

  const className = classNames({ "p-submenu-list": !root });
  const submenu = renderMenu();
  const active = isActive();

  return (
    <CSSTransition
      nodeRef={subMenuRef}
      classNames="p-contextmenusub"
      in={active}
      timeout={{ enter: 0, exit: 0 }}
      unmountOnExit
      onEnter={onEnter}
    >
      <ul ref={subMenuRef} className={`${className} not-selectable`}>
        {submenu}
      </ul>
    </CSSTransition>
  );
};

export { SubMenu };
