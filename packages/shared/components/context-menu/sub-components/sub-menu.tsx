import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import DomHelpers from "../../utils/domHelpers";
import ObjectUtils from "../../utils/objectUtils";
import { classNames } from "../../utils/classNames";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { CSSTransition } from "react-transition-group";
import { ReactSVG } from "react-svg";
import { useTheme } from "styled-components";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/arrow.right.... Remove this comment to see the full error message
import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/arrow.outsid... Remove this comment to see the full error message
import OutsdideIcon from "PUBLIC_DIR/images/arrow.outside.react.svg";
import Scrollbar from "../../scrollbar";
import ToggleButton from "../../toggle-button";
import { SubMenuItem } from "../styled-context-menu";
import ContextMenuSkeleton from "../../skeletons/context-menu";

import { isMobile, isTablet } from "../../utils/device";

const SubMenu = (props: any) => {
  const {
    onLeafClick,
    root,
    resetMenu,
    changeView,
    onMobileItemClick,
    onLoad,
  } = props;

  const [model, setModel] = useState(props.model);
  const [isLoading, setIsLoading] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const subMenuRef = useRef();

  const theme = useTheme();

  const onItemMouseEnter = (e: any, item: any) => {
    if (item.disabled || isTablet() || isMobile()) {
      e.preventDefault();
      return;
    }

    setActiveItem(item);
  };

  const onItemClick = (e: any, item: any) => {
    if (item.onLoad) {
      e.preventDefault();
      if (!isMobile() && !isTablet()) return;

      if (isMobile() || isTablet()) onMobileItemClick(e, item.onLoad);
      else onLeafClick(e);
      return;
    }

    const { disabled, url, onClick, items, action } = item;
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (!url) {
      e.preventDefault();
    }

    if (onClick) {
      onClick({
        originalEvent: e,
        action: action,
        item,
      });
    }

    if (!items) {
      onLeafClick(e);
    } else {
      e.stopPropagation();
    }
  };

  const position = () => {
    // @ts-expect-error TS(2339): Property 'parentElement' does not exist on type 'n... Remove this comment to see the full error message
    const parentItem = subMenuRef.current?.parentElement;
    const containerOffset = DomHelpers.getOffset(
      // @ts-expect-error TS(2339): Property 'parentElement' does not exist on type 'n... Remove this comment to see the full error message
      subMenuRef.current?.parentElement
    );
    const viewport = DomHelpers.getViewport();
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const subListWidth = subMenuRef.current.offsetParent
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      ? subMenuRef.current.offsetWidth
      : DomHelpers.getHiddenElementOuterWidth(subMenuRef.current);
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    const itemOuterWidth = DomHelpers.getOuterWidth(parentItem.children[0]);
    // @ts-expect-error TS(2339): Property 'interfaceDirection' does not exist on ty... Remove this comment to see the full error message
    const isRtl = theme.interfaceDirection === "rtl";
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    subMenuRef.current.style.top = "0px";
    if (isRtl) {
      if (subListWidth < parseInt(containerOffset.left, 10)) {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        subMenuRef.current.style.left = -1 * subListWidth + "px";
      } else {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        subMenuRef.current.style.left = itemOuterWidth + "px";
      }
    } else {
      if (
        parseInt(containerOffset.left, 10) + itemOuterWidth + subListWidth >
        // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
        viewport.width - DomHelpers.calculateScrollbarWidth()
      ) {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        subMenuRef.current.style.left = -1 * subListWidth + "px";
      } else {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        subMenuRef.current.style.left = itemOuterWidth + "px";
      }
    }
  };

  const onEnter = async () => {
    if (onLoad && model && model.length && model[0].isLoader && !isLoading) {
      setIsLoading(true);
      const res = await onLoad();
      setIsLoading(false);
      setModel(res);
    }

    position();
  };

  const isActive = () => {
    return root || !resetMenu;
  };

  useEffect(() => {
    if (isActive()) {
      position();
    }
  });

  const renderSeparator = (index: any, style: any) => (
    <li
      key={"separator_" + index}
      className="p-menu-separator not-selectable"
      role="separator"
      style={style}
    ></li>
  );

  const renderSubMenu = (item: any) => {
    const loaderItem = {
      id: "link-loader-option",
      key: "link-loader",
      isLoader: true,
      label: <ContextMenuSkeleton />,
    };

    if (item.items || item.onLoad) {
      return (
        <SubMenu
          model={item.onLoad ? [loaderItem] : item.items}
          resetMenu={item !== activeItem}
          onLeafClick={onLeafClick}
          // @ts-expect-error TS(2322): Type '{ model: any; resetMenu: boolean; onLeafClic... Remove this comment to see the full error message
          onEnter={onEnter}
          onLoad={item.onLoad}
        />
      );
    }

    return null;
  };

  const renderMenuitem = (item: any, index: any, style: any) => {
    if (item.disabled) return;
    //TODO: Not render disabled items
    const active = activeItem === item;
    const className = classNames(
      "p-menuitem",
      { "p-menuitem-active": active },
      item.className
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
        <img src={item.icon} className={iconClassName} />
      ) : (
        <ReactSVG wrapper="span" className={iconClassName} src={item.icon} />
      ));

    const label = item.label && (
      <span className="p-menuitem-text not-selectable">{item.label}</span>
    );
    const subMenuIcon = (item.items || item.onLoad) && (
      <ArrowIcon className={subMenuIconClassName} />
    );
    const subMenu = renderSubMenu(item);
    const dataKeys = Object.fromEntries(
      Object.entries(item).filter((el) => el[0].indexOf("data-") === 0)
    );
    const onClick = (e: any) => {
      onItemClick(e, item);
    };
    let content = (
      <a
        href={item.url || "#"}
        className={linkClassName}
        target={item.target}
        {...dataKeys}
        onClick={onClick}
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
        props: props,
        active,
      };

      content = ObjectUtils.getJSXElement(
        item.template,
        item,
        defaultContentOptions
      );
    }

    if (item.withToggle) {
      return (
        <SubMenuItem
          id={item.id}
          key={item.key}
          role="none"
          className={className}
          style={{ ...item.style, ...style }}
          onMouseEnter={(e) => onItemMouseEnter(e, item)}
        >
          {content}
          {subMenu}
          <ToggleButton
            // @ts-expect-error TS(2322): Type '{ isChecked: any; onChange: (e: any) => void... Remove this comment to see the full error message
            isChecked={item.checked}
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
        className={className}
        style={{ ...item.style, ...style }}
        onMouseEnter={(e) => onItemMouseEnter(e, item)}
      >
        {content}
        {subMenu}
      </li>
    );
  };

  const renderItem = (data: any, idx: any) => {
    let item = data;
    let index = idx;
    let style = {};

    if (Array.isArray(data?.data)) {
      item = data.data[data.index] ? data.data[data.index] : null;
      index = data.index;
      style = data.style;
    }

    if (!item) return null;
    if (item.isSeparator)
      return (
        <React.Fragment key={"fragment" + item.key}>
          {renderSeparator(index, style)}
        </React.Fragment>
      );

    return (
      <React.Fragment key={"fragment" + item.key}>
        {renderMenuitem(item, index, style)}
      </React.Fragment>
    );
  };

  const renderMenu = () => {
    if (model) {
      if (changeView) {
        const newModel = model.filter((item: any) => item && !item.disabled);
        const rowHeights = newModel.map((item: any) => {
          if (!item) return 0;
          if (item.isSeparator) return 13;
          return 36;
        });

        //const getItemSize = (index) => rowHeights[index];

        const height = rowHeights.reduce((a: any, b: any) => a + b);

        const viewport = DomHelpers.getViewport();

        const listHeight =
          height + 61 > viewport.height - 64
            ? viewport.height - 125
            : height + 5;

        return (
          // @ts-expect-error TS(2322): Type '{ children: any; style: { height: any; }; st... Remove this comment to see the full error message
          <Scrollbar style={{ height: listHeight }} stype="mediumBlack">
            {model.map((item: any, index: any) => {
              if (item.disabled) return null;
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

      return model.map((item: any, index: any) => {
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
      unmountOnExit={true}
      onEnter={onEnter}
    >
      // @ts-expect-error TS(2322): Type 'MutableRefObject<undefined>' is not assignab... Remove this comment to see the full error message
      <ul ref={subMenuRef} className={`${className} not-selectable`}>
        {submenu}
      </ul>
    </CSSTransition>
  );
};

SubMenu.propTypes = {
  model: PropTypes.any,
  root: PropTypes.bool,
  className: PropTypes.string,
  resetMenu: PropTypes.bool,
  onLeafClick: PropTypes.func,
  changeView: PropTypes.bool,
};

SubMenu.defaultProps = {
  model: null,
  root: false,
  className: null,
  resetMenu: false,
  onLeafClick: null,
};

export default SubMenu;
