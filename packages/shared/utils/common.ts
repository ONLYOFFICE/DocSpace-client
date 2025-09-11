// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import type { Location } from "react-router";
import find from "lodash/find";
import moment from "moment-timezone";
import { findWindows } from "windows-iana";
import { isMobile } from "react-device-detect";
import { I18nextProviderProps } from "react-i18next";
import sjcl from "sjcl";
import resizeImage from "resize-image";

import LoginPageSvgUrl from "PUBLIC_DIR/images/logo/loginpage.svg?url";
import DarkLoginPageSvgUrl from "PUBLIC_DIR/images/logo/dark_loginpage.svg?url";
import LeftMenuSvgUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import DocseditorSvgUrl from "PUBLIC_DIR/images/logo/docseditor.svg?url";
import LightSmallSvgUrl from "PUBLIC_DIR/images/logo/lightsmall.svg?url";
import DocsEditoRembedSvgUrl from "PUBLIC_DIR/images/logo/docseditorembed.svg?url";
import DarkLightSmallSvgUrl from "PUBLIC_DIR/images/logo/dark_lightsmall.svg?url";
import FaviconIco from "PUBLIC_DIR/images/logo/favicon.ico";
import SpreadsheetEditorSvgUrl from "PUBLIC_DIR/images/logo/spreadsheeteditor.svg?url";
import SpreadsheetEditorEmbedSvgUrl from "PUBLIC_DIR/images/logo/spreadsheeteditorembed.svg?url";
import PresentationEditorSvgUrl from "PUBLIC_DIR/images/logo/presentationeditor.svg?url";
import PresentationEditorEmbedSvgUrl from "PUBLIC_DIR/images/logo/presentationeditorembed.svg?url";
import PDFEditorSvgUrl from "PUBLIC_DIR/images/logo/pdfeditor.svg?url";
import PDFEditorEmbedSvgUrl from "PUBLIC_DIR/images/logo/pdfeditorembed.svg?url";
import DiagramEditorSvgUrl from "PUBLIC_DIR/images/logo/diagrameditor.svg?url";
import DiagramEditorEmbedSvgUrl from "PUBLIC_DIR/images/logo/diagrameditorembed.svg?url";

import BackgroundPatternReactSvgUrl from "PUBLIC_DIR/images/background.pattern.react.svg?url";
import BackgroundPatternOrangeReactSvgUrl from "PUBLIC_DIR/images/background.pattern.orange.react.svg?url";
import BackgroundPatternGreenReactSvgUrl from "PUBLIC_DIR/images/background.pattern.green.react.svg?url";
import BackgroundPatternRedReactSvgUrl from "PUBLIC_DIR/images/background.pattern.red.react.svg?url";
import BackgroundPatternPurpleReactSvgUrl from "PUBLIC_DIR/images/background.pattern.purple.react.svg?url";
import BackgroundPatternLightBlueReactSvgUrl from "PUBLIC_DIR/images/background.pattern.lightBlue.react.svg?url";
import BackgroundPatternBlackReactSvgUrl from "PUBLIC_DIR/images/background.pattern.black.react.svg?url";

import { AvatarRole } from "../components/avatar/Avatar.enums";

import { flagsIcons } from "./image-flags";

import { parseAddress } from "./email";

import {
  FolderType,
  RoomsType,
  ThemeKeys,
  ErrorKeys,
  WhiteLabelLogoType,
  EmployeeType,
  UrlActionType,
} from "../enums";
import {
  CategoryType,
  COOKIE_EXPIRATION_YEAR,
  LANGUAGE,
  PUBLIC_MEDIA_VIEW_URL,
  RTL_LANGUAGES,
  TIMEZONE,
} from "../constants";

import { TI18n, TTranslation, ValueOf } from "../types";
import { TUser } from "../api/people/types";
import { TFolder, TFile, TGetFolder } from "../api/files/types";
import { TRoom } from "../api/rooms/types";
import {
  TDomainValidator,
  TPasswordHash,
  TTimeZone,
} from "../api/settings/types";
import TopLoaderService from "../components/top-loading-indicator";

import { Encoder } from "./encoder";
import { combineUrl } from "./combineUrl";
import { getCookie, setCookie } from "./cookie";
import { checkIsSSR } from "./device";
import { hasOwnProperty } from "./object";
import { TFrameConfig } from "../types/Frame";
import { isFile, isFolder } from "./typeGuards";

