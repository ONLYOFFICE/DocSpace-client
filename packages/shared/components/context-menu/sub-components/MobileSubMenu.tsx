import React, { useRef, useState, useEffect, useCallback } from "react";
import { ReactSVG } from "react-svg";
import { CSSTransition } from "react-transition-group";

import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import { DomHelpers, classNames } from "../../../utils";
import { ContextMenuSkeleton } from "../../../skeletons/context-menu";
import { Scrollbar } from "../../scrollbar";
import { Badge } from "../../badge";
import { ContextMenuModel, ContextMenuType } from "../ContextMenu.types";
import { globalColors } from "../../../themes";
import { useTheme } from "../../../hooks/useTheme";

interface MobileSubMenuProps {
  onLeafClick: (e: React.MouseEvent) => void;
  root?: boolean;
  resetMenu: boolean;
  mobileSubMenuItems?: ContextMenuModel[];
}

const MenuItem = ({
  item,
  onClick,
  style,
}: {
  item: ContextMenuType;
  onClick: (e: React.MouseEvent) => void;
  style: React.CSSProperties;
}) => {
  const { isBase } = useTheme();

  if (item.disabled) return null;

  const subMenuIconClassName = "p-submenu-icon";

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

  const renderIcon = () => {
    if (!item.icon) return null;
    return !item.icon.includes("images/") ? (
      <img src={item.icon} alt="plugin img" className={iconClassName} />
    ) : (
      <ReactSVG wrapper="span" className={iconClassName} src={item.icon} />
    );
  };

  const dataKeys = Object.fromEntries(
    Object.entries(item).filter((el) => el[0].indexOf("data-") === 0),
  );

  return (
    <li
      id={item.id}
      key={item.key}
      data-testid={item.dataTestId ?? item.key}
      role="none"
      className={className}
      style={{ ...item.style, ...style }}
    >
      <a
        href={item.url || "#"}
        className={linkClassName}
        target={item.target}
        {...dataKeys}
        onClick={onClick}
        role="menuitem"
      >
        {renderIcon()}
        {item.label ? (
          <span className="p-menuitem-text not-selectable">{item.label}</span>
        ) : null}
        {item.items ? <ArrowIcon className="p-submenu-icon" /> : null}
        {item.isPaidBadge ? (
          <Badge
            label={item.badgeLabel}
            className={`${subMenuIconClassName} p-submenu-badge`}
            style={{ marginInlineStart: "10px" }}
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
    </li>
  );
};

const Separator = ({
  index,
  style,
}: {
  index: number;
  style: React.CSSProperties;
}) => (
  <li
    key={`separator_${index}`}
    className="p-menu-separator not-selectable"
    role="separator"
    style={style}
  />
);

export const MobileSubMenu = ({
  onLeafClick,
  root,
  resetMenu,
  mobileSubMenuItems,
}: MobileSubMenuProps) => {
  const [submenu, setSubmenu] = useState<ContextMenuModel[] | null>(null);
  const subMenuRef = useRef<HTMLUListElement>(null);

  const position = useCallback(() => {
    if (!subMenuRef.current) return;

    const parentItem = subMenuRef.current.parentElement;
    if (!parentItem) return;

    const containerOffset = DomHelpers.getOffset(parentItem);
    const viewport = DomHelpers.getViewport();
    const subListWidth = subMenuRef.current.offsetParent
      ? subMenuRef.current.offsetWidth
      : DomHelpers.getHiddenElementOuterWidth(subMenuRef.current);
    const itemOuterWidth = DomHelpers.getOuterWidth(
      parentItem.children[0] as HTMLElement,
    );

    subMenuRef.current.style.top = "0px";
    if (
      parseInt(`${containerOffset.left}`, 10) + itemOuterWidth + subListWidth >
      viewport.width - DomHelpers.calculateScrollbarWidth()
    ) {
      subMenuRef.current.style.left = `${-1 * subListWidth}px`;
    } else {
      subMenuRef.current.style.left = `${itemOuterWidth}px`;
    }
  }, []);

  const isActive = useCallback(() => root || !resetMenu, [root, resetMenu]);

  useEffect(() => {
    if (isActive()) {
      position();
    }
  }, [isActive, position]);

  useEffect(() => {
    if (!mobileSubMenuItems?.length) return;
    setSubmenu(mobileSubMenuItems);
    position();
  }, [mobileSubMenuItems, position]);

  const handleItemClick = useCallback(
    (e: React.MouseEvent, item: ContextMenuType) => {
      if (item.disabled) {
        e.preventDefault();
        return;
      }

      if (!item.url) {
        e.preventDefault();
      }

      item.onClick?.({ originalEvent: e, action: item.action, item });

      if (!item.items) {
        onLeafClick(e);
      }
    },
    [onLeafClick],
  );

  const renderMenu = useCallback(
    (model: ContextMenuModel[]) => {
      if (!model?.length) return null;

      const activeModel = model.filter(
        (item: ContextMenuModel) => item && !item.disabled,
      );

      const rowHeights: number[] = activeModel.map((item: ContextMenuModel) =>
        !item ? 0 : item.isSeparator ? 13 : 36,
      );

      const totalHeight: number = rowHeights.reduce((a, b) => a + b, 0);
      const viewport = DomHelpers.getViewport();
      const listHeight =
        totalHeight + 61 > viewport.height - 64
          ? viewport.height - 125
          : totalHeight + 5;

      return (
        <Scrollbar style={{ height: listHeight }}>
          {model.map((item: ContextMenuModel, index: number) => {
            if (item.disabled) return null;

            if (item.isSeparator || !("label" in item)) {
              return (
                <Separator
                  key={item.key}
                  index={index}
                  style={item.style || {}}
                />
              );
            }

            return (
              <MenuItem
                key={item.key}
                item={item as ContextMenuType}
                onClick={(e) => handleItemClick(e, item as ContextMenuType)}
                style={item.style || {}}
              />
            );
          })}
        </Scrollbar>
      );
    },
    [handleItemClick],
  );

  const className = classNames({ "p-submenu-list": !root });

  return (
    <CSSTransition
      nodeRef={subMenuRef}
      classNames="p-contextmenusub"
      in={isActive()}
      timeout={{ enter: 0, exit: 0 }}
      unmountOnExit
    >
      <ul ref={subMenuRef} className={`${className} not-selectable`}>
        {submenu ? renderMenu(submenu) : <ContextMenuSkeleton />}
      </ul>
    </CSSTransition>
  );
};
