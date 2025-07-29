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

import AvatarBaseReactSvgUrl from "PUBLIC_DIR/images/avatar.base.react.svg?url";

import { globalColors } from "./globalColors";
import { CommonTheme } from "./commonTheme";
import { zIndex as z } from "./zIndex";
import { DEFAULT_FONT_FAMILY } from "../constants";

export type TColorScheme = {
  id: number;
  main: {
    accent: string;
    buttons: string;
  };
  name: string;
  text: {
    accent: string;
    buttons: string;
  };
};

const {
  white,
  black,
  darkBlack,
  moonstone,
  grayLight,
  darkGrayLight,
  lightGrayHover,
  grayLightMid,
  grayDarkMid,
  lightGraySelected,
  grayStrong,
  gray,
  grayDark,
  lightGrayDark,
  grayText,
  grayDarkText,
  lightBlueMain,
  lightBlueMainHover,
  lightBlueMainDisabled,
  lightBlueMainPressed,
  lightSecondMain,
  lightSecondMainHover,
  lightSecondMainDisabled,

  mainGreen,
  mainRed,

  lightErrorStatus,
  favoritesStatus,
  lightStatusWarning,
  lightStatusPositive,

  lightIcons,
  link,
  blueLightMid,

  lightToastDone,
  lightToastInfo,
  lightToastAlert,
  lightToastWarning,

  dndColor,
  dndHoverColor,

  onWhiteColor,
  boxShadowColor,
  loaderLight,

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
  lightScroll,
  lightScrollHover,
  lightScrollActive,

  blurLight,
  lightBlueAction,
  lightActive,
  lightBlueHover,
} = globalColors;

