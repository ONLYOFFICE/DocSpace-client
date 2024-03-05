import React from "react";

import { StyledLoader, StyledLoaderWrapper } from "./ViewerLoader.styled";
import type { ViewerLoaderProps } from "./ViewerLoader.types";

export const ViewerLoader = ({
  onClick,
  isError,
  isLoading,
  withBackground,
}: ViewerLoaderProps) => {
  if (!isLoading || isError) return;

  return (
    <StyledLoaderWrapper withBackground={withBackground} onClick={onClick}>
      <StyledLoader />
    </StyledLoaderWrapper>
  );
};
