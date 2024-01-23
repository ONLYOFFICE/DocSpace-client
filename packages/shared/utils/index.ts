import moment from "moment-timezone";

import { isArrayEqual } from "./array";
import * as email from "./email";
import { EmailSettings, parseAddress, parseAddresses } from "./email";
import useId from "./useId";
import {
  getCorrectTextAlign,
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
  TInterfaceDirection,
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
  getSystemTheme,
  getEditorTheme,
  getLogoFromPath,
  isBetaLanguage,
} from "./common";

export type { TInterfaceDirection };

export {
  isBetaLanguage,
  getLogoFromPath,
  getSystemTheme,
  getEditorTheme,
  RoomsTypeValues,
  parseAddresses,
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
};

export const getModalType = () => {
  return window.innerWidth < size.desktop ? "aside" : "modal";
};

export const isValidDate = (date: Date) => {
  return moment(date).tz(window.timezone).year() !== 9999;
};
