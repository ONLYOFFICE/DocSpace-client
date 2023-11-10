import React from "react";
import { LoaderStyle } from "@docspace/components/utils/constants";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const speed = 2;

const SettingsHeaderLoader = () => (
  <RectangleSkeleton
    height="24"
    width="140"
    backgroundColor={LoaderStyle.backgroundColor}
    foregroundColor={LoaderStyle.foregroundColor}
    backgroundOpacity={LoaderStyle.backgroundOpacity}
    foregroundOpacity={LoaderStyle.foregroundOpacity}
    speed={speed}
    animate={true}
  />
);

export default SettingsHeaderLoader;
