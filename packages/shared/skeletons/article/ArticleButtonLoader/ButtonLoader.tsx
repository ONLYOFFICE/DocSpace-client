import React from "react";
import { RectangleSkeleton } from "../../rectangle";

import StyledContainer from "./MainButton.styled";
import { ButtonLoaderProps } from "./ButtonLoader.types";

const ArticleButtonLoader = ({
  id,
  className,
  style,
  ...rest
}: ButtonLoaderProps) => {
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
    <StyledContainer id={id} className={className} style={style}>
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

export default ArticleButtonLoader;
