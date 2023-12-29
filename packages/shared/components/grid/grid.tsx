import React, { forwardRef } from "react";

import StyledGrid from "./Grid.styled";
import { GridProps } from "./Grid.types";

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ tag, as, heightProp = "100%", widthProp = "100%", ...rest }, ref) => {
    // console.log("Grid render", rest)
    return (
      <StyledGrid
        // as={!as && tag ? tag : as}
        ref={ref}
        heightProp={heightProp}
        widthProp={widthProp}
        {...rest}
      />
    );
  },
);

Grid.displayName = "Grid";

export { Grid };
