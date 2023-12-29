import React from "react";
import { LoaderStyle } from "@docspace/shared/constants";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

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
