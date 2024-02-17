import React from "react";
import { LOADER_STYLE } from "@docspace/shared/constants";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const speed = 2;

export const SettingsHeaderSkeleton = () => (
  <RectangleSkeleton
    height="24"
    width="140"
    backgroundColor={LOADER_STYLE.backgroundColor}
    foregroundColor={LOADER_STYLE.foregroundColor}
    backgroundOpacity={LOADER_STYLE.backgroundOpacity}
    foregroundOpacity={LOADER_STYLE.foregroundOpacity}
    speed={speed}
    animate
  />
);
