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
  >(iconName);

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
