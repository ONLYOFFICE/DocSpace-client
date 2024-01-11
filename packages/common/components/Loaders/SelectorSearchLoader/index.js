import React from "react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const SelectorSearchLoader = ({
  id,
  className,
  style,

  ...rest
}) => {
  return (
    <RectangleSkeleton
      width={"calc(100% - 16px)"}
      height={"32px"}
      style={{ padding: "0 0 0 16px", marginBottom: "8px", ...style }}
      {...rest}
    />
  );
};

export default SelectorSearchLoader;
