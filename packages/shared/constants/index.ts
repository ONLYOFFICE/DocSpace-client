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

export const MANAGER = "manager";
export const TOTAL_SIZE = "total_size";
export const FILE_SIZE = "file_size";
export const ROOM = "room";
export const USERS = "users";
export const USERS_IN_ROOM = "usersInRoom";

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
  },
  google: {
    label: "google",
    icon: ShareGoogleReactSvgUrl,
  },
  facebook: {
    label: "facebook",
    icon: ShareFacebookReactSvgUrl,
  },
  twitter: {
    label: "twitter",
    icon: ShareTwitterReactSvgUrl,
    iconOptions: { color: "#2AA3EF" },
  },
  linkedin: {
    label: "linkedin",
    icon: ShareLinkedinReactSvgUrl,
  },
  microsoft: {
    label: "microsoft",
    icon: ShareMicrosoftReactSvgUrl,
  },
  zoom: {
    label: "zoom",
    icon: ShareZoomReactSvgUrl,
  },
});

export const PASSWORD_LIMIT_SPECIAL_CHARACTERS = "!@#$%^&*";

export const EDITOR_ID = "docspace_editor";

export const WRONG_PORTAL_NAME_URL =
  (typeof window !== "undefined" &&
    window.DocSpaceConfig?.wrongPortalNameUrl) ||
  `https://www.onlyoffice.com/wrongportalname.aspx`;

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
