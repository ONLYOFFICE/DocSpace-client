/* eslint-disable no-console */
/* eslint-disable no-multi-str */
/* eslint-disable no-plusplus */

import find from "lodash/find";
import moment from "moment-timezone";
import { isMobile } from "react-device-detect";
import sjcl from "sjcl";

import LoginPageSvgUrl from "PUBLIC_DIR/images/logo/loginpage.svg?url";
import DarkLoginPageSvgUrl from "PUBLIC_DIR/images/logo/dark_loginpage.svg?url";
import LeftMenuSvgUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import DocseditorSvgUrl from "PUBLIC_DIR/images/logo/docseditor.svg?url";
import LightSmallSvgUrl from "PUBLIC_DIR/images/logo/lightsmall.svg?url";
import DocsEditoRembedSvgUrl from "PUBLIC_DIR/images/logo/docseditorembed.svg?url";
import DarkLightSmallSvgUrl from "PUBLIC_DIR/images/logo/dark_lightsmall.svg?url";
import FaviconIco from "PUBLIC_DIR/favicon.ico";

import BackgroundPatternReactSvgUrl from "PUBLIC_DIR/images/background.pattern.react.svg?url";
import BackgroundPatternOrangeReactSvgUrl from "PUBLIC_DIR/images/background.pattern.orange.react.svg?url";
import BackgroundPatternGreenReactSvgUrl from "PUBLIC_DIR/images/background.pattern.green.react.svg?url";
import BackgroundPatternRedReactSvgUrl from "PUBLIC_DIR/images/background.pattern.red.react.svg?url";
import BackgroundPatternPurpleReactSvgUrl from "PUBLIC_DIR/images/background.pattern.purple.react.svg?url";
import BackgroundPatternLightBlueReactSvgUrl from "PUBLIC_DIR/images/background.pattern.lightBlue.react.svg?url";
import BackgroundPatternBlackReactSvgUrl from "PUBLIC_DIR/images/background.pattern.black.react.svg?url";

import { FolderType, RoomsType, ThemeKeys } from "../enums";
import { LANGUAGE, RTL_LANGUAGES } from "../constants";
import { TI18n } from "../types";
import { TUser } from "../api/people/types";
import { TFolder, TFile, TGetFolder } from "../api/files/types";
import { TRoom } from "../api/rooms/types";
import TopLoaderService from "../components/top-loading-indicator";

import { Encoder } from "./encoder";
import { combineUrl } from "./combineUrl";
import { getCookie } from "./cookie";
import { isNumber } from "./typeGuards";

let timer: null | ReturnType<typeof setTimeout> = null;

export function changeLanguage(i18n: TI18n, currentLng = getCookie(LANGUAGE)) {
  return currentLng
    ? i18n.language !== currentLng
      ? i18n.changeLanguage(currentLng)
      : Promise.resolve((...args: string[]) => i18n.t(...args))
    : i18n.changeLanguage("en");
}

export function createPasswordHash(
  password: string,
  hashSettings: { [key: string]: boolean },
) {
  if (
    !password ||
    !hashSettings ||
    typeof password !== "string" ||
    typeof hashSettings !== "object" ||
    !Object.prototype.hasOwnProperty.call(hashSettings, "salt") ||
    !Object.prototype.hasOwnProperty.call(hashSettings, "size") ||
    !Object.prototype.hasOwnProperty.call(hashSettings, "iterations") ||
    typeof hashSettings.size !== "number" ||
    typeof hashSettings.iterations !== "number" ||
    typeof hashSettings.salt !== "string"
  )
    throw new Error("Invalid params.");

  const { size, iterations, salt } = hashSettings;

  let bits = sjcl.misc.pbkdf2(password, salt, iterations);
  bits = bits.slice(0, size / 32);
  const hash = sjcl.codec.hex.fromBits(bits);

  return hash;
}

