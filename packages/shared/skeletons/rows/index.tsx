import React from "react";
import RowSkeleton from "./row";
import { RectangleSkeletonProps } from "../rectangle";

const RowsSkeleton = ({
  count = 25,
  ...props
}: { count?: number } & RectangleSkeletonProps) => {
  const items = [];

  for (let i = 0; i < count; i += 1) {
    items.push(<RowSkeleton key={`row_loader_${i}`} {...props} />);
  }
  return <div>{items}</div>;
};

export { RowsSkeleton };
