import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import StyledContainer from "./HeaderLoader.styled";

import { HeaderLoaderProps } from "./HeaderLoader.types";

const ArticleHeaderLoader = ({
  id,
  className,
  style,
  showText,
  ...rest
}: HeaderLoaderProps) => {
  const {
    title,
    width,
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
    <StyledContainer
      id={id}
      className={className}
      style={style}
      showText={showText}
    >
      <RectangleSkeleton
        title={title}
        width={width}
        height={height}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
    </StyledContainer>
  );
};

export default ArticleHeaderLoader;
