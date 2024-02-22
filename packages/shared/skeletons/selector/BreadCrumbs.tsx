import React from "react";
import styled from "styled-components";
import { RectangleSkeleton, RectangleSkeletonProps } from "../rectangle";

const StyledContainer = styled.div`
  width: 100%;

  display: flex;
  align-items: center;

  padding: 0 16px;

  margin-bottom: 16px;

  gap: 8px;
`;

interface BreadCrumbsProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const BreadCrumbsLoader = ({
  id,
  className,
  style,

  ...rest
}: BreadCrumbsProps) => {
  return (
    <StyledContainer>
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
    </StyledContainer>
  );
};

export default BreadCrumbsLoader;