export const getBaseTheme = () => {
  return {
    ...CommonTheme,

    isBase: true,
    color: black,
    backgroundColor: white,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: "13px",

    text: {
      color: black,
      disableColor: gray,
      emailColor: gray,
      fontWeight: "normal",
      fontWeightBold: "bold",

      secondary: {
        color: gray,
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
      color: black,
    },

    backgroundAndSubstrateColor: grayLight,

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
        extraSmall: "0 11.5px",
        small: "0 28px",
        normal: "0 28px",
        medium: "0 32px",
      },

      color: {
        base: black,
        baseHover: black,
        baseActive: black,
        baseDisabled: grayStrong,
        primary: white,
        primaryHover: white,
        primaryActive: white,
        primaryDisabled: white,
      },

      backgroundColor: {
        base: white,
        baseHover: white,
        baseActive: grayLightMid,
        baseDisabled: grayLight,

        primary: lightSecondMain,
        primaryHover: lightSecondMainHover,
        primaryActive: `linear-gradient(0deg, ${lightSecondMain}, ${lightSecondMain}),linear-gradient(0deg, ${onWhiteColor}, ${onWhiteColor})`,
        primaryDisabled: lightSecondMainDisabled,
      },

      border: {
        base: `1px solid ${globalColors.grayStrong}`,
        baseHover: `1px solid ${lightSecondMain}`,
        baseActive: `1px solid ${globalColors.grayStrong}`,
        baseDisabled: `1px solid ${globalColors.grayLightMid}`,

        primary: `1px solid ${lightSecondMain}`,
        primaryHover: `1px solid ${lightSecondMainHover}`,
        primaryActive: `1px solid linear-gradient(0deg, ${lightSecondMain}, ${lightSecondMain}),linear-gradient(0deg, ${onWhiteColor}, ${onWhiteColor})`,
        primaryDisabled: `1px solid ${lightSecondMainDisabled}`,
      },

      loader: {
        base: lightSecondMain,
        primary: white,
      },
    },

    helpButton: {
      width: "100%",
      backgroundColor: white,
      maxWidth: "500px",
      margin: "0",
      lineHeight: "56px",
      fontWeight: "700",
      padding: "0 16px 16px",
      bodyPadding: "16px 0",
    },

    mainButtonMobile: {
      textColor: lightGrayDark,

      buttonColor: lightStatusWarning,
      iconFill: white,

      circleBackground: white,

      mobileProgressBarBackground: grayStrong,

      bar: {
        icon: gray,
      },

      buttonWrapper: {
        background: white,
        uploadingBackground: grayLightMid,
      },

      buttonOptions: {
        backgroundColor: blueLightMid,
        color: white,
      },

      dropDown: {
        position: "fixed",
        right: "48px",
        bottom: "48px",

        width: "400px",

        zIndex: z.backdrop,

        mobile: {
          right: "32px",
          bottom: "40px",

          marginLeft: "24px",

          width: "calc(100vw - 64px)",
        },
        separatorBackground: white,

        buttonColor: white,
        hoverButtonColor: lightBlueMainPressed,

        backgroundActionMobile: blueLightMid,
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
        borderTop: "5px solid white",
        borderTopDisabled: `5px solid white`,
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

      border: `1px solid ${grayStrong}`,
      background: white,

      borderConnect: "none",
      connectBackground: lightIcons,

      disableBackgroundColor: grayLight,

      hoverBackground: white,
      hoverBorder: `1px solid ${lightSecondMain}`,
      hoverConnectBackground: link,
      hoverConnectBorder: "none",

      activeBorder: `1px solid ${grayStrong}`,
      activeBackground: grayLightMid,
      activeConnectBorder: "none",
      activeConnectBackground: blueLightMid,

      color: gray,
      disableColor: black,
      disabledSvgColor: "none",

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
        color: gray,
        hoverColor: black,
        connectColor: white,
      },

      svg: {
        margin: "11px 8px",
        width: "20px",
        height: "20px",
        minWidth: "20px",
        minHeight: "20px",
        fill: white,
      },
    },

    groupButton: {
      fontSize: "14px",
      lineHeight: "19px",
      color: black,
      disableColor: gray,
      float: "left",
      height: "19px",
      overflow: "hidden",
      padding: "0px",

      separator: {
        border: `1px solid ${globalColors.grayLightMid}`,
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
      background: white,
      boxShadow: `0px 10px 18px -8px ${menuShadow}`,
      height: "48px",
      tabletHeight: "56px",
      padding: "0 18px 19px 0",
      width: "100%",
      zIndex: z.sticky,
      marginTop: "1px",

      closeButton: {
        right: "11px",
        top: "6px",
        tabletTop: "10px",
        width: "20px",
        height: "20px",
        padding: "8px",
        hoverBackgroundColor: grayText,
        backgroundColor: grayStrong,
      },
    },

    iconButton: {
      color: gray,
      hoverColor: lightGrayDark,
    },
    selectorAddButton: {
      background: grayLightMid,
      hoverBackground: lightGraySelected,
      activeBackground: grayStrong,

      iconColor: lightGrayDark,
      iconColorHover: lightGrayDark,
      iconColorActive: lightGrayDark,

      border: `none`,
      boxSizing: "border-box",
      borderRadius: "3px",
      height: " 32px",
      width: "32px",
      padding: "10px",
      color: lightGrayDark,
      hoverColor: black,
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
      fillColor: white,
      borderColor: grayStrong,
      arrowColor: black,
      indeterminateColor: black,

      disableArrowColor: grayStrong,
      disableBorderColor: grayLightMid,
      disableFillColor: grayLight,
      disableIndeterminateColor: gray,

      hoverBorderColor: gray,
      hoverIndeterminateColor: black,

      pressedBorderColor: grayStrong,
      pressedFillColor: grayLightMid,

      focusColor: gray,

      errorColor: lightErrorStatus,
    },

    viewSelector: {
      fillColor: white,
      checkedFillColor: gray,
      fillColorDisabled: grayLight,
      disabledFillColor: grayLightMid,
      disabledFillColorInner: grayStrong,
      hoverBorderColor: gray,
      borderColor: grayStrong,
    },

    radioButton: {
      textColor: black,
      textDisableColor: gray,

      marginBeforeLabel: "8px",

      background: white,
      disableBackground: grayLight,

      fillColor: black,
      borderColor: grayStrong,

      disableFillColor: grayStrong,
      disableBorderColor: grayLightMid,

      hoverBorderColor: gray,
    },

    row: {
      minHeight: "47px",
      width: "100%",
      borderBottom: globalColors.grayLightMid,
      backgroundColor: globalColors.lightGrayHover,
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
        height: "19px",
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
      borderColor: globalColors.grayLightMid,
    },

    badge: {
      border: "1px solid transparent",
      padding: "1px",
      lineHeight: "0.8",
      overflow: "hidden",
      color: white,
      backgroundColor: lightStatusWarning,
      disableBackgroundColor: gray,
    },

    scrollbar: {
      bgColor: lightScroll,
      hoverBgColor: lightScrollHover,
      pressBgColor: lightScrollActive,
      paddingInlineEnd: "17px !important",
      paddingInlineEndMobile: "8px !important",
    },

    modalDialog: {
      backgroundColor: white,
      textColor: black,
      headerBorderColor: globalColors.grayLightMid,
      footerBorderColor: globalColors.grayLightMid,
      width: "auto",
      maxwidth: "560px",
      margin: " 0 auto",
      minHeight: "100%",

      colorDisabledFileIcons: lightGrayHover,

      backdrop: {
        backgroundRGBA: {
          r: 6,
          g: 22,
          b: 38,
          a: 0.2,
        },
        blur: 9,
      },

      content: {
        backgroundColor: white,
        modalPadding: "0 12px 12px",
        modalBorderRadius: "6px",
        asidePadding: "0 16px 16px",
        heading: {
          maxWidth: "calc(100% - 18px)",
          margin: "0",
          modalLineHeight: "40px",
          asideLineHeight: "56px",
          fontWeight: "700",
          asideFontSize: "21px",
          modalFontSize: "18px",
        },
      },

      closeButton: {
        fillColor: white,
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
      color: black,
      disableColor: grayStrong,

      backgroundColor: white,
      disableBackgroundColor: grayLight,

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

      borderColor: grayStrong,
      errorBorderColor: lightErrorStatus,
      warningBorderColor: lightStatusWarning,
      disabledBorderColor: grayLightMid,

      hoverBorderColor: gray,
      hoverErrorBorderColor: lightErrorStatus,
      hoverWarningBorderColor: lightStatusWarning,
      hoverDisabledBorderColor: grayLightMid,

      focusBorderColor: lightSecondMain,
      focusErrorBorderColor: lightErrorStatus,
      focusWarningBorderColor: lightStatusWarning,
      focusDisabledBorderColor: grayLightMid,
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
        background: white,

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
      disableColor: grayStrong,
      color: gray,

      iconColor: grayStrong,
      hoverIconColor: gray,

      hoverColor: gray,

      lineHeight: "32px",

      tooltipTextColor: black,

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

      iconColor: grayStrong,
      hoverIconColor: grayStrong,
    },

    textInput: {
      fontWeight: "normal",
      placeholderColor: gray,
      disablePlaceholderColor: grayStrong,

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

      borderColor: lightSecondMain,

      iconColor: gray,
      hoverIconColor: lightGrayDark,
    },

    textArea: {
      disabledColor: grayLight,

      focusBorderColor: lightSecondMain,
      focusErrorBorderColor: lightErrorStatus,
      focusOutline: "none",

      scrollWidth: "100%",
      scrollHeight: "91px",

      numerationColor: gray,

      copyIconFilter:
        "invert(71%) sepia(1%) saturate(1597%) hue-rotate(166deg) brightness(100%) contrast(73%)",
    },

    link: {
      color: black,
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
      disableColor: gray,

      svg: {
        opacity: "1",
        semiTransparentOpacity: "0.5",
      },

      text: { maxWidth: "100%" },

      span: { maxWidth: "300px" },

      expander: {
        iconColor: black,
      },

      color: {
        default: gray,
        hover: grayText,
        active: black,
        focus: black,
      },

      background: {
        default: "transparent",
        hover: grayLightMid,
        active: grayStrong,
        focus: lightGraySelected,
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
      color: white,
      textColor: black,
      backgroundColor: grayLight,

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
        color: lightErrorStatus,
      },
    },

    avatar: {
      defaultImage: `url("${AvatarBaseReactSvgUrl}")`,
      initialsContainer: {
        color: white,
        groupColor: black,
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
          max: "72px",
          groupBig: "23px",
        },
      },

      roleWrapperContainer: {
        right: {
          min: "-2px",
          small: "-2px",
          base: "-2px",
          medium: "-4px",
          big: "3px",
          max: "10px",
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
          max: "22px",
        },

        height: {
          min: "12px",
          medium: "16px",
          max: "22px",
        },
      },

      imageContainer: {
        backgroundImage: lightSecondMain,
        background: grayStrong,
        groupBackground: grayLightMid,
        borderRadius: "50%",
        height: "100%",

        svg: {
          display: "block",
          width: "50%",
          height: "100%",
          margin: "auto",
          fill: white,
        },
      },

      administrator: {
        fill: lightStatusWarning,
        stroke: darkBlack,
        color: white,
      },

      guest: {
        fill: lightIcons,
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
        fill: white,
        backgroundColor: blueLightMid,
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
        background: grayLightMid,
        color: gray,
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
        color: black,
        linkColor: link,
      },

      slider: {
        width: "100%",
        margin: "24px 0",
        backgroundColor: "transparent",

        runnableTrack: {
          background: grayLightMid,
          focusBackground: grayLightMid,
          border: `1.4px solid ${grayLightMid}`,
          borderRadius: "5.6px",
          width: "100%",
          height: "8px",
        },

        sliderThumb: {
          marginTop: "-9.4px",
          width: "24px",
          height: "24px",
          background: lightSecondMain,
          disabledBackground: lightSecondMainDisabled,
          borderWidth: "6px",
          borderStyle: "solid",
          borderColor: `${white}`,
          borderRadius: "30px",
          boxShadow: `0px 5px 20px ${popupShadow}`,
        },

        thumb: {
          width: "24px",
          height: "24px",
          background: lightSecondMain,
          border: `6px solid ${white}`,
          borderRadius: "30px",
          marginTop: "0px",
          boxShadow: `0px 5px 20px ${popupShadow}`,
        },

        rangeTrack: {
          background: grayLightMid,
          border: `1.4px solid ${grayLightMid}`,
          borderRadius: "5.6px",
          width: "100%",
          height: "8px",
        },

        rangeThumb: {
          width: "14px",
          height: "14px",
          background: lightSecondMain,
          border: `6px solid ${white}`,
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
          background: grayLightMid,
          focusBackground: grayLightMid,
          border: `1.4px solid ${grayLightMid}`,
          borderRadius: "11.2px",
        },

        fillUpper: {
          background: grayLightMid,
          focusBackground: grayLightMid,
          border: `1.4px solid ${grayLightMid}`,
          borderRadius: "11.2px",
        },
      },

      container: {
        miniPreview: {
          width: "160px",
          border: `1px solid ${grayLightMid}`,
          borderRadius: "6px",
          padding: "8px",
        },

        buttons: {
          height: "32px",
          background: gray,

          mobileWidth: "40px",
          mobileHeight: "100%",
          mobileBackground: "none",
        },

        button: {
          background: gray,
          fill: white,
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
      backgroundColor: blurLight,
      unsetBackgroundColor: "unset",
    },

    progressBar: {
      backgroundColor: lightGrayHover,

      animation: {
        background: lightBlueMain,
      },

      percent: {
        background: lightBlueMain,
      },

      color: {
        error: lightErrorStatus,
        status: black,
      },
    },

    dropDown: {
      fontWeight: "600",
      fontSize: "13px",
      zIndex: z.backdrop,
      background: white,
      borderRadius: "6px",
      boxShadow: `0px 8px 16px 0px ${boxShadowColor}`,
      border: "none",
    },

    dropDownItem: {
      color: black,
      disableColor: gray,
      backgroundColor: white,
      hoverBackgroundColor: grayLight,
      hoverDisabledBackgroundColor: white,
      selectedBackgroundColor: lightGrayHover,
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

        color: black,
        disableColor: black,
      },

      separator: {
        padding: "0px 16px",
        borderBottom: `1px solid ${globalColors.grayLightMid}`,
        margin: " 4px 16px 4px",
        lineHeight: "1px",
        height: "1px",
        width: "calc(100% - 32px)",
      },
    },

    toast: {
      active: {
        success: lightToastDone,
        error: lightToastWarning,
        info: lightToastInfo,
        warning: lightToastAlert,
      },
      hover: {
        success: lightToastDone,
        error: lightToastWarning,
        info: lightToastInfo,
        warning: lightToastAlert,
      },
      border: {
        success: "none",
        error: "none",
        info: "none",
        warning: "none",
      },

      zIndex: z.systemTop,
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
        boxShadow: `0px 10px 16px -12px ${popupShadow}`,
        maxHeight: "800px",
        overflow: "hidden",
        borderRadius: "6px",
        color: darkBlack,
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
          success: black,
          error: black,
          info: black,
          warning: black,
        },
      },

      text: {
        lineHeight: " 1.3",
        fontSize: "12px",
        color: black,
      },

      title: {
        fontWeight: "600",
        margin: "0",
        marginBottom: "5px",
        lineHeight: "16px",
        color: {
          success: darkBlack,
          error: darkBlack,
          info: darkBlack,
          warning: darkBlack,
        },
        fontSize: "12px",
      },

      closeButtonColor: black,
    },

    loader: {
      color: loaderLight,
      size: "40px",
      marginRight: "2px",
      borderRadius: "50%",
    },

    dialogLoader: {
      borderBottom: `1px solid ${loaderLight}`,
    },

    comboBox: {
      padding: "6px 0px",
      background: lightGraySelected,

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
        selectPaddingRight: "6px",

        color: black,
        disabledColor: grayStrong,
        background: white,
        backgroundWithBorder: "none",
        backgroundModernView: "none",

        border: `1px solid ${grayStrong}`,
        borderRadius: "3px",
        borderColor: lightSecondMain,
        openBorderColor: lightSecondMain,
        disabledBorderColor: grayLightMid,
        disabledBackground: grayLight,

        hoverBorderColor: gray,
        hoverBorderColorOpen: lightSecondMain,
        hoverDisabledBorderColor: grayLightMid,

        hoverBackgroundModernView: grayLightMid,
        activeBackgroundModernView: grayStrong,
        focusBackgroundModernView: lightGraySelected,
      },

      label: {
        marginRightWithBorder: "13px",
        marginRight: "4px",

        disabledColor: grayStrong,
        color: black,
        alternativeColor: gray,
        selectedColor: black,
        maxWidth: "175px",

        lineHeightWithoutBorder: "16px",
        lineHeightTextDecoration: "underline dashed",
      },

      childrenButton: {
        marginRight: "8px",
        width: "16px",
        height: "16px",

        defaultDisabledColor: grayStrong,
        defaultColor: gray,
        disabledColor: grayStrong,
        color: black,
        selectedColor: black,
      },

      plusBadge: {
        color: white,
        bgColor: gray,
        selectedBgColor: lightGrayDark,
      },
    },

    toggleContent: {
      headingHeight: "24px",
      headingLineHeight: "26px",
      hoverBorderBottom: "1px dashed",
      contentPadding: "10px 0px 0px 0px",
      arrowMargin: "4px 8px 4px 0px",
      transform: "rotate(180deg)",
      iconColor: black,

      childrenContent: {
        color: black,
        paddingTop: "6px",
      },
    },

    toggleButton: {
      fillColorDefault: lightBlueMain,
      fillColorOff: grayStrong,
      hoverFillColorOff: gray,
      fillCircleColor: white,
      fillCircleColorOff: white,
    },

    contextMenuButton: {
      content: {
        width: "100%",
        backgroundColor: white,
        padding: "0 16px 16px",
      },

      headerContent: {
        maxWidth: "500px",
        margin: "0",
        lineHeight: "56px",
        fontWeight: "700",
        borderBottom: `1px solid ${grayStrong}`,
      },

      bodyContent: {
        padding: "16px 0",
      },
    },

    calendar: {
      containerBorderColor: white,

      color: black,
      disabledColor: lightGraySelected,
      pastColor: gray,
      onHoverBackground: lightGrayHover,
      titleColor: grayText,
      outlineColor: grayLightMid,
      arrowColor: grayText,
      disabledArrow: gray,
      weekdayColor: gray,
      accent: lightBlueMain,
      boxShadow: `0px 12px 40px ${popupShadow}`,
    },

    datePicker: {
      width: "115px",
      dropDownPadding: "16px 16px 16px 17px",
      contentPadding: "0 16px 16px",
      bodyPadding: "16px 0",
      backgroundColor: white,
      inputBorder: lightSecondMain,
      iconPadding: "8px 8px 7px 0px",

      contentMaxWidth: "500px",
      contentLineHeight: "56px",
      contentFontWeight: "700",

      borderBottom: `1px solid ${grayStrong}`,
    },

    aside: {
      backgroundColor: white,
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
      acceptBackground: dndHoverColor,
      background: dndColor,
    },

    catalog: {
      background: grayLight,

      header: {
        borderBottom: `1px solid ${grayLightMid}`,
        iconFill: lightGrayDark,
      },
      control: {
        fill: white,
      },

      headerBurgerColor: lightGrayDark,

      verticalLine: `1px solid ${grayLightMid}`,

      profile: {
        borderTop: `1px solid ${grayLightMid}`,
        background: lightGrayHover,
      },

      paymentAlert: {
        color: lightStatusWarning,
        warningColor: lightErrorStatus,
      },
    },

    alertComponent: {
      descriptionColor: grayText,
      iconColor: lightGrayDark,
    },

    catalogItem: {
      header: {
        color: gray,
        background: grayStrong,
      },
      container: {
        width: "100%",
        height: "36px",
        padding: "0 12px",
        marginBottom: "16px",
        background: white,
        tablet: {
          height: "44px",
          padding: "0 12px",
          marginBottom: "24px",
        },
      },
      sibling: {
        active: {
          background: lightGraySelected,
        },
        hover: {
          background: grayLightMid,
        },
      },
      img: {
        svg: {
          width: "16px",
          height: "16px",

          fill: lightGrayDark,
          isActiveFill: lightBlueMain,
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
        color: grayText,
        isActiveColor: lightBlueMain,
        fontSize: "13px",
        fontWeight: 600,
        tablet: {
          marginLeft: "12px",
          lineHeight: "20px",
          fontSize: "15px",
          fontWeight: "600",
        },
      },
      initialText: {
        color: white,
        width: "16px",
        lineHeight: "11px",
        fontSize: "11px",
        fontWeight: "bold",
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
        backgroundColor: lightStatusWarning,

        size: "8px",
        position: "-4px",
      },
      trashIconFill: gray,
    },

    navigation: {
      expanderColor: black,
      background: white,
      rootFolderTitleColor: gray,
      boxShadow: `0px 8px 16px 0px ${boxShadowColor}`,
      lifetimeIconFill: mainRed,
      lifetimeIconStroke: mainRed,

      icon: {
        fill: link,
        stroke: lightGraySelected,
      },
    },

    nav: {
      backgroundColor: lightBlueMain,
    },

    navItem: {
      baseColor: lightSecondMain,
      activeColor: white,
      separatorColor: lightSecondMainHover,

      wrapper: {
        hoverBackground: lightBlueMainHover,
      },
    },

    header: {
      backgroundColor: grayLight,
      recoveryColor: lightGrayDark,
      linkColor: lightGrayDark,
      productColor: white,
      height: "48px",
    },

    menuContainer: {
      background: lightGrayHover,
      color: black,
    },

    article: {
      background: grayLight,
      pinBorderColor: grayLightMid,
      catalogItemHeader: gray,
      catalogItemText: grayText,
      catalogItemActiveBackground: lightGraySelected,
      catalogShowText: lightGrayDark,
    },

    section: {
      header: {
        backgroundColor: white,
        background: `linear-gradient(180deg, ${white} 2.81%,${grayDarkText} 63.03%,rgba(255, 255, 255, 0) 100%)`,
        trashErasureLabelBackground: grayLight,
        trashErasureLabelText: grayText,
      },
    },

    infoPanel: {
      sectionHeaderToggleIcon: gray,
      sectionHeaderToggleIconActive: lightIcons,
      sectionHeaderToggleBg: "transparent",
      sectionHeaderToggleBgActive: grayLight,

      backgroundColor: white,
      blurColor: blurLight,
      borderColor: grayLightMid,
      thumbnailBorderColor: grayLightMid,
      textColor: black,
      errorColor: lightErrorStatus,

      closeButtonWrapperPadding: "0px",
      closeButtonIcon: white,
      closeButtonSize: "17px",

      nameColor: grayDark,
      avatarColor: grayText,

      links: {
        color: lightBlueMain,
        iconColor: lightIcons,
        iconErrorColor: lightErrorStatus,
        primaryColor: grayText,
        barIconColor: lightGrayDark,
      },

      members: {
        iconColor: gray,
        iconHoverColor: lightGrayDark,
        isExpectName: gray,
        subtitleColor: gray,
        meLabelColor: gray,
        roleSelectorColor: gray,
        disabledRoleSelectorColor: gray,
        roleSelectorArrowColor: gray,
        createLink: black,
        linkAccessComboboxExpired: gray,
        crossFill: lightGrayDark,
      },

      history: {
        subtitleColor: gray,
        fileBlockBg: grayLight,
        dateColor: gray,
        fileExstColor: gray,
        locationIconColor: gray,
        folderLabelColor: gray,
        renamedItemColor: gray,
        oldRoleColor: lightGrayDark,
        messageColor: black,
        itemBorderColor: grayLightMid,
        fileBackgroundColor: lightGraySelected,
      },

      details: {
        customLogoBorderColor: grayLightMid,
        commentEditorIconColor: black,
        tagBackground: grayLightMid,
      },

      gallery: {
        borderColor: grayStrong,
        descriptionColor: lightGrayDark,
      },

      search: {
        boxShadow: `0px 5px 20px 0px ${menuShadow}`,
      },

      groups: {
        textColor: gray,
        tagColor: grayStrong,
      },

      expired: {
        color: grayText,
      },
    },

    filesArticleBody: {
      background: lightGraySelected,
      panelBackground: lightGraySelected,

      fill: lightGrayDark,
      expanderColor: "dimgray",
      downloadAppList: {
        textColor: gray,
        color: gray,
        winHoverColor: windowsColor,
        macHoverColor: darkBlack,
        linuxHoverColor: linuxColor,
        androidHoverColor: androidColor,
        iosHoverColor: darkBlack,
      },
      devTools: {
        border: `1px solid ${lightGraySelected}`,
        color: gray,
      },
    },

    peopleArticleBody: {
      iconColor: lightGrayDark,
      expanderColor: "dimgray",
    },

    peopleTableRow: {
      nameColor: black,
      pendingNameColor: gray,

      sideInfoColor: gray,
      pendingSideInfoColor: grayStrong,
    },

    filterInput: {
      button: {
        border: `1px solid ${grayStrong}`,
        hoverBorder: `1px solid ${gray}`,

        openBackground: gray,

        openFill: white,
      },

      filter: {
        background: white,
        border: `1px solid ${grayLightMid}`,
        color: gray,

        separatorColor: grayLightMid,
        indicatorColor: lightStatusWarning,

        selectedItem: {
          background: blueLightMid,
          border: blueLightMid,
          color: white,
        },
      },

      sort: {
        background: white,
        hoverBackground: grayLight,
        selectedViewIcon: lightGraySelected,
        viewIcon: gray,
        sortFill: lightGrayDark,

        tileSortFill: black,
        tileSortColor: black,
      },

      selectedItems: {
        background: grayLightMid,
        hoverBackground: lightGrayHover,
      },
    },

    updateUserForm: {
      tooltipTextColor: black,
      borderTop: `1px solid ${grayLightMid}`,
    },

    tableContainer: {
      borderRight: `2px solid ${grayStrong}`,
      hoverBorderColor: lightGrayDark,
      tableCellBorder: `1px solid ${grayLightMid}`,

      indexingSeparator: lightBlueMain,

      groupMenu: {
        background: white,
        borderBottom: "1px solid transparent",
        borderRight: `1px solid ${grayStrong}`,
        boxShadow: `0px 5px 20px ${menuShadow}`,
      },

      header: {
        background: white,
        borderBottom: `1px solid ${grayLightMid}`,
        textColor: gray,
        activeTextColor: lightGrayDark,
        hoverTextColor: lightGrayDark,

        iconColor: gray,
        activeIconColor: lightGrayDark,
        hoverIconColor: lightGrayDark,

        borderImageSource: `linear-gradient(to right,${white} 21px,${grayLightMid} 21px,${grayLightMid} calc(100% - 20px),${white} calc(100% - 20px))`,
        borderHoverImageSource: `linear-gradient(to right,${white} 0px,${grayLightMid} 0px,${grayLightMid} 100% ,${white} 100%)`,

        lengthenBorderImageSource: `linear-gradient(to right, ${grayLightMid}, ${grayLightMid})`,
        hotkeyBorderBottom: `1px solid ${lightSecondMain}`,

        settingsIconDisableColor: grayStrong,
      },

      tableCell: {
        border: `1px solid ${grayLightMid}`,
      },
    },

    filesSection: {
      rowView: {
        checkedBackground: lightGrayHover,

        draggingBackground: dndColor,
        draggingHoverBackground: dndHoverColor,

        shareButton: {
          color: lightGrayDark,
          fill: lightGrayDark,
        },

        sideColor: gray,
        linkColor: black,
        textColor: gray,

        editingIconColor: lightIcons,
        shareHoverColor: lightIcons,
        pinColor: lightIcons,
      },

      tableView: {
        fileName: {
          linkColor: black,
          textColor: gray,
        },
        fileExstColor: gray,

        row: {
          checkboxChecked: `linear-gradient(to right, ${lightGrayHover} 24px, ${grayLightMid} 24px)`,
          checkboxDragging: `linear-gradient(to right, ${dndColor} 24px, ${grayLightMid} 24px)`,
          checkboxDraggingHover: `linear-gradient(to right, ${dndHoverColor} 24px, ${grayLightMid} 24px)`,

          contextMenuWrapperChecked: `linear-gradient(to left, ${lightGrayHover} 24px, ${grayLightMid} 24px)`,
          contextMenuWrapperDragging: `border-image-source: linear-gradient(to left, ${dndColor} 24px, ${grayLightMid} 24px)`,
          contextMenuWrapperDraggingHover: `linear-gradient(to left, ${dndHoverColor} 24px,${grayLightMid} 24px)`,

          backgroundActive: lightGrayHover,
          indexUpdate: lightActive,
          indexActive: lightBlueAction,

          indexBackgroundButtonHover: lightBlueHover,
          indexArrowButtonHover: lightBlueMain,

          borderImageCheckbox: `linear-gradient(to right, ${white} 24px, ${grayLightMid} 24px)`,
          borderImageContextMenu: `linear-gradient(to left, ${white} 24px, ${grayLightMid} 24px)`,

          borderHover: gray,
          sideColor: gray,
          shareHoverColor: lightIcons,

          borderImageRight: `linear-gradient(to right, ${white} 25px, ${grayLightMid} 24px)`,
          borderImageLeft: `linear-gradient(to left, ${white} 24px, ${grayLightMid} 24px)`,

          borderColor: grayLightMid,
          borderColorTransition: lightGrayHover,

          color: black,
          backgroundGroup: grayLightMid,
        },
      },

      tilesView: {
        tile: {
          draggingColor: dndColor,
          draggingHoverColor: dndHoverColor,
          checkedColor: lightGrayHover,
          roomsCheckedColor: lightGrayHover,
          border: `1px solid ${grayStrong}`,
          backgroundBadgeColor: white,
          backgroundColor: white,
          borderRadius: "6px",
          roomsBorderRadius: "12px",
          bottomBorderRadius: "0 0 6px 6px",
          roomsBottomBorderRadius: "0 0 12px 12px",
          upperBorderRadius: "6px 6px 0 0",
          roomsUpperBorderRadius: "12px 12px 0 0",
          backgroundColorTop: white,
        },

        tag: {
          backgroundColor: white,
          hoverBackgroundColor: grayStrong,
          activeBackgroundColor: grayLight,
        },

        sideColor: black,
        color: black,
        textColor: gray,
        subTextColor: "#657077",
      },

      animationColor: lightSecondMain,
    },

    advancedSelector: {
      footerBorder: `1px solid ${grayLightMid}`,

      hoverBackgroundColor: grayLightMid,
      selectedBackgroundColor: grayLightMid,
      borderLeft: `1px solid ${grayLightMid}`,

      searcher: {
        hoverBorderColor: grayStrong,
        focusBorderColor: lightSecondMain,
        placeholderColor: gray,
      },
    },

    selector: {
      border: `1px solid ${grayLightMid}`,

      breadCrumbs: {
        prevItemColor: lightGrayDark,
        arrowRightColor: lightGrayDark,
      },

      info: {
        backgroundColor: grayLight,
        color: grayText,
      },

      bodyDescriptionText: gray,

      item: {
        hoverBackground: grayLight,
        selectedBackground: lightGrayHover,

        inputButtonBorder: grayStrong,
        inputButtonBorderHover: lightGrayDark,

        disableTextColor: gray,
      },

      emptyScreen: {
        descriptionColor: grayText,

        buttonColor: lightGrayDark,
        hoverButtonColor: black,
        pressedButtonColor: grayText,
      },
    },

    floatingButton: {
      backgroundColor: lightIcons,
      color: white,
      boxShadow: `0px 5px 20px ${popupShadow}`,
      fill: white,

      alert: {
        fill: "",
        path: "",
      },
    },

    createEditRoomDialog: {
      commonParam: {
        descriptionColor: gray,
        textColor: lightGrayDark,
      },

      roomType: {
        listItem: {
          background: "none",
          hoverBackground: grayLight,
          borderColor: grayLightMid,
          descriptionText: gray,
        },
        dropdownButton: {
          background: "none",
          hoverBackground: grayLight,
          borderColor: grayLightMid,
          descriptionText: gray,
        },
        dropdownItem: {
          background: white,
          hoverBackground: grayLight,
          descriptionText: gray,
        },
        displayItem: {
          background: grayLight,
          borderColor: grayLight,
          descriptionText: grayText,
        },
      },

      roomTypeDropdown: {
        desktop: {
          background: white,
          borderColor: grayStrong,
        },
        mobile: {
          background: white,
        },
      },

      permanentSettings: {
        background: grayLight,
        isPrivateIcon: lightStatusPositive,
        descriptionColor: grayText,
      },

      dropdown: {
        background: white,
        borderColor: grayStrong,
        item: {
          hoverBackground: lightGrayHover,
        },
      },

      isPrivate: {
        limitations: {
          background: grayLight,
          iconColor: lightStatusWarning,
          titleColor: lightStatusWarning,
          descriptionColor: grayText,
          linkColor: grayText,
        },
      },

      thirdpartyStorage: {
        combobox: {
          background: white,
          dropdownBorderColor: grayStrong,
          hoverDropdownBorderColor: gray,
          isOpenDropdownBorderColor: lightSecondMain,
          arrowFill: gray,
        },
        folderInput: {
          background: white,
          borderColor: grayStrong,
          hoverBorderColor: gray,
          rootLabelColor: gray,
          iconFill: lightGrayDark,
        },
      },

      iconCropper: {
        gridColor: grayStrong,
        deleteButton: {
          background: grayLight,
          hoverBackground: lightGrayHover,
          borderColor: grayLight,
          hoverBorderColor: lightGrayHover,
          color: grayText,
          hoverColor: grayText,
          iconColor: lightGrayDark,
        },
      },

      previewTile: {
        background: white,
        borderColor: grayStrong,
        iconBorderColor: grayLightMid,
      },

      dropzone: {
        borderColor: grayLightMid,
        linkMainColor: link,
        linkSecondaryColor: black,
        exstsColor: gray,
      },
      helpButton: {
        background: gray,
        fill: white,
      },
    },

    createEditGroupDialog: {
      textColor: gray,
      iconFill: gray,
    },

    filesThirdPartyDialog: {
      border: `1px solid ${grayStrong}`,
    },

    connectedClouds: {
      color: lightGrayDark,
      borderBottom: `1px solid ${grayLightMid}`,
      borderRight: `1px solid ${grayStrong}`,
    },

    filesModalDialog: {
      border: `1px solid lightgray`,
    },

    filesDragTooltip: {
      background: white,
      boxShadow: `0px 5px 20px ${popupShadow}`,
      color: gray,
    },

    filesEmptyContainer: {
      linkColor: grayText,
      privateRoom: {
        linkColor: link,
      },
      descriptionColor: lightGrayDark,
    },

    emptyContent: {
      header: {
        color: black,
      },

      description: {
        color: grayText,
      },
      button: {
        colorLink: lightGrayDark,
        colorText: grayText,
      },
    },

    emptyView: {
      link: {
        color: lightBlueMain,
        background: white,
        hoverBackground: lightGrayHover,
        PressedBackground: lightGraySelected,
      },

      items: {
        hoverColor: grayLight,
        pressColor: lightGraySelected,
      },
    },

    filesPanels: {
      color: black,

      aside: {
        backgroundColor: white,
      },

      addGroups: {
        iconColor: gray,
        arrowColor: darkBlack,
      },

      addUsers: {
        iconColor: gray,
        arrowColor: darkBlack,
        textColor: gray,
      },

      changeOwner: {
        iconColor: gray,
        arrowColor: darkBlack,
      },

      embedding: {
        textAreaColor: gray,
        iconColor: black,
        color: gray,
        border: `1px solid ${grayDarkMid}`,
        linkBackground: blueLightMid,
        linkColor: white,
      },

      versionHistory: {
        borderTop: `1px solid ${grayLightMid}`,
      },

      content: {
        backgroundColor: white,
        fill: gray,
        disabledFill: grayStrong,
      },

      body: {
        backgroundColor: grayLightMid,
        fill: black,
      },

      footer: {
        backgroundColor: white,
        borderTop: `1px solid ${grayLightMid}`,
      },

      linkRow: {
        backgroundColor: grayLight,
        fill: gray,
        disabledFill: grayStrong,
      },

      selectFolder: {
        color: gray,
      },

      filesList: {
        color: gray,
        backgroundColor: grayLightMid,
        borderBottom: `1px solid ${grayLightMid}`,
      },

      modalRow: {
        backgroundColor: grayLightMid,
        fill: gray,
        disabledFill: grayStrong,
      },

      sharing: {
        color: gray,
        fill: gray,
        loadingFill: grayStrong,

        borderBottom: `1px solid ${grayLightMid}`,
        borderTop: `1px solid ${grayLightMid}`,
        externalLinkBackground: grayLight,
        externalLinkSvg: black,

        internalLinkBorder: `1px dashed ${black}`,

        itemBorder: `1px dashed ${black}`,

        itemOwnerColor: gray,

        backgroundButtons: white,

        dropdownColor: black,

        loader: {
          foregroundColor: grayLight,
          backgroundColor: grayLight,
        },
      },

      upload: {
        color: gray,
        tooltipColor: lightToastInfo,
        iconColor: lightErrorStatus,
        positiveStatusColor: lightStatusPositive,
        progressColor: lightGrayDark,
        shareButton: {
          color: gray,
          sharedColor: lightGrayDark,
        },

        loadingButton: {
          color: lightSecondMain,
          background: white,
          defaultBackground: gray,
          hoverColor: lightGrayDark,
        },
      },
      invite: {
        textColor: gray,
        addButtonColor: lightBlueMain,
        border: `1px solid ${grayStrong}`,
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
        borderBottom: `1px solid ${grayLightMid} !important`,
        margin: "6px 16px !important",
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
        color: black,
      },
      hover: grayLight,
      background: "none",
      svgFill: black,
      header: {
        height: "55px",
        borderBottom: `1px solid ${grayLightMid}`,
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
      background: white,
      borderRadius: "6px",
      mobileBorderRadius: "6px 6px 0 0",
      boxShadow: `0px 8px 16px 0px ${boxShadowColor}`,
      border: "none",
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

      linkColor: black,
    },

    filesBadges: {
      iconColor: gray,
      hoverIconColor: lightIcons,

      color: white,
      backgroundColor: white,

      badgeColor: white,
      badgeBackgroundColor: gray,
    },

    accountsBadges: {
      pendingColor: gray,
      disabledColor: lightErrorStatus,
    },

    filesEditingWrapper: {
      color: black,
      border: `1px solid ${grayStrong}`,
      borderBottom: `1px solid ${grayLightMid}`,

      tile: {
        background: globalColors.lightGrayHover,
        itemBackground: white,
        itemBorder: grayStrong,
        itemActiveBorder: lightSecondMain,
      },

      row: {
        itemBackground: white,
      },

      fill: gray,
      hoverFill: lightGrayDark,
      disabledBackground: white,
    },

    filesIcons: {
      fill: lightIcons,
      hoverFill: lightIcons,
    },

    filesQuickButtons: {
      color: gray,
      sharedColor: lightIcons,
      hoverColor: lightIcons,
    },

    filesSharedButton: {
      color: gray,
      sharedColor: lightGrayDark,
    },

    filesPrivateRoom: {
      borderBottom: `1px solid ${grayLightMid}`,
      linkColor: link,
      textColor: grayText,
    },

    filesVersionHistory: {
      row: {
        color: gray,
        fill: black,
      },

      badge: {
        color: white,
        stroke: gray,
        fill: gray,
        defaultFill: white,
        badgeFill: lightStatusWarning,
      },

      versionList: {
        fill: grayStrong,
        stroke: grayStrong,
        color: grayStrong,
      },

      versionDisabled: {
        fillDisabled: grayStrong,
      },

      versionLink: {
        color: gray,
      },
      commentColor: gray,
    },

    login: {
      linkColor: link,
      textColor: gray,
      navBackground: grayLight,
      headerColor: black,
      helpButton: gray,
      orLineColor: grayLightMid,
      orTextColor: gray,
      titleColor: black,

      register: {
        backgroundColor: grayLight,
        textColor: link,
      },

      container: {
        backgroundColor: grayLightMid,
      },

      captcha: {
        border: `1px solid ${lightErrorStatus}`,
        color: lightErrorStatus,
      },

      backTitle: {
        color: gray,
      },
    },

    peopleSelector: {
      textColor: gray,
    },

    peopleWithContent: {
      color: gray,
      pendingColor: grayStrong,
    },

    peopleDialogs: {
      modal: {
        border: `1px solid ${gray}`,
      },

      deleteUser: {
        textColor: lightErrorStatus,
      },

      deleteSelf: {
        linkColor: link,
      },

      changePassword: {
        linkColor: link,
      },
    },

    downloadDialog: {
      background: grayLight,
      textColor: gray,
      iconFill: black,
      warningColor: lightErrorStatus,
    },

    client: {
      about: {
        linkColor: lightSecondMain,
        border: `1px solid ${gray}`,
        logoColor: black,
      },

      comingSoon: {
        linkColor: grayText,
        linkIconColor: black,
        backgroundColor: white,
        foregroundColor: white,
      },

      confirm: {
        activateUser: {
          textColor: link,
          textColorError: lightErrorStatus,
        },
        change: {
          titleColor: link,
        },
      },

      home: {
        logoColor: black,
        textColorError: lightErrorStatus,
      },

      payments: {
        linkColor: link,
        delayColor: lightErrorStatus,
      },

      settings: {
        iconFill: black,
        headerTitleColor: black,
        descriptionColor: grayText,
        trashIcon: gray,
        article: {
          titleColor: lightGrayDark,
          fillIcon: "dimgray",
          expanderColor: "dimgray",
        },

        separatorBorder: `1px solid ${grayLightMid}`,

        security: {
          arrowFill: black,
          descriptionColor: grayText,

          tfa: {
            textColor: gray,
          },

          admins: {
            backgroundColor: black,
            backgroundColorWrapper: lightSecondMain,
            roleColor: grayStrong,

            color: link,
            departmentColor: gray,

            tooltipColor: lightToastInfo,

            nameColor: black,
            pendingNameColor: gray,

            textColor: white,
            iconColor: lightSecondMain,
          },

          owner: {
            backgroundColor: grayLight,
            linkColor: link,
            departmentColor: gray,
            tooltipColor: lightToastInfo,
          },
          auditTrail: {
            sideColor: gray,
            nameColor: black,
            downloadReportDescriptionColor: gray,
          },
          loginHistory: {
            sideColor: gray,
            nameColor: black,
            textColor: gray,
            subheaderColor: lightGrayDark,
          },
          ip: {
            errorColor: lightErrorStatus,
          },
        },

        common: {
          linkColor: gray,
          linkColorHelp: link,
          tooltipLinkColor: black,
          arrowColor: black,
          descriptionColor: lightGrayDark,
          brandingDescriptionColor: lightGrayDark,

          appearance: {
            themeAddBackground: grayLightMid,
            accentBoxBackground: grayLightMid,
            buttonBoxBackground: grayLightMid,
            iconFill: gray,
            addThemeBackground: grayStrong,
          },

          whiteLabel: {
            borderImg: `1px solid ${grayStrong}`,

            backgroundColorWhite: white,
            backgroundColorLight: grayLight,
            backgroundColorDark: darkGrayLight,
            greenBackgroundColor: editorGreenColor,
            blueBackgroundColor: editorBlueColor,
            orangeBackgroundColor: editorOrangeColor,
            redBackgroundColor: editorRedColor,

            dataFontColor: white,
            dataFontColorBlack: black,
            notAvailableBackground: grayLight,
            textColor: black,
            paidBadgeBackground: favoritesStatus,
          },

          companyInfo: {
            border: `1px dashed ${black}`,
            color: gray,
          },

          dns: {
            errorColor: lightErrorStatus,
          },
        },

        integration: {
          separatorBorder: `1px solid ${grayStrong}`,
          linkColor: link,
          textColor: gray,
          sso: {
            textColor: gray,
            errorColor: lightErrorStatus,
            toggleContentBackground: grayLight,
            iconButton: black,
            iconButtonDisabled: gray,
            border: `1px solid ${grayStrong}`,
          },
          ldap: {
            border: `1px solid ${grayLightMid}`,
            errorBorder: `1px solid ${lightErrorStatus}`,
            certificateBackground: grayLight,
            textColor: gray,
            errorColor: lightErrorStatus,
          },
          smtp: {
            requirementColor: lightErrorStatus,
          },
        },

        backup: {
          rectangleBackgroundColor: grayLight,
          separatorBorder: `1px solid ${grayLightMid}`,
          warningColor: lightErrorStatus,
          textColor: gray,
          backupCheckedListItemBackground: lightGrayHover,
        },

        payment: {
          priceColor: grayText,
          storageSizeTitle: gray,

          backgroundColor: grayLight,
          linkColor: link,
          tariffText: grayText,
          border: `1px solid ${grayLight}`,
          backgroundBenefitsColor: grayLight,
          rectangleColor: lightGrayHover,

          priceContainer: {
            backgroundText: lightGrayHover,
            background: "transparent",
            border: `1px solid ${grayStrong}`,
            featureTextColor: gray,

            disableColor: gray,
            trackNumberColor: gray,
            disablePriceColor: gray,
          },

          benefitsContainer: {
            iconsColor: lightGrayDark,
          },

          contactContainer: {
            textColor: gray,
            linkColor: lightGrayDark,
          },

          warningColor: lightErrorStatus,
          color: lightStatusWarning,
        },

        migration: {
          descriptionColor: lightGrayDark,
          subtitleColor: black,
          workspaceBackground: white,
          workspaceBorder: `1px solid ${grayStrong}`,
          workspaceHover: lightBlueMain,
          stepDescriptionColor: black,
          fileInputIconColor: gray,
          infoBlockBackground: grayLight,
          infoBlockTextColor: grayText,
          errorTextColor: lightErrorStatus,
          existingTextColor: mainGreen,
          tableHeaderText: gray,
          tableRowHoverColor: lightGrayHover,
          tableRowTextColor: gray,
          comboBoxLabelColor: black,
          importSectionBackground: grayLight,
          importSectionTextColor: gray,
          importItemBackground: grayLightMid,
          importItemDisableBackground: lightGrayHover,
          importItemTextColor: grayText,
          importItemDisableTextColor: gray,
          importItemDescription: black,
          importIconColor: lightGrayDark,
          groupMenuBackground: white,
          groupMenuBorder: `1px solid ${white}`,
          groupMenuBoxShadow: `${menuShadow} 0px 5px 5px 0px`,
          linkColor: lightBlueMain,
          background: grayLight,
        },
        storageManagement: {
          grayBackgroundText: black,
          descriptionColor: lightGrayDark,
          dividerColor: grayLightMid,
        },
        deleteData: {
          borderTop: `1px solid ${grayLightMid}`,
        },
        webhooks: {
          border: `1px solid ${grayLightMid}`,
          historyRowBackground: lightGrayHover,
          tableCellBackground: lightGrayHover,
          barBackground: grayLight,
          color: gray,
          linkColor: link,
          spanBackground: lightBlueMain,
          filterBorder: `1px solid ${grayStrong}`,

          background: grayLight,
        },
      },

      wizard: {
        linkColor: link,
        generatePasswordColor: lightGrayDark,
        textColor: gray,
      },
    },

    statusMessage: {
      toastBackground: lightToastWarning,
    },

    tileLoader: {
      border: `1px solid ${grayStrong}`,

      background: white,
    },

    errorContainer: {
      background: white,
      bodyText: gray,
      linkColor: link,
    },

    editor: {
      color: grayText,
      background: white,
    },

    tabs: {
      gradientColor: white,
      lineColor: grayLightMid,

      textColorPrimary: lightGrayDark,
      activeTextColorPrimary: "",
      hoverTextColorPrimary: gray,
      pressedTextColorPrimary: grayText,
      backgroundColorPrimary: white,

      textColorSecondary: black,
      activeTextColorSecondary: white,

      backgroundColorSecondary: white,
      hoverBackgroundColorSecondary: lightGrayHover,
      pressedBackgroundColorSecondary: grayLightMid,
      activeBackgroundColorSecondary: blueLightMid,
    },

    hotkeys: {
      key: {
        color: lightGrayDark,
      },
    },

    tag: {
      color: black,
      deletedColor: gray,
      background: grayLightMid,
      hoverBackground: lightGraySelected,
      disabledBackground: grayLightMid,
      deletedBackground: grayLight,
      defaultTagColor: black,
      newTagBackground: grayLightMid,
      newTagHoverBackground: lightGrayHover,
    },

    profile: {
      main: {
        background: grayLight,
        textColor: black,

        descriptionTextColor: gray,
        pendingEmailTextColor: gray,

        mobileRowBackground: grayLight,

        iconFill: lightGrayDark,
        mobileLabel: gray,
      },
      login: {
        textColor: gray,
      },
      themePreview: {
        descriptionColor: gray,
        border: `1px solid ${grayLightMid}`,
      },
      notifications: {
        textDescriptionColor: gray,
      },
      activeSessions: {
        color: black,
        borderColor: grayLightMid,
        tickIconColor: lightStatusPositive,
        removeIconColor: gray,
        sortHeaderColor: grayStrong,
        tableCellColor: gray,
        dividerColor: grayStrong,
      },
    },

    formWrapper: {
      background: white,
      boxShadow: `0px 5px 20px ${popupShadow}`,
    },

    preparationPortalProgress: {
      backgroundColor: lightGrayHover,
      colorPercentSmall: black,
      colorPercentBig: white,
      errorTextColor: lightErrorStatus,
      descriptionTextColor: gray,
    },

    accessRightSelect: {
      descriptionColor: gray,
    },

    itemIcon: {
      borderColor: grayLightMid,
      editIconColor: grayLightMid,
    },

    invitePage: {
      borderColor: grayLightMid,
      textColor: gray,
    },

    portalUnavailable: {
      textDescriptionColor: gray,
    },

    deepLink: {
      navBackground: grayLight,
      fileTileBackground: lightGrayHover,
    },

    emailChips: {
      borderColor: gray,
      dashedBorder: `1px dashed ${lightSecondMain}`,
    },

    dialogs: {
      disableText: gray,
      errorText: lightErrorStatus,
      linkColor: lightBlueMain,
      borderColor: grayLightMid,
    },

    editLink: {
      text: {
        color: gray,
        errorColor: lightErrorStatus,
      },
      editInputColor: grayText,
      requiredColor: lightErrorStatus,
    },

    oformGallery: {
      errorView: {
        subHeaderTextColor: grayText,
      },
      submitToGalleryTile: {
        bodyText: grayText,
        closeIconFill: lightGrayDark,
      },
    },

    infoBlock: {
      background: grayLight,
      headerColor: black,
      descriptionColor: grayText,
    },

    infoBar: {
      background: grayLight,
      title: black,
      description: grayText,
      textColor: black,
      iconFill: lightStatusWarning,
    },

    roomIcon: {
      backgroundArchive: gray,
      opacityBackground: "1",
      plusIcon: white,
      emptyBorder: `2px dashed ${grayStrong}`,

      linkIcon: {
        background: white,
        path: moonstone,
      },
    },

    plugins: {
      borderColor: grayStrong,
      pluginName: grayDarkText,
      descriptionColor: lightGrayDark,
      color: grayDark,
    },
    oauth: {
      previewDialog: {
        border: `1px solid ${grayLightMid}`,
      },
      infoDialog: {
        descLinkColor: lightGrayDark,
        blockHeaderColor: gray,
        separatorColor: black,
      },
      list: {
        descriptionColor: gray,
      },
      clientForm: {
        descriptionColor: gray,
        headerBorder: `1px solid ${grayStrong}`,
        scopeDesc: gray,
      },
    },
    sdkPresets: {
      borderColor: grayStrong,
      secondaryColor: lightGrayDark,
      previewBackgroundColor: lightGrayHover,
      linkHelpColor: lightGrayDark,
    },
    sideBarRow: {
      titleColor: black,
      metaDataColor: gray,
    },

    dateTimePicker: {
      colorClockIcon: lightGrayDark,
    },

    embeddingPanel: {
      descriptionTextColor: lightGrayDark,
      iconColor: lightGrayDark,
    },

    completedForm: {
      linkColor: lightBlueMain,
      descriptionColor: gray,

      labelColor: gray,

      box: {
        background: globalColors.grayLight,
      },
    },

    management: {
      textColor: gray,
      errorColor: lightErrorStatus,
      sideColor: gray,
      nameColor: grayStrong,
      barBackground: grayLight,
    },

    publicRoom: {
      border: `1px solid ${lightGraySelected}`,
      linkColor: lightBlueMain,
    },

    newFilesPanel: {
      borderColor: globalColors.grayLightMid,

      borderRadius: "6px",
      boxShadow: `0px 8px 16px 0px ${boxShadowColor}`,

      fileItem: {
        borderColor: globalColors.grayLightMid,
        fileExstColor: globalColors.gray,
      },
    },
    logoCover: {
      selectColor: {
        backgroundColor: lightGrayHover,
      },

      iconColor: lightGrayDark,
      textColor: lightGrayDark,
      selectedBackgroundColor: grayLightMid,
      selectedBorderColor: grayLightMid,
      backgroundColor: white,
      borderColor: grayLightMid,
    },

    formFillingTips: {
      circleColor: grayLightMid,
      selectedColor: white,
      circleBorder: `3px solid ${lightSecondMain}`,
    },

    socialAuthDialog: {
      accountDetailsBackground: grayLight,
    },
  };
};

const Base = getBaseTheme();

export default Base;

export type TTheme = ReturnType<typeof getBaseTheme> & {
  currentColorScheme?: TColorScheme;
};
