import React from "react";
import { isMobile } from "../../utils";

import ListComponent from "./sub-components/List";
import GridComponent from "./sub-components/Grid";

import { InfiniteLoaderProps } from "./InfiniteLoader.types";

const InfiniteLoaderComponent = (props: InfiniteLoaderProps) => {
  const { viewAs, isLoading } = props;

  const scroll = isMobile()
    ? document.querySelector("#customScrollBar .scroll-wrapper > .scroller")
    : document.querySelector("#sectionScroll .scroll-wrapper > .scroller");

  if (isLoading) return null;

  return viewAs === "tile" ? (
    <GridComponent scroll={scroll ?? window} {...props} />
  ) : (
    <ListComponent scroll={scroll ?? window} {...props} />
  );
};

export { InfiniteLoaderComponent };
