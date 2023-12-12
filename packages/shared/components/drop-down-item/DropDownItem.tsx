import React from "react";
import { ReactSVG } from "react-svg";

import RightArrowReactSvgUrl from "PUBLIC_DIR/images/right.arrow.react.svg?url";
import ArrowLeftReactUrl from "PUBLIC_DIR/images/arrow-left.react.svg?url";

import { ToggleButton } from "../toggle-button";

import {
  StyledDropdownItem,
  IconWrapper,
  WrapperToggle,
} from "./DropDownItem.styled";
import { DropDownItemProps } from "./DropDownItem.types";

const DropDownItem = (props: DropDownItemProps) => {
  const {
    isSeparator,
    isHeader,
    withHeaderArrow,
    headerArrowAction,
    label,
    icon,
    children,
    disabled,
    className,

    fillIcon,
    isSubMenu,
    isActive,
    withoutIcon,
    noHover,

    isSelected,
    isActiveDescendant,
  } = props;

  const { withToggle, checked, onClick, onClickSelectedItem, ...rest } = props;

  const onClickAction = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (onClick && !disabled) onClick(e);
    if (onClickSelectedItem && isSelected) onClickSelectedItem();
  };

  const stopPropagation = (
    event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
    event.stopPropagation();
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    stopPropagation(event);
    onClickAction(event);
  };

  return (
    <StyledDropdownItem
      {...rest}
      noHover={noHover}
      className={className}
      onClick={onClickAction}
      disabled={disabled}
      isActive={isActive}
      isHeader={isHeader}
      isSelected={isSelected}
      isActiveDescendant={isActiveDescendant}
      data-testid="drop-down-item"
    >
      {isHeader && withHeaderArrow && (
        <IconWrapper
          className="drop-down-icon back-arrow"
          onClick={headerArrowAction}
        >
          <ReactSVG src={ArrowLeftReactUrl} className="drop-down-icon_image" />
        </IconWrapper>
      )}

      {icon && (
        <IconWrapper className="drop-down-icon ">
          {!withoutIcon ? (
            (!icon.includes("images/") && !icon.includes(".svg")) ||
            icon.includes("webplugins") ? (
              <img
                className="drop-down-icon_image"
                src={icon}
                alt="plugin-logo"
              />
            ) : (
              <ReactSVG
                src={icon}
                className={fillIcon ? "drop-down-item_icon" : ""}
              />
            )
          ) : null}
        </IconWrapper>
      )}

      {isSeparator ? (
        "\u00A0"
      ) : label ? (
        <span dir="auto">{label}</span>
      ) : (
        children && children
      )}

      {isSubMenu && (
        <IconWrapper className="submenu-arrow">
          <ReactSVG
            src={RightArrowReactSvgUrl}
            className="drop-down-item_icon"
          />
        </IconWrapper>
      )}

      {withToggle && (
        <WrapperToggle onClick={stopPropagation}>
          <ToggleButton
            isChecked={checked || false}
            onChange={onChange}
            noAnimation
          />
        </WrapperToggle>
      )}
    </StyledDropdownItem>
  );
};

DropDownItem.defaultProps = {
  isSeparator: false,
  isHeader: false,
  tabIndex: -1,
  label: "",
  disabled: false,
  noHover: false,
  textOverflow: false,
  fillIcon: true,
  isSubMenu: false,
  isActive: false,
  withoutIcon: false,
  height: 32,
  heightTablet: 36,
};

export { DropDownItem };
