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

"use client";

import moment from "moment-timezone";

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
import commonIconsStyles, { IconSizeType } from "./common-icons-style";
import { classNames } from "./classNames";
import { getBannerAttribute, getLanguage } from "./banner";
import { NoUserSelect } from "./commonStyles";
import { commonInputStyles } from "./commonInputStyles";
import { commonTextStyles } from "./commonTextStyles";
import {
  RoomsTypeValues,
  RoomsTypes,
  getSystemTheme,
  getEditorTheme,
  getLogoFromPath,
  isBetaLanguage,
  getLogoUrl,
} from "./common";
import { DeviceType } from "../enums";
import { TFile } from "../api/files/types";
import { onEdgeScrolling, clearEdgeScrollingTimer } from "./edgeScrolling";

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
  commonTextStyles,
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

export const getLastColumn = (tableStorageName: string) => {
  if (!tableStorageName) return;

  const storageColumns = localStorage.getItem(tableStorageName);
  if (!storageColumns) return;

  const columns = storageColumns.split(",");
  const filterColumns = columns.filter(
    (column) => column !== "false" && column !== "QuickButtons",
  );

  if (filterColumns.length > 0) return filterColumns[filterColumns.length - 1];

  return null;
};

export const getNewPassword = (
  settings: {
    minLength?: number;
    upperCase?: boolean;
    digits?: boolean;
    specSymbols?: boolean;
    digitsRegexStr?: string;
    upperCaseRegexStr?: string;
    specSymbolsRegexStr?: string;
    allowedCharactersRegexStr?: string;
  },
  generatorSpecial: string = "!@#$%^&*",
) => {
  const passwordSettings = settings ?? {
    minLength: 8,
    upperCase: false,
    digits: false,
    specSymbols: false,
    digitsRegexStr: "(?=.*\\d)",
    upperCaseRegexStr: "(?=.*[A-Z])",
    specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
  };

  const length = passwordSettings?.minLength || 0;
  const string = "abcdefghijklmnopqrstuvwxyz";
  const numeric = "0123456789";
  const special = generatorSpecial || "";

  let password = "";
  let character = "";

  while (password.length < length) {
    const a = Math.ceil(string.length * Math.random() * Math.random());
    const b = Math.ceil(numeric.length * Math.random() * Math.random());
    const c = Math.ceil(special.length * Math.random() * Math.random());

    let hold = string.charAt(a);

    if (passwordSettings?.upperCase) {
      hold = password.length % 2 === 0 ? hold.toUpperCase() : hold;
    }

    character += hold;

    if (passwordSettings?.digits) {
      character += numeric.charAt(b);
    }

    if (passwordSettings?.specSymbols) {
      character += special.charAt(c);
    }

    password = character;
  }

  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password.substring(0, length);
};
