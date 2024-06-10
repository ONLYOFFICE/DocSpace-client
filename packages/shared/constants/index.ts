// (c) Copyright Ascensio System SIA 2009-2024
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

import ShareAppleReactSvgUrl from "PUBLIC_DIR/images/share.apple.react.svg?url";
import ShareGoogleReactSvgUrl from "PUBLIC_DIR/images/share.google.react.svg?url";
import ShareFacebookReactSvgUrl from "PUBLIC_DIR/images/share.facebook.react.svg?url";
import ShareTwitterReactSvgUrl from "PUBLIC_DIR/images/share.twitter.react.svg?url";
import ShareLinkedinReactSvgUrl from "PUBLIC_DIR/images/share.linkedin.react.svg?url";
import ShareMicrosoftReactSvgUrl from "PUBLIC_DIR/images/share.microsoft.react.svg?url";
import ShareZoomReactSvgUrl from "PUBLIC_DIR/images/share.zoom.react.svg?url";

export const LOADER_STYLE = Object.freeze({
  title: "",
  width: "100%",
  height: "32",
  backgroundColor: "#000000",
  foregroundColor: "#000000",
  backgroundOpacity: 0.1,
  foregroundOpacity: 0.15,
  borderRadius: "3",
  radius: "3",
  speed: 2,
  animate: true,
});

export const DOCSPACE = "DocSpace";
export const MANAGER = "manager";
export const TOTAL_SIZE = "total_size";
export const FILE_SIZE = "file_size";
export const ROOM = "room";
export const USERS = "users";
export const USERS_IN_ROOM = "usersInRoom";
export const PDF_FORM_DIALOG_KEY = "pdf_form_dialog";

export const COUNT_FOR_SHOWING_BAR = 2;
export const PERCENTAGE_FOR_SHOWING_BAR = 90;

export const LANGUAGE = "asc_language";

export const MOBILE_FOOTER_HEIGHT = "64px";

export const COOKIE_EXPIRATION_YEAR = 31536000000;
export const ARTICLE_PINNED_KEY = "asc_article_pinned_key";
export const LIVE_CHAT_LOCAL_STORAGE_KEY = "live_chat_state";
export const MAX_FILE_COMMENT_LENGTH = 255;
export const LINKS_LIMIT_COUNT = 5;
export const LOADER_TIMEOUT = 300;

export const ROOMS_TYPE_TRANSLATIONS = Object.freeze({
  1: "Files:FillingFormRooms",
  2: "Files:CollaborationRooms",
  3: "Common:Review",
  4: "Files:ViewOnlyRooms",
  5: "Files:CustomRooms",
  6: "Files:PublicRoom",
});

export const ROOMS_PROVIDER_TYPE_NAME = Object.freeze({
  1: "Box",
  2: "DropBox",
  3: "Google Drive",
  4: "kDrive",
  5: "OneDrive",
  6: "SharePoint",
  7: "WebDav",
  8: "Yandex",
});

// extends FolderType keys
export const FOLDER_NAMES = Object.freeze({
  0: "default",
  1: "common",
  2: "bunch",
  3: "trash",
  5: "personal",
  6: "share",
  8: "projects",
  10: "favorites",
  11: "recent",
  12: "templates",
  13: "privacy",
  14: "shared",
  20: "archive",
});

export const PROVIDERS_DATA = Object.freeze({
  appleid: {
    label: "apple",
    icon: ShareAppleReactSvgUrl,
    iconOptions: undefined,
  },
  google: {
    label: "google",
    icon: ShareGoogleReactSvgUrl,
    iconOptions: undefined,
  },
  facebook: {
    label: "facebook",
    icon: ShareFacebookReactSvgUrl,
    iconOptions: undefined,
  },
  twitter: {
    label: "twitter",
    icon: ShareTwitterReactSvgUrl,
    iconOptions: { color: "#2AA3EF" },
  },
  linkedin: {
    label: "linkedin",
    icon: ShareLinkedinReactSvgUrl,
    iconOptions: undefined,
  },
  microsoft: {
    label: "microsoft",
    icon: ShareMicrosoftReactSvgUrl,
    iconOptions: undefined,
  },
  zoom: {
    label: "zoom",
    icon: ShareZoomReactSvgUrl,
    iconOptions: undefined,
  },
});

export const PASSWORD_LIMIT_SPECIAL_CHARACTERS = "!@#$%^&*";

export const EDITOR_ID = "docspace_editor";

export const WRONG_PORTAL_NAME_URL =
  (typeof window !== "undefined" &&
    window.DocSpaceConfig?.wrongPortalNameUrl) ||
  `https://www.onlyoffice.com/wrongportalname.aspx`;

export const MEDIA_VIEW_URL = "/media/view/";
export const PUBLIC_MEDIA_VIEW_URL = "/rooms/share/media/view";

export const RTL_LANGUAGES = Object.freeze([
  "ar",
  "arc",
  "dv",
  "fa",
  "ha",
  "he",
  "khw",
  "ks",
  "ku",
  "ps",
  "ur",
  "yi",
]);

export const DEFAULT_FONT_FAMILY = "Open Sans, sans-serif, Arial";

// Contains system fonts used in mac, ios, windows, android and linux
export const SYSTEM_FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Arial, sans-serif, Roboto, Noto Sans Arabic, Geeza Pro, Traditional Arabic, Noto Sans";

export const HTML_EXST = [".htm", ".mht", ".html"];

export const SYSTEM_THEME_KEY = "system_theme";

export const PORTAL = "DocSpace";
export const BRAND_NAME = "ONLYOFFICE";
