import React from "react";
import styled from "styled-components";

import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledNoItemLoader = styled.div`
  width: 100%;
  margin: 80px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
`;

const NoItemLoader = () => {
  return (
    <StyledNoItemLoader>
      <RectangleSkeleton width={"96px"} height={"96px"} borderRadius={"6px"} />
      <RectangleSkeleton width={"150px"} height={"16px"} borderRadius={"3px"} />
    </StyledNoItemLoader>
  );
};

export default NoItemLoader;
