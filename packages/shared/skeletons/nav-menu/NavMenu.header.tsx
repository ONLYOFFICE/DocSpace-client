import React from "react";

import { CircleSkeleton } from "../circle";
import { RectangleSkeleton } from "../rectangle";

import { StyledHeader, StyledSpacer } from "./NavMenu.styled";
import type { NavMenuHeaderLoaderProps } from "./NavMenu.types";

export const NavMenuHeaderLoader = ({
  id,
  className,
  style,
  ...rest
}: NavMenuHeaderLoaderProps) => {
  const {
    title,
    borderRadius,
    backgroundColor = "#fff",
    foregroundColor = "#fff",
    backgroundOpacity = 0.25,
    foregroundOpacity = 0.2,
    speed,
    animate,
  } = rest;

  return (
    <StyledHeader id={id} className={className} style={style}>
      <RectangleSkeleton
        title={title}
        width="208"
        height="24"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <StyledSpacer />
      <CircleSkeleton
        x="18"
        y="18"
        radius="18"
        width="36"
        height="36"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
      />
    </StyledHeader>
  );
};
