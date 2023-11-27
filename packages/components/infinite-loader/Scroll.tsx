import React, { forwardRef } from "react";
import { StyledScroll } from "./StyledInfiniteLoader";

const Scroll = forwardRef((props, ref) => {
  // @ts-expect-error TS(2769): No overload matches this call.
  return <StyledScroll {...props} forwardedRef={ref} />;
});

export default Scroll;