export function updateTempContent(isAuth = false) {
  if (isAuth) {
    const el = document.getElementById("burger-loader-svg");
    if (el) {
      el.style.display = "block";
    }

    const el1 = document.getElementById("logo-loader-svg");
    if (el1) {
      el1.style.display = "block";
    }

    const el2 = document.getElementById("avatar-loader-svg");
    if (el2) {
      el2.style.display = "block";
    }
  } else {
    const tempElm = document.getElementById("temp-content");
    if (tempElm) {
      tempElm.outerHTML = "";
    }
  }
}

export function hideLoader() {
  if (isMobile) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  TopLoaderService.end();
}

export function showLoader() {
  if (isMobile) return;

  hideLoader();

  timer = setTimeout(() => TopLoaderService.start(), 500);
}

export function isMe(user: TUser, userName: string) {
  return (
    user && user.id && (userName === "@self" || user.userName === userName)
  );
}

export function isAdmin(currentUser: TUser) {
  return (
    currentUser.isAdmin ||
    currentUser.isOwner ||
    (currentUser.listAdminModules && currentUser.listAdminModules?.length > 0)
  );
}

export const getUserRole = (user: TUser) => {
  if (user.isOwner) return "owner";
  if (isAdmin(user))
    // TODO: Change to People Product Id const
    return "admin";
  // TODO: Need refactoring
  if (user.isVisitor) return "user";
  if (user.isCollaborator) return "collaborator";
  return "manager";
};

export function clickBackdrop() {
  const elms = document.getElementsByClassName(
    "backdrop-active",
  ) as HTMLCollectionOf<HTMLDivElement>;

  if (elms && elms.length > 0) {
    elms[0].click();
  }
}

export function objectToGetParams(object: {}) {
  const params = Object.entries(object)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );

  return params.length > 0 ? `?${params.join("&")}` : "";
}

export function toCommunityHostname(hostname: string) {
  let communityHostname;
  try {
    communityHostname =
      hostname.indexOf("m.") > -1
        ? hostname.substring(2, hostname.length)
        : hostname;
  } catch (e) {
    console.error(e);
    communityHostname = hostname;
  }

  return communityHostname;
}

export function getProviderTranslation(
  provider: string,
  t: (key: string) => string,
  linked = false,
  signUp = false,
) {
  const capitalizeProvider =
    provider.charAt(0).toUpperCase() + provider.slice(1);
  if (linked) {
    return `${t("Common:Disconnect")} ${capitalizeProvider}`;
  }

  switch (provider) {
    case "apple":
      return signUp ? t("Common:SignUpWithApple") : t("Common:SignInWithApple");
    case "google":
      return signUp
        ? t("Common:SignUpWithGoogle")
        : t("Common:SignInWithGoogle");
    case "facebook":
      return signUp
        ? t("Common:SignUpWithFacebook")
        : t("Common:SignInWithFacebook");
    case "twitter":
      return signUp
        ? t("Common:SignUpWithTwitter")
        : t("Common:SignInWithTwitter");
    case "linkedin":
      return signUp
        ? t("Common:SignUpWithLinkedIn")
        : t("Common:SignInWithLinkedIn");
    case "microsoft":
      return signUp
        ? t("Common:SignUpWithMicrosoft")
        : t("Common:SignInWithMicrosoft");
    case "sso":
      return signUp ? t("Common:SignUpWithSso") : t("Common:SignInWithSso");
    case "zoom":
      return signUp ? t("Common:SignUpWithZoom") : t("Common:SignInWithZoom");
    default:
      return "";
  }
}

export const isLanguageRtl = (lng: string) => {
  if (!lng) return;

  const splittedLng = lng.split("-");
  return RTL_LANGUAGES.includes(splittedLng[0]);
};

