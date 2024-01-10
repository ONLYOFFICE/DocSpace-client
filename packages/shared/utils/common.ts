import { RoomsType, ThemeKeys } from "../enums";

export const RoomsTypeValues = Object.values(RoomsType).reduce(
  (acc, current) => {
    return { ...acc, [current]: current };
  },
  {},
);

export const getSystemTheme = () => {
  const isDesktopClient = window["AscDesktopEditor"] !== undefined;
  const desktopClientTheme = window?.RendererProcessVariable?.theme;
  const isDark =
    desktopClientTheme?.id === "theme-dark" ||
    desktopClientTheme?.id === "theme-contrast-dark" ||
    (desktopClientTheme?.id === "theme-system" &&
      desktopClientTheme?.system === "dark");

  return isDesktopClient
    ? isDark
      ? ThemeKeys.DarkStr
      : ThemeKeys.BaseStr
    : window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ? ThemeKeys.DarkStr
    : ThemeKeys.BaseStr;
};

export const getEditorTheme = (theme: ThemeKeys) => {
  switch (theme) {
    case ThemeKeys.BaseStr:
      return "default-light";
    case ThemeKeys.DarkStr:
      return "default-dark";
    case ThemeKeys.SystemStr: {
      const uiTheme = getSystemTheme();
      return uiTheme === ThemeKeys.DarkStr ? "default-dark" : "default-light";
    }
    default:
      return "default-dark";
  }
};
