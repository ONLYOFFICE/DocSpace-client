import React from "react";
import ContentLoader from "react-content-loader";
import { LOADER_STYLE } from "@docspace/shared/constants";

const TextLoader = (props) => (
  <ContentLoader
    speed={2}
    width={174}
    height={23}
    viewBox="0 0 174 23"
    backgroundColor={LOADER_STYLE.backgroundColor}
    foregroundColor={LOADER_STYLE.foregroundColor}
    backgroundOpacity={LOADER_STYLE.backgroundOpacity}
    foregroundOpacity={LOADER_STYLE.foregroundOpacity}
    {...props}
  >
    <rect x="0" y="0" rx="0" ry="0" width="174" height="23" />
  </ContentLoader>
);

export default TextLoader;