// temporary function needed to replace rtl language in Editor to ltr
export const getLtrLanguageForEditor = (
  userLng: string | undefined,
  portalLng: string,
  isEditor: boolean = false,
): string => {
  let isEditorPath;
  if (typeof window !== "undefined") {
    isEditorPath = window?.location.pathname.indexOf("doceditor") !== -1;
  }
  const isUserLngRtl = isLanguageRtl(userLng || "en");
  // const isPortalLngRtl = isLanguageRtl(portalLng);

  if (userLng === undefined && portalLng) return portalLng;

  if ((!isEditor && !isEditorPath) || (userLng && !isUserLngRtl))
    return userLng || "en";

  return "en";
};

export function loadScript(
  url: string,
  id: string,
  onLoad: (e: Event) => void,
  onError: OnErrorEventHandler,
) {
  try {
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("id", id);

    if (onLoad) script.onload = onLoad;
    if (onError) script.onerror = onError;

    script.src = url;
    script.async = true;

    document.body.appendChild(script);
  } catch (e) {
    console.error(e);
  }
}

export function isRetina() {
  if (window.devicePixelRatio > 1) return true;

  const mediaQuery =
    "(-webkit-min-device-pixel-ratio: 1.5),\
      (min--moz-device-pixel-ratio: 1.5),\
      (-o-min-device-pixel-ratio: 3/2),\
      (min-resolution: 1.5dppx),\
      (min-device-pixel-ratio: 1.5)";

  if (window.matchMedia && window.matchMedia(mediaQuery).matches) return true;
  return false;
}

export function convertLanguage(key: string) {
  switch (key) {
    case "en":
      return "en-GB";
    case "ru-RU":
      return "ru";
    case "de-DE":
      return "de";
    case "it-IT":
      return "it";
    case "fr-FR":
      return "fr";
    default:
      return "en-GB";
  }

  return key;
}

export function convertToCulture(key: string) {
  switch (key) {
    case "ar":
      return "ar-SA";
    case "en":
      return "en-US";
    case "el":
      return "el-GR";
    case "hy":
      return "hy-AM";
    case "ko":
      return "ko-KR";
    case "lo":
      return "lo-LA";
    case "pt":
      return "pt-BR";
    case "uk":
      return "uk-UA";
    case "ja":
      return "ja-JP";
    case "zh":
      return "zh-CN";
    default:
      return "en-US";
  }
  return key;
}

