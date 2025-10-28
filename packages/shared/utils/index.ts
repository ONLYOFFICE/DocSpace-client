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

"use client";

import moment from "moment-timezone";
import { TTranslation } from "../types";

import { isArrayEqual } from "./array";
import * as email from "./email";
import { EmailSettings, parseAddress, parseAddresses, getParts } from "./email";
import useId from "./useId";
import {
  getCorrectTextAlign,
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
} from "./rtlUtils";
import * as useClickOutside from "./useClickOutside";
import { trimSeparator } from "./trimSeparator";
import getCorrectDate from "./getCorrectDate";
import { handleAnyClick } from "./event";
import { getTextColor } from "./getTextColor";
import { getFormFillingTipsStorageName } from "./getFormFillingTipsStorageName";

import DomHelpers from "./domHelpers";
import ObjectUtils from "./objectUtils";
import {
  size,
  mobile,
  mobileMore,
  tablet,
  desktop,
  transitionalScreenSize,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  checkIsSSR,
  INFO_PANEL_WIDTH,
  isMobileDevice,
} from "./device";
import { getCookie } from "./cookie";
import { Context, Provider, Consumer } from "./context";
import commonIconsStyles, {
  IconSizeType,
  isIconSizeType,
} from "./common-icons-style";
import { classNames } from "./classNames";
import { getBannerAttribute, getLanguage } from "./banner";
import { NoUserSelect } from "./commonStyles";
import { commonInputStyles } from "./commonInputStyles";
import {
  RoomsTypeValues,
  RoomsTypes,
  getSystemTheme,
  getEditorTheme,
  getLogoFromPath,
  isBetaLanguage,
  getLogoUrl,
} from "./common";
import {
  DeviceType,
  FilterType,
  RoomsType,
  FileFillingFormStatus,
  FolderType,
} from "../enums";
import { TFile } from "../api/files/types";
import { onEdgeScrolling, clearEdgeScrollingTimer } from "./edgeScrolling";
import type { TRoom } from "../api/rooms/types";
import { injectDefaultTheme } from "./injectDefaultTheme";
import { getFromSessionStorage } from "./getFromSessionStorage";
import { saveToSessionStorage } from "./saveToSessionStorage";
import { getFromLocalStorage } from "./getFromLocalStorage";
import { fakeFormFillingList } from "./formFillingTourData";
import { getCountTilesInRow } from "./getCountTilesInRow";
import { getSelectFormatTranslation } from "./getSelectFormatTranslation";
import * as userFilterUtils from "./userFilterUtils";
import * as filterConstants from "./filterConstants";
import { getAiProviderIcon, getServerIcon, getAiProviderLabel } from "./ai";

export {
  isBetaLanguage,
  getLogoFromPath,
  getSystemTheme,
  getEditorTheme,
  RoomsTypeValues,
  RoomsTypes,
  parseAddresses,
  getParts,
  NoUserSelect,
  commonInputStyles,
  INFO_PANEL_WIDTH,
  EmailSettings,
  parseAddress,
  desktop,
  checkIsSSR,
  getLanguage,
  isArrayEqual,
  getBannerAttribute,
  classNames,
  commonIconsStyles,
  IconSizeType,
  isIconSizeType,
  Context,
  Provider,
  Consumer,
  getCookie,
  size,
  mobile,
  mobileMore,
  tablet,
  transitionalScreenSize,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  getCorrectTextAlign,
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
  email,
  useId,
  useClickOutside,
  trimSeparator,
  getCorrectDate,
  handleAnyClick,
  DomHelpers,
  ObjectUtils,
  getLogoUrl,
  isMobileDevice,
  onEdgeScrolling,
  clearEdgeScrollingTimer,
  injectDefaultTheme,
  getTextColor,
  getFromSessionStorage,
  saveToSessionStorage,
  getFromLocalStorage,
  getFormFillingTipsStorageName,
  fakeFormFillingList,
  getCountTilesInRow,
  getSelectFormatTranslation,
  userFilterUtils,
  filterConstants,
  getAiProviderIcon,
  getServerIcon,
  getAiProviderLabel,
};

export const getModalType = () => {
  return window.innerWidth < size.desktop ? "aside" : "modal";
};

export const isValidDate = (date: Date) => {
  return moment(date).tz(window.timezone).year() !== 9999;
};

export const presentInArray = (
  array: string[],
  search: string,
  caseInsensitive = false,
) => {
  const pattern = caseInsensitive ? search.toLowerCase() : search;
  const result = array?.findIndex((item) => item === pattern);
  return result !== -1;
};

export const getDeviceTypeByWidth = (width: number): DeviceType => {
  if (width <= size.mobile) return DeviceType.mobile;

  if (isTablet(width)) return DeviceType.tablet;

  return DeviceType.desktop;
};

export const getTitleWithoutExtension = (
  item: TFile,
  fromTemplate: boolean,
) => {
  const titleWithoutExst = item.title.split(".").slice(0, -1).join(".");
  return titleWithoutExst && item.fileExst && !fromTemplate
    ? titleWithoutExst
    : item.title;
};

