import React from "react";

import { RectangleSkeleton } from "../rectangle";

import {
  StyledHeaderContainer,
  StyledHeaderBox1,
  StyledHeaderBox2,
  StyledHeaderSpacer,
} from "./Sections.styled";
import type { SectionHeaderSkeloton } from "./Sections.types";

export const SectionHeaderSkeleton = ({
  id,
  className,
  style,
  ...rest
}: SectionHeaderSkeloton) => {
  const {
    title,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  return (
    <StyledHeaderContainer id={id} className={className} style={style}>
      <StyledHeaderBox1>
        <RectangleSkeleton
          title={title}
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </StyledHeaderBox1>
      <StyledHeaderSpacer />
      <StyledHeaderBox2>
        <RectangleSkeleton
          title={title}
          width="17"
          height="17"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </StyledHeaderBox2>
    </StyledHeaderContainer>
  );
};
