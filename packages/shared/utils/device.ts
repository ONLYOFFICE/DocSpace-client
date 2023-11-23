import { INFO_PANEL_WIDTH } from "../constants";
import { checkIsSSR } from "./index";

export const size = {
  mobile: 600,
  // table: is between
  desktop: 1024,
};

export const mobile = `(max-width: ${size.mobile}px)`;

export const mobileMore = `(min-width: ${size.mobile}px)`;

export const tablet = `(max-width: ${size.desktop - 0.1}px)`;

export const desktop = `(min-width: ${size.desktop}px)`;

export const transitionalScreenSize = `(max-width: ${
  size.desktop + INFO_PANEL_WIDTH
}px)`;

export const isMobile = () => {
  return window.innerWidth <= size.mobile;
};

export const isTablet = (width = undefined) => {
  const checkWidth = width || window.innerWidth;
  return checkWidth > size.mobile && checkWidth < size.desktop;
};

export const isDesktop = () => {
  if (!checkIsSSR()) {
    return window.innerWidth >= size.desktop;
  } else return false;
};

export const isTouchDevice = !!(
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0)
);
