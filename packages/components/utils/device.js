import { checkIsSSR } from "@docspace/common/utils";
import { isMobile as isMobileUtil } from "react-device-detect";

export const size = {
  mobile: 600,
  // table: is between
  desktop: 1024,
  hugeDesktop: 1439,
};

export const mobile = `(max-width: ${size.mobile}px)`;

export const mobileMore = `(min-width: ${size.mobile}px)`;

export const tablet = `(max-width: ${size.desktop - 1}px)`;

export const desktop = `(min-width: ${size.desktop}px)`;

export const hugeDesktop = `(max-width: ${size.hugeDesktop}px)`;

export const isMobile = () => {
  return window.innerWidth <= size.mobile;
};

export const isTablet = (width = undefined) => {
  const checkWidth = width || window.innerWidth;
  return checkWidth > size.mobile && checkWidth <= size.desktop - 1;
};

export const isDesktop = () => {
  if (!checkIsSSR()) {
    return window.innerWidth >= size.desktop;
  } else return false;
};

export const isTouchDevice = !!(
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  ("ontouchstart" in window || navigator.msMaxTouchPoints > 0)
);

export const getModalType = () => {
  return window.innerWidth < size.desktop ? "aside" : "modal";
};
