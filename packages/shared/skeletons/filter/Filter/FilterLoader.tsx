import React from "react";

import StyledFilter from "./Filter.styled";
import { RectangleSkeleton } from "../../rectangle";
import { FilterLoaderProps } from "./Filter.types";

const FilterLoader = ({ id, className, style, ...rest }: FilterLoaderProps) => {
  const {
    title,
    height,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  return (
    <StyledFilter id={id} className={className} style={style}>
      <RectangleSkeleton
        title={title}
        height={height}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        title={title}
        height={height}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
    </StyledFilter>
  );
};

export default FilterLoader;
