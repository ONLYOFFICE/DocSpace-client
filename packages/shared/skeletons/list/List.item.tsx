import React from "react";

import { RectangleSkeleton } from "../rectangle";

import { StyledRow } from "./List.styled";
import { ListItemLoaderProps } from "./List.types";

const ListItemLoader = ({
  id,
  className,
  style,
  withoutFirstRectangle = false,
  withoutLastRectangle = false,
  ...rest
}: ListItemLoaderProps) => {
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
    <StyledRow
      id={id}
      className={className}
      style={style}
      withoutFirstRectangle={withoutFirstRectangle}
      withoutLastRectangle={withoutLastRectangle}
    >
      {!withoutFirstRectangle && (
        <RectangleSkeleton
          title={title}
          width="16"
          height="16"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
          className="list-loader_rectangle"
        />
      )}

      <RectangleSkeleton
        className="list-loader_rectangle-content"
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

      <RectangleSkeleton
        className="list-loader_rectangle-row"
        title={title}
        height="16px"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />

      {!withoutLastRectangle && (
        <RectangleSkeleton
          title={title}
          width="16"
          height="16"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      )}
    </StyledRow>
  );
};

export default ListItemLoader;
