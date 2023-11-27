import { isMobile, isTablet } from "../../utils/device";

const getCurrentSizeName = () => {
  if (isMobile()) return "mobile";

  if (isTablet()) return "tablet";

  return "desktop";
};

export const getCurrentDisplayType = (
  propsDisplayType: any,
  propsDisplayTypeDetailed: any
) => {
  if (!propsDisplayTypeDetailed) return propsDisplayType;

  const detailedDisplayType = propsDisplayTypeDetailed[getCurrentSizeName()];

  if (detailedDisplayType) return detailedDisplayType;
  return propsDisplayType;
};
