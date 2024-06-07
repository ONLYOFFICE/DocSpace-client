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
  blueDisabled,
  blueDenim,

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
  veryDarkGrey,
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
    emailColor: gray,
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

  backgroundAndSubstrateColor: charlestonGreen,

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
      base: white,
      baseHover: white,
      baseActive: white,
      baseDisabled: "#474747",

      primary: white,
      primaryHover: white,
      primaryActive: white,
      primaryDisabled: white,
    },

    backgroundColor: {
      base: black,
      baseHover: black,
      baseActive: charlestonGreen,
      baseDisabled: charlestonGreen,

      primary: blueDenim,
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

      icon: grayDark,
    },

    buttonWrapper: {
      background: black,
      uploadingBackground: grayDarkMid,
    },

    buttonOptions: {
      backgroundColor: grayDarkMid,
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
    hoverConnectBackground: white,
    hoverConnectBorder: "none",

    activeBackground: charlestonGreen,
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
    color: grayDark,
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
      backgroundColor: grayDark,
    },
  },

  iconButton: { color: grayDark, hoverColor: grayMaxLight },
  selectorAddButton: {
    background: grayDarkMid,
    hoverBackground: charlestonGreen,
    activeBackground: grayDarkMid,

    iconColor: grayDark,
    iconColorHover: white,
    iconColorActive: silver,

    border: `none`,
    boxSizing: "border-box",
    borderRadius: "3px",
    height: " 32px",
    width: "32px",
    padding: "10px",
    color: grayDark,
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
    background: grayDarkMid,
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
      backgroundColor: grayDarkMid,
    },
  },

  checkbox: {
    fillColor: charlestonGreen,
    borderColor: "#474747",
    arrowColor: white,
    indeterminateColor: white,

    disableArrowColor: "#474747",
    disableBorderColor: "#545454",
    disableFillColor: "#545454",
    disableIndeterminateColor: "#474747",

    hoverBorderColor: grayDark,
    hoverIndeterminateColor: white,

    pressedBorderColor: "#474747",
    pressedFillColor: black,

    focusColor: grayDark,

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
    checkedFillColor: grayDark,
    fillColorDisabled: grayLight,
    disabledFillColor: grayLightMid,
    disabledFillColorInner: grayMid,
    hoverBorderColor: grayDark,
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
    color: black,
    backgroundColor: "#F59931",
    disableBackgroundColor: grayDark,
  },

  scrollbar: {
    bgColor: "rgba(20, 20, 20, 0.4)",
    hoverBgColor: "rgba(20, 20, 20, 0.64)",
    pressBgColor: "rgba(20, 20, 20, 0.8)",
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
        a: 0.4,
      },
      blur: 10,
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

    hoverBorderColor: grayDark,
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
    color: grayDark,
    disableColor: grayDark,

    tooltipTextColor: black,

    iconColor: "#646464",
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

    iconColor: "#646464",
    hoverIconColor: grayDark,
  },

  inputPhone: {
    activeBorderColor: blueMain,
    inactiveBorderColor: "#474747",
    errorBorderColor: "#f21c0e",
    backgroundColor: "#33333",
    color: white,
    scrollBackground: grayDark,
    placeholderColor: grayDark,
    dialCodeColor: grayDark,
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

    iconColor: grayDark,
    hoverIconColor: white,
  },

  textArea: {
    disabledColor: "#474747",

    focusBorderColor: grayMaxLight,
    focusErrorBorderColor: "#E06451",
    focusOutline: "none",

    scrollWidth: "100%",
    scrollHeight: "91px",

    numerationColor: grayDark,

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
      default: grayDark,
      hover: "#ADADAD",
      active: white,
      focus: white,
    },

    background: {
      default: "transparent",
      hover: "#474747",
      active: charlestonGreen,
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
    boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.40)",
    opacity: "1",
    padding: "8px 12px",
    pointerEvents: "auto",
    maxWidth: "340px",
    color: grayDarkMid,
    textColor: white,
    backgroundColor: charlestonGreen,

    before: {
      border: "none",
    },
    after: {
      border: "none",
    },
  },

  tabsContainer: {
    scrollbar: {
      width: "100%",
      height: "44px",
    },

    label: {
      height: " 30px",
      border: "1px solid #474747",
      borderRadius: "16px",
      minWidth: "fit-content",
      marginRight: "8px",
      width: "fit-content",

      backgroundColor: white,
      hoverBackgroundColor: "#474747",
      disableBackgroundColor: charlestonGreen,
      activeBackgroundColor: charlestonGreen,
      activeSelectedBackgroundColor:
        "linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18))",

      title: {
        padding: "4px 16px",
        overflow: "hidden",
        color: black,
        hoverColor: "#a4a4a4",
        disableColor: "#474747",
      },
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
        fill: grayDark,
      },
    },

    administrator: {
      fill: "#F59931",
      stroke: darkBlack,
      color: black,
    },

    guest: {
      fill: "#575757",
      stroke: darkBlack,
      color: black,
    },

    owner: {
      fill: "#EDC409",
      stroke: darkBlack,
      color: black,
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
      background: grayDarkMid,
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
        background: grayDarkMid,
        focusBackground: grayDarkMid,
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
        disabledBackground: blueDisabled,
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
        background: grayDarkMid,
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
        color: gray,
      },

      fillLower: {
        background: grayDarkMid,
        focusBackground: grayDarkMid,
        border: `1.4px solid #242424`,
        borderRadius: "11.2px",
      },

      fillUpper: {
        background: grayDarkMid,
        focusBackground: grayDarkMid,
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
        fill: grayDark,
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
    backgroundColor: "rgba(20, 20, 20, 0.8)",
    unsetBackgroundColor: "unset",
  },

  treeMenu: {
    disabledColor: "#5c5c5c",
  },

  treeNode: {
    background: veryDarkGrey,
    disableColor: grayDark,

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
    backgroundColor: grayDark,

    percent: {
      background: white,
    },
  },

  dropDown: {
    fontWeight: "600",
    fontSize: "13px",
    zIndex: "400",
    background: black,
    borderRadius: "6px",
    boxShadow: "0px 8px 16px 0px #040F1B29",
    // boxShadowMobile: "0px -4px 60px rgba(0, 0, 0, 0.25)",
    border: "1px solid #474747",
  },

  dropDownItem: {
    color: grayMaxLight,
    disableColor: gray,
    backgroundColor: black,
    hoverBackgroundColor: veryDarkGrey,
    hoverDisabledBackgroundColor: black,
    selectedBackgroundColor: charlestonGreen,
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
      colorStep_1: black,
      colorStep_2: black,
      colorStep_3: "#323032",
      colorStep_4: "#323032",
    },
    red: {
      colorStep_1: black,
      colorStep_2: black,
      colorStep_3: "#323032",
    },
    green: {
      colorStep_1: black,
      colorStep_2: black,
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

      color: grayDark,
      disabledColor: grayDark,
      background: "#292929",
      backgroundWithBorder: "none",
      backgroundModernView: "none",

      border: `1px solid #474747`,
      borderRadius: "3px",

      borderColor: "#474747",
      openBorderColor: grayMaxLight,

      disabledBorderColor: "#474747",
      disabledBackground: "#474747",

      hoverBorderColor: grayDark,
      hoverBorderColorOpen: grayMaxLight,
      hoverDisabledBorderColor: "#474747",

      hoverBackgroundModernView: "#474747",
      activeBackgroundModernView: charlestonGreen,
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
    hoverFillColorOff: veryDarkGrey,

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
      borderBottom: `1px solid #474747`,
    },

    bodyContent: {
      padding: "16px 0",
    },
  },

  calendar: {
    color: white,
    disabledColor: "#474747",
    pastColor: grayDark,
    onHoverBackground: veryDarkGrey,
    titleColor: "#ADADAD",
    outlineColor: "#474747",
    arrowColor: "#F6F9FC",
    disabledArrow: "#474747",
    weekdayColor: grayDark,
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
      fill: white,
    },

    headerBurgerColor: "#606060",

    verticalLine: "1px solid #474747",

    profile: {
      borderTop: "1px solid #474747",
      background: veryDarkGrey,
    },

    paymentAlert: {
      color: "#ed7309",
      warningColor: "#E06451",
    },

    teamTrainingAlert: {
      titleColor: white,
      borderColor: "#388BDE",
      linkColor: blueDenim,
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
      color: "#a9a9a9",
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
      backgroundColor: "#F58D31",

      size: "8px",
      position: "-4px",
    },
    trashIconFill: grayDark,
  },

  navigation: {
    expanderColor: grayMaxLight,
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
    productColor: grayMaxLight,
    height: "48px",
  },

  menuContainer: {
    background: veryDarkGrey,
    color: "rgba(255, 255, 255, 0.92)",
  },

  article: {
    background: "#292929",
    pinBorderColor: "#474747",
    catalogItemHeader: grayDark,
    catalogItemText: "rgba(255, 255, 255, 0.6)",
    catalogItemActiveBackground: black,
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
    sectionHeaderToggleIcon: grayDark,
    sectionHeaderToggleIconActive: "#c4c4c4",
    sectionHeaderToggleBg: "transparent",
    sectionHeaderToggleBgActive: "#292929",

    backgroundColor: black,
    blurColor: "rgba(20, 20, 20, 0.8)",
    borderColor: "#474747",
    thumbnailBorderColor: grayLightMid,
    textColor: white,
    errorColor: "#E06451",

    closeButtonWrapperPadding: "6px",
    closeButtonIcon: black,
    closeButtonSize: "12px",
    closeButtonBg: "#a2a2a2",

    links: {
      iconColor: grayDark,
      iconErrorColor: "#E06451",
      primaryColor: "#ADADAD",
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
    },

    history: {
      subtitleColor: gray,
      fileBlockBg: "#292929",
      dateColor: gray,
      fileExstColor: gray,
      locationIconColor: gray,
      folderLabelColor: gray,
    },

    details: {
      customLogoBorderColor: "#474747",
      commentEditorIconColor: grayMaxLight,
      tagBackground: grayDarkMid,
    },

    gallery: {
      borderColor: "#292929",
      descriptionColor: grayMaxLight,
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
      textColor: grayDark,
      color: "#5C5C5C",
      winHoverColor: "#3785D3",
      macHoverColor: white,
      linuxHoverColor: "#FFB800",
      androidHoverColor: "#9BD71C",
      iosHoverColor: white,
    },

    thirdPartyList: {
      color: "#818b91",
      linkColor: "#DDDDDD",
    },
    devTools: {
      border: "1px solid #474747",
      color: grayDark,
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

    sideInfoColor: grayDark,
    pendingSideInfoColor: "#5a5a5a",
  },

  filterInput: {
    button: {
      border: "1px solid #474747",
      hoverBorder: "1px solid #858585",

      openBackground: gray,

      openFill: grayMaxLight,
    },

    filter: {
      background: black,
      border: "1px solid #474747",
      color: gray,

      separatorColor: "#474747",
      indicatorColor: "#F58D31",

      selectedItem: {
        background: grayMaxLight,
        border: grayMaxLight,
        color: black,
      },
    },

    sort: {
      background: black,
      hoverBackground: "#292929",
      selectedViewIcon: "rgba(255, 255, 255, 0.88)",
      viewIcon: grayDark,
      sortFill: "rgba(255, 255, 255, 0.6)",

      tileSortFill: grayMaxLight,
      tileSortColor: grayMaxLight,
    },

    selectedItems: {
      background: grayDarkMid,
      hoverBackground: veryDarkGrey,
    },
  },

  profileInfo: {
    color: grayDark,
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
      textColor: grayDark,
      activeTextColor: grayDark,
      hoverTextColor: grayMaxLight,

      iconColor: grayDark,
      activeIconColor: grayDark,
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
      checkedBackground: veryDarkGrey,

      draggingBackground: "rgba(230, 211, 138, 0.12)",
      draggingHoverBackground: "rgba(204, 184, 102, 0.2)2",

      shareButton: {
        color: grayDark,
        fill: grayDark,
      },

      sideColor: grayDark,
      linkColor: grayMaxLight,
      textColor: grayDark,

      editingIconColor: grayMaxLight,
      shareHoverColor: grayMaxLight,
      pinColor: white,
    },

    tableView: {
      fileName: {
        linkColor: grayMaxLight,
        textColor: grayDark,
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

        backgroundActive: veryDarkGrey,

        borderImageCheckbox:
          "linear-gradient(to right, #474747 24px, #474747 24px)",
        borderImageContextMenu:
          "linear-gradient(to left, #474747 24px, #474747 24px)",

        borderHover: "#474747",
        sideColor: gray,

        shareHoverColor: grayMaxLight,

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
        checkedColor: veryDarkGrey,
        roomsCheckedColor: black,
        border: "1px solid #474747",
        backgroundBadgeColor: black,
        backgroundColor: charlestonGreen,
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
      textColor: grayDark,
    },

    animationColor: "rgba(82, 153, 224, 0.16)",
  },

  advancedSelector: {
    footerBorder: "1px solid #474747",

    hoverBackgroundColor: "#474747",
    selectedBackgroundColor: "#474747",
    borderLeft: "1px solid #474747",

    searcher: {
      hoverBorderColor: grayDark,
      focusBorderColor: grayMaxLight,
      placeholderColor: "#474747",
    },
  },

  selector: {
    border: `1px solid #474747`,

    breadCrumbs: {
      prevItemColor: "#ADADAD",
      arrowRightColor: "#ADADAD",
    },

    info: {
      backgroundColor: charlestonGreen,
      color: "#ADADAD",
    },

    bodyDescriptionText: grayDark,

    item: {
      hoverBackground: veryDarkGrey,
      selectedBackground: veryDarkGrey,

      inputButtonBorder: "#474747",
      inputButtonBorderHover: grayMaxLight,
    },

    emptyScreen: {
      descriptionColor: "#ADADAD",
      buttonColor: "#ADADAD",
      hoverButtonColor: white,
      pressedButtonColor: silver,
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
      descriptionColor: gray,
      textColor: grayDark,
    },

    roomType: {
      listItem: {
        background: "none",
        hoverBackground: charlestonGreen,
        borderColor: "#474747",
        descriptionText: gray,
      },
      dropdownButton: {
        background: "none",
        hoverBackground: charlestonGreen,
        borderColor: "#474747",
        isOpenBorderColor: "#F97A0B",
        descriptionText: gray,
      },
      dropdownItem: {
        background: black,
        hoverBackground: charlestonGreen,
        descriptionText: gray,
      },
      displayItem: {
        background: charlestonGreen,
        borderColor: charlestonGreen,
        descriptionText: gray,
      },
    },

    roomTypeDropdown: {
      desktop: {
        background: black,
        borderColor: "#474747",
      },
      mobile: {
        background: black,
      },
    },

    permanentSettings: {
      background: "#474747",
      isPrivateIcon: "#35ad17",
      descriptionColor: gray,
    },

    tagInput: {
      tagBackground: grayDarkMid,
      tagHoverBackground: veryDarkGrey,
    },

    dropdown: {
      background: black,
      borderColor: "#474747",
      item: {
        hoverBackground: charlestonGreen,
      },
    },

    isPrivate: {
      limitations: {
        background: "#474747",
        iconColor: "#ed7309",
        titleColor: "#ed7309",
        descriptionColor: gray,
        linkColor: "#e8e8e9",
      },
    },

    thirdpartyStorage: {
      combobox: {
        background: "#292929",
        dropdownBorderColor: "#474747",
        hoverDropdownBorderColor: grayDark,
        isOpenDropdownBorderColor: "#e8e8e9",
        arrowFill: "#474747",
      },
      folderInput: {
        background: "#292929",
        borderColor: "#474747",
        hoverBorderColor: grayDark,
        focusBorderColor: "#e8e8e9",
        rootLabelColor: gray,
        iconFill: "#657177",
      },
    },

    iconCropper: {
      gridColor: black,
      deleteButton: {
        background: "#292929",
        hoverBackground: black,
        borderColor: "#292929",
        hoverBorderColor: "#fafafa",
        color: grayDark,
        iconColor: "#e8e8e9",
      },
    },

    previewTile: {
      background: "#292929",
      borderColor: "#474747",
      iconBorderColor: grayLightMid,
    },

    dropzone: {
      borderColor: "#474747",
      linkMainColor: "#F97A0B",
      linkSecondaryColor: white,
      exstsColor: gray,
    },
  },

  filesThirdPartyDialog: {
    border: "1px solid #474747",
  },

  connectedClouds: {
    color: grayMaxLight,
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
      color: white,
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
      textAreaColor: grayDark,
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
      externalLinkSvg: grayMaxLight,

      internalLinkBorder: "1px dashed #eeeeee",

      itemBorder: "1px dashed #333333",

      itemOwnerColor: grayDark,

      backgroundButtons: black,

      dropdownColor: grayMaxLight,

      loader: {
        foregroundColor: black,
        backgroundColor: black,
      },
    },

    upload: {
      color: black,
      tooltipColor: "#F5E9BA",

      shareButton: {
        color: gray,
        sharedColor: grayMain,
      },

      loadingButton: {
        color: grayMaxLight,
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
      color: grayMaxLight,
    },
    hover: black,
    background: "none",
    svgFill: grayMaxLight,
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
    iconColor: grayDark,
    hoverIconColor: grayMaxLight,

    color: white,
    backgroundColor: black,

    badgeColor: black,
    badgeBackgroundColor: grayDark,
  },

  filesEditingWrapper: {
    color: grayMaxLight,
    border: "1px solid #474747",
    borderBottom: "1px solid #474747",

    tile: {
      background: globalColors.black,
      itemBackground: grayDarkMid,
      itemBorder: gray,
      itemActiveBorder: grayMaxLight,
    },

    row: {
      itemBackground: globalColors.black,
    },

    fill: grayDark,
    hoverFill: grayMaxLight,
  },

  filesIcons: {
    fill: grayDark,
    hoverFill: grayMaxLight,
  },

  filesQuickButtons: {
    color: grayDark,
    sharedColor: grayMaxLight,
    hoverColor: grayMaxLight,
  },

  filesSharedButton: {
    color: grayDark,
    sharedColor: grayMaxLight,
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
    textColor: grayDark,
    navBackground: charlestonGreen,
    headerColor: white,
    helpButton: graySilver,
    orLineColor: "#474747",
    orTextColor: grayDark,
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
      color: gray,
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
    color: grayDark,
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
    background: charlestonGreen,
  },

  client: {
    about: {
      linkColor: "#E06A1B",
      border: "1px solid #474747",
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
      headerTitleColor: white,
      trashIcon: grayDark,
      article: {
        titleColor: "#c4c4c4",
        fillIcon: "#c4c4c4",
        expanderColor: "#c4c4c4",
      },

      separatorBorder: "1px solid #474747",

      security: {
        arrowFill: white,
        descriptionColor: grayDark,

        admins: {
          backgroundColor: black,
          backgroundColorWrapper: blueMain,
          roleColor: grayMid,

          color: "#E06A1B",
          departmentColor: grayDark,

          tooltipColor: "#F5E9BA",

          nameColor: grayMaxLight,
          pendingNameColor: grayDark,

          textColor: black,
          iconColor: blueMain,
        },

        owner: {
          backgroundColor: black,
          linkColor: "#E06A1B",
          departmentColor: grayDark,
          tooltipColor: "#F5E9BA",
        },
        auditTrail: {
          sideColor: grayDark,
          nameColor: grayMaxLight,
          downloadReportDescriptionColor: grayDark,
        },
        loginHistory: {
          sideColor: grayDark,
          nameColor: grayMaxLight,
        },
      },

      common: {
        linkColor: grayDark,
        linkColorHelp: "#E06A1B",
        tooltipLinkColor: "#e06a1b",
        arrowColor: white,
        descriptionColor: grayDark,
        brandingDescriptionColor: grayDark,

        whiteLabel: {
          borderImg: "1px solid #474747",

          backgroundColorWhite: white,
          backgroundColorLight: grayLight,
          backgroundColorDark: charlestonGreen,
          greenBackgroundColor: "#40865C",
          blueBackgroundColor: "#446995",
          orangeBackgroundColor: "#AA5252",

          dataFontColor: white,
          dataFontColorBlack: white,
        },
      },

      integration: {
        separatorBorder: "1px solid #474747",
        linkColor: "#E06A1B",

        sso: {
          toggleContentBackground: "#474747",
          iconButton: white,
          iconButtonDisabled: black,
          border: "1px solid #474747",
        },

        smtp: {
          requirementColor: "#E06451",
        },
      },

      backup: {
        rectangleBackgroundColor: veryDarkGrey,
        separatorBorder: "1px solid #474747",
        warningColor: "#E06451",
        textColor: "#ADADAD",
        backupCheckedListItemBackground: veryDarkGrey,
      },

      payment: {
        priceColor: "#ADADAD",
        storageSizeTitle: gray,

        backgroundColor: charlestonGreen,
        linkColor: "#316DAA",
        tariffText: grayDark,
        border: "1px solid #474747",
        backgroundBenefitsColor: "#3333",
        rectangleColor: veryDarkGrey,

        priceContainer: {
          backgroundText: veryDarkGrey,
          background: charlestonGreen,
          border: "1px solid #282828",
          featureTextColor: grayDark,
          disableColor: grayDark,
          trackNumberColor: grayDark,
          disablePriceColor: "#5C5C5C",
        },

        benefitsContainer: {
          iconsColor: grayDark,
        },
        contactContainer: {
          textColor: "#ADADAD",
          linkColor: grayDark,
        },
        warningColor: "#E06451",
        color: "#E17415",
      },

      migration: {
        descriptionColor: "#ADADAD",
        subtitleColor: white,
        workspaceBackground: black,
        workspaceBorder: "1px solid #474747",
        stepDescriptionColor: white,
        fileInputIconColor: "#5c5c5c",
        infoBlockBackground: charlestonGreen,
        infoBlockTextColor: grayDark,
        errorTextColor: "#E06451",
        existingTextColor: "#3BA420",
        tableHeaderText: grayDark,
        tableRowHoverColor: veryDarkGrey,
        tableRowTextColor: grayDark,
        comboBoxLabelColor: white,
        importSectionBackground: charlestonGreen,
        importSectionTextColor: grayDark,
        importItemBackground: black,
        importItemDisableBackground: veryDarkGrey,
        importItemTextColor: "#ADADAD",
        importItemDisableTextColor: "#5C5C5C",
        importItemDescription: gray,
        importIconColor: "#a9a9a9",
        groupMenuBackground: black,
        groupMenuBorder: "1px solid #474747",
        groupMenuBoxShadow: "rgba(0, 0, 0, 0.16) 0px 5px 5px 0px",
      },
      storageManagement: {
        grayBackgroundText: grayDark,
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
    bodyText: grayDark,
  },

  editor: {
    color: grayMaxLight,
    background: black,
  },

  submenu: {
    lineColor: "#474747",
    backgroundColor: black,
    activeTextColor: white,
    textColor: "#ADADAD",
    bottomLineColor: "#E06A1B",
  },

  hotkeys: {
    key: {
      color: "#C4C4C4",
    },
  },

  tag: {
    color: white,
    background: "#474747",
    hoverBackground: charlestonGreen,
    disabledBackground: grayDark,
    defaultTagColor: white,
    newTagBackground: black,
  },

  profile: {
    main: {
      background: veryDarkGrey,
      textColor: white,

      descriptionTextColor: grayDark,
      pendingEmailTextColor: grayDark,

      mobileRowBackground: veryDarkGrey,
    },
    themePreview: {
      descriptionColor: "#ADADAD",
      border: "1px solid #474747",
    },
    notifications: {
      textDescriptionColor: grayDark,
    },
    activeSessions: {
      color: grayMaxLight,
      borderColor: "#474747",
      tickIconColor: "#3BA420",
      removeIconColor: gray,
      sortHeaderColor: "#474747",
      tableCellColor: grayDark,
      dividerColor: "#474747",
    },
  },

  formWrapper: {
    background: black,
    boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.16);",
  },

  preparationPortalProgress: {
    backgroundColor: charlestonGreen,
    colorPercentSmall: white,
    colorPercentBig: black,
    errorTextColor: "#E06451",
    descriptionTextColor: grayDark,
  },

  codeInput: {
    background: charlestonGreen,
    border: "1px solid #474747",
    color: white,
    lineColor: grayDark,
    disabledBackground: "#474747",
    disabledBorder: "1px solid #474747",
    disabledColor: grayDark,
  },

  accessRightSelect: {
    descriptionColor: grayDark,
  },

  itemIcon: {
    borderColor: "#474747",
  },

  invitePage: {
    borderColor: "#474747",
  },

  portalUnavailable: {
    textDescriptionColor: grayDark,
  },

  deepLink: {
    navBackground: charlestonGreen,
    fileTileBackground: veryDarkGrey,
  },

  emailChips: {
    borderColor: grayDark,
    dashedBorder: "1px dashed #fff",
  },

  dialogs: {
    disableText: grayDark,
  },

  editLink: {
    text: {
      color: gray,
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
    background: charlestonGreen,
    headerColor: white,
    descriptionColor: "#ADADAD",
  },

  infoBar: {
    background: charlestonGreen,
    title: white,
    description: "#ADADAD",
  },

  roomIcon: {
    backgroundArchive: white,
    opacityBackground: "0.1",
  },

  plugins: {
    borderColor: "#474747",
    pluginName: gray,
    descriptionColor: "#ADADAD",
  },

  sdkPresets: {
    borderColor: "#474747",
    secondaryColor: "#ADADAD",
    previewBackgroundColor: veryDarkGrey,
  },

  sideBarRow: {
    titleColor: white,
    metaDataColor: grayDark,
  },

  dateTimePicker: {
    colorClockIcon: "#ADADAD",
  },
};

export default Dark;
