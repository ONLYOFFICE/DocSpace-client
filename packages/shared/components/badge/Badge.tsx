import React from "react";

import { BadgeProps } from "./Badge.types";
import { StyledInner, StyledText } from "./Badge.styled";
import { BadgeTheme } from "./Badge.theme";

const Badge = (props: BadgeProps) => {
  const {
    onClick,
    fontSize,
    color,
    fontWeight,
    backgroundColor,
    borderRadius,
    padding,
    maxWidth,
    height,
    type,
    compact,
    isHovered,
    border,
    label,
  } = props;

  const onClickAction = React.useCallback(
    (e: React.MouseEvent) => {
      if (!onClick) return;

      e.preventDefault();
      onClick(e);
    },
    [onClick],
  );

  return (
    <BadgeTheme
      {...props}
      isHovered={isHovered}
      onClick={onClickAction}
      border={border}
      height={height}
    >
      <StyledInner
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        padding={padding}
        type={type}
        compact={compact}
        maxWidth={maxWidth}
        data-testid="badge"
      >
        <StyledText
          textAlign="center"
          fontWeight={fontWeight}
          borderRadius={borderRadius}
          color={color}
          fontSize={fontSize}
        >
          {label}
        </StyledText>
      </StyledInner>
    </BadgeTheme>
  );
};

Badge.defaultProps = {
  label: 0,
  fontSize: "11px",
  fontWeight: 800,
  borderRadius: "11px",
  padding: "0px 5px",
  maxWidth: "50px",
  isHovered: false,
  noHover: false,
};

export { Badge };
