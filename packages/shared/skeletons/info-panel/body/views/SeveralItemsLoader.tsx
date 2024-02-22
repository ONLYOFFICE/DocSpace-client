import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { StyledSeveralItemsLoader } from "../body.styled";

const SeveralItemsLoader = () => {
  return (
    <StyledSeveralItemsLoader>
      <RectangleSkeleton width="96px" height="96px" borderRadius="6px" />
    </StyledSeveralItemsLoader>
  );
};

export default SeveralItemsLoader;
