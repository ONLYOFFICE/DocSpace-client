import React from "react";
import { DebouncedFunc } from "lodash";
import throttle from "lodash/throttle";
import { isTablet as Tablet } from "react-device-detect";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";

import { desktop, isTablet, isMobile } from "../../utils";

import { DropDownItem } from "../drop-down-item";
import { DropDown } from "../drop-down";
import { IconButton } from "../icon-button";
import { Backdrop } from "../backdrop";
import { Aside } from "../aside";
import { Heading, HeadingLevel, HeadingSize } from "../heading";
import { Link } from "../link";
import { ContextMenuModel } from "../context-menu";

import {
  StyledBodyContent,
  StyledHeaderContent,
  StyledContent,
  StyledOuter,
} from "./ContextMenuButton.styled";
import { ContextMenuButtonProps } from "./ContextMenuButton.types";
import { ContextMenuButtonDisplayType } from "./ContextMenuButton.enums";

const ContextMenuButtonPure = ({
  opened,
  data,
  displayType = ContextMenuButtonDisplayType.dropdown,
  onClose,
  isDisabled,
  getData,
  onClick,
  className,
  iconOpenName,
  id,
  style,
  displayIconBorder,
  iconClassName,
  color,
  hoverColor,
  clickColor,
  size,
  iconHoverName,
  iconClickName,
  isFill,
  onMouseEnter,
  onMouseLeave,
  onMouseOut,
  onMouseOver,
  title,
  dropDownClassName,
  directionX,
  directionY,
  columnCount,
  zIndex,
  usePortal,
  asideHeader,
  iconName = VerticalDotsReactSvgUrl,
}: ContextMenuButtonProps) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const throttledResize = React.useRef<null | DebouncedFunc<() => void>>(null);

  const [state, setState] = React.useState({
    isOpen: opened,
    data,
    displayType: ContextMenuButtonDisplayType.dropdown,
    offsetX: 0,
    offsetY: 0,
  });

  const getTypeByWidth = React.useCallback(() => {
    if (displayType !== "auto") return displayType;
    const desktopSize = desktop.match(/\d+/)?.[0] as number | undefined;
    if (typeof desktopSize !== "undefined" && window.innerWidth < desktopSize) {
      return ContextMenuButtonDisplayType.aside;
    }

    return ContextMenuButtonDisplayType.dropdown;
  }, [displayType]);

  React.useEffect(() => {
    const type = displayType === "auto" ? getTypeByWidth() : displayType;

    setState((s) => ({ ...s, displayType: type }));
  }, [displayType, getTypeByWidth]);

  const resize = React.useCallback(() => {
    if (displayType !== "auto") return;
    const type = getTypeByWidth();

    if (type === state.displayType) return;
    setState((s) => ({ ...s, displayType: type }));
  }, [displayType, getTypeByWidth, state.displayType]);

  React.useEffect(() => {
    throttledResize.current = throttle(resize, 300);

    window.addEventListener("resize", throttledResize.current);

    return () => {
      if (throttledResize.current) {
        window.removeEventListener("resize", throttledResize.current);
        throttledResize.current.cancel();
      }
    };
  }, [resize]);

  const stopAction = React.useCallback(
    (e: React.MouseEvent) => e.preventDefault(),
    [],
  );

  const toggle = (o?: boolean) => {
    setState((s) => ({
      ...s,
      isOpen: typeof o === "boolean" ? o : !s.isOpen,
    }));
  };

  const onCloseAction = React.useCallback(() => {
    setState((s) => ({ ...s, isOpen: !s.isOpen }));
    onClose?.();
  }, [onClose]);

  const popstate = React.useCallback(() => {
    window.removeEventListener("popstate", popstate, false);
    onCloseAction();
    window.history.go(1);
  }, [onCloseAction]);

  React.useEffect(() => {
    return () => {
      window.removeEventListener("popstate", popstate, false);
    };
  }, [popstate]);

  React.useEffect(() => {
    toggle(opened);
  }, [opened]);

  React.useEffect(() => {
    if (opened && state.displayType === "aside") {
      window.addEventListener("popstate", popstate, false);
    }
  }, [opened, popstate, state.displayType]);

  React.useEffect(() => {
    setState((s) => ({ ...s, displayType: getTypeByWidth() }));
  }, [displayType, getTypeByWidth]);

  const onIconButtonClick = (e: React.MouseEvent) => {
    if (isDisabled || state.displayType === "toggle") {
      stopAction(e);
      return;
    }

    setState((s) => ({ ...s, data: getData(), isOpen: !s.isOpen }));

    if (!isDisabled && state.isOpen) onClick?.(e);
  };

  const clickOutsideAction = (e: Event) => {
    const path = e.composedPath?.();
    const dropDownItem = path
      ? path.find((x: EventTarget) => x === ref.current)
      : null;

    if (dropDownItem) return;

    onCloseAction();
  };

  const getLabel = (item: ContextMenuModel) => {
    return "label" in item ? item.label : "";
  };

  const onDropDownItemClick = (
    item: ContextMenuModel,
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if ("onClick" in item) {
      const open = state.displayType === "dropdown";
      item.onClick?.({ originalEvent: e, action: open, item });
    }
    toggle();
  };

  const callNewMenu = (e: React.MouseEvent) => {
    if (isDisabled || state.displayType !== "toggle") {
      stopAction(e);
      return;
    }

    setState((s) => ({ ...s, data: getData() }));
    onClick?.(e);
  };

  const iconButtonName = state.isOpen && iconOpenName ? iconOpenName : iconName;

  return (
    <StyledOuter
      ref={ref}
      className={className}
      id={id}
      style={style}
      onClick={callNewMenu}
      displayIconBorder={displayIconBorder}
      data-testid="context-menu-button"
    >
      <IconButton
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
        onClick={onIconButtonClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseOver}
        onMouseUp={onMouseOut}
        title={title}
      />
      {displayType === "dropdown" ? (
        <DropDown
          className={dropDownClassName}
          directionX={directionX}
          directionY={directionY}
          open={state.isOpen}
          forwardedRef={ref}
          clickOutsideAction={clickOutsideAction}
          columnCount={columnCount}
          withBackdrop={isTablet() || isMobile() || Tablet}
          zIndex={zIndex}
          isDefaultMode={usePortal}
          eventTypes={["click"]}
        >
          {state.data?.map(
            (item: ContextMenuModel, index: number) =>
              item && (
                <DropDownItem
                  {...item}
                  id={item.id}
                  key={item.key || index}
                  label={getLabel(item)}
                  onClick={(
                    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
                  ) => onDropDownItemClick(item, e)}
                />
              ),
          )}
        </DropDown>
      ) : (
        displayType === "aside" && (
          <>
            <Backdrop
              onClick={onCloseAction}
              visible={state.isOpen || false}
              zIndex={310}
              isAside
            />
            <Aside
              visible={state.isOpen || false}
              scale={false}
              zIndex={310}
              onClose={onCloseAction}
            >
              <StyledContent>
                <StyledHeaderContent>
                  <Heading
                    className="header"
                    size={HeadingSize.medium}
                    level={HeadingLevel.h1}
                    truncate
                  >
                    {asideHeader}
                  </Heading>
                </StyledHeaderContent>
                <StyledBodyContent>
                  {state.data.map(
                    (item: ContextMenuModel, index: number) =>
                      item && (
                        <Link
                          className={`context-menu-button_link${
                            "isHeader" in item && item.isHeader ? "-header" : ""
                          }`}
                          key={item.key || index}
                          fontSize={
                            "isHeader" in item && item.isHeader
                              ? "15px"
                              : "13px"
                          }
                          noHover={"isHeader" in item ? item.isHeader : false}
                          fontWeight={600}
                          onClick={(e) => onDropDownItemClick(item, e)}
                        >
                          {getLabel(item)}
                        </Link>
                      ),
                  )}
                </StyledBodyContent>
              </StyledContent>
            </Aside>
          </>
        )
      )}
    </StyledOuter>
  );
};

ContextMenuButtonPure.defaultProps = {
  opened: false,
  data: [],
  title: "",
  size: 16,
  isDisabled: false,
  directionX: "left",
  isFill: false,

  usePortal: true,
  displayIconBorder: false,
};

export { ContextMenuButtonPure };

const compare = (
  prevProps: ContextMenuButtonProps,
  nextProps: ContextMenuButtonProps,
) => {
  if (
    prevProps.opened === nextProps.opened &&
    prevProps.displayType === nextProps.displayType &&
    prevProps.isDisabled === nextProps.isDisabled
  ) {
    return false;
  }
  return true;
};

export const ContextMenuButton = React.memo(ContextMenuButtonPure, compare);

