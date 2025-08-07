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

import ShareAppleReactSvg from "PUBLIC_DIR/images/share.apple.react.svg";
import ShareGoogleReactSvg from "PUBLIC_DIR/images/share.google.react.svg";
import ShareFacebookReactSvg from "PUBLIC_DIR/images/share.facebook.react.svg";
import ShareTwitterReactSvg from "PUBLIC_DIR/images/thirdparties/twitter.svg";
import ShareLinkedinReactSvg from "PUBLIC_DIR/images/share.linkedin.react.svg";
import ShareMicrosoftReactSvg from "PUBLIC_DIR/images/share.microsoft.react.svg";
import ShareZoomReactSvg from "PUBLIC_DIR/images/share.zoom.react.svg";
import { globalColors } from "../themes/globalColors";
import { FileFillingFormStatus } from "../enums";

export const LOADER_STYLE = Object.freeze({
  title: "",
  width: "100%",
  height: "32",
  backgroundColor: globalColors.darkBlack,
  foregroundColor: globalColors.darkBlack,
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
export const YEAR_KEY = "year";
export const PDF_FORM_DIALOG_KEY = "pdf_form_dialog";
export const CREATED_FORM_KEY = "created_form_key";
export const PUBLIC_STORAGE_KEY = "public-auth";

export const OPEN_BACKUP_CODES_DIALOG = "openBackupCodesDialog";

export const COUNT_FOR_SHOWING_BAR = 2;
export const PERCENTAGE_FOR_SHOWING_BAR = 90;

export const LANGUAGE = "asc_language";
export const TIMEZONE = "timezone";

export const MOBILE_FOOTER_HEIGHT = "64px";
export const ASIDE_PADDING_AFTER_LAST_ITEM = "12px";

export const COOKIE_EXPIRATION_YEAR = 31536000000;
export const ARTICLE_PINNED_KEY = "asc_article_pinned_key";
export const LIVE_CHAT_LOCAL_STORAGE_KEY = "live_chat_state";
export const MAX_FILE_COMMENT_LENGTH = 255;
export const LINKS_LIMIT_COUNT = 5;
export const LOADER_TIMEOUT = 300;

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
    icon: ShareAppleReactSvg,
    iconOptions: undefined,
  },
  google: {
    label: "google",
    icon: ShareGoogleReactSvg,
    iconOptions: undefined,
  },
  facebook: {
    label: "facebook",
    icon: ShareFacebookReactSvg,
    iconOptions: undefined,
  },
  twitter: {
    label: "twitter",
    icon: ShareTwitterReactSvg,
    iconOptions: undefined,
  },
  linkedin: {
    label: "linkedin",
    icon: ShareLinkedinReactSvg,
    iconOptions: undefined,
  },
  microsoft: {
    label: "microsoft",
    icon: ShareMicrosoftReactSvg,
    iconOptions: undefined,
  },
  zoom: {
    label: "zoom",
    icon: ShareZoomReactSvg,
    iconOptions: undefined,
  },
});

export const PASSWORD_LIMIT_SPECIAL_CHARACTERS = "!@#$%^&*";

export const EDITOR_ID = "portal_editor";

export const FILLING_STATUS_ID = "fillingStatusDialog" as const;

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

export const ONE_MEGABYTE = 1024 * 1024;
export const COMPRESSION_RATIO = 2;
export const NO_COMPRESSION_RATIO = 1;

// Contains system fonts used in mac, ios, windows, android and linux
export const SYSTEM_FONT_FAMILY =
  "-apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Arial, sans-serif, Roboto, Noto Sans Arabic, Geeza Pro, Traditional Arabic, Noto Sans";

export const HTML_EXST = [".htm", ".mht", ".html", ".mhtml"];

export const EBOOK_EXST = [".fb2", ".pb2", ".ibk", ".prc", ".epub", ".djvu"];

export const SYSTEM_THEME_KEY = "system_theme";

const SDK_VERSION = "2.1.0";

export const SDK_SCRIPT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/static/scripts/sdk/${SDK_VERSION}/api.js`
    : "";

export const ALLOWED_PASSWORD_CHARACTERS =
  "a-z, A-Z, 0-9, !\"#%&'()*+,-./:;<=>?@[]^_`{|}";

export const GENERAL_LINK_HEADER_KEY = "general-link_header";

export const FILLING_FORM_STATUS_COLORS = Object.freeze({
  [FileFillingFormStatus.None]: globalColors.mainRed,
  [FileFillingFormStatus.Draft]: globalColors.mainRed,
  [FileFillingFormStatus.YourTurn]: globalColors.lightBlueMain,
  [FileFillingFormStatus.InProgress]: globalColors.gray,
  [FileFillingFormStatus.Completed]: globalColors.mainGreen,
  [FileFillingFormStatus.Stopped]: globalColors.mainRed,
});

export const OPERATIONS_NAME = Object.freeze({
  trash: "trash",
  deletePermanently: "deletePermanently",
  download: "download",
  duplicate: "duplicate",
  exportIndex: "exportIndex",
  markAsRead: "markAsRead",
  copy: "copy",
  move: "move",
  convert: "convert",
  other: "other",
  upload: "upload",
  deleteVersionFile: "deleteVersionFile",
  backup: "backup",
});

export const thumbnailStatuses = {
  WAITING: 0,
  CREATED: 1,
  ERROR: 2,
  NOT_REQUIRED: 3,
};

export const STORAGE_TARIFF_DEACTIVATED = "storageTariffDeactivated";
