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

"use client";

import React from "react";
import { ReactSVG } from "react-svg";

import StyledOuter from "./IconButton.styled";
import { IconButtonProps } from "./IconButton.types";

const IconButton = ({
  iconName,
  iconHoverName,
  iconClickName,
  iconNode,

  color,
  hoverColor,
  clickColor,

  isDisabled = false,
  isFill = true,
  isClickable = false,
  className,
  size = 25,
  title,
  id,
  style,
  dataTip = "",
  isStroke = false,

  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onClick,

  ...rest
}: IconButtonProps) => {
  const [currentIconName, setCurrentIconName] = React.useState(iconName);
  const [currentIconColor, setCurrentIconColor] = React.useState<
    string | undefined
  >(color);

  const onMouseEnterAction = (e: React.MouseEvent) => {
    if (isDisabled) return;

    if (!("ontouchstart" in document.documentElement)) {
      setCurrentIconName(iconHoverName || iconName);
      setCurrentIconColor(hoverColor || color);
    } else {
      setCurrentIconName(iconName);
      setCurrentIconColor(hoverColor || color);
    }

    onMouseEnter?.(e);
  };

  const onMouseLeaveAction = (e: React.MouseEvent) => {
    if (isDisabled) return;

    setCurrentIconName(iconName);
    setCurrentIconColor(color);

    onMouseLeave?.(e);
  };

  const onMouseDownAction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    if (!("ontouchstart" in document.documentElement)) {
      setCurrentIconName(iconClickName || iconName);
      setCurrentIconColor(clickColor || color);
    } else {
      setCurrentIconName(iconName);
      setCurrentIconColor(clickColor || color);
    }

    onMouseDown?.(e);
  };

  const onMouseUpAction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    switch (e.nativeEvent.button) {
      case 1: // Left click
        if (!("ontouchstart" in document.documentElement)) {
          setCurrentIconName(iconHoverName || iconName);
          setCurrentIconColor(hoverColor || color);
        } else {
          setCurrentIconName(iconName);
          setCurrentIconColor(hoverColor || color);
        }

        onMouseUp?.(e);
        break;
      case 2: // Right click
        onMouseUp?.(e);
        break;
      default:
        break;
    }
  };

  const onClickAction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    onClick?.(e);
  };

  React.useEffect(() => {
    setCurrentIconName(iconName);
    setCurrentIconColor(color || "");
  }, [iconName, color]);

  return (
    <StyledOuter
      className={className}
      size={size}
      title={title}
      isDisabled={isDisabled}
      onMouseEnter={onMouseEnterAction}
      onMouseLeave={onMouseLeaveAction}
      onMouseDown={onMouseDownAction}
      onMouseUp={onMouseUpAction}
      onClick={onClickAction}
      isClickable={typeof onClick === "function" || isClickable}
      data-tip={dataTip}
      data-event="click focus"
      data-for={id}
      id={id}
      style={style}
      color={currentIconColor}
      isFill={isFill}
      iconName={iconName}
      data-testid="icon-button"
      isStroke={isStroke}
      {...rest}
    >
      {iconNode || (
        <ReactSVG
          className="icon-button_svg not-selectable"
          src={currentIconName || ""}
        />
      )}
    </StyledOuter>
  );
};

export { IconButton };
