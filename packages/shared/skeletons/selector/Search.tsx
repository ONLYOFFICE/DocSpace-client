import React from "react";
import { RectangleSkeleton, RectangleSkeletonProps } from "../rectangle";

interface SearchLoaderProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SearchLoader = ({
  id,
  className,
  style,

  ...rest
}: SearchLoaderProps) => {
  return (
    <RectangleSkeleton
      width="calc(100% - 16px)"
      height="32px"
      style={{ padding: "0 0 0 16px", marginBottom: "8px", ...style }}
      {...rest}
    />
  );
};

export default SearchLoader;
