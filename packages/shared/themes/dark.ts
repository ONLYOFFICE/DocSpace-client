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

import AvatarDarkReactSvgUrl from "PUBLIC_DIR/images/avatar.dark.react.svg?url";

import { globalColors } from "./globalColors";
import { CommonTheme } from "./commonTheme";

import { TTheme } from "./base";
import { DEFAULT_FONT_FAMILY } from "../constants";

const {
  black,
  white,

  grayLight,
  grayLightMid,
  grayMid,
  grayDarkMid,
  graySilver,
  gray,
  grayMain,
  grayDark,
  shuttleGrey,

  blueMain,

  orangePressed,

  warningColor,
  red,

  grayMaxLight,
  cyanBlueDarkShade,

  darkBlack,
  silver,
  strongBlue,

  darkRed,

  darkErrorStatus,
  charlestonGreen,
  outerSpace,

  blurDark,
} = globalColors;

const Dark: TTheme = {
  ...CommonTheme,
  isBase: false,
  color: grayMaxLight,
  backgroundColor: black,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: "13px",

  text: {
    color: grayMaxLight,
    disableColor: "#5c5c5c",
    emailColor: "#a3a9ae",
    fontWeight: "normal",
    fontWeightBold: "bold",
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
    color: grayMaxLight,
  },

  backgroundAndSubstrateColor: "#282828",

  betaBadgeTooltip: {
    boxShadowColor: "rgba(0, 0, 0, 0.40)",
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
      base: "#FFFFFF",
      baseHover: "#FFFFFF",
      baseActive: "#FFFFFF",
      baseDisabled: "#474747",

      primary: "#FFFFFF",
      primaryHover: "#FFFFFF",
      primaryActive: "#FFFFFF",
      primaryDisabled: "#FFFFFF",
    },

    backgroundColor: {
      base: "#333333",
      baseHover: "#333333",
      baseActive: "#282828",
      baseDisabled: "#282828",

      primary: "#5299E0",
      primaryHover: "#4D8AC7",
      primaryActive: "#427CB7",
      primaryDisabled: "#45709B",
    },

    border: {
      base: `1px solid #474747`,
      baseHover: `1px solid #858585`,
      baseActive: `1px solid #CCCCCC`,
      baseDisabled: `1px solid #474747`,

      primary: `1px solid #5299E0`,
      primaryHover: `1px solid #4D8AC7`,
      primaryActive: `1px solid #427CB7`,
      primaryDisabled: `1px solid #45709B`,
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
    borderBottom: `1px solid ${globalColors.lightGrayishBlue}`,
    padding: "0 16px 16px",
    bodyPadding: "16px 0",
  },

  mainButtonMobile: {
    textColor: "rgba(255, 255, 255, 0.6)",

    buttonColor: "#F58D31",
    iconFill: black,

    circleBackground: black,

    mobileProgressBarBackground: "#606060",

    bar: {
      errorBackground: orangePressed,

      icon: "#858585",
    },

    buttonWrapper: {
      background: "#333333",
      uploadingBackground: "#242424",
    },

    buttonOptions: {
      backgroundColor: "#242424",
      color: "#ff0000",
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

      buttonColor: grayMaxLight,

      hoverButtonColor: black,

      backgroundActionMobile: "rgba(255, 255, 255, 0.92)",
    },

    dropDownItem: {
      padding: "10px",
    },
  },

  mainButton: {
    backgroundColor: "#4781D1",
    disableBackgroundColor: "rgba(71, 129, 209, 0.6)",
    hoverBackgroundColor: "rgba(71, 129, 209, .85)",
    clickBackgroundColor: "#4074BC",

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
      fill: black,
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

    border: "1px solid #474747",
    background: black,

    borderConnect: "none",
    connectBackground:
      "linear-gradient(0deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), #333333",

    disableBackgroundColor: "rgba(0, 0, 0, 0.08)",

    hoverBackground: black,
    hoverBorder: "1px solid #858585",
    hoverConnectBackground: "#FFFFFF",
    hoverConnectBorder: "none",

    activeBackground: "#282828",
    activeBorder: "1px solid #CCCCCC",
    activeConnectBackground: "rgba(255, 255, 255, 0.64)",
    activeConnectBorder: "none",

    color: "rgba(0, 0, 0, 0.54)",
    disableColor: "rgba(0, 0, 0, 0.4)",
    disabledSvgColor: "#474747",

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
      color: grayMaxLight,
      hoverColor: grayMaxLight,
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
    color: "#858585",
    disableColor: "#474747",
    float: "left",
    height: "19px",
    overflow: "hidden",
    padding: "0px",

    separator: {
      border: `1px solid #474747`,
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
    boxShadow: " 0px 10px 18px -8px rgba(0, 0, 0, 0.100306)",
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
      hoverBackgroundColor: grayMaxLight,
      backgroundColor: "#858585",
    },
  },

  iconButton: { color: "#858585", hoverColor: grayMaxLight },
  selectorAddButton: {
    background: "#242424",
    hoverBackground: "#282828",
    activeBackground: "#242424",

    iconColor: "#858585",
    iconColorHover: "#FFFFFF",
    iconColorActive: "#CCCCCC",

    border: `none`,
    boxSizing: "border-box",
    borderRadius: "3px",
    height: " 32px",
    width: "32px",
    padding: "10px",
    color: "#858585",
    hoverColor: grayMaxLight,
  },

  saveCancelButtons: {
    bottom: "0",
    width: "100%",
    left: "0",
    padding: "8px 24px 8px 16px",
    marginRight: "8px",

    unsavedColor: gray,
  },

  selectedItem: {
    background: "#242424",
    border: `1px solid #242424`,
    borderRadius: "3px",

    textBox: {
      padding: "0 8px",
      height: "32px",
      alignItems: "center",
      borderRight: `1px solid #242424`,
    },

    text: {
      color: grayMaxLight,
      disabledColor: "#474747",
    },

    closeButton: {
      alignItems: "center",
      padding: "0 8px",
      color: grayMaxLight,
      colorHover: grayMaxLight,
      backgroundColor: "#242424",
    },
  },

  checkbox: {
    fillColor: "#282828",
    borderColor: "#474747",
    arrowColor: white,
    indeterminateColor: white,

    disableArrowColor: "#474747",
    disableBorderColor: "#545454",
    disableFillColor: "#545454",
    disableIndeterminateColor: "#474747",

    hoverBorderColor: "#858585",
    hoverIndeterminateColor: white,

    pressedBorderColor: "#474747",
    pressedFillColor: black,

    focusColor: "#858585",

    errorColor: "#E06451",
  },

  // slider: {
  //   sliderBarColorProgress: blueMain,
  //   sliderBarColorProgressDisabled: grayMid,
  //   sliderBarColor: grayLightMid,
  //   sliderBarDisableColor: grayLightMid,

  //   sliderBarBorderActive: `1px solid ${globalColors.grayMid}`,
  //   sliderBarBorderDisable: `1px solid ${globalColors.grayMid}`,

  //   thumbFillDisable: grayLightMid,
  //   thumbFillActive: grayLightMid,

  //   thumbBorderColorActive: `1px solid ${globalColors.gray}`,
  //   thumbBorderColorDisable: `1px solid ${globalColors.grayMid}`,

  //   sliderWidth: "202px",

  //   arrowHover: blueMain,
  //   arrowColor: grayMid,
  // },

  viewSelector: {
    fillColor: black,
    checkedFillColor: "#858585",
    fillColorDisabled: grayLight,
    disabledFillColor: grayLightMid,
    disabledFillColorInner: grayMid,
    hoverBorderColor: "#858585",
    borderColor: "#474747",
  },

  radioButton: {
    textColor: grayMaxLight,
    textDisableColor: "#5c5c5c",

    marginBeforeLabel: "8px",

    background: "#292929",
    disableBackground: "#545454",

    fillColor: grayMaxLight,
    disableFillColor: "#474747",

    borderColor: "#646464",
    disableBorderColor: "none",
    hoverBorderColor: grayMaxLight,
  },

  requestLoader: {
    backgroundColor: white,
    border: `1px solid ${globalColors.veryLightGrey}`,
    overflow: "hidden",
    padding: "5px 10px",
    lineHeight: "16px",
    borderRadius: "5px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",

    marginRight: "10px",
    top: "10px",
    width: "100%",
  },

  row: {
    minHeight: "47px",
    width: "100%",
    borderBottom: "#474747",
    backgroundColor: globalColors.veryDarkGrey,
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
    borderColor: "#474747",
  },

  badge: {
    border: "1px solid transparent",
    padding: "1px",
    lineHeight: "0.8",
    overflow: "hidden",
    color: white,
    backgroundColor: "#F59931",
    disableBackgroundColor: "#858585",
  },

  scrollbar: {
    bgColor: "rgba(136, 136, 136, 0.4)",
    hoverBgColor: "rgba(136, 136, 136, 0.64)",
    pressBgColor: "rgba(136, 136, 136, 0.8)",
    paddingInlineEnd: "17px !important",
    paddingInlineEndMobile: "8px !important",
  },

  modalDialog: {
    backgroundColor: black,
    textColor: white,
    headerBorderColor: "#474747",
    footerBorderColor: "#474747",
    width: "auto",
    maxwidth: "560px",
    margin: " 0 auto",
    minHeight: "100%",

    colorDisabledFileIcons: "#5c5c5c",

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

    header: {
      borderBottom: `1px solid #474747`,
    },

    closeButton: {
      // backgroundColor: "#9A9EA3",

      fillColor: "#9A9EA3",
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
    color: grayMaxLight,
    disableColor: "#6c6c6c",

    backgroundColor: "#292929",
    disableBackgroundColor: "#474747",

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

    borderColor: "#474747",
    errorBorderColor: "#E06451",
    warningBorderColor: warningColor,
    disabledBorderColor: "#474747",

    hoverBorderColor: "#858585",
    hoverErrorBorderColor: "#E06451",
    hoverWarningBorderColor: warningColor,
    hoverDisabledBorderColor: "#474747",

    focusBorderColor: grayMaxLight,
    focusErrorBorderColor: "#E06451",
    focusWarningBorderColor: warningColor,
    focusDisabledBorderColor: "#474747",
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
      background: "#292929",

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
    color: "#858585",
    disableColor: "#858585",

    tooltipTextColor: black,

    iconColor: "#646464",
    hoverIconColor: "#858585",

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

    iconColor: "#646464",
    hoverIconColor: "#858585",
  },

  inputPhone: {
    activeBorderColor: "#2da7db",
    inactiveBorderColor: "#474747",
    errorBorderColor: "#f21c0e",
    backgroundColor: "#33333",
    color: "#fff",
    scrollBackground: "#858585",
    placeholderColor: "#858585",
    dialCodeColor: "#858585",
    width: "320px",
    height: "44px",
  },
  textInput: {
    fontWeight: "normal",
    placeholderColor: "rgba(255, 255, 255, 0.2)",
    disablePlaceholderColor: "#6c6c6c",

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

    borderColor: grayMaxLight,

    iconColor: "#858585",
    hoverIconColor: "#FFFFFF",
  },

  textArea: {
    disabledColor: "#474747",

    focusBorderColor: grayMaxLight,
    focusErrorBorderColor: "#E06451",
    focusOutline: "none",

    scrollWidth: "100%",
    scrollHeight: "91px",

    numerationColor: "#858585",

    copyIconFilter:
      "invert(62%) sepia(0%) saturate(0%) hue-rotate(119deg) brightness(85%) contrast(87%)",
  },

  link: {
    color: grayMaxLight,
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
    disableColor: "#5c5c5c",

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
      default: "#858585",
      hover: "#ADADAD",
      active: "#FFFFFF",
      focus: "#FFFFFF",
    },

    background: {
      default: "transparent",
      hover: "#474747",
      active: "#282828",
      focus: "#242424",
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
    boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.40)",
    opacity: "1",
    padding: "8px 12px",
    pointerEvents: "auto",
    maxWidth: "340px",
    color: "#242424",
    textColor: white,
    backgroundColor: "#282828",

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
      color: "#E06451",
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
      backgroundImage: "#606060",
      background: "#606060",
      groupBackground: grayDarkMid,
      borderRadius: "50%",
      height: "100%",

      svg: {
        display: "block",
        width: "50%",
        height: "100%",
        margin: "auto",
        fill: "#858585",
      },
    },

    administrator: {
      fill: "#A15B1D",
      stroke: darkBlack,
      color: white,
    },

    guest: {
      fill: "#575757",
      stroke: darkBlack,
      color: white,
    },

    owner: {
      fill: "#A38A1A",
      stroke: darkBlack,
      color: white,
    },

    editContainer: {
      right: "0px",
      bottom: "0px",
      fill: black,
      backgroundColor: "#b2b2b2",
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
      background: "#242424",
      color: "#ADADAD",
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
      color: "#474747",
      linkColor: "#E06A1B",
    },

    slider: {
      width: "100%",
      margin: "24px 0",
      backgroundColor: "transparent",

      runnableTrack: {
        background: "#242424",
        focusBackground: "#242424",
        border: `1.4px solid #242424`,
        borderRadius: "5.6px",
        width: "100%",
        height: "8px",
      },

      sliderThumb: {
        marginTop: "-9.4px",
        width: "24px",
        height: "24px",
        background: grayMaxLight,
        disabledBackground: "#A6DCF2",
        borderWidth: "6px",
        borderStyle: "solid",
        borderColor: `${black}`,
        borderRadius: "30px",
        boxShadow: "0px 5px 20px rgba(4, 15, 27, 0.13)",
      },

      thumb: {
        width: "24px",
        height: "24px",
        background: grayMaxLight,
        border: `6px solid ${black}`,
        borderRadius: "30px",
        marginTop: "0px",
        boxShadow: "0px 5px 20px rgba(4, 15, 27, 0.13)",
      },

      rangeTrack: {
        background: "#242424",
        border: `1.4px solid #242424`,
        borderRadius: "5.6px",
        width: "100%",
        height: "8px",
      },

      rangeThumb: {
        width: "14px",
        height: "14px",
        background: grayMaxLight,
        border: `6px solid ${black}`,
        borderRadius: "30px",
        boxShadow: "0px 5px 20px rgba(4, 15, 27, 0.13)",
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
        color: "#A3A9AE",
      },

      fillLower: {
        background: "#242424",
        focusBackground: "#242424",
        border: `1.4px solid #242424`,
        borderRadius: "11.2px",
      },

      fillUpper: {
        background: "#242424",
        focusBackground: "#242424",
        border: `1.4px solid #242424`,
        borderRadius: "11.2px",
      },
    },

    dropZone: {
      border: `1px dashed #474747`,
    },

    container: {
      miniPreview: {
        width: "160px",
        border: `1px solid #242424`,
        borderRadius: "6px",
        padding: "8px",
      },

      buttons: {
        height: "32px",
        background: "#292929",
        mobileWidth: "40px",
        mobileHeight: "100%",
        mobileBackground: "none",
      },

      button: {
        background: "#b6b6b6",
        fill: "#858585",
        hoverFill: grayMaxLight,
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

  treeMenu: {
    disabledColor: "#5c5c5c",
  },

  treeNode: {
    background: "#3D3D3D",
    disableColor: "#858585",

    icon: {
      color: "#ADADAD",
    },

    dragging: {
      draggable: {
        background: "rgba(230, 211, 138, 0.12)",
        hoverBackgroundColor: "rgba(204, 184, 102, 0.2)",
        borderRadius: "3px",
      },

      title: {
        width: "85%",
        // color: "#000",
      },
    },

    draggable: {
      color: cyanBlueDarkShade,
      dragOverBackgroundColor: strongBlue,
      border: `1px ${strongBlue} solid`,
      dragOverColor: white,

      gapTop: {
        borderTop: `2px blue solid`,
      },

      gapBottom: {
        borderBottom: `2px blue solid`,
      },
    },

    contentWrapper: {
      color: darkRed,
    },

    title: {
      color: "#a9a9a9",
    },

    selected: {
      background: black,
      hoverBackgroundColor: black,
      borderRadius: "3px",
    },

    checkbox: {
      border: `2px solid ${white}`,
      borderTop: 0,
      borderLeft: 0,
    },
  },

  progressBar: {
    backgroundColor: "#858585",

    percent: {
      background: "#E17415",
    },

    color: {
      error: darkErrorStatus,
      status: grayMaxLight,
    },
  },

  dropDown: {
    fontWeight: "600",
    fontSize: "13px",
    zIndex: "400",
    background: "#333333",
    borderRadius: "6px",
    boxShadow: "0px 8px 16px 0px #040F1B29",
    // boxShadowMobile: "0px -4px 60px rgba(0, 0, 0, 0.25)",
    border: "1px solid #474747",
  },

  dropDownItem: {
    color: grayMaxLight,
    disableColor: gray,
    backgroundColor: black,
    hoverBackgroundColor: "#3D3D3D",
    hoverDisabledBackgroundColor: black,
    selectedBackgroundColor: "#282828",
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

      color: grayMaxLight,
      disableColor: grayMaxLight,
    },

    separator: {
      padding: "0px 16px",
      borderBottom: `1px solid #474747`,
      margin: " 4px 16px 4px",
      lineHeight: "1px",
      height: "1px",
      width: "calc(100% - 32px)",
    },
  },

  toast: {
    active: {
      success: "#292929",
      error: "#292929",
      info: "#292929",
      warning: "#292929",
    },
    hover: {
      success: "#292929",
      error: "#292929",
      info: "#292929",
      warning: "#292929",
    },
    border: {
      success: "2px solid #9de051",
      error: "2px solid #e0b051",
      info: "2px solid #e0d751",
      warning: "2px solid #e07751",
    },

    zIndex: "9999",
    position: "fixed",
    padding: "4px",
    width: "320px",
    color: grayMaxLight,
    top: "16px",
    right: "24px",
    marginTop: "0px",

    closeButton: {
      color: grayMaxLight,
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
      boxShadow: "0px 16px 16px rgba(0, 0, 0, 0.16)",
      maxHeight: "800px",
      overflow: "hidden",
      borderRadius: "6px",
      color: grayMaxLight,
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
        success: "#9DE051",
        error: "#E0B151",
        info: "#E0D751",
        warning: "#E07751",
      },
    },

    text: {
      lineHeight: " 1.3",
      fontSize: "12px",
      color: grayMaxLight,
    },

    title: {
      fontWeight: "600",
      margin: "0",
      marginBottom: "5px",
      lineHeight: "16px",
      color: {
        success: "#9DE051",
        error: "#E0B151",
        info: "#E0D751",
        warning: "#E07751",
      },
      fontSize: "12px",
    },

    closeButtonColor: grayMaxLight,
  },

  loader: {
    color: shuttleGrey,
    size: "40px",
    marginRight: "2px",
    borderRadius: "50%",
  },
  rombsLoader: {
    blue: {
      colorStep_1: "#333",
      colorStep_2: "#333",
      colorStep_3: "#323032",
      colorStep_4: "#323032",
    },
    red: {
      colorStep_1: "#333",
      colorStep_2: "#333",
      colorStep_3: "#323032",
    },
    green: {
      colorStep_1: "#333",
      colorStep_2: "#333",
      colorStep_3: "#323032",
      colorStep_4: "#323032",
    },
  },
  dialogLoader: {
    borderBottom: "1px solid #292929",
  },

  // dropDownItem: {
  //   width: "100%",
  //   maxWidth: "240px",
  //   border: "none",
  //   cursor: "pointer",
  //   padding: "0px 16px",
  //   lineHeight: "32px",
  //   textAlign: "left",
  //   background: "none",
  //   textDecoration: "none",
  //   fontStyle: "normal",
  //   fontWeight: "600",
  //   fontSize: "13px",

  //   whiteSpace: "nowrap",
  //   overflow: "hidden",
  //   textOverflow: "ellipsis",

  //   outline: "none",
  //   color: black,
  //   textTransform: "none",

  //   hoverBackgroundColor: grayLight,
  //   noHoverBackgroundColor: white,

  //   header: {
  //     color: gray,
  //     hoverCursor: "default",
  //     hoverBackgroundColor: "white",
  //     textTransform: "uppercase",
  //   },

  //   disabled: {
  //     color: gray,
  //     hoverCursor: "default",
  //     hoverBackgroundColor: "white",
  //   },

  //   separator: {
  //     padding: "0px 16px",
  //     border: `0.5px solid ${grayLightMid}`,
  //     cursor: "default",
  //     margin: "6px 16px 6px",
  //     lineHeight: "1px",
  //     height: "1px",
  //     width: "calc(100% - 32px)",
  //   },

  //   tablet: { lineHeight: "36px" },

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

      paddingLeft: "16px",
      paddingRightNoArrow: "16px",
      paddingRight: "8px",

      selectPaddingLeft: "8px",
      selectPaddingRightNoArrow: "14px",
      selectPaddingRight: "8px",

      color: "#858585",
      disabledColor: "#858585",
      background: "#292929",
      backgroundWithBorder: "none",
      backgroundModernView: "none",

      border: `1px solid #474747`,
      borderRadius: "3px",

      borderColor: "#474747",
      openBorderColor: grayMaxLight,

      disabledBorderColor: "#474747",
      disabledBackground: "#474747",

      hoverBorderColor: "#858585",
      hoverBorderColorOpen: grayMaxLight,
      hoverDisabledBorderColor: "#474747",

      hoverBackgroundModernView: "#474747",
      activeBackgroundModernView: "#282828",
      focusBackgroundModernView: "#242424",
    },

    label: {
      marginRightWithBorder: "13px",
      marginRight: "4px",

      disabledColor: "#858585",
      color: "#858585",
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

      defaultDisabledColor: "#858585",
      defaultColor: white,
      disabledColor: "#858585",
      color: white,
      selectedColor: white,
    },

    plusBadge: {
      color: black,
      bgColor: grayDark,
      selectedBgColor: "#ADADAD",
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
    fillColorDefault: "#4781D1",
    fillColorOff: "#292929",
    hoverFillColorOff: "#3D3D3D",

    fillCircleColor: "#FFFFFF",
    fillCircleColorOff: "#FFFFFF",
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
      borderBottom: `1px solid #474747`,
    },

    bodyContent: {
      padding: "16px 0",
    },
  },

  calendar: {
    color: "#FFFFFF",
    disabledColor: "#474747",
    pastColor: "#858585",
    onHoverBackground: "#3D3D3D",
    titleColor: "#ADADAD",
    outlineColor: "#474747",
    arrowColor: "#F6F9FC",
    disabledArrow: "#474747",
    weekdayColor: "#858585",
    accent: "#4781d1",
    boxShadow: "0px 12px 40px 0px rgba(0, 0, 0, 0.40)",
  },

  datePicker: {
    width: "115px",
    dropDownPadding: "16px 16px 16px 17px",
    contentPadding: "0 16px 16px",
    bodyPadding: "16px 0",
    backgroundColor: black,
    inputBorder: blueMain,
    iconPadding: "8px 8px 7px 0px",

    contentMaxWidth: "500px",
    contentLineHeight: "56px",
    contentFontWeight: "700",

    borderBottom: `1px solid ${globalColors.lightGrayishBlue}`,
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
    border: `1px solid ${globalColors.darkSilver}`,
    transparentBorder: "1px solid transparent",
    acceptBackground: "rgba(204, 184, 102, 0.2)",
    background: "rgba(230, 211, 138, 0.12)",
  },

  // phoneInput: {
  //   width: "304px",
  //   height: "44px",
  //   itemTextColor: black,
  //   itemBackgroundColor: white,
  //   itemHoverColor: grayLightMid,
  //   scrollBackground: "rgba(0, 0, 0, 0.1)",
  //   placeholderColor: gray,
  // },

  // squareButton: {
  //   height: "32px",
  //   width: "32px",
  //   color: gray,
  //   backgroundColor: white,
  //   border: `1px solid ${grayMid}`,
  //   borderRadius: "3px",
  //   outline: "none",
  //   hover: {
  //     backgroundColor: white,
  //     border: `1px solid ${gray}`,
  //   },
  //   click: {
  //     backgroundColor: grayLightMid,
  //     border: `1px solid ${gray}`,
  //   },
  //   disable: {
  //     backgroundColor: grayLight,
  //     border: `1px solid ${grayLightMid}`,
  //   },
  //   crossShape: {
  //     color: graySilver,
  //     disable: {
  //       color: gray,
  //     },
  //   },
  // },

  // roundButton: {
  //   height: "40px",
  //   width: "40px",
  //   backgroundColor: grayLight,
  //   borderRadius: {
  //     plus: "112px",
  //     minus: "81px",
  //   },
  //   borderStyle: "none",
  //   outline: "none",
  //   hover: {
  //     backgroundColor: grayLightMid,
  //   },
  //   click: {
  //     backgroundColor: grayMid,
  //   },
  //   disable: {
  //     backgroundColor: grayLight,
  //   },
  //   plus: {
  //     color: grayMid,
  //     disable: {
  //       color: black,
  //     },
  //   },
  // },
  catalog: {
    background: "#292929",

    header: {
      borderBottom: "1px solid #474747",
      iconFill: "#a9a9a9",
    },
    control: {
      background: "#a3a3a3",
      fill: "#ffffff",
    },

    headerBurgerColor: "#606060",

    verticalLine: "1px solid #474747",

    profile: {
      borderTop: "1px solid #474747",
      background: "#3D3D3D",
    },

    paymentAlert: {
      color: "#ed7309",
      warningColor: "#E06451",
    },

    teamTrainingAlert: {
      titleColor: "#FFFFFF",
      borderColor: "#388BDE",
      linkColor: "#5299E0",
    },
  },

  alertComponent: {
    descriptionColor: "#ADADAD",
    iconColor: "#ADADAD",
  },

  catalogItem: {
    container: {
      width: "100%",
      height: "36px",
      padding: "0 12px",
      background: "#1b1c1d",
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

        fill: "#a9a9a9",
        isActiveFill: "#FFFFFF",
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
      color: "#a9a9a9",
      isActiveColor: "#FFFFFF",
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
      backgroundColor: "#F58D31",

      size: "8px",
      position: "-4px",
    },
    trashIconFill: "#858585",
  },

  navigation: {
    expanderColor: "#eeeeee",
    background: black,
    rootFolderTitleColor: "#ADADAD",
    boxShadow: "0px 8px 16px 0px #040F1B29",

    icon: {
      fill: "#E06A1B",
      stroke: "#474747",
    },
  },

  nav: {
    backgroundColor: "#292929",
  },

  navItem: {
    baseColor: "#a9a9a9",
    activeColor: white,
    separatorColor: "#474747",

    wrapper: {
      hoverBackground: "#474747",
    },
  },

  header: {
    backgroundColor: "#282828 ",
    recoveryColor: "#4C4C4C",
    linkColor: "#606060",
    productColor: "#eeeeee",
    height: "48px",
  },

  menuContainer: {
    background: "#3d3d3d",
    color: "rgba(255, 255, 255, 0.92)",
  },

  article: {
    background: "#292929",
    pinBorderColor: "#474747",
    catalogItemHeader: "#858585",
    catalogItemText: "rgba(255, 255, 255, 0.6)",
    catalogItemActiveBackground: "#333333",
    catalogShowText: "#adadad",
  },

  section: {
    toggler: {
      background: white,
      fill: black,
      boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.13)",
    },

    header: {
      backgroundColor: black,
      background: `linear-gradient(180deg, #333333 2.81%, rgba(51, 51, 51, 0.9) 63.03%, rgba(51, 51, 51, 0) 100%);`,
      trashErasureLabelBackground: "#292929",
      trashErasureLabelText: "#ADADAD",
    },
  },

  infoPanel: {
    sectionHeaderToggleIcon: "#858585",
    sectionHeaderToggleIconActive: "#c4c4c4",
    sectionHeaderToggleBg: "transparent",
    sectionHeaderToggleBgActive: "#292929",

    backgroundColor: black,
    blurColor: blurDark,
    borderColor: "#474747",
    thumbnailBorderColor: grayLightMid,
    textColor: white,
    errorColor: "#E06451",

    closeButtonWrapperPadding: "6px",
    closeButtonIcon: black,
    closeButtonSize: "12px",
    closeButtonBg: "#a2a2a2",

    nameColor: "#A3A9AE",

    links: {
      iconColor: "#858585",
      iconErrorColor: "#E06451",
      primaryColor: "#ADADAD",
    },

    members: {
      iconColor: "#858585",
      iconHoverColor: "#ffffff",
      isExpectName: "#A3A9AE",
      subtitleColor: "#a3a9ae",
      meLabelColor: "#a3a9ae",
      roleSelectorColor: "#a3a9ae",
      disabledRoleSelectorColor: "#a3a9ae",
      roleSelectorArrowColor: "#a3a9ae",
      createLink: "#858585",
      linkAccessComboboxExpired: "#a3a9ae",
    },

    history: {
      subtitleColor: "#A3A9AE",
      fileBlockBg: "#292929",
      dateColor: "#A3A9AE",
      fileExstColor: "#A3A9AE",
      locationIconColor: "#A3A9AE",
      folderLabelColor: "#A3A9AE",
      renamedItemColor: "#A3A9AE",
      oldRoleColor: "#A3A9AE",
      messageColor: "#FFFFFF",
    },

    details: {
      customLogoBorderColor: "#474747",
      commentEditorIconColor: "#eee",
      tagBackground: "#242424",
    },

    gallery: {
      borderColor: "#292929",
      descriptionColor: "#eeeeee",
    },

    search: {
      boxShadow: "0px 5px 20px 0px rgba(0, 0, 0, 0.16)",
    },
  },

  filesArticleBody: {
    background: black,
    panelBackground: "#474747",

    fill: "#C4C4C4",
    expanderColor: "#C4C4C4",

    downloadAppList: {
      textColor: "#858585",
      color: "#5C5C5C",
      winHoverColor: "#3785D3",
      macHoverColor: "#fff",
      linuxHoverColor: "#FFB800",
      androidHoverColor: "#9BD71C",
      iosHoverColor: "#fff",
    },

    thirdPartyList: {
      color: "#818b91",
      linkColor: "#DDDDDD",
    },
    devTools: {
      border: "1px solid #474747",
      color: "#858585",
    },
  },

  peopleArticleBody: {
    iconColor: "#C4C4C4",
    expanderColor: "#C4C4C4",
  },

  peopleTableRow: {
    fill: graySilver,

    nameColor: grayMaxLight,
    pendingNameColor: "#6f6f6f",

    sideInfoColor: "#858585",
    pendingSideInfoColor: "#5a5a5a",
  },

  filterInput: {
    button: {
      border: "1px solid #474747",
      hoverBorder: "1px solid #858585",

      openBackground: "#a3a9ae",

      openFill: "#eeeeee",
    },

    filter: {
      background: "#333333",
      border: "1px solid #474747",
      color: "#a3a9ae",

      separatorColor: "#474747",
      indicatorColor: "#F58D31",

      selectedItem: {
        background: "#eeeeee",
        border: "#eeeeee",
        color: "#333333",
      },
    },

    sort: {
      background: "#333333",
      hoverBackground: "#292929",
      selectedViewIcon: "rgba(255, 255, 255, 0.88)",
      viewIcon: "#858585",
      sortFill: "rgba(255, 255, 255, 0.6)",

      tileSortFill: "#eeeeee",
      tileSortColor: "#eeeeee",
    },

    selectedItems: {
      background: "#242424",
      hoverBackground: "#3d3d3d",
    },
  },

  profileInfo: {
    color: "#858585",
    iconButtonColor: grayMaxLight,
    linkColor: grayMaxLight,

    tooltipLinkColor: "#e06a1b",
    iconColor: "#C96C27",
  },

  updateUserForm: {
    tooltipTextColor: black,
    borderTop: "none",
  },

  tableContainer: {
    borderRight: "2px solid #474747",
    hoverBorderColor: "#474747",
    tableCellBorder: "1px solid #474747",

    groupMenu: {
      background: black,
      borderBottom: "1px solid #474747",
      borderRight: "1px solid #474747",
      boxShadow: "0px 40px 60px rgba(0, 0, 0, 0.12)",
    },

    header: {
      background: black,
      borderBottom: "1px solid #474747",
      textColor: "#858585",
      activeTextColor: "#858585",
      hoverTextColor: grayMaxLight,

      iconColor: "#858585",
      activeIconColor: "#858585",
      hoverIconColor: grayMaxLight,

      borderImageSource: `linear-gradient(to right,${black} 21px,#474747 21px,#474747 calc(100% - 20px),${black} calc(100% - 20px))`,
      borderHoverImageSource: `linear-gradient(to right,${black} 0px,#474747 0px,#474747 100% ,${black} 100%)`,
      lengthenBorderImageSource: `linear-gradient(to right, #474747, #474747)`,
      hotkeyBorderBottom: `1px solid ${globalColors.blueMain}`,

      settingsIconDisableColor: "#474747",
    },

    tableCell: {
      border: "1px solid #474747",
    },
  },
  filesSection: {
    rowView: {
      checkedBackground: "#3D3D3D",

      draggingBackground: "rgba(230, 211, 138, 0.12)",
      draggingHoverBackground: "rgba(204, 184, 102, 0.2)2",

      shareButton: {
        color: "#858585",
        fill: "#858585",
      },

      sideColor: "#858585",
      linkColor: grayMaxLight,
      textColor: "#858585",

      editingIconColor: "#eeeeee",
      shareHoverColor: "#eeeeee",
      pinColor: "#FFFFFF",
    },

    tableView: {
      fileName: {
        linkColor: grayMaxLight,
        textColor: "#858585",
      },

      row: {
        checkboxChecked: `linear-gradient(to right, ${black} 24px, #474747 24px)`,
        checkboxDragging:
          "linear-gradient(to right, rgba(230, 211, 138, 0.12) 24px, #474747 24px)",
        checkboxDraggingHover:
          "inear-gradient(to right,rgba(204, 184, 102, 0.2) 24px, #474747 24px)",

        contextMenuWrapperChecked: `linear-gradient(to left, ${black} 24px, #474747 24px)`,
        contextMenuWrapperDragging:
          "border-image-source: linear-gradient(to left, rgba(230, 211, 138, 0.12) 24px, #474747 24px)",
        contextMenuWrapperDraggingHover:
          "linear-gradient(to left,rgba(204, 184, 102, 0.2) 24px, #474747 24px)",

        backgroundActive: "#3D3D3D",

        borderImageCheckbox:
          "linear-gradient(to right, #474747 24px, #474747 24px)",
        borderImageContextMenu:
          "linear-gradient(to left, #474747 24px, #474747 24px)",

        borderHover: "#474747",
        sideColor: gray,

        shareHoverColor: "#eeeeee",

        borderImageRight:
          "linear-gradient(to right, #333333 25px, #474747 24px)",
        borderImageLeft: "linear-gradient(to left, #333333 20px, #474747 24px)",

        borderColor: "#474747",
        borderColorTransition: "#474747",
      },
    },

    tilesView: {
      tile: {
        draggingColor: "rgba(230, 211, 138, 0.12)",
        draggingHoverColor: "rgba(204, 184, 102, 0.2)",
        checkedColor: "#3d3d3d",
        roomsCheckedColor: black,
        border: "1px solid #474747",
        backgroundBadgeColor: black,
        backgroundColor: "#282828",
        borderRadius: "6px",
        roomsBorderRadius: "12px",
        bottomBorderRadius: "0 0 6px 6px",
        roomsBottomBorderRadius: "0 0 12px 12px",
        upperBorderRadius: "6px 6px 0 0",
        roomsUpperBorderRadius: "12px 12px 0 0",
        backgroundColorTop: "#292929",
      },

      sideColor: grayMaxLight,
      color: grayMaxLight,
      textColor: "#858585",
    },

    animationColor: "rgba(82, 153, 224, 0.16)",
  },

  advancedSelector: {
    footerBorder: "1px solid #474747",

    hoverBackgroundColor: "#474747",
    selectedBackgroundColor: "#474747",
    borderLeft: "1px solid #474747",

    searcher: {
      hoverBorderColor: "#858585",
      focusBorderColor: grayMaxLight,
      placeholderColor: "#474747",
    },
  },

  selector: {
    border: `1px solid #474747`,

    breadCrumbs: {
      prevItemColor: "#CCCCCC",
      arrowRightColor: "#ADADAD",
    },

    info: {
      backgroundColor: "#282828",
      color: "#ADADAD",
    },

    bodyDescriptionText: "#858585",

    item: {
      hoverBackground: "#3d3d3d",
      selectedBackground: "#3d3d3d",

      inputButtonBorder: "#474747",
      inputButtonBorderHover: grayMaxLight,

      disableTextColor: "#858585",
    },

    emptyScreen: {
      descriptionColor: "#ADADAD",
      buttonColor: "#ADADAD",
      hoverButtonColor: "#FFFFFF",
      pressedButtonColor: "#CCCCCC",
    },
  },

  floatingButton: {
    backgroundColor: white,
    color: black,
    boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.12)",
    fill: black,

    alert: {
      fill: "#F58D31",
      path: black,
    },
  },

  mediaViewer: {
    color: "#d1d1d1",
    background: "rgba(17, 17, 17, 0.867)",
    backgroundColor: "rgba(11, 11, 11, 0.7)",
    fill: white,
    titleColor: white,
    iconColor: white,

    controlBtn: {
      backgroundColor: "rgba(200, 200, 200, 0.2)",
    },

    imageViewer: {
      backgroundColor: "rgba(200, 200, 200, 0.2)",
      inactiveBackgroundColor: "rgba(11,11,11,0.7)",
      fill: white,
    },

    progressBar: {
      background: "#d1d1d1",
      backgroundColor: "rgba(200, 200, 200, 0.2)",
    },

    scrollButton: {
      backgroundColor: "rgba(11, 11, 11, 0.7)",
      background: "rgba(200, 200, 200, 0.2)",
      border: `solid ${white}`,
    },

    videoViewer: {
      fill: white,
      stroke: white,
      color: "#d1d1d1",
      colorError: white,
      backgroundColorError: darkBlack,
      backgroundColor: "rgba(11, 11, 11, 0.7)",
      background: "rgba(200, 200, 200, 0.2)",
    },
  },

  connectCloud: {
    connectBtnContent: silver,
    connectBtnTextBg: "none",
    connectBtnIconBg: "#none",
    connectBtnTextBorder: silver,
    connectBtnIconBorder: "#474747",
  },

  createEditRoomDialog: {
    commonParam: {
      descriptionColor: "#a3a9ae",
      textColor: "#858585",
    },

    roomType: {
      listItem: {
        background: "none",
        hoverBackground: "#282828",
        borderColor: "#474747",
        descriptionText: "#A3A9AE",
      },
      dropdownButton: {
        background: "none",
        hoverBackground: "#282828",
        borderColor: "#474747",
        isOpenBorderColor: "#F97A0B",
        descriptionText: "#A3A9AE",
      },
      dropdownItem: {
        background: "#333333",
        hoverBackground: "#282828",
        descriptionText: "#A3A9AE",
      },
      displayItem: {
        background: "#282828",
        borderColor: "#282828",
        descriptionText: "#a3a9ae",
      },
    },

    roomTypeDropdown: {
      desktop: {
        background: "#333333",
        borderColor: "#474747",
      },
      mobile: {
        background: "#333333",
      },
    },

    permanentSettings: {
      background: "#474747",
      isPrivateIcon: "#35ad17",
      descriptionColor: "#a3a9ae",
    },

    dropdown: {
      background: "#333333",
      borderColor: "#474747",
      item: {
        hoverBackground: "#282828",
      },
    },

    isPrivate: {
      limitations: {
        background: "#474747",
        iconColor: "#ed7309",
        titleColor: "#ed7309",
        descriptionColor: "#a3a9ae",
        linkColor: "#e8e8e9",
      },
    },

    thirdpartyStorage: {
      combobox: {
        background: "#292929",
        dropdownBorderColor: "#474747",
        hoverDropdownBorderColor: "#858585",
        isOpenDropdownBorderColor: "#e8e8e9",
        arrowFill: "#474747",
      },
      folderInput: {
        background: "#292929",
        borderColor: "#474747",
        hoverBorderColor: "#858585",
        focusBorderColor: "#e8e8e9",
        rootLabelColor: "#a3a9ae",
        iconFill: "#657177",
      },
    },

    iconCropper: {
      gridColor: "#333333",
      deleteButton: {
        background: "#292929",
        hoverBackground: "#333333",
        borderColor: "#292929",
        hoverBorderColor: "#fafafa",
        color: "#858585",
        iconColor: "#858585",
      },
    },

    previewTile: {
      background: "#292929",
      borderColor: "#474747",
      iconBorderColor: "#eceef1",
    },

    dropzone: {
      borderColor: "#474747",
      linkMainColor: "#F97A0B",
      linkSecondaryColor: "#ffffff",
      exstsColor: "#a3a9ae",
    },
  },

  filesThirdPartyDialog: {
    border: "1px solid #474747",
  },

  connectedClouds: {
    color: "#eeeeee",
    borderBottom: `1px solid #474747`,
    borderRight: `1px solid #474747`,
  },

  filesModalDialog: {
    border: `1px solid #474747`,
  },

  filesDragTooltip: {
    background: black,
    boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.13)",
    color: grayMaxLight,
  },

  emptyContent: {
    header: {
      color: "#FFFFFF",
    },

    description: {
      color: "#ADADAD",
    },
    button: {
      colorLink: "#ADADAD",
      colorText: "#ADADAD",
    },
  },

  emptyView: {
    items: {
      hoverColor: charlestonGreen,
      pressColor: outerSpace,
    },
  },

  filesEmptyContainer: {
    linkColor: "#adadad",
    privateRoom: {
      linkColor: "#E06A1B",
    },
  },

  filesPanels: {
    color: grayMaxLight,

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
    },

    changeOwner: {
      iconColor: gray,
      arrowColor: darkBlack,
    },

    embedding: {
      textAreaColor: "#858585",
      iconColor: grayMaxLight,
      color: gray,
    },

    versionHistory: {
      borderTop: "1px solid #474747",
    },

    content: {
      backgroundColor: black,
      fill: grayMaxLight,
      disabledFill: "#5c5c5c",
    },

    body: {
      backgroundColor: black,
      fill: grayMaxLight,
    },

    footer: {
      backgroundColor: black,
      borderTop: "1px solid #474747",
    },

    linkRow: {
      backgroundColor: black,
      fill: grayMaxLight,
      disabledFill: "#5c5c5c",
    },

    selectFolder: {
      color: gray,
    },

    selectFile: {
      color: gray,
      background: black,
      borderBottom: "1px solid #474747",
      borderRight: "1px solid #474747",

      buttonsBackground: black,
    },

    filesList: {
      color: grayMaxLight,
      backgroundColor: black,
      borderBottom: "1px solid #474747",
    },

    modalRow: {
      backgroundColor: black,
      fill: gray,
      disabledFill: "#5c5c5c",
    },

    sharing: {
      color: grayMaxLight,

      fill: grayMaxLight,
      loadingFill: grayMaxLight,

      borderBottom: "1px solid #474747",
      borderTop: "1px solid #474747",
      externalLinkBackground: "#292929",
      externalLinkSvg: "#eeeeee",

      internalLinkBorder: "1px dashed #eeeeee",

      itemBorder: "1px dashed #333333",

      itemOwnerColor: "#858585",

      backgroundButtons: "#333333",

      dropdownColor: grayMaxLight,

      loader: {
        foregroundColor: black,
        backgroundColor: black,
      },
    },

    upload: {
      color: black,
      tooltipColor: "#F5E9BA",
      iconColor: darkErrorStatus,

      shareButton: {
        color: gray,
        sharedColor: grayMain,
      },

      loadingButton: {
        color: "#eeeeee",
        background: black,
      },
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
      borderBottom: `1px solid #474747 !important`,
      margin: "6px 16px 6px 16px !important",
      height: "1px !important",
      width: "calc(100% - 32px) !important",
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
      color: "#eeeeee",
    },
    hover: black,
    background: "none",
    svgFill: "#eeeeee",
    header: {
      height: "49px",
      borderBottom: `1px solid #474747`,
      marginBottom: "6px",
    },
    height: "30px",
    borderBottom: "none",
    marginBottom: "0",
    padding: "0 12px",
    mobile: {
      height: "36px",
      padding: "0 16px 6px",
    },
  },
  newContextMenu: {
    background: black,
    borderRadius: "6px",
    mobileBorderRadius: "6px 6px 0 0",
    boxShadow: "0px 8px 16px 0px #040F1B29",
    padding: "6px 0px",
    border: "1px solid #474747",
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
    color: cyanBlueDarkShade,

    linkColor: grayMaxLight,
  },

  filesBadges: {
    iconColor: "#858585",
    hoverIconColor: grayMaxLight,

    color: white,
    backgroundColor: black,

    badgeColor: black,
    badgeBackgroundColor: "#858585",
  },

  filesEditingWrapper: {
    color: grayMaxLight,
    border: "1px solid #474747",
    borderBottom: "1px solid #474747",

    tile: {
      background: globalColors.black,
      itemBackground: "#242424",
      itemBorder: gray,
      itemActiveBorder: "#eeeeee",
    },

    row: {
      itemBackground: globalColors.black,
    },

    fill: "#858585",
    hoverFill: "#eeeeee",
  },

  filesIcons: {
    fill: "#858585",
    hoverFill: "#eeeeee",
  },

  filesQuickButtons: {
    color: "#858585",
    sharedColor: "#eeeeee",
    hoverColor: "#eeeeee",
  },

  filesSharedButton: {
    color: "#858585",
    sharedColor: "#eeeeee",
  },

  filesPrivateRoom: {
    borderBottom: "1px solid #d3d3d3",
    linkColor: "#E06A1B",
    textColor: "#83888D",
  },

  filesVersionHistory: {
    row: {
      color: grayMaxLight,
      fill: grayMaxLight,
    },

    badge: {
      color: black,
      stroke: "#ADADAD",
      fill: "#ADADAD",
      defaultFill: black,
      badgeFill: "#F58D31",
    },

    versionList: {
      fill: grayMaxLight,
      stroke: grayMaxLight,
      color: grayMaxLight,
    },
  },

  login: {
    linkColor: "#E06A1B",
    textColor: "#858585",
    navBackground: "#282828",
    headerColor: white,
    helpButton: "#D8D8D8",
    orLineColor: "#474747",
    orTextColor: "#858585",
    titleColor: white,

    register: {
      backgroundColor: "#292929",
      textColor: "#E06A1B",
    },

    container: {
      backgroundColor: "#474747",
    },

    captcha: {
      border: `1px solid ${darkErrorStatus}`,
      color: darkErrorStatus,
    },

    backTitle: {
      color: "#A3A9AE",
    },
  },

  facebookButton: {
    background: black,
    border: "1px solid #474747",
    color: grayMaxLight,
  },

  peopleSelector: {
    textColor: grayMaxLight,
  },

  peopleWithContent: {
    color: "#858585",
    pendingColor: "#474747",
  },

  peopleDialogs: {
    modal: {
      border: "1px solid #474747",
    },

    deleteUser: {
      textColor: red,
    },

    deleteSelf: {
      linkColor: "#e06a1b",
    },

    changePassword: {
      linkColor: "#e06a1b",
    },
  },

  downloadDialog: {
    background: "#282828",
  },

  client: {
    about: {
      linkColor: "#E06A1B",
      border: "1px solid #474747",
      logoColor: white,
    },

    comingSoon: {
      linkColor: "#858585",
      linkIconColor: black,
      backgroundColor: black,
      foregroundColor: black,
    },

    confirm: {
      activateUser: {
        textColor: "#E06A1B",
        textColorError: red,
      },
      change: {
        titleColor: "#E06A1B",
      },
    },

    home: {
      logoColor: "rgba(255, 255, 255, 0.92)",
      textColorError: red,
    },

    payments: {
      linkColor: "#E06A1B",
      delayColor: "#F21C0E",
    },

    paymentsEnterprise: {
      background: black,

      buttonBackground: "#292929",

      linkColor: "#E06A1B",
      headerColor: orangePressed,
    },

    settings: {
      iconFill: white,
      headerTitleColor: "#FFFFFF",
      trashIcon: "#858585",
      article: {
        titleColor: "#c4c4c4",
        fillIcon: "#c4c4c4",
        expanderColor: "#c4c4c4",
      },

      separatorBorder: "1px solid #474747",

      security: {
        arrowFill: white,
        descriptionColor: "#858585",

        admins: {
          backgroundColor: black,
          backgroundColorWrapper: blueMain,
          roleColor: grayMid,

          color: "#E06A1B",
          departmentColor: "#858585",

          tooltipColor: "#F5E9BA",

          nameColor: grayMaxLight,
          pendingNameColor: "#858585",

          textColor: black,
          iconColor: blueMain,
        },

        owner: {
          backgroundColor: black,
          linkColor: "#E06A1B",
          departmentColor: "#858585",
          tooltipColor: "#F5E9BA",
        },
        auditTrail: {
          sideColor: "#858585",
          nameColor: "#eeeeee",
          downloadReportDescriptionColor: "#858585",
        },
        loginHistory: {
          sideColor: "#858585",
          nameColor: "#eeeeee",
        },
      },

      common: {
        linkColor: "#858585",
        linkColorHelp: "#E06A1B",
        tooltipLinkColor: "#e06a1b",
        arrowColor: white,
        descriptionColor: "#ADADAD",
        brandingDescriptionColor: "#858585",

        whiteLabel: {
          borderImg: "1px solid #474747",

          backgroundColorWhite: white,
          backgroundColorLight: "#F8F9F9",
          backgroundColorDark: "#282828",
          greenBackgroundColor: "#40865C",
          blueBackgroundColor: "#446995",
          orangeBackgroundColor: "#BE6650",
          redBackgroundColor: "#AA5251",

          dataFontColor: white,
          dataFontColorBlack: white,
        },
      },

      integration: {
        separatorBorder: "1px solid #474747",
        linkColor: "#E06A1B",

        sso: {
          textColor: grayDark,
          errorColor: darkErrorStatus,
          toggleContentBackground: "#474747",
          iconButton: white,
          iconButtonDisabled: "#333",
          border: "1px solid #474747",
        },

        smtp: {
          requirementColor: "#E06451",
        },
      },

      backup: {
        rectangleBackgroundColor: "#3D3D3D",
        separatorBorder: "1px solid #474747",
        warningColor: "#E06451",
        textColor: "#ADADAD",
        backupCheckedListItemBackground: "#3D3D3D",
      },

      payment: {
        priceColor: "#ADADAD",
        storageSizeTitle: "#A3A9AE",

        backgroundColor: "#282828",
        linkColor: "#316DAA",
        tariffText: "#858585",
        border: "1px solid #474747",
        backgroundBenefitsColor: "#3333",
        rectangleColor: "#3D3D3D",

        priceContainer: {
          backgroundText: "#3D3D3D",
          background: "#282828",
          border: "1px solid #282828",
          featureTextColor: "#858585",
          disableColor: "#858585",
          trackNumberColor: "#858585",
          disablePriceColor: "#5C5C5C",
        },

        benefitsContainer: {
          iconsColor: "#858585",
        },
        contactContainer: {
          textColor: "#ADADAD",
          linkColor: "#858585",
        },
        warningColor: "#E06451",
        color: "#E17415",
      },

      migration: {
        descriptionColor: "#ADADAD",
        subtitleColor: "#FFFFFF",
        workspaceBackground: "#333333",
        workspaceBorder: "1px solid #474747",
        stepDescriptionColor: "#FFFFFF",
        fileInputIconColor: "#5c5c5c",
        infoBlockBackground: "#282828",
        infoBlockTextColor: "#858585",
        errorTextColor: "#E06451",
        existingTextColor: "#3BA420",
        tableHeaderText: "#858585",
        tableRowHoverColor: "#3D3D3D",
        tableRowTextColor: "#858585",
        comboBoxLabelColor: "#FFFFFF",
        importSectionBackground: "#282828",
        importSectionTextColor: "#858585",
        importItemBackground: "#333333",
        importItemDisableBackground: "#3D3D3D",
        importItemTextColor: "#ADADAD",
        importItemDisableTextColor: "#5C5C5C",
        importItemDescription: "#A3A9AE",
        importIconColor: "#a9a9a9",
        groupMenuBackground: "#333333",
        groupMenuBorder: "1px solid #474747",
        groupMenuBoxShadow: "rgba(0, 0, 0, 0.16) 0px 5px 5px 0px",
      },
      storageManagement: {
        grayBackgroundText: "#858585",
        descriptionColor: "#ADADAD",
      },
    },

    wizard: {
      linkColor: "#E06A1B",
      generatePasswordColor: "#a9a9a9",
    },
  },

  campaignsBanner: {
    border: "1px solid #CCCCCC",
    color: darkBlack,

    btnColor: black,
    btnBackgroundActive: blueMain,
  },

  tileLoader: {
    border: `none`,

    background: "none",
  },

  errorContainer: {
    background: black,
    bodyText: "#858585",
  },

  editor: {
    color: "#eeeeee",
    background: black,
  },

  tabs: {
    gradientColor: black,
    lineColor: "#474747",

    textColorPrimary: "#ADADAD",
    activeTextColorPrimary: white,
    hoverTextColorPrimary: white,
    pressedTextColorPrimary: "#CCCCCC",
    backgroundColorPrimary: "#333",

    textColorSecondary: "#FFFFFF",
    activeTextColorSecondary: "#333333",

    backgroundColorSecondary: "#333",
    hoverBackgroundColorSecondary: "#474747",
    pressedBackgroundColorSecondary: "#282828",
    activeBackgroundColorSecondary: "#FFFFFF",
  },

  hotkeys: {
    key: {
      color: "#C4C4C4",
    },
  },

  tag: {
    color: white,
    deletedColor: "#A3A9AE",
    background: "#474747",
    hoverBackground: "#282828",
    disabledBackground: "#858585",
    deletedBackground: "#282828",
    defaultTagColor: white,
    newTagBackground: "#242424",
    newTagHoverBackground: "#3D3D3D",
  },

  profile: {
    main: {
      background: "#3D3D3D",
      textColor: white,

      descriptionTextColor: "#858585",
      pendingEmailTextColor: "#858585",

      mobileRowBackground: "#3D3D3D",
    },
    themePreview: {
      descriptionColor: "#ADADAD",
      border: "1px solid #474747",
    },
    notifications: {
      textDescriptionColor: "#858585",
    },
    activeSessions: {
      color: "#eeeeee",
      borderColor: "#474747",
      tickIconColor: "#3BA420",
      removeIconColor: "#A3A9AE",
      sortHeaderColor: "#474747",
      tableCellColor: "#858585",
      dividerColor: "#474747",
    },
  },

  formWrapper: {
    background: black,
    boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.16);",
  },

  preparationPortalProgress: {
    backgroundColor: "#282828",
    colorPercentSmall: "#FFFFFF",
    colorPercentBig: "#333333",
    errorTextColor: "#E06451",
    descriptionTextColor: "#858585",
  },

  codeInput: {
    background: "#282828",
    border: "1px solid #474747",
    color: white,
    lineColor: "#858585",
    disabledBackground: "#474747",
    disabledBorder: "1px solid #474747",
    disabledColor: "#858585",
  },

  accessRightSelect: {
    descriptionColor: "#858585",
  },

  itemIcon: {
    borderColor: "#474747",
  },

  invitePage: {
    borderColor: "#474747",
  },

  portalUnavailable: {
    textDescriptionColor: "#858585",
  },

  deepLink: {
    navBackground: "#282828",
    fileTileBackground: "#3D3D3D",
  },

  emailChips: {
    borderColor: "#858585",
    dashedBorder: "1px dashed #fff",
  },

  dialogs: {
    disableText: "#858585",
  },

  editLink: {
    text: {
      color: "#A3A9AE",
      errorColor: "#F21C0E",
    },
  },

  oformGallery: {
    errorView: {
      subHeaderTextColor: "#ADADAD",
    },
    submitToGalleryTile: {
      bodyText: "#ADADAD",
      closeIconFill: "#a9a9a9",
    },
  },

  infoBlock: {
    background: "#282828",
    headerColor: "#FFF",
    descriptionColor: "#ADADAD",
  },

  infoBar: {
    background: "#282828",
    title: white,
    description: "#ADADAD",
  },

  roomIcon: {
    backgroundArchive: "#FFFFFF",
    opacityBackground: "0.1",
  },

  plugins: {
    borderColor: "#474747",
    pluginName: "#A3A9AE",
    descriptionColor: "#ADADAD",
  },

  sdkPresets: {
    borderColor: "#474747",
    secondaryColor: "#ADADAD",
    previewBackgroundColor: "#3D3D3D",
  },

  sideBarRow: {
    titleColor: white,
    metaDataColor: grayDark,
  },

  dateTimePicker: {
    colorClockIcon: "#ADADAD",
  },

  embeddingPanel: {
    descriptionTextColor: "#ADADAD",
    iconColor: "#ADADAD",
  },
  completedForm: {
    linkColor: white,
    descriptionColor: globalColors.silverChalice,

    labelColor: globalColors.silverChalice,
    box: {
      background: globalColors.charlestonGreen,
    },
  },
};

export default Dark;
