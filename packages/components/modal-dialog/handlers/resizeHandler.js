import { size } from "../../utils/device";
import { isMobile } from "react-device-detect";

const getCurrentSizeName = () => {
  const innerWidth = window.innerWidth;
  return innerWidth > size.tablet
    ? "desktop"
    : !isMobile && innerWidth <= size.tablet && innerWidth > size.mobile
    ? "tablet"
    : "mobile";
};

export const getCurrentDisplayType = (
  propsDisplayType,
  propsDisplayTypeDetailed
) => {
  if (!propsDisplayTypeDetailed) return propsDisplayType;

  const detailedDisplayType = propsDisplayTypeDetailed[getCurrentSizeName()];

  if (detailedDisplayType) return detailedDisplayType;
  return propsDisplayType;
};
