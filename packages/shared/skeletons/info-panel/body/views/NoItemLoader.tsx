import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { StyledNoItemLoader } from "../body.styled";

const NoItemLoader = () => {
  return (
    <StyledNoItemLoader>
      <RectangleSkeleton width="96px" height="96px" borderRadius="6px" />
      <RectangleSkeleton width="150px" height="16px" borderRadius="3px" />
    </StyledNoItemLoader>
  );
};

export default NoItemLoader;
