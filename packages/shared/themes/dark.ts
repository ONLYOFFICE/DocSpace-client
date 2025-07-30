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

import AvatarDarkReactSvgUrl from "PUBLIC_DIR/images/avatar.dark.react.svg?url";

import { globalColors } from "./globalColors";
import { CommonTheme } from "./commonTheme";

import { TTheme } from "./base";
import { DEFAULT_FONT_FAMILY } from "../constants";

const {
  white,
  black,
  darkBlack,
  blueRomb,

  grayLight,
  darkGrayLight,
  lightGrayHover,
  lightDarkGrayHover,
  grayLightMid,
  grayDarkMid,
  lightGraySelected,
  grayStrong,
  grayDarkStrong,
  gray,
  grayDark,
  lightGrayDark,
  darkGrayDark,
  grayText,
  grayDarkText,
  lightBlueMain,
  lightBlueMainHover,
  lightBlueMainDisabled,
  lightBlueMainPressed,
  lightSecondMain,
  lightSecondMainHover,
  lightSecondMainDisabled,

  mainOrange,
  mainRed,

  darkErrorStatus,
  favoritesStatus,
  favoriteStatusDark,
  lightStatusWarning,
  darkStatusWarning,
  darkStatusPositive,

  darkIcon,
  link,
  darkLink,
  blueLightMid,
  bigGrayDarkMid,

  darkToastDone,
  darkToastInfo,
  darkToastAlert,
  darkToastWarning,

  dndColor,
  dndDarkColor,
  dndHoverColor,
  dndDarkHover,

  onWhiteColor,
  boxShadowDarkColor,
  loaderDark,

  editorGreenColor,
  editorBlueColor,
  editorOrangeColor,
  editorRedColor,
  windowsColor,
  linuxColor,
  androidColor,
  badgeShadow,
  popupShadow,
  menuShadow,
  darkScroll,
  darkScrollHover,
  darkScrollActive,

  blurDark,
  darkGreyAction,
  darkActive,
  darkGreyHover,
} = globalColors;

