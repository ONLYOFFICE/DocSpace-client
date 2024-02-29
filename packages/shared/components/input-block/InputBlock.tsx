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
    </StyledInputGroup>
  );
};

export { InputBlock };
