import React from "react";
import PropTypes from "prop-types";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";

import RightArrowReactSvgUrl from "PUBLIC_DIR/images/right.arrow.react.svg?url";
import ArrowLeftReactUrl from "PUBLIC_DIR/images/arrow-left.react.svg?url";

import {
  StyledDropdownItem,
  IconWrapper,
  WrapperToggle,
  WrapperBadge,
} from "./styled-drop-down-item";
import ToggleButton from "../toggle-button";
import Badge from "../badge";

const DropDownItem = (props) => {
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
    theme,
    fillIcon,
    isSubMenu,
    isActive,
    withoutIcon,
    noHover,
    height,
    isSelected,
    isActiveDescendant,
    isBeta,
  } = props;

  const { t } = useTranslation(["Settings"]);

  const { withToggle, checked, onClick, onClickSelectedItem, ...rest } = props;

  const onClickAction = (e) => {
    onClick && !disabled && onClick(e);
    onClickSelectedItem && isSelected && onClickSelectedItem();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  const onChange = (event) => {
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
      withToggle={withToggle}
      isActiveDescendant={isActiveDescendant}
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
              <img className="drop-down-icon_image" src={icon} />
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
          <ToggleButton isChecked={checked} onChange={onChange} noAnimation />
        </WrapperToggle>
      )}

      {isBeta && (
        <WrapperBadge>
          <Badge
            noHover
            fontSize="9px"
            isHovered={false}
            borderRadius="50px"
            backgroundColor="#533ED1"
            label={t("Settings:BetaLabel")}
          />
        </WrapperBadge>
      )}
    </StyledDropdownItem>
  );
};

DropDownItem.propTypes = {
  /** Sets the dropdown item to display as a separator */
  isSeparator: PropTypes.bool,
  /** Sets the dropdown to display as a header */
  isHeader: PropTypes.bool,
  /** Enables header arrow icon */
  withHeaderArrow: PropTypes.bool,
  /** Sets an action that will be triggered when the header arrow is clicked */
  headerArrowAction: PropTypes.func,
  /** Accepts tab-index */
  tabIndex: PropTypes.number,
  /** Dropdown item text */
  label: PropTypes.string,
  /** Sets the dropdown item to display as disabled */
  disabled: PropTypes.bool,
  /** Dropdown item icon */
  icon: PropTypes.string,
  /** Disables default style hover effect */
  noHover: PropTypes.bool,
  /** Sets an action that will be triggered when the dropdown item is clicked */
  onClick: PropTypes.func,
  /** Children elements */
  children: PropTypes.any,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Accepts css text-overflow */
  textOverflow: PropTypes.bool,
  /** Indicates that component will fill selected item icon */
  fillIcon: PropTypes.bool,
  /** Enables the submenu */
  isSubMenu: PropTypes.bool,
  /**  Sets drop down item active  */
  isActive: PropTypes.bool,
  /** Disables the element icon */
  withoutIcon: PropTypes.bool,
  /** Sets the padding to the minimum value */
  isModern: PropTypes.bool,
  /** Facilitates highlighting a selected element with the keyboard */
  isActiveDescendant: PropTypes.bool,
  /** Facilitates selecting an element from the context menu */
  isSelected: PropTypes.bool,
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

export default DropDownItem;