export function convertToLanguage(key: string) {
  if (!key) return;

  const splittedKey = key.split("-");

  if (splittedKey.length > 1) return splittedKey[0];

  return key;
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isElementInViewport(el: HTMLElement) {
  if (!el) return;

  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function assign(
  obj: { [key: string]: {} },
  keyPath: string[],
  value: {},
) {
  const lastKeyIndex = keyPath.length - 1;
  for (let i = 0; i < lastKeyIndex; ++i) {
    const key = keyPath[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

export function getOAuthToken(
  tokenGetterWin: Window | string | null,
): Promise<string> {
  return new Promise((resolve, reject) => {
    localStorage.removeItem("code");
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      try {
        const code = localStorage.getItem("code");
        if (typeof tokenGetterWin !== "string") {
          if (code) {
            localStorage.removeItem("code");
            clearInterval(interval);
            resolve(code);
          } else if (tokenGetterWin && tokenGetterWin.closed) {
            clearInterval(interval);
            reject();
          }
        }
      } catch (e) {
        clearInterval(interval);
        reject(e);
      }
    }, 500);
  });
}

export function getLoginLink(token: string, code: string) {
  return combineUrl(
    window.DocSpaceConfig?.proxy?.url,
    `/login.ashx?p=${token}&code=${code}`,
  );
}

export const frameCallbackData = (methodReturnData: unknown) => {
  window.parent.postMessage(
    JSON.stringify({
      type: "onMethodReturn",
      methodReturnData,
    }),
    "*",
  );
};

export const frameCallEvent = (eventReturnData: unknown) => {
  window.parent.postMessage(
    JSON.stringify({
      type: "onEventReturn",
      eventReturnData,
    }),
    "*",
  );
};

export const frameCallCommand = (commandName: string, commandData: unknown) => {
  window.parent.postMessage(
    JSON.stringify({
      type: "onCallCommand",
      commandName,
      commandData,
    }),
    "*",
  );
};

export const getConvertedSize = (t: (key: string) => string, bytes: number) => {
  let power = 0;
  let resultSize = bytes;

  const sizeNames = [
    t("Common:Bytes"),
    t("Common:Kilobyte"),
    t("Common:Megabyte"),
    t("Common:Gigabyte"),
    t("Common:Terabyte"),
    t("Common:Petabyte"),
    t("Common:Exabyte"),
  ];

  if (bytes <= 0) return `${`0 ${t("Common:Bytes")}`}`;

  if (bytes >= 1024) {
    power = Math.floor(Math.log(bytes) / Math.log(1024));
    power = power < sizeNames.length ? power : sizeNames.length - 1;
    resultSize = parseFloat((bytes / 1024 ** power).toFixed(2));
  }

  return `${resultSize} ${sizeNames[power]}`;
};

export const getBgPattern = (colorSchemeId: number | undefined) => {
  switch (colorSchemeId) {
    case 1:
      return `url('${BackgroundPatternReactSvgUrl}')`;
    case 2:
      return `url('${BackgroundPatternOrangeReactSvgUrl}')`;
    case 3:
      return `url('${BackgroundPatternGreenReactSvgUrl}')`;
    case 4:
      return `url('${BackgroundPatternRedReactSvgUrl}')`;
    case 5:
      return `url('${BackgroundPatternPurpleReactSvgUrl}')`;
    case 6:
      return `url('${BackgroundPatternLightBlueReactSvgUrl}')`;
    case 7:
      return `url('${BackgroundPatternBlackReactSvgUrl}')`;
    default:
      return `url('${BackgroundPatternReactSvgUrl}')`;
  }
};

export const getDaysLeft = (date: Date) => {
  return moment(date).startOf("day").diff(moment().startOf("day"), "days");
};

export const getDaysRemaining = (autoDelete: Date) => {
  const daysRemaining = getDaysLeft(autoDelete);

  if (daysRemaining <= 0) return "<1";
  return `${daysRemaining}`;
};

export const getFileExtension = (fileTitle: string) => {
  if (!fileTitle) {
    return "";
  }
  fileTitle = fileTitle.trim();
  const posExt = fileTitle.lastIndexOf(".");
  return posExt >= 0 ? fileTitle.substring(posExt).trim().toLowerCase() : "";
};

export const sortInDisplayOrder = (folders: TGetFolder[]) => {
  const sorted = [];

  const myFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.USER,
  );
  if (myFolder) sorted.push(myFolder);

  const shareRoom = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.Rooms,
  );
  if (shareRoom) sorted.push(shareRoom);

  const archiveRoom = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.Archive,
  );
  if (archiveRoom) sorted.push(archiveRoom);

  const shareFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.SHARE,
  );
  if (shareFolder) sorted.push(shareFolder);

  const favoritesFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.Favorites,
  );
  if (favoritesFolder) sorted.push(favoritesFolder);

  const recentFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.Recent,
  );
  if (recentFolder) sorted.push(recentFolder);

  const privateFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.Privacy,
  );
  if (privateFolder) sorted.push(privateFolder);

  const commonFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.COMMON,
  );
  if (commonFolder) sorted.push(commonFolder);

  const projectsFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.Projects,
  );
  if (projectsFolder) sorted.push(projectsFolder);

  const trashFolder = find(
    folders,
    (folder) => folder.current.rootFolderType === FolderType.TRASH,
  );
  if (trashFolder) sorted.push(trashFolder);

  return sorted;
};

export const getFolderClassNameByType = (folderType: FolderType) => {
  switch (folderType) {
    case FolderType.USER:
      return "tree-node-my";
    case FolderType.SHARE:
      return "tree-node-share";
    case FolderType.COMMON:
      return "tree-node-common";
    case FolderType.Projects:
      return "tree-node-projects";
    case FolderType.Favorites:
      return "tree-node-favorites";
    case FolderType.Recent:
      return "tree-node-recent";
    case FolderType.Privacy:
      return "tree-node-privacy";
    case FolderType.TRASH:
      return "tree-node-trash";
    default:
      return "";
  }
};

