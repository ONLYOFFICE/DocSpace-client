import React from "react";
import ContentLoader from "react-content-loader";

import { LOADER_STYLE } from "../../constants";
import { RectangleSkeletonProps } from "./Rectangle.types";

export type { RectangleSkeletonProps };

const RectangleSkeleton = ({
  title = LOADER_STYLE.title,
  x = "0",
  y = "0",
  width = "100%",
  height = "32px",
  borderRadius = LOADER_STYLE.borderRadius,
  backgroundColor = LOADER_STYLE.backgroundColor,
  foregroundColor = LOADER_STYLE.foregroundColor,
  backgroundOpacity = LOADER_STYLE.backgroundOpacity,
  foregroundOpacity = LOADER_STYLE.foregroundOpacity,
  speed = LOADER_STYLE.speed,
  animate = LOADER_STYLE.animate,

  ...rest
}: RectangleSkeletonProps) => (
  <ContentLoader
    title={title}
    width={width}
    height={height}
    backgroundColor={backgroundColor}
    foregroundColor={foregroundColor}
    backgroundOpacity={backgroundOpacity}
    foregroundOpacity={foregroundOpacity}
    speed={speed}
    animate={animate}
    {...rest}
  >
    <rect
      x={x}
      y={y}
      rx={borderRadius}
      ry={borderRadius}
      width={width}
      height={height}
    />
  </ContentLoader>
);

export { RectangleSkeleton };
