import React from "react";
import ContentLoader from "react-content-loader";

import { LOADER_STYLE } from "../../constants";
import { RectangleSkeletonProps } from "./Rectangle.types";

export type { RectangleSkeletonProps };

const RectangleSkeleton = ({
  title,
  x,
  y,
  borderRadius,
  width,
  height,
  ...rest
}: RectangleSkeletonProps) => (
  <ContentLoader title={title} width={width} height={height} {...rest}>
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

RectangleSkeleton.propTypes = {};

RectangleSkeleton.defaultProps = {
  title: LOADER_STYLE.title,
  x: "0",
  y: "0",
  width: "100%",
  height: "32",
  borderRadius: LOADER_STYLE.borderRadius,
  backgroundColor: LOADER_STYLE.backgroundColor,
  foregroundColor: LOADER_STYLE.foregroundColor,
  backgroundOpacity: LOADER_STYLE.backgroundOpacity,
  foregroundOpacity: LOADER_STYLE.foregroundOpacity,
  speed: LOADER_STYLE.speed,
  animate: LOADER_STYLE.animate,
};

export { RectangleSkeleton };
