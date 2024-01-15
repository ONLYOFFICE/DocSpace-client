import React from "react";

import { StyledRow, StyledBox } from "../Rows.styled";
import { RectangleSkeleton, RectangleSkeletonProps } from "../../rectangle";
import { CircleSkeleton } from "../../circle";

const RowSkeleton = ({
  id,
  className,
  style,
  isRectangle,
  ...rest
}: {
  id?: string;
  key?: string;
  className?: string;
  style?: React.CSSProperties;
  isRectangle?: boolean;
} & RectangleSkeletonProps) => {
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
    <StyledRow id={id} className={className} style={style}>
      {isRectangle ? (
        <RectangleSkeleton
          className="rectangle-content"
          title={title}
          width="32px"
          height="32px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      ) : (
        <CircleSkeleton
          title={title}
          x="16"
          y="16"
          width="32"
          height="32"
          radius="16"
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      )}

      <StyledBox className="row-content">
        <RectangleSkeleton
          className="first-row-content__mobile"
          title={title}
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
        <RectangleSkeleton
          className="second-row-content__mobile"
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
      </StyledBox>

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
    </StyledRow>
  );
};

RowSkeleton.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  isRectangle: true,
};

export default RowSkeleton;