export const decodeDisplayName = <T extends TFile | TFolder | TRoom>(
  items: T[],
) => {
  return items.map((item) => {
    if (!item) return item;

    if ("updatedBy" in item) {
      const updatedBy = item.updatedBy as {};
      if (
        updatedBy &&
        "displayName" in updatedBy &&
        updatedBy.displayName &&
        typeof updatedBy.displayName === "string"
      )
        updatedBy.displayName = Encoder.htmlDecode(updatedBy.displayName);
    }

    if ("createdBy" in item) {
      const createdBy = item.createdBy as {};
      if (
        createdBy &&
        "displayName" in createdBy &&
        createdBy.displayName &&
        typeof createdBy.displayName === "string"
      )
        createdBy.displayName = Encoder.htmlDecode(createdBy.displayName);
    }

    return item;
  });
};

export const checkFilterInstance = (
  filterObject: {},
  certainClass: { prototype: {} },
) => {
  const isInstance =
    filterObject.constructor.name === certainClass.prototype.constructor.name;

  if (!isInstance)
    throw new Error(
      `Filter ${filterObject.constructor.name} isn't an instance of   ${certainClass.prototype.constructor.name}`,
    );

  return isInstance;
};

export const toUrlParams = (
  obj: { [key: string]: unknown },
  skipNull: boolean,
) => {
  let str = "";

  Object.keys(obj).forEach((key) => {
    if (skipNull && !obj[key]) return;

    if (str !== "") {
      str += "&";
    }

    const item = obj[key];

    // added for double employeetype
    if (Array.isArray(item) && key === "employeetypes") {
      for (let i = 0; i < item.length; i += 1) {
        str += `${key}=${encodeURIComponent(item[i])}`;
        if (i !== item.length - 1) {
          str += "&";
        }
      }
    } else if (typeof item === "object") {
      str += `${key}=${encodeURIComponent(JSON.stringify(item))}`;
    } else if (typeof item === "string" || typeof item === "number") {
      str += `${key}=${encodeURIComponent(item)}`;
    }
  });

  return str;
};

export function getObjectByLocation(location: Location) {
  if (!location.search || !location.search.length) return null;

  const searchUrl = location.search.substring(1);
  const decodedString = decodeURIComponent(searchUrl)
    .replace(/\["/g, '["')
    .replace(/"\]/g, '"]')
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
    .replace(/\\/g, "\\\\")
    .replace(/\[\\\\"/g, '["')
    .replace(/\\\\"\]/g, '"]')
    .replace(/"\[/g, "[")
    .replace(/\]"/g, "]")
    .replace(/\\\\",\\\\"/g, '","')
    .replace(/\\\\\\\\"/g, '\\"');

  try {
    const object = JSON.parse(`{"${decodedString}"}`);
    return object;
  } catch (e) {
    return {};
  }
}

export const RoomsTypeValues = Object.values(RoomsType).filter(isNumber);

export const RoomsTypes = RoomsTypeValues.reduce<Record<number, number>>(
  (acc, current) => {
    if (typeof current === "string") return { ...acc };
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

export type FolderTypeValueOf = (typeof FolderType)[keyof typeof FolderType];
export const getIconPathByFolderType = (
  folderType?: FolderTypeValueOf,
): string => {
  const defaultPath = "folder.svg";

  const folderIconPath: Partial<Record<FolderTypeValueOf, string>> = {
    [FolderType.Done]: "done.svg",
    [FolderType.InProgress]: "inProgress.svg",
    [FolderType.DEFAULT]: defaultPath,
  };

  return folderIconPath[folderType ?? FolderType.DEFAULT] ?? defaultPath;
};
