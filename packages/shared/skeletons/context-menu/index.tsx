import React from "react";

import { isDesktop } from "../../utils";

import { RectangleSkeletonProps, RectangleSkeleton } from "../rectangle";

import { StyledContextMenu } from "./ContextMenu.styled";
import { ContextMenuSkeletonProps } from "./ContextMenu.types";

const ContextMenuSkeleton = ({
  id,
  className,
  style,
  isRectangle,
  ...rest
}: ContextMenuSkeletonProps & RectangleSkeletonProps) => {
  const {
    title,

    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  const isDesktopView = isDesktop();

  return (
    <StyledContextMenu id={id} className={className} style={style}>
      <RectangleSkeleton
        className="rectangle-content"
        title={title}
        width="16px"
        height="16px"
        borderRadius="3px"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        className="context-menu-rectangle"
        title={title}
        width={isDesktopView ? "97px" : "102px"}
        height={isDesktopView ? "16px" : "20px"}
        borderRadius="3px"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
    </StyledContextMenu>
  );
};

ContextMenuSkeleton.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  isRectangle: true,
};

export { ContextMenuSkeleton };
