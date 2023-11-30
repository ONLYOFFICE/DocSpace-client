import React from "react";
import ContentLoader from "react-content-loader";

import { LoaderStyle } from "../../constants";
import { RectangleSkeletonProps } from "./Rectangle.types";

export { RectangleSkeletonProps };

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
  title: LoaderStyle.title,
  x: "0",
  y: "0",
  width: "100%",
  height: "32",
  borderRadius: LoaderStyle.borderRadius,
  backgroundColor: LoaderStyle.backgroundColor,
  foregroundColor: LoaderStyle.foregroundColor,
  backgroundOpacity: LoaderStyle.backgroundOpacity,
  foregroundOpacity: LoaderStyle.foregroundOpacity,
  speed: LoaderStyle.speed,
  animate: LoaderStyle.animate,
};

export { RectangleSkeleton };
