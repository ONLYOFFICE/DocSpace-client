import { checkIsSSR } from "@docspace/common/utils";
import { isMobile as isMobileUtil } from "react-device-detect";

export const size = {
  mobile: 600,
  tablet: 1024,
  desktop: 1025,
  hugeDesktop: 1439,
};

export const mobile = `(max-width: ${size.mobile}px)`;

export const tablet = `(max-width: ${size.tablet}px)`;

export const desktop = `(min-width: ${size.desktop}px)`;

export const hugeDesktop = `(max-width: ${size.hugeDesktop}px)`;

export const isMobile = () => {
  return window.innerWidth <= size.mobile; // isMobileUtil &&
};

export const isTablet = () => {
  return window.innerWidth > size.mobile && window.innerWidth <= size.tablet;
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
