import React, { useRef, useState, useEffect } from "react";
import { ReactSVG } from "react-svg";
import { CSSTransition } from "react-transition-group";

import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";

import { DomHelpers, classNames } from "../../../utils";
import { ContextMenuSkeleton } from "../../../skeletons/context-menu";

import { Scrollbar } from "../../scrollbar";
import {
  ContextMenuModel,
  ContextMenuType,
  SeparatorType,
} from "../ContextMenu.types";

const MobileSubMenu = (props: {
  onLeafClick: (e: React.MouseEvent) => void;
  root?: boolean;
  resetMenu: boolean;
  onLoad?: () => Promise<ContextMenuModel[]>;
}) => {
  const { onLeafClick, root, resetMenu, onLoad } = props;

  const [submenu, setSubmenu] = useState<null | ContextMenuModel[]>(null);

  const subMenuRef = useRef<HTMLUListElement>(null);

  const position = React.useCallback(() => {
    const parentItem = subMenuRef.current?.parentElement;
    const containerOffset = DomHelpers.getOffset(parentItem);
    const viewport = DomHelpers.getViewport();

    const subListWidth = subMenuRef.current?.offsetParent
      ? subMenuRef.current.offsetWidth
      : DomHelpers.getHiddenElementOuterWidth(subMenuRef.current);

    const itemOuterWidth = DomHelpers.getOuterWidth(
      parentItem?.children[0] as HTMLElement,
    );

    if (subMenuRef.current) {
      subMenuRef.current.style.top = "0px";

      if (
        parseInt(`${containerOffset.left}`, 10) +
          itemOuterWidth +
          subListWidth >
        viewport.width - DomHelpers.calculateScrollbarWidth()
      ) {
        subMenuRef.current.style.left = `${-1 * subListWidth}px`;
      } else {
        subMenuRef.current.style.left = `${itemOuterWidth}px`;
      }
    }
  }, []);

  const isActive = () => {
    return !!root || !resetMenu;
  };

  useEffect(() => {
    if (isActive()) {
      position();
    }
  });

  const fetchSubMenu = React.useCallback(async () => {
    const res = await onLoad?.();
    if (res) setSubmenu(res);

    position();
  }, [position, setSubmenu, onLoad]);

  useEffect(() => {
    if (onLoad) fetchSubMenu();
  }, [onLoad, fetchSubMenu]);

  const onItemClick = (e: React.MouseEvent, item: ContextMenuType) => {
    const { disabled, url, onClick, items, action } = item;
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (!url) {
      e.preventDefault();
    }

    if (onClick) {
      onClick(e, action, item);
    }

    if (!items) {
      onLeafClick(e);
    }
  };

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

    const className = classNames(
      "p-menuitem",
      { "p-menuitem-active": false },
      item?.className || "",
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
      (!item.icon.includes("images/") ? (
        <img src={item.icon} alt="plugin img" className={iconClassName || ""} />
      ) : (
        <ReactSVG
          wrapper="span"
          className={iconClassName || ""}
          src={item.icon}
        />
      ));

    const label = item.label && (
      <span className="p-menuitem-text not-selectable">{item.label}</span>
    );
    const subMenuIcon = item.items && (
      <ArrowIcon className={subMenuIconClassName} />
    );

    const dataKeys = Object.fromEntries(
      Object.entries(item).filter((el) => el[0].indexOf("data-") === 0),
    );

    const onClick = (e: React.MouseEvent) => {
      onItemClick(e, item);
    };

    return (
      <li
        id={item.id}
        key={item.key}
        role="none"
        className={className || ""}
        style={{ ...item.style, ...style }}
      >
        <a
          href={item.url || "#"}
          className={linkClassName || ""}
          target={item.target}
          {...dataKeys}
          onClick={onClick}
          role="menuitem"
        >
          {icon}
          {label}
          {subMenuIcon}
        </a>
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
      "data" in data ? null : data;
    let index = idx;
    let style = {};

    if ("data" in data && Array.isArray(data.data)) {
      item = data.data[data.index] ? data.data[data.index] : null;
      index = data.index;
      style = data.style;
    }

    if (!item) return null;
    if (item?.isSeparator || !("label" in item))
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

  const renderMenu = (model: ContextMenuModel[]) => {
    if (model) {
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
      const listHeight =
        height + 61 > viewport.height - 64 ? viewport.height - 125 : height + 5;

      return (
        <Scrollbar style={{ height: listHeight }}>
          {model.map((item: ContextMenuModel, index: number) => {
            if (item.disabled) return null;
            return renderItem(item, index);
          })}
        </Scrollbar>
      );
    }

    return null;
  };

  const className = classNames({ "p-submenu-list": !root });
  const active = isActive();

  return (
    <CSSTransition
      nodeRef={subMenuRef}
      classNames="p-contextmenusub"
      in={active}
      timeout={{ enter: 0, exit: 0 }}
      unmountOnExit
    >
      <ul ref={subMenuRef} className={`${className} not-selectable`}>
        {submenu ? renderMenu(submenu) : <ContextMenuSkeleton />}
      </ul>
    </CSSTransition>
  );
};

export { MobileSubMenu };
