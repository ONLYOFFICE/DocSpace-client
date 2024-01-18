import React from "react";
import styled from "styled-components";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

const StyledSeveralItemsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SeveralItemsLoader = () => {
  return (
    <StyledSeveralItemsLoader>
      <RectangleSkeleton width={"96px"} height={"96px"} borderRadius={"6px"} />
    </StyledSeveralItemsLoader>
  );
};

export default SeveralItemsLoader;
