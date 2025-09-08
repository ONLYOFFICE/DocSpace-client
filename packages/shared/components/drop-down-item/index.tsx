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

import React from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import RightArrowReactSvgUrl from "PUBLIC_DIR/images/right.arrow.react.svg?url";
import ArrowLeftReactUrl from "PUBLIC_DIR/images/arrow-left.react.svg?url";

import { globalColors } from "../../themes";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";
import { useTheme } from "../../hooks/useTheme";

import { ToggleButton } from "../toggle-button";
import { Badge } from "../badge";

import { DropDownItemProps } from "./DropDownItem.types";
import styles from "./DropDownItem.module.scss";

const IconComponent = ({
  icon,
  fillIcon = true,
}: {
  icon: string | React.ReactElement | React.ElementType;
  fillIcon?: boolean;
}) => {
  const isImageSrc = (src: string) =>
    (!src.includes("images/") && !src.includes(".svg")) ||
    src.includes("webplugins");

  if (typeof icon === "string" && isImageSrc(icon)) {
    return (
      <img className="drop-down-icon_image" src={icon} alt="plugin-logo" />
    );
  }

  if (
    typeof icon === "function" &&
    React.isValidElement(React.createElement(icon))
  ) {
    return <div>{React.createElement(icon)}</div>;
  }

  return (
    <ReactSVG
      src={typeof icon === "string" ? icon : ""}
      className={
        fillIcon
          ? classNames(styles.dropDownItemIcon, "drop-down-item_icon")
          : ""
      }
    />
  );
};

const DropDownItem = ({
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
  noActive = false,
  isSelected,
  isActiveDescendant,
  isBeta,
  additionalElement,
  setOpen,
  withToggle,
  checked,
  onClick,
  onClickSelectedItem,
  label = "",
  tabIndex = -1,
  textOverflow = false,
  minWidth,
  isModern,
  style,
  isPaidBadge,
  badgeLabel,
  testId,
  ...rest
}: DropDownItemProps) => {
  const { t } = useTranslation(["Common"]);
  const { isRTL } = useInterfaceDirection();

  const { isBase } = useTheme();

  const handleClick = (
    e: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!disabled) onClick?.(e);
    if (isSelected) onClickSelectedItem?.();
    setOpen?.(false);
  };

  const handleToggleClick = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handleClick(e);
  };

  return (
    <div
      {...rest}
      className={classNames(
        styles.dropDownItem,
        {
          [styles.headerItem]: isHeader,
          [styles.separator]: isSeparator,
          [styles.noHover]: noHover || isHeader,
          [styles.noActive]: noActive || isHeader,
          [styles.rtlIem]: !noHover && !isHeader && isRTL,
          [styles.selected]: (disabled && isSelected) || isActive,
          [styles.activeDescendant]: isActiveDescendant && !disabled,
          [styles.textOverflow]: textOverflow,
          [styles.modern]: isModern,
          [styles.disabled]: disabled && !isSelected,
        },
        className,
      )}
      onClick={handleClick}
      tabIndex={tabIndex}
      data-testid={testId ?? "drop-down-item"}
      data-focused={isActiveDescendant}
      role={isSeparator ? "separator" : "option"}
      aria-selected={isSelected}
      aria-disabled={disabled}
      style={
        { "--drop-down-min-width": minWidth, ...style } as React.CSSProperties
      }
    >
      {isHeader && withHeaderArrow ? (
        <div className={styles.iconWrapper} onClick={headerArrowAction}>
          <ReactSVG src={ArrowLeftReactUrl} className="drop-down-icon_image" />
        </div>
      ) : null}

      {icon && !withoutIcon ? (
        <div className={styles.iconWrapper}>
          <IconComponent icon={icon} fillIcon={fillIcon} />
        </div>
      ) : null}

      {isSeparator ? (
        "\u00A0"
      ) : label ? (
        <span dir="auto">{label}</span>
      ) : (
        children
      )}

      {isSubMenu ? (
        <div
          className={classNames(styles.iconWrapper, styles.submenuArrow, {
            [styles.RTL]: isRTL,
            [styles.active]: isActive,
          })}
        >
          <ReactSVG
            src={RightArrowReactSvgUrl}
            data-disabled={disabled}
            className={classNames(
              styles.dropDownItemIcon,
              { [styles.disabled]: disabled },
              "drop-down-item_icon",
            )}
          />
        </div>
      ) : null}

      {withToggle ? (
        <div className={styles.wrapperToggle} onClick={handleToggleClick}>
          <ToggleButton
            isChecked={checked || false}
            onChange={handleToggleChange}
            noAnimation
          />
        </div>
      ) : null}

      {isBeta ? (
        <div className={styles.wrapperBadge}>
          <Badge
            noHover
            fontSize="9px"
            isHovered={false}
            borderRadius="50px"
            backgroundColor={globalColors.mainPurple}
            label={t("Common:BetaLabel")}
          />
        </div>
      ) : null}
      {isPaidBadge ? (
        <div className={styles.wrapperBadge}>
          <Badge
            noHover
            fontSize="9px"
            isHovered={false}
            borderRadius="50px"
            style={{ marginInlineStart: "10px" }}
            backgroundColor={
              isBase
                ? globalColors.favoritesStatus
                : globalColors.favoriteStatusDark
            }
            label={badgeLabel || t("Common:Paid")}
            isPaidBadge
          />
        </div>
      ) : null}

      {additionalElement ? (
        <div className={styles.elementWrapper}>{additionalElement}</div>
      ) : null}
    </div>
  );
};

export { DropDownItem };
