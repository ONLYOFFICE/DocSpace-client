import React from "react";
import TableRow from "./sub-components/Row";
import { RectangleSkeletonProps } from "../rectangle";

const TableSkeleton = ({
  count = 25,
  ...props
}: { count?: number; style: React.CSSProperties } & RectangleSkeletonProps) => {
  const items = [];

  for (let i = 0; i < count; i += 1) {
    items.push(<TableRow key={`row_loader_${i}`} {...props} />);
  }
  return <div>{items}</div>;
};

export { TableSkeleton };
