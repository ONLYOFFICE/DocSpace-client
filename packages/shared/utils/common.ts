import LoginPageSvgUrl from "PUBLIC_DIR/images/logo/loginpage.svg?url";
import DarkLoginPageSvgUrl from "PUBLIC_DIR/images/logo/dark_loginpage.svg?url";
import LeftMenuSvgUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import DocseditorSvgUrl from "PUBLIC_DIR/images/logo/docseditor.svg?url";
import LightSmallSvgUrl from "PUBLIC_DIR/images/logo/lightsmall.svg?url";
import DocsEditoRembedSvgUrl from "PUBLIC_DIR/images/logo/docseditorembed.svg?url";
import DarkLightSmallSvgUrl from "PUBLIC_DIR/images/logo/dark_lightsmall.svg?url";
import FaviconIco from "PUBLIC_DIR/favicon.ico";

import { RoomsType, ThemeKeys } from "../enums";

export const RoomsTypeValues = Object.values(RoomsType).reduce(
  (acc, current) => {
    return { ...acc, [current]: current };
  },
  {},
);

export const getSystemTheme = () => {
  const isDesktopClient = window.AscDesktopEditor !== undefined;
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

const languages: string[] = ["ar-SA"];
export const isBetaLanguage = (language: string): boolean => {
  return languages.includes(language);
};

export const getLogoFromPath = (path: string) => {
  if (!path || path.indexOf("images/logo/") === -1) return path;

  const name = path.split("/").pop();

  switch (name) {
    case "aboutpage.svg":
    case "loginpage.svg":
      return LoginPageSvgUrl;
    case "dark_loginpage.svg":
      return DarkLoginPageSvgUrl;
    case "leftmenu.svg":
    case "dark_leftmenu.svg":
      return LeftMenuSvgUrl;
    case "dark_aboutpage.svg":
    case "dark_lightsmall.svg":
      return DarkLightSmallSvgUrl;
    case "docseditor.svg":
      return DocseditorSvgUrl;
    case "lightsmall.svg":
      return LightSmallSvgUrl;
    case "docseditorembed.svg":
      return DocsEditoRembedSvgUrl;
    case "favicon.ico":
      return FaviconIco;
    default:
      break;
  }

  return path;
};
