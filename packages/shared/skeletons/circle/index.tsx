import React from "react";
import ContentLoader from "react-content-loader";

import { LoaderStyle } from "../../constants";
import { CircleSkeletonProps } from "./Circle.types";

export { CircleSkeletonProps };

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
  title: LoaderStyle.title,
  x: "3",
  y: "12",
  radius: "12",
  width: "100%",
  height: "100%",
  backgroundColor: LoaderStyle.backgroundColor,
  foregroundColor: LoaderStyle.foregroundColor,
  backgroundOpacity: LoaderStyle.backgroundOpacity,
  foregroundOpacity: LoaderStyle.foregroundOpacity,
  speed: LoaderStyle.speed,
  animate: LoaderStyle.animate,
};

export { CircleSkeleton };
