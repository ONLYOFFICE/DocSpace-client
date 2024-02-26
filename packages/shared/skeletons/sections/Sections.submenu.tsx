import React from "react";

import { RectangleSkeleton } from "../rectangle";
import { StyledSubmenu } from "./Sections.styled";
import type { SectionSubmenuSkeletonProps } from "./Sections.types";

export const SectionSubmenuSkeleton = ({
  id,
  style,
  title,
  className,
}: SectionSubmenuSkeletonProps) => {
  return (
    <StyledSubmenu id={id} className={className} style={style}>
      <RectangleSkeleton title={title} width="80" height="32" />
      <RectangleSkeleton title={title} width="115" height="32" />
    </StyledSubmenu>
  );
};
