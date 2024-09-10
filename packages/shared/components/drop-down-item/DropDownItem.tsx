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

import React from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import RightArrowReactSvgUrl from "PUBLIC_DIR/images/right.arrow.react.svg?url";
import ArrowLeftReactUrl from "PUBLIC_DIR/images/arrow-left.react.svg?url";

import { ToggleButton } from "../toggle-button";
import { Badge } from "../badge";

import {
  StyledDropdownItem,
  IconWrapper,
  WrapperToggle,
  WrapperBadge,
  ElementWrapper,
} from "./DropDownItem.styled";
import { DropDownItemProps } from "./DropDownItem.types";
import { globalColors } from "../../themes";

const DropDownItem = (props: DropDownItemProps) => {
  const {
    isSeparator = false,
    isHeader = false,
    withHeaderArrow,
    headerArrowAction,

    icon,
    children,
    disabled = false,
    className,

    fillIcon = true,
    isSubMenu = false,
    isActive = false,
    withoutIcon = false,
    noHover = false,

    isSelected,
    isActiveDescendant,
    isBeta,
    additionalElement,
    setOpen,
  } = props;

  const { t } = useTranslation(["Common"]);
  const theme = useTheme();

  const {
    withToggle,
    checked,
    onClick,
    onClickSelectedItem,
    label = "",
    tabIndex = -1,
    textOverflow = false,
    ...rest
  } = props;

  const onClickAction = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (onClick && !disabled) onClick(e);
    if (onClickSelectedItem && isSelected) onClickSelectedItem();
    if (setOpen) setOpen(false);
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
      tabIndex={tabIndex}
      textOverflow={textOverflow}
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

      {isBeta && (
        <WrapperBadge>
          <Badge
            noHover
            fontSize="9px"
            isHovered={false}
            borderRadius="50px"
            backgroundColor={globalColors.mainPurple}
            label={t("Common:BetaLabel")}
          />
        </WrapperBadge>
      )}

      {additionalElement && (
        <ElementWrapper>{additionalElement}</ElementWrapper>
      )}
    </StyledDropdownItem>
  );
};

DropDownItem.displayName = "DropDownItem";

export { DropDownItem };
