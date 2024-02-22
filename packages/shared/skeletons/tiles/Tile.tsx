import React from "react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { StyledTile, StyledBottom, StyledMainContent } from "./Tiles.styled";
import type { TileSkeletonProps } from "./Tiles.types";

export const TileSkeleton = ({
  isFolder,
  title,
  borderRadius,
  backgroundColor,
  foregroundColor,
  backgroundOpacity,
  foregroundOpacity,
  speed,
  animate,
  ...rest
}: TileSkeletonProps) => {
  return isFolder ? (
    <StyledTile {...rest}>
      <StyledBottom className="bottom-content" isFolder>
        <RectangleSkeleton
          className="first-content"
          title={title}
          width="100%"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
        <RectangleSkeleton
          className="second-content"
          title={title}
          height="22px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
        <RectangleSkeleton
          className="option-button"
          title={title}
          height="16px"
          width="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
      </StyledBottom>
    </StyledTile>
  ) : (
    <StyledTile {...rest}>
      <StyledMainContent>
        <RectangleSkeleton
          className="main-content"
          title={title}
          height="156px"
          borderRadius={borderRadius || "0"}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
      </StyledMainContent>

      <StyledBottom className="bottom-content">
        <RectangleSkeleton
          className="first-content"
          title={title}
          width="100%"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
        <RectangleSkeleton
          className="second-content"
          title={title}
          height="22px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
        <RectangleSkeleton
          className="option-button"
          title={title}
          height="16px"
          width="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
      </StyledBottom>
    </StyledTile>
  );
};
