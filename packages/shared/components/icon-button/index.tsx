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

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import styles from "./IconButton.module.scss";
import { IconButtonProps } from "./IconButton.types";

const isTouchDevice = () => "ontouchstart" in document.documentElement;

const IconButton = ({
  // Icon props
  iconName,
  iconHoverName,
  iconClickName,
  iconNode,

  // Color props
  color,
  hoverColor,
  clickColor,

  // State props
  isDisabled = false,
  isFill = true,
  isClickable = false,
  isStroke = false,

  // Style props
  className,
  size = 20,
  style,

  // Tooltip props
  title,
  id,
  dataTip = "",

  // Event handlers
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onClick,

  ...rest
}: IconButtonProps) => {
  const buttonRef = React.useRef<HTMLDivElement>(null);
  // State for dynamic icon and color changes
  const [currentIcon, setCurrentIcon] = useState({
    name: iconName,
    color,
  });

  // Update state when props change
  useEffect(() => {
    setCurrentIcon({
      name: iconName,
      color: color || "",
    });
  }, [iconName, color]);

  // Update CSS variables when color or size changes
  useEffect(() => {
    if (!buttonRef.current) return;

    buttonRef.current.style.setProperty(
      "--icon-button-color",
      currentIcon.color ?? "",
    );
    buttonRef.current.style.setProperty(
      "--icon-button-hover-color",
      currentIcon.color ?? "",
    );

    if (size)
      buttonRef.current.style.setProperty(
        "--icon-button-size",
        typeof size === "number" ? `${size}px` : size,
      );
  }, [currentIcon.color, size]);

  // Helper function to update icon state
  const updateIconState = useCallback(
    (newName?: string, newColor?: string) => {
      setCurrentIcon({
        name: newName || iconName,
        color: newColor || color,
      });
    },
    [iconName, color],
  );

  // Event handlers with touch device support
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) return;

      const newName = isTouchDevice() ? iconName : iconHoverName || iconName;
      const newColor = hoverColor || color;

      updateIconState(newName, newColor);
      onMouseEnter?.(e);
    },
    [
      isDisabled,
      iconName,
      iconHoverName,
      hoverColor,
      color,
      onMouseEnter,
      updateIconState,
    ],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) return;

      updateIconState(iconName, color);
      onMouseLeave?.(e);
    },
    [isDisabled, iconName, color, onMouseLeave, updateIconState],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;

      const newName = isTouchDevice() ? iconName : iconClickName || iconName;
      const newColor = clickColor || color;

      updateIconState(newName, newColor);
      onMouseDown?.(e);
    },
    [
      isDisabled,
      iconName,
      iconClickName,
      clickColor,
      color,
      onMouseDown,
      updateIconState,
    ],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;

      const newName = isTouchDevice() ? iconName : iconHoverName || iconName;
      const newColor = hoverColor || color;

      switch (e.nativeEvent.button) {
        case 1: // Left click
          updateIconState(newName, newColor);
          onMouseUp?.(e);
          break;
        case 2: // Right click
          onMouseUp?.(e);
          break;
        default:
          break;
      }
    },
    [
      isDisabled,
      iconName,
      iconHoverName,
      hoverColor,
      color,
      onMouseUp,
      updateIconState,
    ],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      onClick?.(e);
    },
    [isDisabled, onClick],
  );

  const buttonClasses = classNames(
    styles.iconButton,
    {
      [styles.disabled]: isDisabled,
      [styles.notClickable]: !onClick && !isClickable,
      [styles.fill]: isFill && !isStroke,
      [styles.stroke]: isStroke,
    },
    className,
    "icon-button_svg",
  );

  return (
    <div
      ref={buttonRef}
      className={buttonClasses}
      title={title}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      data-tip={dataTip}
      data-event="click focus"
      data-for={id}
      id={id}
      style={style}
      data-testid="icon-button"
      data-iconname={currentIcon.name}
      {...rest}
    >
      {iconNode || (
        <ReactSVG
          className={classNames(styles.notSelectable, "icon-button_svg")}
          src={iconName || ""}
          data-testid="icon-button-svg"
        />
      )}
    </div>
  );
};

export { IconButton };
