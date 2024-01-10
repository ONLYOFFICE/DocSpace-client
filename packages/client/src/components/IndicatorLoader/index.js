import React from "react";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

const IndicatorLoader = () => {
  return (
    <ColorTheme themeId={ThemeId.IndicatorLoader}>
      <div id="ipl-progress-indicator"></div>
    </ColorTheme>
  );
};

export default IndicatorLoader;
