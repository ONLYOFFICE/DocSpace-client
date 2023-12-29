import React from "react";
import ContentLoader from "react-content-loader";

import { LOADER_STYLE } from "../../constants";
import { CircleSkeletonProps } from "./Circle.types";

export type { CircleSkeletonProps };

const CircleSkeleton = ({
  title,
  x,
  y,
  radius,
  width,
  height,
  ...rest
}: CircleSkeletonProps) => (
  <ContentLoader title={title} width={width} height={height} {...rest}>
    <circle cx={x} cy={y} r={radius} />
  </ContentLoader>
);

CircleSkeleton.defaultProps = {
  title: LOADER_STYLE.title,
  x: "3",
  y: "12",
  radius: "12",
  width: "100%",
  height: "100%",
  backgroundColor: LOADER_STYLE.backgroundColor,
  foregroundColor: LOADER_STYLE.foregroundColor,
  backgroundOpacity: LOADER_STYLE.backgroundOpacity,
  foregroundOpacity: LOADER_STYLE.foregroundOpacity,
  speed: LOADER_STYLE.speed,
  animate: LOADER_STYLE.animate,
};

export { CircleSkeleton };
