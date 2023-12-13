import React from "react";
import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledContainer = styled.div`
  width: 100%;

  display: flex;
  align-items: center;

  padding: 0 16px;

  margin-bottom: 16px;

  gap: 8px;
`;

const SelectorBreadCrumbsLoader = ({
  id,
  className,
  style,

  ...rest
}) => {
  return (
    <StyledContainer>
      <RectangleSkeleton
        width={"80px"}
        height={"22px"}
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width={"12px"}
        height={"12px"}
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width={"80px"}
        height={"22px"}
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width={"12px"}
        height={"12px"}
        style={{ ...style }}
        {...rest}
      />
      <RectangleSkeleton
        width={"80px"}
        height={"22px"}
        style={{ ...style }}
        {...rest}
      />
    </StyledContainer>
  );
};

export default SelectorBreadCrumbsLoader;
