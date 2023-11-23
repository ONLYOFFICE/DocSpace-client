import * as isArrayEqual from "./array";

import * as email from "./email";

import * as useId from "./useId";
import {
  getCorrectTextAlign,
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
} from "./rtlUtils";
import * as useClickOutside from "./useClickOutside";
import * as trimSeparator from "./trimSeparator";
import * as getCorrectDate from "./getCorrectDate";
import { handleAnyClick } from "./event";
import * as DomHelpers from "./domHelpers";
import * as ObjectUtils from "./objectUtils";
import {
  size,
  mobile,
  mobileMore,
  tablet,
  transitionalScreenSize,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
} from "./device";
import { getCookie } from "./cookie";
import { Context, Provider, Consumer } from "./context";
import commonIconsStyles, { IconSizeType } from "./common-icons-style";
import { classNames } from "./classNames";
import { getBannerAttribute } from "./banner";

export {
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

export function checkIsSSR() {
  return typeof window === "undefined";
}

export function getLanguage(lng: string) {
  try {
    if (!lng) return lng;

    let language = lng == "en-US" || lng == "en-GB" ? "en" : lng;

    const splitted = lng.split("-");

    if (splitted.length == 2 && splitted[0] == splitted[1].toLowerCase()) {
      language = splitted[0];
    }

    return language;
  } catch (error) {
    console.error(error);
  }

  return lng;
}

export const getModalType = () => {
  return window.innerWidth < size.desktop ? "aside" : "modal";
};
