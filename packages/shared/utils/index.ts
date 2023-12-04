import * as isArrayEqual from "./array";

import * as email from "./email";

import useId from "./useId";
import {
  getCorrectTextAlign,
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
} from "./rtlUtils";
import * as useClickOutside from "./useClickOutside";
import { trimSeparator } from "./trimSeparator";
import * as getCorrectDate from "./getCorrectDate";
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
} from "./device";
import { getCookie } from "./cookie";
import { Context, Provider, Consumer } from "./context";
import commonIconsStyles, { IconSizeType } from "./common-icons-style";
import { classNames } from "./classNames";
import { getBannerAttribute, getLanguage } from "./banner";

export {
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
