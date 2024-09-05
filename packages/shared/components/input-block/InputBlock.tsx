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

import { InputSize, TextInput } from "../text-input";
import { IconButton } from "../icon-button";

import {
  StyledInputGroup,
  StyledChildrenBlock,
  StyledIconBlock,
} from "./InputBlock.styled";
import { InputBlockProps } from "./InputBlock.types";

const InputBlock = ({
  onIconClick,
  onChange,
  size,
  iconSize,
  hasError = false,
  hasWarning = false,
  isDisabled = false,
  isReadOnly,
  scale = false,
  className,
  style,
  iconColor,
  hoverColor,
  children,
  id,
  name,
  type,
  value = "",
  placeholder,
  tabIndex = -1,
  maxLength = 255,
  onBlur,
  onFocus,
  isAutoFocussed,
  autoComplete = "off",
  onKeyDown,
  mask,
  keepCharPositions = false,
  forwardedRef,
  iconButtonClassName = "",
  iconName = "",
  iconNode,
  isIconFill = false,
  onClick,
}: InputBlockProps) => {
  const onIconClickAction = React.useCallback(
    (e: React.MouseEvent) => {
      onIconClick?.(e);
    },
    [onIconClick],
  );
  const onChangeAction = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    },
    [onChange],
  );

  const getIconSize = () => {
    let iconButtonSize = 0;
    if (iconSize && iconSize > 0) {
      iconButtonSize = iconSize;
    } else if (size) {
      switch (size) {
        case InputSize.base:
          iconButtonSize = 16;
          break;
        case InputSize.middle:
          iconButtonSize = 18;
          break;
        case InputSize.big:
          iconButtonSize = 21;
          break;
        case InputSize.huge:
          iconButtonSize = 24;
          break;

        default:
          break;
      }
    }

    return iconButtonSize;
  };

  const iconButtonSize = getIconSize();

  return (
    <StyledInputGroup
      hasError={hasError}
      hasWarning={hasWarning}
      isDisabled={isDisabled}
      scale={scale}
      size={size}
      className={className}
      style={style}
      color={iconColor}
      hoverColor={hoverColor}
      data-testid="input-block"
    >
      <div className="prepend">
        <StyledChildrenBlock className="prepend-children">
          {children}
        </StyledChildrenBlock>
      </div>
      <TextInput
        id={id}
        className={className}
        name={name}
        type={type}
        value={value}
        onClick={onClick}
        isDisabled={isDisabled}
        hasError={hasError}
        hasWarning={hasWarning}
        placeholder={placeholder}
        tabIndex={tabIndex}
        maxLength={maxLength}
        onBlur={onBlur}
        onFocus={onFocus}
        isReadOnly={isReadOnly}
        isAutoFocussed={isAutoFocussed}
        autoComplete={autoComplete}
        size={size}
        scale={scale}
        onChange={onChangeAction}
        onKeyDown={onKeyDown}
        withBorder={false}
        mask={mask}
        keepCharPositions={keepCharPositions}
        forwardedRef={forwardedRef}
      />

      {!isDisabled && (
        <div className="append">
          <StyledIconBlock
            className={`input-block-icon ${iconButtonClassName}`}
            onClick={onIconClickAction}
            isClickable={!!onIconClick}
          >
            <IconButton
              size={iconButtonSize}
              iconNode={iconNode}
              iconName={iconName || ""}
              isFill={isIconFill}
              isClickable={typeof onIconClick === "function"}
              color={iconColor}
              hoverColor={hoverColor}
            />
          </StyledIconBlock>
        </div>
      )}
    </StyledInputGroup>
  );
};

export { InputBlock };
