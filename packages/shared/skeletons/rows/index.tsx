import React from "react";

import { RectangleSkeletonProps } from "../rectangle";

import RowSkeleton from "./sub-components/Row";

const RowsSkeleton = ({
  count = 25,
  ...props
}: {
  count?: number;
  style?: React.CSSProperties;
} & RectangleSkeletonProps) => {
  const items = [];

  for (let i = 0; i < count; i += 1) {
    items.push(<RowSkeleton key={`row_loader_${i}`} {...props} />);
  }
  return <div>{items}</div>;
};

export { RowsSkeleton };