export const desktopConstants = Object.freeze({
  domain: !checkIsSSR() && window.location.origin,
  provider: "onlyoffice",
  cryptoEngineId: "{FFF0E1EB-13DB-4678-B67D-FF0A41DBBCEF}",
});

let timer: null | ReturnType<typeof setTimeout> = null;
type I18n = I18nextProviderProps["i18n"];

export function changeLanguage(i18n: TI18n, currentLng = getCookie(LANGUAGE)) {
  return currentLng
    ? i18n.language !== currentLng
      ? i18n.changeLanguage(currentLng)
      : Promise.resolve((...args: string[]) => i18n.t(...args))
    : i18n.changeLanguage("en");
}

export function createPasswordHash(
  password: string,
  hashSettings?: TPasswordHash,
) {
  if (
    !password ||
    !hashSettings ||
    typeof password !== "string" ||
    typeof hashSettings !== "object" ||
    !hasOwnProperty(hashSettings, "salt") ||
    !hasOwnProperty(hashSettings, "size") ||
    !hasOwnProperty(hashSettings, "iterations") ||
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

export const isPublicRoom = () => {
  return (
    window.location.pathname === "/rooms/share" ||
    window.location.pathname.includes(PUBLIC_MEDIA_VIEW_URL)
  );
};

export const isPublicPreview = () => {
  return window.location.pathname.includes("/share/preview/");
};

export const parseDomain = (
  domain: string,
  setError: (error: string[] | null) => void,
  t: (key: string) => string,
) => {
  const parsedDomain = parseAddress(`test@${domain}`);

  if (parsedDomain?.parseErrors && parsedDomain?.parseErrors.length > 0) {
    const translatedErrors = parsedDomain.parseErrors.map((error) => {
      switch (error.errorKey) {
        case ErrorKeys.LocalDomain:
          return t("Common:LocalDomain");
        case ErrorKeys.IncorrectDomain:
        case ErrorKeys.IncorrectEmail:
          return t("Common:IncorrectDomain");
        case ErrorKeys.DomainIpAddress:
          return t("Common:DomainIpAddress");
        case ErrorKeys.PunycodeDomain:
          return t("Common:PunycodeDomain");
        case ErrorKeys.PunycodeLocalPart:
          return t("Common:PunycodeLocalPart");
        case ErrorKeys.IncorrectLocalPart:
          return t("Common:IncorrectLocalPart");
        case ErrorKeys.SpacesInLocalPart:
          return t("Common:SpacesInLocalPart");
        case ErrorKeys.MaxLengthExceeded:
          return t("Common:MaxLengthExceeded");
        default:
          return t("Common:IncorrectDomain");
      }
    });

    setError(translatedErrors);
  }

  return parsedDomain.isValid();
};

export const validatePortalName = (
  value: string,
  nameValidator: TDomainValidator,
  setError: (error: string | null) => void,
  t: TTranslation,
) => {
  const validName = new RegExp(nameValidator.regex);
  switch (true) {
    case value === "":
      return setError(t("Common:PortalNameEmpty"));
    case value.length < nameValidator.minLength ||
      value.length > nameValidator.maxLength:
      return setError(
        t("Common:PortalNameLength", {
          minLength: nameValidator.minLength.toString(),
          maxLength: nameValidator.maxLength.toString(),
        }),
      );
    case !validName.test(value):
      return setError(t("Common:PortalNameIncorrect"));

    default:
      setError(null);
  }
  return validName.test(value);
};

export const getShowText = () => {
  const showArticle = localStorage.getItem("showArticle");

  if (showArticle) {
    return JSON.parse(showArticle) === "true";
  }

  return false;
};

export const isManagement = () => {
  return window.location.pathname.includes("management");
};

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
  TopLoaderService.cancel();
  // timer = setTimeout(() => {
  TopLoaderService.start();
  // }, 500);
}

export function showProgress() {
  if (isMobile) return;
  TopLoaderService.cancel();
  TopLoaderService.start();
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

export const getUserAvatarRoleByType = (type: EmployeeType) => {
  switch (type) {
    case EmployeeType.Owner:
      return AvatarRole.owner;
    case EmployeeType.Admin:
      return AvatarRole.admin;
    case EmployeeType.RoomAdmin:
      return AvatarRole.manager;

    default:
      return AvatarRole.user;
  }
};

export const getUserType = (user: TUser) => {
  if (user.isOwner) return EmployeeType.Owner;
  if (isAdmin(user)) return EmployeeType.Admin;
  if (user.isRoomAdmin) return EmployeeType.RoomAdmin;
  if (user.isCollaborator) return EmployeeType.User;
  if (user.isVisitor) return EmployeeType.Guest;
  return EmployeeType.Guest;
};

export const getUserTypeTranslation = (type: EmployeeType, t: TTranslation) => {
  switch (type) {
    case EmployeeType.Owner:
      return t("Common:Owner");
    case EmployeeType.Admin:
      return t("Common:PortalAdmin", {
        productName: t("Common:ProductName"),
      });
    case EmployeeType.RoomAdmin:
      return t("Common:RoomAdmin");
    case EmployeeType.User:
      return t("Common:User");
    case EmployeeType.Guest:
    default:
      return t("Common:Guest");
  }
};

export function clickBackdrop() {
  const elms = document.getElementsByClassName(
    "backdrop-active",
  ) as HTMLCollectionOf<HTMLDivElement>;

  if (elms && elms.length > 0) {
    elms[0].click();
  }
}

export function objectToGetParams(obj: object) {
  const params = Object.entries(obj)
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
export function getProviderLabel(provider: string, t: (key: string) => string) {
  switch (provider) {
    case "apple":
      return t("Common:ProviderApple");
    case "google":
      return t("Common:ProviderGoogle");
    case "facebook":
      return t("Common:ProviderFacebook");
    case "twitter":
      return t("Common:ProviderTwitter");
    case "linkedin":
      return t("Common:ProviderLinkedIn");
    case "microsoft":
      return t("Common:ProviderMicrosoft");
    case "sso":
      return t("Common:SSO");
    case "zoom":
      return t("Common:ProviderZoom");
    case "sso-full":
      return t("Common:ProviderSsoSetting");
    default:
      return "";
  }
}

export const getLifetimePeriodTranslation = (
  period: number,
  t: TTranslation,
) => {
  switch (period) {
    case 0:
      return t("Common:Days").toLowerCase();
    case 1:
      return t("Common:Months").toLowerCase();
    case 2:
      return t("Common:Years").toLowerCase();

    default:
      return t("Common:Days").toLowerCase();
  }
};

export const isLanguageRtl = (lng: string) => {
  if (!lng) return;

  const splittedLng = lng.split("-");
  return RTL_LANGUAGES.includes(splittedLng[0]);
};

export const getDirectionByLanguage = (lng: string) => {
  return isLanguageRtl(lng) ? "rtl" : "ltr";
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
      return key;
  }
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
  objParam: Record<string, unknown>,
  keyPath: string[],
  value: unknown,
) {
  let obj: Record<string, unknown> = objParam;
  const lastKeyIndex = keyPath.length - 1;
  for (let i = 0; i < lastKeyIndex; ++i) {
    const key = keyPath[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key] as Record<string, unknown>;
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
    window.ClientConfig?.proxy?.url,
    `/login.ashx?p=${token}&code=${code}`,
  );
}

const FRAME_NAME = "frameDocSpace";

const getFrameId = () => {
  return window.self.name.replace(`${FRAME_NAME}__#`, "");
};

export const frameCallbackData = (methodReturnData: unknown) => {
  window.parent.postMessage(
    JSON.stringify({
      type: "onMethodReturn",
      frameId: getFrameId(),
      methodReturnData,
    }),
    "*",
  );
};

export const frameCallEvent = (eventReturnData: unknown) => {
  window.parent.postMessage(
    JSON.stringify({
      type: "onEventReturn",
      frameId: getFrameId(),
      eventReturnData,
    }),
    "*",
  );
};

export const frameCallCommand = (
  commandName: string,
  commandData?: unknown,
) => {
  window.parent.postMessage(
    JSON.stringify({
      type: "onCallCommand",
      frameId: getFrameId(),
      commandName,
      commandData,
    }),
    "*",
  );
};

// Done in a similar way to server code
// https://github.com/ONLYOFFICE/DocSpace-server/blob/master/common/ASC.Common/Utils/CommonFileSizeComment.cs
export const getPowerFromBytes = (bytes: number, maxPower = 6) => {
  const power = Math.floor(Math.log(bytes) / Math.log(1024));
  return power <= maxPower ? power : maxPower;
};

export const getSizeFromBytes = (bytes: number, power: number) => {
  const size = bytes / 1024 ** power;
  const truncateToTwo = Math.trunc(size * 100) / 100;

  return truncateToTwo;
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
    power = getPowerFromBytes(bytes, sizeNames.length - 1);
    resultSize = getSizeFromBytes(bytes, power);
  }

  return `${resultSize} ${sizeNames[power]}`;
};

//

export const getConvertedQuota = (
  t: (key: string) => string,
  bytes: number,
) => {
  if (bytes === -1) return t("Common:Unlimited");
  return getConvertedSize(t, bytes);
};

export const getSpaceQuotaAsText = (
  t: (key: string) => string,
  usedSpace: number,
  quotaLimit: number,
  isDefaultQuotaSet: boolean,
) => {
  const usedValue = getConvertedQuota(t, usedSpace);

  if (!isDefaultQuotaSet) return usedValue;

  if (!quotaLimit) return usedValue;

  const quotaValue = getConvertedQuota(t, quotaLimit);

  return `${usedValue} / ${quotaValue}`;
};

export const conversionToBytes = (size: number, power: number) => {
  const value = Math.ceil(size * 1024 ** power);

  return value.toString();
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

export const getFileExtension = (fileTitleParam: string) => {
  let fileTitle = fileTitleParam;
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
      const updatedBy = item.updatedBy;
      if (
        updatedBy &&
        "displayName" in updatedBy &&
        updatedBy.displayName &&
        typeof updatedBy.displayName === "string"
      )
        updatedBy.displayName = Encoder.htmlDecode(updatedBy.displayName);
    }

    if ("createdBy" in item) {
      const createdBy = item.createdBy;
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
  filterObject: object,
  certainClass: { prototype: object },
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

    // added for double employeetype or room type
    if (Array.isArray(item) && (key === "employeetypes" || key === "type")) {
      for (let i = 0; i < item.length; i += 1) {
        str += `${key}=${encodeURIComponent(item[i])}`;
        if (i !== item.length - 1) {
          str += "&";
        }
      }
    } else if (typeof item === "object") {
      str += `${key}=${encodeURIComponent(JSON.stringify(item))}`;
    } else if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      str += `${key}=${encodeURIComponent(item)}`;
    }
  });

  return str;
};

