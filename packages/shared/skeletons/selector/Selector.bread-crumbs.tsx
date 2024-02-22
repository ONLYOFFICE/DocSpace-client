import React from "react";

import { RectangleSkeleton } from "../rectangle";

import { StyledBreadCrumbsSkeletonContainer } from "./Selector.styled";
import type { SelectorBreadCrumbsSkeletonProps } from "./Selector.types";

export const SelectorBreadCrumbsSkeleton = ({
  id,
  className,
  style,

  ...rest
}: SelectorBreadCrumbsSkeletonProps) => {
  return (
    <StyledBreadCrumbsSkeletonContainer>
      <RectangleSkeleton
        width="80px"
        height="22px"
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width="12px"
        height="12px"
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width="80px"
        height="22px"
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width="12px"
        height="12px"
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width="80px"
        height="22px"
        style={{ ...style }}
        {...rest}
      />
    </StyledBreadCrumbsSkeletonContainer>
  );
};