export const getLastColumn = (
  tableStorageName: string,
  storageColumnsSize?: string,
  isIndexedFolder?: boolean,
) => {
  if (!tableStorageName) return;

  const storageColumns = localStorage.getItem(tableStorageName);
  if (!storageColumns) return;

  const columns = storageColumns.split(",");
  const filterColumns = columns.filter(
    (column) => column !== "false" && column !== "QuickButtons",
  );
  let hideColumnsTable = false;

  if (storageColumnsSize) {
    const enabledColumn = storageColumnsSize
      .split(" ")
      .filter((_, index, array) => {
        if (isIndexedFolder) {
          return index !== 0 && index !== 1 && index !== array.length - 1;
        }
        return index !== 0 && index !== array.length - 1;
      })
      .find((item) => item !== "0px");

    hideColumnsTable = !enabledColumn;
  }

  if (hideColumnsTable) {
    return isIndexedFolder ? filterColumns[1] : filterColumns[0];
  }

  if (filterColumns.length > 0) {
    return filterColumns[filterColumns.length - 1];
  }
  return null;
};

export const isLockedSharedRoom = (item?: TRoom) => {
  if (!item) return false;

  return Boolean(
    item.external && item.passwordProtected && !item.isLinkExpired,
  );
};

export const addLog = (log: string, category: "socket") => {
  if (!window.ClientConfig?.logs?.enableLogs) return;

  if (window.ClientConfig.logs.logsToConsole) console.log(log);
  else {
    if (!window.logs) window.logs = { socket: [] };

    if (!window.logs[category]) window.logs[category] = [];

    window.logs[category].push(log);
  }
};

export const getFillingStatusLabel = (
  status: FileFillingFormStatus | undefined,
  t: TTranslation,
) => {
  switch (status) {
    case FileFillingFormStatus.Draft:
      return t("Common:BadgeMyDraftTitle");
    case FileFillingFormStatus.YourTurn:
      return t("Common:YourTurn");
    case FileFillingFormStatus.InProgress:
      return t("Common:InProgress");
    case FileFillingFormStatus.Stopped:
      return t("Common:Stopped");
    case FileFillingFormStatus.Completed:
      return t("Common:Complete");
    default:
      return "";
  }
};
export const getFillingStatusTitle = (
  status: FileFillingFormStatus | undefined,
  t: TTranslation,
) => {
  switch (status) {
    case FileFillingFormStatus.Draft:
      return t("Common:BadgeDraftTitle");
    case FileFillingFormStatus.YourTurn:
      return t("Common:BadgeYourTurnTitle");
    case FileFillingFormStatus.InProgress:
      return t("Common:BadgeInProgressTitle");
    case FileFillingFormStatus.Stopped:
      return t("Common:BadgeStoppedTitle");
    case FileFillingFormStatus.Completed:
      return t("Common:BadgeCompletedTitle");
    default:
      return "";
  }
};

export const getCheckboxItemId = (key: string | FilterType | RoomsType) => {
  switch (key) {
    case "all":
      return "selected-all";
    case FilterType.FoldersOnly:
      return "selected-only-folders";
    case FilterType.DocumentsOnly:
      return "selected-only-documents";
    case FilterType.PresentationsOnly:
      return "selected-only-presentations";
    case FilterType.SpreadsheetsOnly:
      return "selected-only-spreadsheets";
    case FilterType.DiagramsOnly:
      return "selected-only-diagrams";
    case FilterType.ImagesOnly:
      return "selected-only-images";
    case FilterType.MediaOnly:
      return "selected-only-media";
    case FilterType.ArchiveOnly:
      return "selected-only-archives";
    case FilterType.FilesOnly:
      return "selected-only-files";

    case `room-${RoomsType.CustomRoom}`:
    case `room-${RoomsType.AIRoom}`:
      return "selected-only-custom-room";
    case `room-${RoomsType.EditingRoom}`:
      return "selected-only-collaboration-rooms";

    case `room-${RoomsType.PublicRoom}`:
      return "selected-only-public-rooms";
    case `room-${RoomsType.VirtualDataRoom}`:
      return "selected-only-vdr-rooms";

    default:
      return "";
  }
};

export const getCheckboxItemLabel = (
  t: TTranslation,
  key: FilterType | RoomsType | string,
) => {
  switch (key) {
    case "all":
      return t("Common:All");
    case FilterType.FoldersOnly:
      return t("Common:Folders");
    case FilterType.DocumentsOnly:
      return t("Common:Documents");
    case FilterType.PresentationsOnly:
      return t("Common:Presentations");
    case FilterType.SpreadsheetsOnly:
      return t("Common:Spreadsheets");
    case FilterType.ImagesOnly:
      return t("Common:Images");
    case FilterType.MediaOnly:
      return t("Common:Media");
    case FilterType.ArchiveOnly:
      return t("Common:Archives");
    case FilterType.FilesOnly:
      return t("Common:Files");
    case FilterType.DiagramsOnly:
      return t("Common:Diagrams");

    case `room-${RoomsType.CustomRoom}`:
      return t("Common:CustomRooms");
    case `room-${RoomsType.EditingRoom}`:
      return t("Common:CollaborationRooms");

    case `room-${RoomsType.FormRoom}`:
      return t("Common:FormRoom");

    case `room-${RoomsType.AIRoom}`:
      return "AI Room";

    case `room-${RoomsType.PublicRoom}`:
      return t("Common:PublicRoomLabel");
    case `room-${RoomsType.VirtualDataRoom}`:
      return t("Common:VirtualDataRoom");

    default:
      return "";
  }
};

export const isSystemFolder = (folderType: FolderType) => {
  return (
    folderType === FolderType.InProgress ||
    folderType === FolderType.Done ||
    folderType === FolderType.SubFolderDone ||
    folderType === FolderType.SubFolderInProgress
  );
};