const groupParamsByKey = (params: URLSearchParams) =>
  Array.from(params.entries()).reduce(
    (accumulator: { [key: string]: string | string[] }, [key, value]) => {
      if (accumulator[key]) {
        accumulator[key] = Array.isArray(accumulator[key])
          ? [...accumulator[key], value]
          : [accumulator[key], value];
      } else {
        accumulator[key] = value;
      }
      return accumulator;
    },
    {},
  );

export const parseURL = (searchUrl: string) => {
  const params = new URLSearchParams(searchUrl);
  const entries: { [key: string]: string | string[] } =
    groupParamsByKey(params);
  return entries;
};

export function getObjectByLocation(location: Location) {
  if (!location.search || !location.search.length) return null;

  try {
    const searchUrl = location.search.substring(1);
    const params = parseURL(searchUrl);
    return params;
  } catch (e) {
    console.error(e);
    return {};
  }
}

export function tryParse(str: string) {
  try {
    if (!str) return undefined;

    return JSON.parse(str);
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function tryParseArray(str: string) {
  try {
    const res = tryParse(str);

    if (!Array.isArray(res)) return undefined;

    return res;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export const RoomsTypeValues = Object.values(RoomsType).filter(
  (item): item is number => typeof item === "number",
);

export const RoomsTypes = RoomsTypeValues.reduce<Record<number, number>>(
  (acc, current) => {
    if (typeof current === "string") return { ...acc };
    return { ...acc, [current]: current };
  },
  {},
);

export const getSystemTheme = () => {
  if (typeof window !== "undefined") {
    const isDesktopClient = window?.AscDesktopEditor !== undefined;
    const desktopClientTheme = window?.RendererProcessVariable?.theme;
    const isDark = desktopClientTheme?.type === "dark";

    return isDesktopClient
      ? isDark
        ? ThemeKeys.DarkStr
        : ThemeKeys.BaseStr
      : window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ? ThemeKeys.DarkStr
        : ThemeKeys.BaseStr;
  }

  return ThemeKeys.BaseStr;
};

export const getEditorTheme = (theme?: ThemeKeys) => {
  const systemTheme =
    getSystemTheme() === ThemeKeys.DarkStr ? "theme-night" : "theme-white";

  switch (theme) {
    case ThemeKeys.BaseStr:
      return "theme-white";
    case ThemeKeys.DarkStr:
      return "theme-night";
    case ThemeKeys.SystemStr:
      return "theme-system";
    default:
      return systemTheme;
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
    case "spreadsheeteditor.svg":
      return SpreadsheetEditorSvgUrl;
    case "spreadsheeteditorembed.svg":
      return SpreadsheetEditorEmbedSvgUrl;
    case "presentationeditor.svg":
      return PresentationEditorSvgUrl;
    case "presentationeditorembed.svg":
      return PresentationEditorEmbedSvgUrl;
    case "pdfeditor.svg":
      return PDFEditorSvgUrl;
    case "pdfeditorembed.svg":
      return PDFEditorEmbedSvgUrl;
    case "diagrameditor.svg":
      return DiagramEditorSvgUrl;
    case "diagrameditorembed.svg":
      return DiagramEditorEmbedSvgUrl;
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
    [FolderType.Done]: "folderComplete.svg",
    [FolderType.InProgress]: "folderInProgress.svg",
    [FolderType.DEFAULT]: defaultPath,
  };

  return folderIconPath[folderType ?? FolderType.DEFAULT] ?? defaultPath;
};

export const insertTagManager = (id: string) => {
  const script = document.createElement("script");
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${id}');`;

  const noScript = document.createElement("noscript");
  noScript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

  document.head.insertBefore(script, document.head.childNodes[0]);
  document.body.insertBefore(noScript, document.body.childNodes[0]);
};

export const insertDataLayer = (id: string) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ user_id: id });
};

export const mapCulturesToArray = (
  culturesArg: string[],
  isBetaBadge: boolean = true,
  i18nArg?: I18n,
) => {
  let t = null;

  if (i18nArg) {
    t = i18nArg.getFixedT(null, "Common");
  }

  return culturesArg.map((culture, index) => {
    let iconName = culture;

    switch (culture) {
      case "sr-Cyrl-RS":
      case "sr-Latn-RS":
        iconName = "sr";
        break;
      default:
        break;
    }

    const icon = flagsIcons?.get(`${iconName}.react.svg`);

    const cultureObj = t
      ? {
          key: culture,
          label: t(`Culture_${culture}`),
          icon,
          ...(isBetaBadge && { isBeta: isBetaLanguage(culture) }),
          index,
        }
      : {
          key: culture,
          icon,
          index,
        };

    return cultureObj;
  });
};

export const mapTimezonesToArray = (
  timezones: TTimeZone[],
): {
  key: string | number;
  label: string;
}[] => {
  return timezones.map((timezone) => {
    return { key: timezone.id, label: timezone.displayName };
  });
};

export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

export const getSelectZone = (
  zones: {
    key: string | number;
    label: string;
  }[],
  userTimezone: string,
) => {
  const defaultTimezone = "UTC";
  const isWindowsZones = zones[0].key === "Dateline Standard Time"; // TODO: get from server

  if (isWindowsZones) {
    const windowsZoneKey = findWindows(userTimezone);
    return (
      zones.filter((zone) => zone.key === windowsZoneKey[0]) ||
      zones.filter((zone) => zone.key === defaultTimezone)
    );
  }
  return (
    zones.filter((zone) => zone.key === userTimezone) ||
    zones.filter((zone) => zone.key === defaultTimezone)
  );
};

export function getLogoUrl(
  logoType: WhiteLabelLogoType,
  dark: boolean = false,
  def: boolean = false,
  culture?: string,
) {
  return `/logo.ashx?logotype=${logoType}&dark=${dark}&default=${def}${culture ? `&culture=${culture}` : ""}`;
}

export const getUserTypeName = (
  isOwner: boolean,
  isPortalAdmin: boolean,
  isRoomAdmin: boolean,
  isCollaborator: boolean,
  t: TTranslation,
) => {
  if (isOwner) return t("Common:Owner");

  if (isPortalAdmin)
    return t("Common:PortalAdmin", { productName: t("Common:ProductName") });

  if (isRoomAdmin) return t("Common:RoomAdmin");

  if (isCollaborator) return t("Common:User");

  return t("Common:Guest");
};

export const getUserTypeDescription = (
  isPortalAdmin: boolean,
  isRoomAdmin: boolean,
  isCollaborator: boolean,
  t: TTranslation,
) => {
  if (isPortalAdmin)
    return t("Common:RolePortalAdminDescription", {
      productName: t("Common:ProductName"),
      sectionName: t("Common:MyDocuments"),
    });

  if (isRoomAdmin)
    return t("Common:RoleRoomAdminDescription", {
      sectionName: t("Common:MyDocuments"),
    });

  if (isCollaborator) return t("Common:RoleNewUserDescription");

  return t("Translations:RoleGuestDescriprion");
};

export function setLanguageForUnauthorized(
  culture: string,
  isReload: boolean = true,
) {
  setCookie(LANGUAGE, culture, {
    "max-age": COOKIE_EXPIRATION_YEAR,
  });

  if (!window) return;

  const url = new URL(window.location.href);
  const prevCulture = url.searchParams.get("culture");

  if (prevCulture) {
    const newUrl = window.location.href.replace(`&culture=${prevCulture}`, ``);

    window.history.pushState({}, "", newUrl);
  }

  if (isReload) window.location.reload();
}

export function setTimezoneForUnauthorized(timezone: string) {
  setCookie(TIMEZONE, timezone, {
    "max-age": COOKIE_EXPIRATION_YEAR,
  });
}

export const imageProcessing = async (file: File, maxSize?: number) => {
  const ONE_MEGABYTE = 1024 * 1024;
  const COMPRESSION_RATIO = 2;
  const NO_COMPRESSION_RATIO = 1;

  const maxImageSize = maxSize ?? ONE_MEGABYTE;
  const imageBitMap = await createImageBitmap(file);

  const { width } = imageBitMap;
  const { height } = imageBitMap;

  const canvas = resizeImage.resize2Canvas(imageBitMap, width, height);

  async function resizeRecursiveAsync(
    img: { width: number; height: number },
    compressionRatio = COMPRESSION_RATIO,
    depth = 0,
  ): Promise<unknown> {
    const data = resizeImage.resize(
      canvas,
      img.width / compressionRatio,
      img.height / compressionRatio,
      resizeImage.JPEG,
    );

    const newFile = await fetch(data)
      .then((res) => res.blob())
      .then((blob) => {
        const f = new File([blob], "File name", {
          type: "image/jpg",
        });
        return f;
      });

    // const stepMessage = `Step ${depth + 1}`;
    // const sizeMessage = `size = ${file.size} bytes`;
    // const compressionRatioMessage = `compressionRatio = ${compressionRatio}`;

    // console.log(`${stepMessage} ${sizeMessage} ${compressionRatioMessage}`);

    if (newFile.size < maxImageSize) {
      return newFile;
    }

    if (depth > 5) {
      // console.log("start");
      throw new Error("recursion depth exceeded");
    }

    return new Promise((resolve) => {
      return resolve(newFile);
    }).then(() => resizeRecursiveAsync(img, compressionRatio + 1, depth + 1));
  }

  return resizeRecursiveAsync(
    { width, height },
    file.size > maxImageSize ? COMPRESSION_RATIO : NO_COMPRESSION_RATIO,
  );
};

export const getBackupProgressInfo = (
  opt: {
    progress: number;
    isCompleted?: boolean;
    link?: string;
    error?: string;
  },
  t: TTranslation,
  setBackupProgress: (progress: number) => void,
  setLink: (link: string) => void,
) => {
  const { isCompleted, link, error, progress } = opt;

  if (progress !== 100) {
    setBackupProgress(progress);
  }

  if (isCompleted) {
    setBackupProgress(100);

    if (error) {
      return { error };
    }

    if (link && link.slice(0, 1) === "/") {
      setLink(link);
    }

    return { success: t("Common:BackupCreatedSuccess") };
  }
};

type OpenUrlParams = {
  url: string;
  action: UrlActionType;
  replace?: boolean;
  isFrame?: boolean;
  frameConfig?: TFrameConfig | null;
};

export const openUrl = ({
  url,
  action,
  replace,
  isFrame,
  frameConfig,
}: OpenUrlParams) => {
  if (action === UrlActionType.Download) {
    return isFrame &&
      frameConfig?.downloadToEvent &&
      frameConfig?.events?.onDownload
      ? frameCallEvent({ event: "onDownload", data: url })
      : replace
        ? (window.location.href = url)
        : window.open(url, "_self");
  }
};

export const getSdkScriptUrl = (version: string) => {
  return typeof window !== "undefined"
    ? `${window.location.origin}/static/scripts/sdk/${version}/api.js`
    : "";
};

export const calculateTotalPrice = (
  quantity: number,
  unitPrice: number,
): number => {
  return Number((quantity * unitPrice).toFixed(2));
};

export const truncateNumberToFraction = (
  value: number,
  digits: number = 2,
): string => {
  const [intPart, fracPart = ""] = value.toString().split(".");
  const truncated = fracPart.slice(0, digits).padEnd(digits, "0");
  return `${intPart}.${truncated}`;
};

export const formatCurrencyValue = (
  language: string,
  amount: number,
  currency: string,
  fractionDigits: number = 3,
) => {
  const truncatedStr = truncateNumberToFraction(amount, fractionDigits);
  const truncated = Number(truncatedStr);

  const formatter = new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(truncated);
};

export const insertEditorPreloadFrame = (docServiceUrl: string) => {
  if (
    !docServiceUrl ||
    typeof window === "undefined" ||
    document.getElementById("editor-preload-frame")
  ) {
    return;
  }

  const iframe = document.createElement("iframe");

  iframe.id = "editor-preload-frame";
  iframe.style.cssText =
    "position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none;visibility:hidden";
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");

  const cleanup = () => iframe.remove();
  const setupCleanup = () => setTimeout(cleanup, 3000);

  iframe.addEventListener("load", setupCleanup, { once: true });
  iframe.addEventListener("error", cleanup, { once: true });

  const appendIframe = () => {
    document.body.appendChild(iframe);
    iframe.src = docServiceUrl;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", appendIframe, { once: true });
  } else {
    appendIframe();
  }
};

export function buildDataTestId(
  dataTestId: string | undefined,
  suffix: string,
): string | undefined {
  if (!dataTestId) return undefined;
  return `${dataTestId}_${suffix}`;
}

export const getErrorInfo = (
  err: unknown,
  t: TTranslation,
  customText: string | React.ReactNode,
) => {
  let message;

  const knownError = err as {
    response?: { status: number; data: { error: { message: string } } };
    message?: string;
  };

  if (customText) {
    message = customText;
  } else if (typeof err === "string") {
    message = err;
  } else {
    message =
      ("response" in knownError && knownError.response?.data?.error?.message) ||
      ("message" in knownError && knownError.message) ||
      "";
  }

  if (knownError?.response?.status === 502)
    message = t("Common:UnexpectedError");

  return message ?? t("Common:UnexpectedError");
};

export const getCategoryType = (location: { pathname: string }) => {
  let categoryType: ValueOf<typeof CategoryType> = CategoryType.Shared;
  const { pathname } = location;

  if (pathname.startsWith("/rooms")) {
    if (pathname.indexOf("personal") > -1) {
      categoryType = CategoryType.Personal;
    } else if (pathname.indexOf("shared") > -1) {
      const regexp = /(rooms)\/shared\/([\d])/;

      categoryType = !regexp.test(location.pathname)
        ? CategoryType.Shared
        : CategoryType.SharedRoom;
    } else if (pathname.indexOf("share") > -1) {
      categoryType = CategoryType.PublicRoom;
    } else if (pathname.indexOf("archive") > -1) {
      categoryType = CategoryType.Archive;
    }
  } else if (pathname.startsWith("/files/favorite")) {
    categoryType = CategoryType.Favorite;
  } else if (pathname.startsWith("/favorite")) {
    categoryType = CategoryType.Favorite;
  } else if (pathname.startsWith("/recent")) {
    categoryType = CategoryType.Recent;
  } else if (pathname.startsWith("/files/trash")) {
    categoryType = CategoryType.Trash;
  } else if (pathname.startsWith("/settings")) {
    categoryType = CategoryType.Settings;
  } else if (pathname.startsWith("/accounts")) {
    categoryType = CategoryType.Accounts;
  } else if (pathname.startsWith("/shared-with-me")) {
    categoryType = CategoryType.SharedWithMe;
  }

  return categoryType;
};
export function splitFileAndFolderIds<T extends TFolder | TFile>(items: T[]) {
  const initial = {
    fileIds: [] as Array<string | number>,
    folderIds: [] as Array<string | number>,
  };

  return (items ?? []).reduce((acc, item) => {
    const id = (item as TFolder | TFile)?.id;
    if (id === undefined || id === null) return acc;

    if (isFolder(item)) acc.folderIds.push(id);
    else if (isFile(item)) acc.fileIds.push(id);

    return acc;
  }, initial);
}