const Dark: TTheme = {
  ...CommonTheme,
  isBase: false,
  color: white,
  backgroundColor: black,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: "13px",

  text: {
    color: white,
    disableColor: grayDarkText,
    emailColor: gray,
    fontWeight: "normal",
    fontWeightBold: "bold",
    secondary: {
      color: grayDark,
    },
  },

  heading: {
    fontSize: {
      xlarge: "27px",
      large: "23px",
      medium: "21px",
      small: "19px",
      xsmall: "15px",
    },

    fontWeight: 600,
    color: white,
  },

  backgroundAndSubstrateColor: darkGrayLight,

  betaBadgeTooltip: {
    boxShadowColor: badgeShadow,
  },

  button: {
    fontWeight: "600",
    margin: "0",
    display: "inline-block",
    textAlign: "center",
    textDecoration: "none",

    topVerticalAlign: "text-top",
    middleVerticalAlign: "middle",
    bottomVerticalAlign: "text-bottom",

    borderRadius: "3px",
    stroke: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    outline: "none",
    boxSizing: "border-box",

    paddingRight: "4px",

    height: {
      extraSmall: "24px",
      small: "32px",
      normal: "40px",
      medium: "44px",
    },

    lineHeight: {
      extraSmall: "15px",
      small: "20px",
      normal: "16px",
      medium: "22px",
    },

    fontSize: {
      extraSmall: "12px",
      small: "13px",
      normal: "14px",
      medium: "16px",
    },

    padding: {
      extraSmall: "0 12px",
      small: "0 28px",
      normal: "0 28px",
      medium: "0 32px",
    },

    color: {
      base: white,
      baseHover: white,
      baseActive: white,
      baseDisabled: grayDarkStrong,

      primary: white,
      primaryHover: white,
      primaryActive: white,
      primaryDisabled: white,
    },

    backgroundColor: {
      base: black,
      baseHover: black,
      baseActive: darkGrayLight,
      baseDisabled: darkGrayLight,

      primary: lightSecondMain,
      primaryHover: lightSecondMainHover,
      primaryActive: `linear-gradient(0deg, ${lightSecondMain}, ${lightSecondMain}),linear-gradient(0deg, ${onWhiteColor}, ${onWhiteColor})`,
      primaryDisabled: lightSecondMainDisabled,
    },

    border: {
      base: `1px solid ${grayDarkStrong}`,
      baseHover: `1px solid ${grayDark}`,
      baseActive: `1px solid ${grayDarkStrong}`,
      baseDisabled: `1px solid ${grayDarkStrong}`,

      primary: `1px solid ${lightSecondMain}`,
      primaryHover: `1px solid ${lightSecondMainHover}`,
      primaryActive: `1px solid linear-gradient(0deg, ${lightSecondMain}, ${lightSecondMain}),linear-gradient(0deg, ${onWhiteColor}, ${onWhiteColor})`,
      primaryDisabled: `1px solid ${lightSecondMainDisabled}`,
    },

    loader: {
      base: white,
      primary: white,
    },
  },

  helpButton: {
    width: "100%",
    backgroundColor: black,
    maxWidth: "500px",
    margin: "0",
    lineHeight: "56px",
    fontWeight: "700",
    padding: "0 16px 16px",
    bodyPadding: "16px 0",
  },

  mainButtonMobile: {
    textColor: darkGrayDark,

    buttonColor: mainOrange,
    iconFill: black,

    circleBackground: white,

    mobileProgressBarBackground: grayDarkStrong,

    bar: {
      icon: grayDark,
    },

    buttonWrapper: {
      background: black,
      uploadingBackground: grayDarkMid,
    },

    buttonOptions: {
      backgroundColor: grayDarkMid,
      color: black,
    },

    dropDown: {
      position: "fixed",
      right: "48px",
      bottom: "48px",

      width: "400px",

      zIndex: "202",

      mobile: {
        right: "32px",
        bottom: "40px",

        marginLeft: "24px",

        width: "calc(100vw - 64px)",
      },

      separatorBackground: white,

      buttonColor: white,

      hoverButtonColor: black,

      backgroundActionMobile: bigGrayDarkMid,
    },

    dropDownItem: {
      padding: "10px",
    },
  },

  mainButton: {
    backgroundColor: lightBlueMain,
    disableBackgroundColor: lightBlueMainDisabled,
    hoverBackgroundColor: lightBlueMainHover,
    clickBackgroundColor: lightBlueMainPressed,

    padding: "5px 14px 5px 12px",
    borderRadius: "3px",
    lineHeight: "22px",
    fontSize: "16px",
    fontWeight: 700,
    textColor: white,
    textColorDisabled: white,

    cornerRoundsTopRight: "0",
    cornerRoundsBottomRight: "0",

    svg: {
      margin: "auto",
      height: "100%",
      fill: white,
    },

    dropDown: {
      top: "100%",
    },

    arrowDropdown: {
      borderLeft: "4px solid transparent",
      borderRight: "4px solid transparent",
      borderTop: `5px solid ${white}`,
      borderTopDisabled: `5px solid ${black}`,
      right: "14px",
      top: "50%",
      width: "0",
      height: "0",
      marginTop: " -1px",
    },
  },

  socialButton: {
    fontWeight: "500",
    textDecoration: "none",
    padding: "0",
    borderRadius: "3px",
    height: "40px",
    heightSmall: "32px",
    textAlign: "left",
    stroke: " none",
    outline: "none",
    width: "100%",

    border: `1px solid ${grayDarkStrong}`,
    background: black,

    borderConnect: "none",
    connectBackground: darkIcon,

    disableBackgroundColor: darkGrayLight,

    hoverBackground: black,
    hoverBorder: `1px solid ${grayDark}`,
    hoverConnectBackground: white,
    hoverConnectBorder: "none",

    activeBackground: darkGrayLight,
    activeBorder: `1px solid ${grayDarkStrong}`,
    activeConnectBackground: bigGrayDarkMid,
    activeConnectBorder: "none",

    color: grayDark,
    disableColor: darkGrayDark,
    disabledSvgColor: grayDarkStrong,

    text: {
      width: "100%",
      height: "18px",
      margin: "0 11px",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "0.21875px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: white,
      hoverColor: white,
      connectColor: darkBlack,
    },

    svg: {
      margin: "11px 8px",
      width: "20px",
      height: "20px",
      minWidth: "20px",
      minHeight: "20px",
      fill: darkBlack,
    },
  },

  groupButton: {
    fontSize: "14px",
    lineHeight: "19px",
    color: grayDark,
    disableColor: grayDarkStrong,
    float: "left",
    height: "19px",
    overflow: "hidden",
    padding: "",

    separator: {
      border: `1px solid ${grayDarkStrong}`,
      width: "0px",
      height: "24px",
      margin: "16px 12px 0 12px",
    },

    checkbox: {
      margin: "16px 0 16px 24px",
      tabletMargin: "auto 0 auto 16px",
    },
  },

  groupButtonsMenu: {
    top: "0",
    background: black,
    boxShadow: `0px 10px 18px -8px ${menuShadow}`,
    height: "48px",
    tabletHeight: "56px",
    padding: "0 18px 19px 0",
    width: "100%",
    zIndex: "189",
    marginTop: "1px",

    closeButton: {
      right: "11px",
      top: "6px",
      tabletTop: "10px",
      width: "20px",
      height: "20px",
      padding: "8px",
      hoverBackgroundColor: white,
      backgroundColor: grayDark,
    },
  },

  iconButton: { color: grayDark, hoverColor: white },
  selectorAddButton: {
    background: grayDarkMid,
    hoverBackground: darkGrayLight,
    activeBackground: grayDarkMid,

    iconColor: grayDark,
    iconColorHover: white,
    iconColorActive: darkGrayDark,

    border: `none`,
    boxSizing: "border-box",
    borderRadius: "3px",
    height: " 32px",
    width: "32px",
    padding: "10px",
    color: grayDark,
    hoverColor: white,
  },

  saveCancelButtons: {
    bottom: "0",
    width: "100%",
    left: "0",
    padding: "8px 24px 8px 16px",
    marginRight: "8px",

    unsavedColor: gray,
  },

  checkbox: {
    fillColor: darkGrayLight,
    borderColor: grayDarkStrong,
    arrowColor: white,
    indeterminateColor: white,

    disableArrowColor: grayDarkStrong,
    disableBorderColor: grayDarkMid,
    disableFillColor: darkGrayLight,
    disableIndeterminateColor: grayDarkStrong,

    hoverBorderColor: grayDark,
    hoverIndeterminateColor: white,

    pressedBorderColor: grayDarkStrong,
    pressedFillColor: black,

    focusColor: grayDark,

    errorColor: darkErrorStatus,
  },

  viewSelector: {
    fillColor: black,
    checkedFillColor: grayDark,
    fillColorDisabled: grayLight,
    disabledFillColor: grayLightMid,
    disabledFillColorInner: grayStrong,
    hoverBorderColor: grayDark,
    borderColor: grayDarkStrong,
  },

  radioButton: {
    textColor: white,
    textDisableColor: grayDarkText,

    marginBeforeLabel: "8px",

    background: black,
    disableBackground: darkGrayLight,

    fillColor: white,
    disableFillColor: grayDarkStrong,

    borderColor: grayDarkStrong,
    disableBorderColor: "none",
    hoverBorderColor: white,
  },

  row: {
    minHeight: "47px",
    width: "100%",
    borderBottom: grayDarkStrong,
    backgroundColor: globalColors.lightDarkGrayHover,
    minWidth: "160px",
    overflow: "hidden",
    textOverflow: "ellipsis",

    element: {
      marginRight: "14px",
      marginLeft: "2px",
    },

    optionButton: {
      padding: "8px 0px 9px 7px",
    },
  },

  rowContent: {
    icons: {
      height: "16px",
    },

    margin: "0 6px",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "600",
    height: "56px",
    maxWidth: " 100%",

    sideInfo: {
      minWidth: "160px",
      margin: "0 6px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    mainWrapper: {
      minWidth: "140px",
      marginRight: "8px",
      marginTop: "8px",
      width: "95%",
    },
  },

  rowContainer: {
    borderColor: grayDarkStrong,
  },

  badge: {
    border: "1px solid transparent",
    padding: "1px",
    lineHeight: "0.8",
    overflow: "hidden",
    color: white,
    backgroundColor: darkStatusWarning,
    disableBackgroundColor: grayDark,
  },

  scrollbar: {
    bgColor: darkScroll,
    hoverBgColor: darkScrollHover,
    pressBgColor: darkScrollActive,
    paddingInlineEnd: "17px !important",
    paddingInlineEndMobile: "8px !important",
  },

  modalDialog: {
    backgroundColor: black,
    textColor: white,
    headerBorderColor: grayDarkStrong,
    footerBorderColor: grayDarkStrong,
    width: "auto",
    maxwidth: "560px",
    margin: " 0 auto",
    minHeight: "100%",

    colorDisabledFileIcons: grayDarkText,

    backdrop: {
      backgroundRGBA: {
        r: 27,
        g: 27,
        b: 27,
        a: 0.6,
      },
      blur: 9,
    },

    content: {
      backgroundColor: black,
      modalBorderRadius: "6px",
      modalPadding: "0 12px 12px",
      asidePadding: "0 16px 16px",

      heading: {
        maxWidth: "calc(100% - 18px)",
        margin: "0",
        fontWeight: "700",
        modalLineHeight: "40px",
        asideLineHeight: "56px",
        asideFontSize: "21px",
        modalFontSize: "18px",
      },
    },

    closeButton: {
      fillColor: darkGrayDark,
    },
  },

  paging: {
    button: {
      marginRight: "8px",
      maxWidth: "110px",
    },

    page: {
      marginRight: "8px",
      width: "110%",
    },

    comboBox: {
      marginLeft: "auto",
      marginRight: "0px",
    },
  },

  input: {
    color: white,
    disableColor: grayDarkText,

    backgroundColor: darkGrayLight,
    disableBackgroundColor: grayDarkStrong,

    width: {
      base: "173px",
      middle: "300px",
      big: "350px",
      huge: "500px",
      large: "550px",
    },

    borderRadius: "3px",
    boxShadow: "none",
    boxSizing: "border-box",
    border: "solid 1px",

    borderColor: grayDarkStrong,
    errorBorderColor: darkErrorStatus,
    warningBorderColor: darkStatusWarning,
    disabledBorderColor: grayDarkStrong,

    hoverBorderColor: grayDark,
    hoverErrorBorderColor: darkErrorStatus,
    hoverWarningBorderColor: darkStatusWarning,
    hoverDisabledBorderColor: grayDarkStrong,

    focusBorderColor: white,
    focusErrorBorderColor: darkErrorStatus,
    focusWarningBorderColor: darkStatusWarning,
    focusDisabledBorderColor: grayDarkStrong,
  },

  fileInput: {
    width: {
      base: "173px",
      middle: "300px",
      big: "350px",
      huge: "500px",
      large: "550px",
    },

    height: {
      base: "32px",
      middle: "38px",
      big: "38px",
      huge: "39px",
      large: "44px",
    },

    paddingRight: {
      base: "37px",
      middle: "48px",
      big: "53px",
      huge: "58px",
      large: "64px",
    },

    icon: {
      background: black,

      border: "1px solid",
      borderRadius: "0 3px 3px 0",

      width: {
        base: "30px",
        middle: "36px",
        big: "37px",
        huge: "38px",
        large: "48px",
      },

      height: {
        base: "30px",
        middle: "36px",
        big: "36px",
        huge: "37px",
        large: "42px",
      },
    },
    iconButton: {
      width: {
        base: "15px",
        middle: "15px",
        big: "16px",
        huge: "16px",
        large: "16px",
      },
    },
  },

  passwordInput: {
    color: grayDark,
    disableColor: grayDark,

    tooltipTextColor: black,

    iconColor: grayDarkStrong,
    hoverIconColor: grayDark,

    hoverColor: gray,

    lineHeight: "32px",

    text: {
      lineHeight: "14px",
      marginTop: "-2px",
    },

    link: {
      marginTop: "-6px",

      tablet: {
        width: "100%",
        marginLeft: "0px",
        marginTop: "-1px",
      },
    },

    progress: {
      borderRadius: "2px",
      marginTop: "-2px",
    },

    newPassword: {
      margin: "0 16px",

      svg: {
        overflow: "hidden",
        marginBottom: "4px",
      },
    },
  },

  searchInput: {
    fontSize: "14px",
    fontWeight: "600",

    iconColor: grayDarkStrong,
    hoverIconColor: grayDark,
  },

  textInput: {
    fontWeight: "normal",
    placeholderColor: grayDark,
    disablePlaceholderColor: grayDarkStrong,

    transition: "all 0.2s ease 0s",
    appearance: "none",
    display: "flex",
    flex: "1 1 0%",
    outline: "none",
    overflow: "hidden",
    opacity: "1",

    lineHeight: {
      base: "20px",
      middle: "20px",
      big: "20px",
      huge: "21px",
      large: "20px",
    },

    fontSize: {
      base: "13px",
      middle: "14px",
      big: "16px",
      huge: "18px",
      large: "16px",
    },

    padding: {
      base: "5px 6px",
      middle: "8px 12px",
      big: "8px 16px",
      huge: "8px 20px",
      large: "11px 12px",
    },
  },

  inputBlock: {
    height: "100%",
    paddingRight: "8px",
    paddingLeft: "1px",

    display: "flex",
    alignItems: "center",
    padding: "2px 0px 2px 2px",
    margin: "0",

    borderColor: white,

    iconColor: grayDark,
    hoverIconColor: white,
  },

  textArea: {
    disabledColor: grayDarkStrong,

    focusBorderColor: white,
    focusErrorBorderColor: darkErrorStatus,
    focusOutline: "none",

    scrollWidth: "100%",
    scrollHeight: "91px",

    numerationColor: grayDark,

    copyIconFilter:
      "invert(62%) sepia(0%) saturate(0%) hue-rotate(119deg) brightness(85%) contrast(87%)",
  },

  link: {
    color: white,
    lineHeight: "calc(100% + 6px)",
    opacity: "0.5",
    textDecoration: "none",
    cursor: "pointer",
    display: "inline-block",

    hover: {
      textDecoration: "underline dashed",
      page: { textDecoration: "underline" },
    },
  },

  linkWithDropdown: {
    paddingRight: "20px",
    semiTransparentOpacity: "0.5",
    textDecoration: "none",
    disableColor: grayDarkText,

    svg: {
      opacity: "1",
      semiTransparentOpacity: "0.5",
    },

    text: { maxWidth: "100%" },

    span: { maxWidth: "300px" },

    expander: {
      iconColor: white,
    },
    color: {
      default: grayDark,
      hover: darkGrayDark,
      active: white,
      focus: white,
    },

    background: {
      default: "transparent",
      hover: grayDarkStrong,
      active: darkGrayLight,
      focus: grayDarkMid,
    },
    caret: {
      width: "5px",
      minWidth: "5px",
      height: "4px",
      minHeight: "4px",
      marginLeft: "5px",
      marginTop: "-4px",
      right: "6px",
      top: "0",
      bottom: "0",
      isOpenBottom: "-1px",
      margin: "auto",
      opacity: "0",
      transform: "scale(1, -1)",
    },
  },

  tooltip: {
    borderRadius: "6px",
    boxShadow: `0px 10px 15px ${popupShadow}`,
    opacity: "1",
    padding: "8px 12px",
    pointerEvents: "auto",
    maxWidth: "340px",
    color: grayDarkMid,
    textColor: white,
    backgroundColor: darkGrayLight,

    before: {
      border: "none",
    },
    after: {
      border: "none",
    },
  },

  fieldContainer: {
    horizontal: {
      margin: "0 0 16px 0",

      label: {
        lineHeight: "32px",
        margin: "0",
      },

      body: {
        flexGrow: "1",
      },

      iconButton: {
        marginTop: "10px",
        marginLeft: "8px",
      },
    },

    vertical: {
      margin: "0 0 16px 0",

      label: {
        lineHeight: "20px",
        height: "20px",
      },

      labelIcon: {
        width: "100%",
        margin: "0 0 4px 0",
      },

      body: {
        width: "100%",
      },

      iconButton: {
        margin: "0",
        padding: "0px 8px",
        width: "12px",
        height: "12px",
      },
    },

    errorLabel: {
      color: darkErrorStatus,
    },
  },

  avatar: {
    defaultImage: `url("${AvatarDarkReactSvgUrl}")`,
    initialsContainer: {
      color: white,
      groupColor: white,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      fontWeight: "600",
      groupFontWeight: "700",

      fontSize: {
        min: "12px",
        small: "12px",
        base: "16px",
        medium: "20px",
        big: "34px",
        groupBig: "23px",
        max: "72px",
      },
    },

    roleWrapperContainer: {
      right: {
        min: "-2px",
        small: "-2px",
        base: "-2px",
        medium: "-4px",
        big: "3px",
        max: "0px",
      },

      bottom: {
        min: "-2px",
        small: "3px",
        base: "4px",
        medium: "6px",
        big: "3px",
        max: "0px",
      },

      width: {
        min: "12px",
        medium: "16px",
        max: "24px",
      },

      height: {
        min: "12px",
        medium: "16px",
        max: "24px",
      },
    },

    imageContainer: {
      backgroundImage: grayDarkStrong,
      background: grayDarkStrong,
      groupBackground: grayDarkMid,
      borderRadius: "50%",
      height: "100%",

      svg: {
        display: "block",
        width: "50%",
        height: "100%",
        margin: "auto",
        fill: grayDark,
      },
    },

    administrator: {
      fill: darkStatusWarning,
      stroke: darkBlack,
      color: white,
    },

    guest: {
      fill: darkIcon,
      stroke: darkBlack,
      color: white,
    },

    owner: {
      fill: favoritesStatus,
      stroke: darkBlack,
      color: white,
    },

    editContainer: {
      right: "0px",
      bottom: "0px",
      fill: black,
      backgroundColor: "rgba(255, 255, 255, 0.64)",
      borderRadius: "50%",
      height: "32px",
      width: "32px",
    },

    image: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
    },

    icon: {
      background: grayDarkMid,
      color: darkGrayDark,
    },

    width: {
      min: "32px",
      small: "36px",
      base: "40px",
      medium: "48px",
      big: "80px",
      max: "124px",
    },

    height: {
      min: "32px",
      small: "36px",
      base: "40px",
      medium: "48px",
      big: "80px",
      max: "124px",
    },
  },

  avatarEditor: {
    minWidth: "208px",
    maxWidth: "300px",
    width: "max-content",
  },

  avatarEditorBody: {
    maxWidth: "400px",

    selectLink: {
      color: grayDarkStrong,
      linkColor: darkLink,
    },

    slider: {
      width: "100%",
      margin: "24px 0",
      backgroundColor: "transparent",

      runnableTrack: {
        background: grayDarkMid,
        focusBackground: grayDarkMid,
        border: `1.4px solid ${grayDarkMid}`,
        borderRadius: "5.6px",
        width: "100%",
        height: "8px",
      },

      sliderThumb: {
        marginTop: "-9.4px",
        width: "24px",
        height: "24px",
        background: white,
        disabledBackground: darkGrayDark,
        borderWidth: "6px",
        borderStyle: "solid",
        borderColor: `${black}`,
        borderRadius: "30px",
        boxShadow: `0px 5px 20px ${popupShadow}`,
      },

      thumb: {
        width: "24px",
        height: "24px",
        background: white,
        border: `6px solid ${black}`,
        borderRadius: "30px",
        marginTop: "0px",
        boxShadow: `0px 5px 20px ${popupShadow}`,
      },

      rangeTrack: {
        background: grayDarkMid,
        border: `1.4px solid ${grayDarkMid}`,
        borderRadius: "5.6px",
        width: "100%",
        height: "8px",
      },

      rangeThumb: {
        width: "14px",
        height: "14px",
        background: white,
        border: `6px solid ${black}`,
        borderRadius: "30px",
        boxShadow: `0px 5px 20px ${popupShadow}`,
      },

      track: {
        background: "transparent",
        borderColor: "transparent",
        borderWidth: "10.2px 0",
        color: "transparent",
        width: "100%",
        height: "8px",
      },

      trackNumber: {
        color: gray,
      },

      fillLower: {
        background: grayDarkMid,
        focusBackground: grayDarkMid,
        border: `1.4px solid ${grayDarkMid}`,
        borderRadius: "11.2px",
      },

      fillUpper: {
        background: grayDarkMid,
        focusBackground: grayDarkMid,
        border: `1.4px solid ${grayDarkMid}`,
        borderRadius: "11.2px",
      },
    },

    container: {
      miniPreview: {
        width: "160px",
        border: `1px solid ${grayDarkMid}`,
        borderRadius: "6px",
        padding: "8px",
      },

      buttons: {
        height: "32px",
        background: black,
        mobileWidth: "40px",
        mobileHeight: "100%",
        mobileBackground: "none",
      },

      button: {
        background: grayDark,
        fill: grayDark,
        hoverFill: white,
        padding: "0 12px",
        height: "40px",
        borderRadius: "6px",
      },

      zoom: {
        height: "56px",

        mobileHeight: "24px",
        marginTop: "16px",
      },
    },
  },

  backdrop: {
    backgroundColor: blurDark,
    unsetBackgroundColor: "unset",
  },

  progressBar: {
    backgroundColor: grayDark,

    animation: {
      background: white,
    },

    percent: {
      background: darkStatusWarning,
    },

    color: {
      error: darkErrorStatus,
      status: white,
    },
  },

  dropDown: {
    fontWeight: "600",
    fontSize: "13px",
    zIndex: "400",
    background: black,
    borderRadius: "6px",
    boxShadow: `0px 8px 16px 0px ${boxShadowDarkColor}`,
    border: `1px solid ${grayDarkStrong}`,
  },

  dropDownItem: {
    color: white,
    disableColor: gray,
    backgroundColor: black,
    hoverBackgroundColor: lightDarkGrayHover,
    hoverDisabledBackgroundColor: black,
    selectedBackgroundColor: darkGrayLight,
    fontWeight: "600",
    fontSize: "13px",
    width: "100%",
    maxWidth: "500px",
    border: "0px",
    margin: "0px",
    padding: "0px 12px",
    tabletPadding: "0px 16px",
    lineHeight: "32px",
    tabletLineHeight: "36px",

    icon: {
      width: "16px",
      marginRight: "8px",
      lineHeight: "10px",

      color: white,
      disableColor: white,
    },

    separator: {
      padding: "0px 16px",
      borderBottom: `1px solid ${grayDarkStrong}`,
      margin: " 4px 16px 4px",
      lineHeight: "1px",
      height: "1px",
      width: "calc(100% - 32px)",
    },
  },

  toast: {
    active: {
      success: black,
      error: black,
      info: black,
      warning: black,
    },
    hover: {
      success: black,
      error: black,
      info: black,
      warning: black,
    },
    border: {
      success: `2px solid ${darkToastDone}`,
      error: `2px solid ${darkToastAlert}`,
      info: `2px solid ${darkToastInfo}`,
      warning: `2px solid ${darkToastWarning}`,
    },

    zIndex: "9999",
    position: "fixed",
    padding: "4px",
    width: "320px",
    color: white,
    top: "16px",
    right: "24px",
    marginTop: "0px",

    closeButton: {
      color: white,
      fontWeight: "700",
      fontSize: "14px",
      background: "transparent",
      padding: "0",
      opacity: "0.7",
      hoverOpacity: "1",
      transition: "0.3s ease",
    },

    main: {
      marginBottom: "1rem",
      boxShadow: `0px 16px 16px ${popupShadow}`,
      maxHeight: "800px",
      overflow: "hidden",
      borderRadius: "6px",
      color: white,
      margin: "0 0 12px",
      padding: "12px",
      minHeight: "32px",
      width: "100%",
      right: "0",
      transition: "0.3s",
    },
  },

  toastr: {
    svg: {
      width: "16px",
      minWidth: "16px",
      height: "16px",
      minHeight: "16px",
      color: {
        success: darkToastDone,
        error: darkToastAlert,
        info: darkToastInfo,
        warning: darkToastWarning,
      },
    },

    text: {
      lineHeight: " 1.3",
      fontSize: "12px",
      color: white,
    },

    title: {
      fontWeight: "600",
      margin: "0",
      marginBottom: "5px",
      lineHeight: "16px",
      color: {
        success: darkToastDone,
        error: darkToastAlert,
        info: darkToastInfo,
        warning: darkToastWarning,
      },
      fontSize: "12px",
    },

    closeButtonColor: white,
  },

  loader: {
    color: loaderDark,
    size: "40px",
    marginRight: "2px",
    borderRadius: "50%",
  },

  dialogLoader: {
    borderBottom: `1px solid ${black}`,
  },

  comboBox: {
    padding: "6px 0px",
    background: black,

    width: {
      base: "173px",
      middle: "300px",
      big: "350px",
      huge: "500px",
    },

    arrow: {
      width: "6px",
      flex: "0 0 6px",
      marginTopWithBorder: "5px",
      marginTop: "12px",
      marginRight: "5px",
      marginLeft: "auto",
    },

    button: {
      height: "18px",
      heightWithBorder: "30px",
      heightModernView: "28px",

      paddingLeft: "8px",
      paddingRightNoArrow: "16px",
      paddingRight: "4px",

      selectPaddingLeft: "8px",
      selectPaddingRightNoArrow: "14px",
      selectPaddingRight: "8px",

      color: grayDark,
      disabledColor: grayDark,
      background: black,
      backgroundWithBorder: "none",
      backgroundModernView: "none",

      border: `1px solid ${grayDarkStrong}`,
      borderRadius: "3px",

      borderColor: grayDarkStrong,
      openBorderColor: white,

      disabledBorderColor: grayDarkStrong,
      disabledBackground: grayDarkStrong,

      hoverBorderColor: grayDark,
      hoverBorderColorOpen: white,
      hoverDisabledBorderColor: grayDarkStrong,

      hoverBackgroundModernView: grayDarkStrong,
      activeBackgroundModernView: darkGrayLight,
      focusBackgroundModernView: grayDarkMid,
    },

    label: {
      marginRightWithBorder: "13px",
      marginRight: "4px",

      disabledColor: grayDark,
      color: grayDark,
      alternativeColor: grayDark,
      selectedColor: white,

      maxWidth: "175px",

      lineHeightWithoutBorder: "16px",
      lineHeightTextDecoration: "underline dashed",
    },

    childrenButton: {
      marginRight: "8px",
      width: "16px",
      height: "16px",

      defaultDisabledColor: grayDark,
      defaultColor: white,
      disabledColor: grayDark,
      color: white,
      selectedColor: white,
    },

    plusBadge: {
      color: black,
      bgColor: grayDark,
      selectedBgColor: darkGrayDark,
    },
  },

  toggleContent: {
    headingHeight: "24px",
    headingLineHeight: "26px",
    hoverBorderBottom: "1px dashed",
    contentPadding: "10px 0px 0px 0px",
    arrowMargin: "4px 8px 4px 0px",
    transform: "rotate(180deg)",
    iconColor: white,

    childrenContent: {
      color: black,
      paddingTop: "6px",
    },
  },

  toggleButton: {
    fillColorDefault: lightBlueMain,
    fillColorOff: grayDarkMid,
    hoverFillColorOff: lightDarkGrayHover,

    fillCircleColor: white,
    fillCircleColorOff: white,
  },

  contextMenuButton: {
    content: {
      width: "100%",
      backgroundColor: black,
      padding: "0 16px 16px",
    },

    headerContent: {
      maxWidth: "500px",
      margin: "0",
      lineHeight: "56px",
      fontWeight: "700",
      borderBottom: `1px solid ${grayDarkStrong}`,
    },

    bodyContent: {
      padding: "16px 0",
    },
  },

  calendar: {
    containerBorderColor: grayDarkStrong,
    color: white,
    disabledColor: grayDarkStrong,
    pastColor: grayDark,
    onHoverBackground: lightDarkGrayHover,
    titleColor: darkGrayDark,
    outlineColor: grayDarkStrong,
    arrowColor: grayDarkText,
    disabledArrow: grayDarkStrong,
    weekdayColor: grayDark,
    accent: lightBlueMain,
    boxShadow: `0px 12px 40px 0px ${popupShadow}`,
  },

  datePicker: {
    width: "115px",
    dropDownPadding: "16px 16px 16px 17px",
    contentPadding: "0 16px 16px",
    bodyPadding: "16px 0",
    backgroundColor: black,
    inputBorder: lightSecondMain,
    iconPadding: "8px 8px 7px 0px",

    contentMaxWidth: "500px",
    contentLineHeight: "56px",
    contentFontWeight: "700",

    borderBottom: `1px solid ${grayDarkStrong}`,
  },

  aside: {
    backgroundColor: black,
    height: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    position: "fixed",
    right: "0",
    top: "0",
    bottom: "16px",
    paddingBottom: "64px",
    transition: "transform 0.3s ease-in-out",
  },

  dragAndDrop: {
    height: "100%",
    transparentBorder: "1px solid transparent",
    acceptBackground: dndDarkHover,
    background: dndDarkColor,
  },

  catalog: {
    background: darkGrayLight,

    header: {
      borderBottom: `1px solid ${grayDarkStrong}`,
      iconFill: darkGrayDark,
    },
    control: {
      fill: white,
    },

    headerBurgerColor: darkGrayDark,

    verticalLine: `1px solid ${grayDarkStrong}`,

    profile: {
      borderTop: `1px solid ${grayDarkStrong}`,
      background: lightDarkGrayHover,
    },

    paymentAlert: {
      color: lightStatusWarning,
      warningColor: darkErrorStatus,
    },
  },

  alertComponent: {
    descriptionColor: darkGrayDark,
    iconColor: darkGrayDark,
  },

  catalogItem: {
    header: {
      color: grayDark,
      background: grayDarkStrong,
    },
    container: {
      width: "100%",
      height: "36px",
      padding: "0 12px",
      background: black,
      marginBottom: "16px",
      tablet: {
        height: "44px",
        padding: "0 12px",
        marginBottom: "24px",
      },
    },
    sibling: {
      active: {
        background: black,
      },
      hover: {
        background: black,
      },
    },
    img: {
      svg: {
        width: "16px",
        height: "16px",

        fill: darkGrayDark,
        isActiveFill: white,
        tablet: {
          width: "20px",
          height: "20px",
        },
      },
    },
    text: {
      width: "100%",
      marginLeft: "8px",
      lineHeight: "20px",
      color: darkGrayDark,
      isActiveColor: white,
      fontSize: "13px",
      fontWeight: 600,
      tablet: {
        marginLeft: "12px",
        lineHeight: "20px",
        fontSize: "14px",
        fontWeight: "600",
      },
    },
    initialText: {
      color: black,
      width: "16px",
      lineHeight: "15px",
      fontSize: "9px",
      fontWeight: "700",
      tablet: {
        width: "20px",
        lineHeight: "19px",
        fontSize: "11px",
      },
    },
    badgeWrapper: {
      size: "16px",
      marginLeft: "8px",
      marginRight: "-2px",
      tablet: {
        width: "44px",
        height: "44px",
        marginRight: "-16px",
      },
    },
    badgeWithoutText: {
      backgroundColor: mainOrange,

      size: "8px",
      position: "-4px",
    },
    trashIconFill: grayDark,
  },

  navigation: {
    expanderColor: white,
    background: black,
    rootFolderTitleColor: darkGrayDark,
    boxShadow: `0px 8px 16px 0px ${boxShadowDarkColor}`,
    lifetimeIconFill: "none",
    lifetimeIconStroke: mainRed,

    icon: {
      fill: darkLink,
      stroke: grayDarkStrong,
    },
  },

  nav: {
    backgroundColor: black,
  },

  navItem: {
    baseColor: darkGrayDark,
    activeColor: white,
    separatorColor: grayDarkStrong,

    wrapper: {
      hoverBackground: grayDarkStrong,
    },
  },

  header: {
    backgroundColor: darkGrayLight,
    recoveryColor: darkGrayDark,
    linkColor: darkGrayDark,
    productColor: white,
    height: "48px",
  },

  menuContainer: {
    background: lightDarkGrayHover,
    color: white,
  },

  article: {
    background: black,
    pinBorderColor: grayDarkStrong,
    catalogItemHeader: grayDark,
    catalogItemText: grayDarkText,
    catalogItemActiveBackground: black,
    catalogShowText: darkGrayDark,
  },

  section: {
    header: {
      backgroundColor: black,
      background: `linear-gradient(180deg, ${black} 2.81%, ${grayText} 63.03%, rgba(51, 51, 51, 0) 100%);`,
      trashErasureLabelBackground: black,
      trashErasureLabelText: darkGrayDark,
    },
  },

  infoPanel: {
    sectionHeaderToggleIcon: grayDark,
    sectionHeaderToggleIconActive: grayStrong,
    sectionHeaderToggleBg: "transparent",
    sectionHeaderToggleBgActive: black,

    backgroundColor: black,
    blurColor: blurDark,
    borderColor: grayDarkStrong,
    thumbnailBorderColor: grayLightMid,
    textColor: white,
    errorColor: darkErrorStatus,

    closeButtonWrapperPadding: "6px",
    closeButtonIcon: black,
    closeButtonSize: "12px",

    nameColor: gray,
    avatarColor: gray,

    links: {
      color: lightBlueMain,
      iconColor: grayDark,
      iconErrorColor: darkErrorStatus,
      primaryColor: darkGrayDark,
      barIconColor: darkGrayDark,
    },

    members: {
      iconColor: grayDark,
      iconHoverColor: white,
      isExpectName: gray,
      subtitleColor: gray,
      meLabelColor: gray,
      roleSelectorColor: gray,
      disabledRoleSelectorColor: gray,
      roleSelectorArrowColor: gray,
      createLink: grayDark,
      linkAccessComboboxExpired: gray,
      crossFill: lightGrayDark,
    },

    history: {
      subtitleColor: gray,
      fileBlockBg: darkGrayLight,
      dateColor: gray,
      fileExstColor: gray,
      locationIconColor: gray,
      folderLabelColor: gray,
      renamedItemColor: gray,
      oldRoleColor: gray,
      messageColor: white,
      itemBorderColor: grayDarkStrong,
      fileBackgroundColor: darkGrayLight,
    },

    details: {
      customLogoBorderColor: grayDarkStrong,
      commentEditorIconColor: white,
      tagBackground: grayDarkMid,
    },

    gallery: {
      borderColor: black,
      descriptionColor: white,
    },

    search: {
      boxShadow: `0px 5px 20px 0px ${popupShadow}`,
    },

    groups: {
      textColor: grayDark,
      tagColor: grayDarkStrong,
    },
    expired: {
      color: darkGrayDark,
    },
  },

  filesArticleBody: {
    background: black,
    panelBackground: grayDarkStrong,

    fill: grayStrong,
    expanderColor: grayStrong,

    downloadAppList: {
      textColor: grayDark,
      color: grayDarkText,
      winHoverColor: windowsColor,
      macHoverColor: white,
      linuxHoverColor: linuxColor,
      androidHoverColor: androidColor,
      iosHoverColor: white,
    },
    devTools: {
      border: `1px solid ${grayDarkStrong}`,
      color: grayDark,
    },
  },

  peopleArticleBody: {
    iconColor: grayStrong,
    expanderColor: grayStrong,
  },

  peopleTableRow: {
    nameColor: white,
    pendingNameColor: grayDark,

    sideInfoColor: grayDark,
    pendingSideInfoColor: grayDarkStrong,
  },

  filterInput: {
    button: {
      border: `1px solid ${grayDarkStrong}`,
      hoverBorder: `1px solid ${grayDark}`,

      openBackground: gray,

      openFill: white,
    },

    filter: {
      background: black,
      border: `1px solid ${grayDarkStrong}`,
      color: gray,

      separatorColor: grayDarkStrong,
      indicatorColor: mainOrange,

      selectedItem: {
        background: white,
        border: white,
        color: black,
      },
    },

    sort: {
      background: black,
      hoverBackground: black,
      selectedViewIcon: lightGraySelected,
      viewIcon: grayDark,
      sortFill: darkGrayDark,

      tileSortFill: white,
      tileSortColor: white,
    },

    selectedItems: {
      background: grayDarkMid,
      hoverBackground: lightDarkGrayHover,
    },
  },

  updateUserForm: {
    tooltipTextColor: black,
    borderTop: "none",
  },

  tableContainer: {
    borderRight: `2px solid ${grayDarkStrong}`,
    hoverBorderColor: grayDarkStrong,
    tableCellBorder: `1px solid ${grayDarkStrong}`,

    indexingSeparator: white,

    groupMenu: {
      background: black,
      borderBottom: `1px solid ${grayDarkStrong}`,
      borderRight: `1px solid ${grayDarkStrong}`,
      boxShadow: `0px 40px 60px ${menuShadow}`,
    },

    header: {
      background: black,
      borderBottom: `1px solid ${grayDarkStrong}`,
      textColor: grayDark,
      activeTextColor: grayDark,
      hoverTextColor: white,

      iconColor: grayDark,
      activeIconColor: grayDark,
      hoverIconColor: white,

      borderImageSource: `linear-gradient(to right,${black} 21px,${grayDarkStrong} 21px,${grayDarkStrong} calc(100% - 20px),${black} calc(100% - 20px))`,
      borderHoverImageSource: `linear-gradient(to right,${black} 0px,${grayDarkStrong} 0px,${grayDarkStrong} 100% ,${black} 100%)`,
      lengthenBorderImageSource: `linear-gradient(to right, ${grayDarkStrong}, ${grayDarkStrong})`,
      hotkeyBorderBottom: `1px solid ${lightSecondMain}`,

      settingsIconDisableColor: grayDarkStrong,
    },

    tableCell: {
      border: `1px solid ${grayDarkStrong}`,
    },
  },
  filesSection: {
    rowView: {
      checkedBackground: lightDarkGrayHover,

      draggingBackground: dndColor,
      draggingHoverBackground: dndHoverColor,

      shareButton: {
        color: grayDark,
        fill: grayDark,
      },

      sideColor: grayDark,
      linkColor: white,
      textColor: grayDark,

      editingIconColor: white,
      shareHoverColor: white,
      pinColor: white,
    },

    tableView: {
      fileName: {
        linkColor: white,
        textColor: grayDark,
      },
      fileExstColor: gray,

      row: {
        checkboxChecked: `linear-gradient(to right, ${black} 24px, ${grayDarkStrong} 24px)`,
        checkboxDragging: `linear-gradient(to right, ${dndDarkColor} 24px, ${grayDarkStrong} 24px)`,
        checkboxDraggingHover: `inear-gradient(to right, ${dndDarkHover} 24px, ${grayDarkStrong} 24px)`,

        contextMenuWrapperChecked: `linear-gradient(to left, ${black} 24px, ${grayDarkStrong} 24px)`,
        contextMenuWrapperDragging: `border-image-source: linear-gradient(to left, ${dndDarkColor} 24px, ${grayDarkStrong} 24px)`,
        contextMenuWrapperDraggingHover: `linear-gradient(to left, ${dndDarkHover} 24px, ${grayDarkStrong} 24px)`,

        backgroundActive: lightDarkGrayHover,

        indexBackgroundButtonHover: darkGreyHover,
        indexUpdate: darkActive,
        indexActive: darkGreyAction,
        indexArrowButtonHover: white,

        borderImageCheckbox: `linear-gradient(to right, ${grayDarkStrong} 24px, ${grayDarkStrong} 24px)`,
        borderImageContextMenu: `linear-gradient(to left, ${grayDarkStrong} 24px, ${grayDarkStrong} 24px)`,

        borderHover: grayDarkStrong,
        sideColor: gray,

        shareHoverColor: white,

        borderImageRight: `linear-gradient(to right, ${black} 25px, ${grayDarkStrong} 24px)`,
        borderImageLeft: `linear-gradient(to left, ${black} 20px, ${grayDarkStrong} 24px)`,

        borderColor: grayDarkStrong,
        borderColorTransition: grayDarkStrong,

        color: white,
        backgroundGroup: grayDarkMid,
      },
    },

    tilesView: {
      tile: {
        draggingColor: dndDarkColor,
        draggingHoverColor: dndDarkHover,
        checkedColor: lightDarkGrayHover,
        roomsCheckedColor: lightDarkGrayHover,
        border: `1px solid ${grayDarkStrong}`,
        backgroundBadgeColor: black,
        backgroundColor: black,
        borderRadius: "6px",
        roomsBorderRadius: "12px",
        bottomBorderRadius: "0 0 6px 6px",
        roomsBottomBorderRadius: "0 0 12px 12px",
        upperBorderRadius: "6px 6px 0 0",
        roomsUpperBorderRadius: "12px 12px 0 0",
        backgroundColorTop: black,
      },

      tag: {
        backgroundColor: black,
        hoverBackgroundColor: grayStrong,
        activeBackgroundColor: grayLight,
      },

      sideColor: white,
      color: white,
      textColor: grayDark,
      subTextColor: "#858585",
    },

    animationColor: lightSecondMain,
  },

  advancedSelector: {
    footerBorder: `1px solid ${grayDarkStrong}`,

    hoverBackgroundColor: grayDarkStrong,
    selectedBackgroundColor: grayDarkStrong,
    borderLeft: `1px solid ${grayDarkStrong}`,

    searcher: {
      hoverBorderColor: grayDark,
      focusBorderColor: white,
      placeholderColor: grayDarkStrong,
    },
  },

  selector: {
    border: `1px solid ${grayDarkStrong}`,

    breadCrumbs: {
      prevItemColor: darkGrayDark,
      arrowRightColor: darkGrayDark,
    },

    info: {
      backgroundColor: darkGrayLight,
      color: darkGrayDark,
    },

    bodyDescriptionText: grayDark,

    item: {
      hoverBackground: lightDarkGrayHover,
      selectedBackground: lightDarkGrayHover,

      inputButtonBorder: grayDarkStrong,
      inputButtonBorderHover: white,

      disableTextColor: grayDark,
    },

    emptyScreen: {
      descriptionColor: darkGrayDark,
      buttonColor: darkGrayDark,
      hoverButtonColor: white,
      pressedButtonColor: grayDarkText,
    },
  },

  floatingButton: {
    backgroundColor: white,
    color: black,
    boxShadow: `0px 12px 24px ${popupShadow}`,
    fill: black,

    alert: {
      fill: mainOrange,
      path: black,
    },
  },

  createEditRoomDialog: {
    commonParam: {
      descriptionColor: gray,
      textColor: grayDark,
    },

    roomType: {
      listItem: {
        background: "none",
        hoverBackground: darkGrayLight,
        borderColor: grayDarkStrong,
        descriptionText: gray,
      },
      dropdownButton: {
        background: "none",
        hoverBackground: darkGrayLight,
        borderColor: grayDarkStrong,
        descriptionText: gray,
      },
      dropdownItem: {
        background: black,
        hoverBackground: darkGrayLight,
        descriptionText: gray,
      },
      displayItem: {
        background: darkGrayLight,
        borderColor: darkGrayLight,
        descriptionText: gray,
      },
    },

    roomTypeDropdown: {
      desktop: {
        background: black,
        borderColor: grayDarkStrong,
      },
      mobile: {
        background: black,
      },
    },

    permanentSettings: {
      background: grayDarkStrong,
      isPrivateIcon: darkStatusPositive,
      descriptionColor: gray,
    },

    dropdown: {
      background: black,
      borderColor: grayDarkStrong,
      item: {
        hoverBackground: darkGrayLight,
      },
    },

    isPrivate: {
      limitations: {
        background: grayDarkStrong,
        iconColor: lightStatusWarning,
        titleColor: lightStatusWarning,
        descriptionColor: gray,
        linkColor: grayDarkText,
      },
    },

    thirdpartyStorage: {
      combobox: {
        background: black,
        dropdownBorderColor: grayDarkStrong,
        hoverDropdownBorderColor: grayDark,
        isOpenDropdownBorderColor: grayDarkText,
        arrowFill: grayDarkStrong,
      },
      folderInput: {
        background: black,
        borderColor: grayDarkStrong,
        hoverBorderColor: grayDark,
        rootLabelColor: gray,
        iconFill: darkGrayDark,
      },
    },

    iconCropper: {
      gridColor: black,
      deleteButton: {
        background: grayDarkMid,
        hoverBackground: grayDarkStrong,
        borderColor: gray,
        hoverBorderColor: lightDarkGrayHover,
        hoverColor: white,
        color: white,
        iconColor: darkGrayDark,
      },
    },

    previewTile: {
      background: black,
      borderColor: grayDarkStrong,
      iconBorderColor: grayLightMid,
    },

    dropzone: {
      borderColor: grayDarkStrong,
      linkMainColor: link,
      linkSecondaryColor: white,
      exstsColor: gray,
    },
    helpButton: {
      background: grayDark,
      fill: white,
    },
  },

  createEditGroupDialog: {
    textColor: grayDark,
    iconFill: grayDark,
  },

  filesThirdPartyDialog: {
    border: `1px solid ${grayDarkStrong}`,
  },

  connectedClouds: {
    color: white,
    borderBottom: `1px solid ${grayDarkStrong}`,
    borderRight: `1px solid ${grayDarkStrong}`,
  },

  filesModalDialog: {
    border: `1px solid ${grayDarkStrong}`,
  },

  filesDragTooltip: {
    background: black,
    boxShadow: `0px 5px 20px ${popupShadow}`,
    color: white,
  },

  emptyContent: {
    header: {
      color: white,
    },

    description: {
      color: darkGrayDark,
    },
    button: {
      colorLink: darkGrayDark,
      colorText: darkGrayDark,
    },
  },

  emptyView: {
    link: {
      color: lightBlueMain,
      background: black,
      hoverBackground: darkGrayLight,
      PressedBackground: grayDarkStrong,
    },
    items: {
      hoverColor: darkGrayLight,
      pressColor: grayDarkStrong,
    },
  },

  filesEmptyContainer: {
    linkColor: darkGrayDark,
    privateRoom: {
      linkColor: darkLink,
    },
    descriptionColor: darkGrayDark,
  },

  filesPanels: {
    color: white,

    aside: {
      backgroundColor: black,
    },

    addGroups: {
      iconColor: gray,
      arrowColor: darkBlack,
    },

    addUsers: {
      iconColor: gray,
      arrowColor: darkBlack,
      textColor: grayDark,
    },

    changeOwner: {
      iconColor: gray,
      arrowColor: darkBlack,
    },

    embedding: {
      textAreaColor: grayDark,
      iconColor: white,
      color: gray,
      border: `1px solid ${grayDarkMid}`,
      linkBackground: blueLightMid,
      linkColor: white,
    },

    versionHistory: {
      borderTop: `1px solid ${grayDarkStrong}`,
    },

    content: {
      backgroundColor: black,
      fill: white,
      disabledFill: grayDarkText,
    },

    body: {
      backgroundColor: black,
      fill: white,
    },

    footer: {
      backgroundColor: black,
      borderTop: `1px solid ${grayDarkStrong}`,
    },

    linkRow: {
      backgroundColor: black,
      fill: white,
      disabledFill: grayDarkText,
    },

    selectFolder: {
      color: gray,
    },

    filesList: {
      color: white,
      backgroundColor: black,
      borderBottom: `1px solid ${grayDarkStrong}`,
    },

    modalRow: {
      backgroundColor: black,
      fill: gray,
      disabledFill: grayDarkText,
    },

    sharing: {
      color: white,

      fill: white,
      loadingFill: white,

      borderBottom: `1px solid ${grayDarkStrong}`,
      borderTop: `1px solid ${grayDarkStrong}`,
      externalLinkBackground: black,
      externalLinkSvg: white,

      internalLinkBorder: `1px dashed ${white}`,

      itemBorder: `1px dashed ${black}`,

      itemOwnerColor: grayDark,

      backgroundButtons: black,

      dropdownColor: white,

      loader: {
        foregroundColor: black,
        backgroundColor: black,
      },
    },

    upload: {
      color: white,
      tooltipColor: darkToastInfo,
      iconColor: darkErrorStatus,
      positiveStatusColor: darkStatusPositive,
      progressColor: grayDark,
      shareButton: {
        color: gray,
        sharedColor: lightGrayDark,
      },

      loadingButton: {
        color: white,
        background: black,
        defaultBackground: grayDark,
        hoverColor: white,
      },
    },
    invite: {
      textColor: grayDark,
      addButtonColor: lightBlueMain,
      border: `1px solid ${grayDarkStrong}`,
    },
  },

  menuItem: {
    iconWrapper: {
      width: "16px",
      height: "16px",
      header: {
        width: "auto",
        height: "auto",
      },
    },
    separator: {
      borderBottom: `1px solid ${grayDarkStrong} !important`,
      margin: "6px 16px 6px 16px !important",
      height: "1px !important",
    },
    text: {
      header: {
        fontSize: "15px",
        lineHeight: "20px",
      },
      mobile: {
        fontSize: "13px",
        lineHeight: "36px",
      },
      fontSize: "12px",
      lineHeight: "30px",
      fontWeight: "600",
      margin: "0 0 0 8px",
      color: white,
    },
    hover: black,
    background: "none",
    svgFill: white,
    header: {
      height: "55px",
      borderBottom: `1px solid ${grayDarkStrong}`,
      marginBottom: "6px",
    },
    height: "30px",
    borderBottom: "none",
    marginBottom: "0",
    padding: "0 12px",
    mobile: {
      height: "36px",
      padding: "6px 16px",
    },
  },
  newContextMenu: {
    background: black,
    borderRadius: "6px",
    mobileBorderRadius: "6px 6px 0 0",
    boxShadow: `0px 8px 16px 0px ${boxShadowDarkColor}`,
    border: `1px solid ${grayDarkStrong}`,
    devices: {
      maxHeight: "calc(100vh - 64px)",
      tabletWidth: "375px",
      mobileWidth: "100vw",
      left: 0,
      right: 0,
      bottom: 0,
      margin: "0 auto",
    },
  },
  filesSettings: {
    color: grayText,

    linkColor: white,
  },

  filesBadges: {
    iconColor: grayDark,
    hoverIconColor: white,

    color: white,
    backgroundColor: black,

    badgeColor: black,
    badgeBackgroundColor: grayDark,
  },

  accountsBadges: {
    pendingColor: grayDark,
    disabledColor: darkErrorStatus,
  },

  filesEditingWrapper: {
    color: white,
    border: `1px solid ${grayDarkStrong}`,
    borderBottom: `1px solid ${grayDarkStrong}`,

    tile: {
      background: globalColors.black,
      itemBackground: grayDarkMid,
      itemBorder: gray,
      itemActiveBorder: white,
    },

    row: {
      itemBackground: globalColors.black,
    },

    fill: grayDark,
    hoverFill: white,
    disabledBackground: white,
  },

  filesIcons: {
    fill: grayDark,
    hoverFill: white,
  },

  filesQuickButtons: {
    color: grayDark,
    sharedColor: white,
    hoverColor: white,
  },

  filesSharedButton: {
    color: grayDark,
    sharedColor: white,
  },

  filesPrivateRoom: {
    borderBottom: `1px solid ${grayDarkMid}`,
    linkColor: darkLink,
    textColor: grayDarkText,
  },

  filesVersionHistory: {
    row: {
      color: white,
      fill: white,
    },

    badge: {
      color: white,
      stroke: grayDark,
      fill: grayDark,
      defaultFill: black,
      badgeFill: mainOrange,
    },

    versionList: {
      fill: white,
      stroke: white,
      color: white,
    },

    versionDisabled: {
      fillDisabled: grayDarkStrong,
    },

    versionLink: {
      color: grayDark,
    },

    commentColor: grayDark,
  },

  login: {
    linkColor: darkLink,
    textColor: grayDark,
    navBackground: darkGrayLight,
    headerColor: white,
    helpButton: grayDark,
    orLineColor: grayDarkStrong,
    orTextColor: grayDark,
    titleColor: white,

    register: {
      backgroundColor: black,
      textColor: darkLink,
    },

    container: {
      backgroundColor: grayDarkStrong,
    },

    captcha: {
      border: `1px solid ${darkErrorStatus}`,
      color: darkErrorStatus,
    },

    backTitle: {
      color: gray,
    },
  },

  peopleSelector: {
    textColor: white,
  },

  peopleWithContent: {
    color: grayDark,
    pendingColor: grayDarkStrong,
  },

  peopleDialogs: {
    modal: {
      border: `1px solid ${grayDarkStrong}`,
    },

    deleteUser: {
      textColor: darkErrorStatus,
    },

    deleteSelf: {
      linkColor: darkLink,
    },

    changePassword: {
      linkColor: darkLink,
    },
  },

  downloadDialog: {
    background: darkGrayLight,
    textColor: grayDark,
    iconFill: black,
    warningColor: darkErrorStatus,
  },

  client: {
    about: {
      linkColor: darkLink,
      border: `1px solid ${grayDarkStrong}`,
      logoColor: white,
    },

    comingSoon: {
      linkColor: grayDark,
      linkIconColor: black,
      backgroundColor: black,
      foregroundColor: black,
    },

    confirm: {
      activateUser: {
        textColor: darkLink,
        textColorError: darkErrorStatus,
      },
      change: {
        titleColor: darkLink,
      },
    },

    home: {
      logoColor: white,
      textColorError: darkErrorStatus,
    },

    payments: {
      linkColor: darkLink,
      delayColor: darkErrorStatus,
    },

    settings: {
      iconFill: white,
      headerTitleColor: white,
      descriptionColor: grayDarkText,
      trashIcon: grayDark,
      article: {
        titleColor: grayStrong,
        fillIcon: grayStrong,
        expanderColor: grayStrong,
      },

      separatorBorder: `1px solid ${grayDarkStrong}`,

      security: {
        arrowFill: white,
        descriptionColor: grayDark,

        tfa: {
          textColor: grayDark,
        },

        admins: {
          backgroundColor: black,
          backgroundColorWrapper: lightSecondMain,
          roleColor: grayStrong,

          color: darkLink,
          departmentColor: grayDark,

          tooltipColor: darkToastInfo,

          nameColor: white,
          pendingNameColor: grayDark,

          textColor: black,
          iconColor: lightSecondMain,
        },

        owner: {
          backgroundColor: black,
          linkColor: darkLink,
          departmentColor: grayDark,
          tooltipColor: darkToastInfo,
        },
        auditTrail: {
          sideColor: grayDark,
          nameColor: white,
          downloadReportDescriptionColor: grayDark,
        },
        loginHistory: {
          sideColor: grayDark,
          nameColor: white,
          textColor: grayDark,
          subheaderColor: darkGrayDark,
        },
        ip: {
          errorColor: darkErrorStatus,
        },
      },

      common: {
        linkColor: grayDark,
        linkColorHelp: darkLink,
        tooltipLinkColor: darkLink,
        arrowColor: white,
        descriptionColor: grayDark,
        brandingDescriptionColor: grayDark,

        appearance: {
          themeAddBackground: grayDarkStrong,
          accentBoxBackground: grayDarkStrong,
          buttonBoxBackground: grayDarkStrong,
          iconFill: grayDark,
          addThemeBackground: grayDarkStrong,
        },

        whiteLabel: {
          borderImg: `1px solid ${grayDarkStrong}`,

          backgroundColorWhite: white,
          backgroundColorLight: grayLight,
          backgroundColorDark: darkGrayLight,
          greenBackgroundColor: editorGreenColor,
          blueBackgroundColor: editorBlueColor,
          orangeBackgroundColor: editorOrangeColor,
          redBackgroundColor: editorRedColor,

          dataFontColor: white,
          dataFontColorBlack: white,
          notAvailableBackground: grayDark,
          textColor: white,
          paidBadgeBackground: favoriteStatusDark,
        },

        companyInfo: {
          border: `1px dashed ${white}`,
          color: grayDark,
        },

        dns: {
          errorColor: darkErrorStatus,
        },
      },

      integration: {
        separatorBorder: `1px solid ${grayDarkStrong}`,
        linkColor: darkLink,
        textColor: grayDark,
        sso: {
          textColor: grayDark,
          errorColor: darkErrorStatus,
          toggleContentBackground: grayDarkStrong,
          iconButton: white,
          iconButtonDisabled: black,
          border: `1px solid ${grayDarkStrong}`,
        },
        ldap: {
          border: `1px solid ${grayDarkStrong}`,
          errorBorder: `1px solid ${darkErrorStatus}`,
          certificateBackground: grayDarkStrong,
          textColor: grayDark,
          errorColor: darkErrorStatus,
        },
        smtp: {
          requirementColor: darkErrorStatus,
        },
      },

      backup: {
        rectangleBackgroundColor: lightDarkGrayHover,
        separatorBorder: `1px solid ${grayDarkStrong}`,
        warningColor: darkErrorStatus,
        textColor: darkGrayDark,
        backupCheckedListItemBackground: lightDarkGrayHover,
      },

      payment: {
        priceColor: darkGrayDark,
        storageSizeTitle: gray,

        backgroundColor: lightDarkGrayHover,
        linkColor: link,
        tariffText: grayDark,
        border: `1px solid ${grayDarkStrong}`,
        backgroundBenefitsColor: black,
        rectangleColor: lightDarkGrayHover,

        priceContainer: {
          backgroundText: lightDarkGrayHover,
          background: darkGrayLight,
          border: `1px solid ${darkGrayLight}`,
          featureTextColor: grayDark,
          disableColor: grayDark,
          trackNumberColor: grayDark,
          disablePriceColor: grayDarkText,
        },

        benefitsContainer: {
          iconsColor: grayDark,
        },
        contactContainer: {
          textColor: darkGrayDark,
          linkColor: grayDark,
        },
        warningColor: darkErrorStatus,
        color: darkStatusWarning,
      },

      migration: {
        descriptionColor: darkGrayDark,
        subtitleColor: white,
        workspaceBackground: black,
        workspaceBorder: `1px solid ${grayDarkStrong}`,
        workspaceHover: lightBlueMain,
        stepDescriptionColor: white,
        fileInputIconColor: grayDarkText,
        infoBlockBackground: darkGrayLight,
        infoBlockTextColor: grayDark,
        errorTextColor: darkErrorStatus,
        existingTextColor: darkStatusPositive,
        tableHeaderText: grayDark,
        tableRowHoverColor: lightDarkGrayHover,
        tableRowTextColor: grayDark,
        comboBoxLabelColor: white,
        importSectionBackground: darkGrayLight,
        importSectionTextColor: grayDark,
        importItemBackground: black,
        importItemDisableBackground: lightDarkGrayHover,
        importItemTextColor: darkGrayDark,
        importItemDisableTextColor: grayDarkText,
        importItemDescription: gray,
        importIconColor: darkGrayDark,
        groupMenuBackground: black,
        groupMenuBorder: `1px solid ${grayDarkStrong}`,
        groupMenuBoxShadow: `${menuShadow} 0px 5px 5px 0px`,
        linkColor: lightBlueMain,
        background: darkGrayLight,
      },
      storageManagement: {
        grayBackgroundText: white,
        descriptionColor: darkGrayDark,
        dividerColor: grayDarkMid,
      },
      deleteData: {
        borderTop: `1px solid ${grayDarkMid}`,
      },
      webhooks: {
        border: `1px solid ${grayDarkMid}`,
        historyRowBackground: lightDarkGrayHover,
        tableCellBackground: lightGrayHover,
        barBackground: lightDarkGrayHover,
        color: grayDark,
        linkColor: lightBlueMain,
        spanBackground: lightBlueMain,
        filterBorder: `1px solid ${grayDarkStrong}`,
        background: darkGrayLight,
      },
    },

    wizard: {
      linkColor: darkLink,
      generatePasswordColor: darkGrayDark,
      textColor: grayDark,
    },
  },

  statusMessage: {
    toastBackground: darkToastWarning,
  },

  tileLoader: {
    border: `none`,

    background: "none",
  },

  errorContainer: {
    background: black,
    bodyText: grayDark,
    linkColor: darkLink,
  },

  editor: {
    color: white,
    background: black,
  },

  tabs: {
    gradientColor: black,
    lineColor: grayDarkStrong,

    textColorPrimary: darkGrayDark,
    activeTextColorPrimary: white,
    hoverTextColorPrimary: white,
    pressedTextColorPrimary: grayDarkText,
    backgroundColorPrimary: black,

    textColorSecondary: white,
    activeTextColorSecondary: black,

    backgroundColorSecondary: black,
    hoverBackgroundColorSecondary: grayDarkStrong,
    pressedBackgroundColorSecondary: darkGrayLight,
    activeBackgroundColorSecondary: white,
  },

  hotkeys: {
    key: {
      color: grayStrong,
    },
  },

  tag: {
    color: white,
    deletedColor: gray,
    background: grayDarkStrong,
    hoverBackground: darkGrayLight,
    disabledBackground: grayDark,
    deletedBackground: darkGrayLight,
    defaultTagColor: white,
    newTagBackground: grayDarkMid,
    newTagHoverBackground: lightDarkGrayHover,
  },

  profile: {
    main: {
      background: lightDarkGrayHover,
      textColor: white,

      descriptionTextColor: grayDark,
      pendingEmailTextColor: grayDark,

      mobileRowBackground: lightDarkGrayHover,

      iconFill: darkGrayDark,
      mobileLabel: grayDark,
    },
    login: {
      textColor: grayDark,
    },
    themePreview: {
      descriptionColor: darkGrayDark,
      border: `1px solid ${grayDarkStrong}`,
    },
    notifications: {
      textDescriptionColor: grayDark,
    },
    activeSessions: {
      color: white,
      borderColor: grayDarkStrong,
      tickIconColor: darkStatusPositive,
      removeIconColor: gray,
      sortHeaderColor: grayDarkStrong,
      tableCellColor: grayDark,
      dividerColor: grayDarkStrong,
    },
  },

  formWrapper: {
    background: black,
    boxShadow: `0px 5px 20px ${badgeShadow}`,
  },

  preparationPortalProgress: {
    backgroundColor: darkGrayLight,
    colorPercentSmall: white,
    colorPercentBig: black,
    errorTextColor: darkErrorStatus,
    descriptionTextColor: grayDark,
  },

  accessRightSelect: {
    descriptionColor: grayDark,
  },

  itemIcon: {
    borderColor: grayDarkStrong,
    editIconColor: grayDarkMid,
  },

  invitePage: {
    borderColor: grayDarkStrong,
    textColor: grayDark,
  },

  portalUnavailable: {
    textDescriptionColor: grayDark,
  },

  deepLink: {
    navBackground: darkGrayLight,
    fileTileBackground: lightDarkGrayHover,
  },

  emailChips: {
    borderColor: grayDark,
    dashedBorder: `1px dashed ${white}`,
  },

  dialogs: {
    disableText: grayDark,
    errorText: darkErrorStatus,
    linkColor: lightBlueMain,
    borderColor: grayDarkMid,
  },

  editLink: {
    text: {
      color: gray,
      errorColor: darkErrorStatus,
    },
    editInputColor: grayDark,
    requiredColor: darkErrorStatus,
  },

  oformGallery: {
    errorView: {
      subHeaderTextColor: darkGrayDark,
    },
    submitToGalleryTile: {
      bodyText: darkGrayDark,
      closeIconFill: darkGrayDark,
    },
  },

  infoBlock: {
    background: darkGrayLight,
    headerColor: white,
    descriptionColor: darkGrayDark,
  },

  infoBar: {
    background: darkGrayLight,
    title: white,
    description: darkGrayDark,
    textColor: white,
    iconFill: darkStatusWarning,
  },

  roomIcon: {
    backgroundArchive: white,
    opacityBackground: "0.1",
    plusIcon: black,
    emptyBorder: `2px dashed ${grayDarkStrong}`,

    linkIcon: {
      background: black,
      path: blueRomb,
    },
  },

  plugins: {
    borderColor: grayDarkStrong,
    pluginName: gray,
    descriptionColor: darkGrayDark,
    color: grayDark,
  },

  oauth: {
    previewDialog: {
      border: `1px solid ${grayDarkMid}`,
    },
    infoDialog: {
      descLinkColor: darkGrayDark,
      blockHeaderColor: grayDark,
      separatorColor: grayDarkStrong,
    },
    list: {
      descriptionColor: grayDark,
    },
    clientForm: {
      descriptionColor: grayDark,
      headerBorder: `1px solid ${grayDarkStrong}`,
      scopeDesc: grayDark,
    },
  },
  sdkPresets: {
    borderColor: grayDarkStrong,
    secondaryColor: darkGrayDark,
    previewBackgroundColor: lightDarkGrayHover,
    linkHelpColor: darkGrayDark,
  },

  sideBarRow: {
    titleColor: white,
    metaDataColor: grayDark,
  },

  dateTimePicker: {
    colorClockIcon: darkGrayDark,
  },

  embeddingPanel: {
    descriptionTextColor: darkGrayDark,
    iconColor: darkGrayDark,
  },
  completedForm: {
    linkColor: white,
    descriptionColor: darkGrayDark,
    labelColor: darkGrayDark,

    box: {
      background: darkGrayLight,
    },
  },

  management: {
    textColor: grayDark,
    errorColor: darkErrorStatus,
    sideColor: grayDark,
    nameColor: grayDarkStrong,
    barBackground: darkGrayLight,
  },

  publicRoom: {
    border: `1px solid ${lightGraySelected}`,
    linkColor: lightBlueMain,
  },
  newFilesPanel: {
    borderColor: globalColors.grayDarkStrong,

    borderRadius: "6px",
    boxShadow: `0px 8px 16px 0px ${boxShadowDarkColor}`,

    fileItem: {
      borderColor: globalColors.grayDarkStrong,
      fileExstColor: globalColors.grayDark,
    },
  },

  logoCover: {
    selectColor: {
      backgroundColor: lightDarkGrayHover,
    },

    iconColor: darkGrayDark,
    textColor: darkGrayDark,
    selectedBackgroundColor: grayDarkMid,
    selectedBorderColor: grayDarkMid,
    backgroundColor: black,
    borderColor: grayDarkStrong,
  },

  formFillingTips: {
    circleColor: grayDarkMid,
    selectedColor: black,
    circleBorder: `3px solid ${lightSecondMain}`,
  },

  socialAuthDialog: {
    accountDetailsBackground: lightDarkGrayHover,
  },
};

export default Dark;
