import React, { forwardRef } from "react";
import { StyledScroll } from "./InfiniteLoader.styled";

const Scroll = forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => {
  return <StyledScroll {...props} ref={ref} />;
});

Scroll.displayName = "Scroll";

export default Scroll;
