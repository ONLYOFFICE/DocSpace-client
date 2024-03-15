export const IS_ZOOM =
  typeof window !== "undefined" &&
  (window?.navigator?.userAgent?.includes("ZoomWebKit") ||
    window?.navigator?.userAgent?.includes("ZoomApps"));
export const IS_DESKTOP_EDITOR =
  typeof window !== "undefined"
    ? window["AscDesktopEditor"] !== undefined
    : false;
export const IS_VIEW =
  typeof window !== "undefined"
    ? window.location.search.indexOf("action=view") !== -1
    : false;
