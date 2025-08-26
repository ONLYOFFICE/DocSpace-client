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

import styled, { css } from "styled-components";
import { globalColors } from "@docspace/shared/themes";
import { injectDefaultTheme, NoUserSelect } from "@docspace/shared/utils";

const StyledComponent = styled.div.attrs(injectDefaultTheme)`
  display: inline-flex;
  width: 100%;

  .menu {
    width: ${(props) => (props.isViewTablet ? "61px" : "251px")};
    display: flex;
    flex-direction: column;
    padding: ${(props) =>
      props.isViewTablet ? "15px 0px 0px" : "21px 0px 17px"};

    height: 100%;
    background: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.grayLight
        : globalColors.darkGrayLight};
    ${(props) =>
      props.withBorder &&
      css`
        border-width: 1px;
        border-style: solid;
        border-start-start-radius: 16px;
        border-end-start-radius: 16px;
      `}
  }

  .tablet-header {
    padding: 0 15px 20px;
  }

  .tablet-category {
    padding: 0 20px;
  }

  .line {
    width: 20px;
    height: 1px;
    background: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.grayLightMid
        : globalColors.grayDarkStrong};
    margin: 0 20px 31px;
  }

  .tablet-category-notice {
    padding: 20px 16px 20px;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}

    circle {
      fill: ${(props) => props.colorPreview};
      stroke: ${(props) =>
        props.themePreview === "Dark" && globalColors.darkGrayLight};
    }
  }

  .bottom {
    padding-bottom: 31px;
  }

  .tablet-half {
    width: 20px;
    height: 10px;
    padding-top: 24px;
  }

  .section-flex-tablet {
    display: ${(props) => props.isViewTablet && "flex"};
    justify-content: ${(props) => props.isViewTablet && "space-between"};
  }

  .tile-half {
    margin-inline-start: 16px;
    border-inline-end: none !important;
    border-start-start-radius: 12px;
    border-end-start-radius: 12px;
    width: 44% !important;
  }

  .section {
    position: relative;
    width: ${(props) => (props.isViewTablet ? "100%" : "56%")};
    ${(props) =>
      props.withBorder &&
      css`
        border-width: 1px;
        border-style: solid;
        border-start-end-radius: 16px;
        border-end-end-radius: 16px;
        border-inline-start-style: none;
      `}
    background: ${(props) =>
      props.themePreview === "Light" ? globalColors.white : globalColors.black};
  }

  .section-header {
    display: flex;
    align-items: flex-start;
    padding-block: 26px 28px;
    padding-inline: 20px 0;

    img {
      ${NoUserSelect}
    }
  }

  .section-header-loader {
    padding-inline-end: 17px;
    height: 16px;
  }

  .section-search {
    height: 30px;
    border-width: 1px;
    border-style: solid;
    margin-block: 0 24px;
    margin-inline: 20px 0;
    border-inline-end-style: none;
    border-start-start-radius: 3px;
    border-end-start-radius: 3px;
  }

  .section-search-loader {
    padding-top: 9px;
    padding-inline-start: 8px;
  }

  .loader-search {
    margin-bottom: 2px;
  }

  .main-button-container {
    margin: 0px 20px 23px;
  }

  .main-button-preview {
    cursor: auto;
    background-color: ${(props) => props.colorPreview};
    border-radius: 3px;

    &:active {
      background-color: ${(props) => props.colorPreview} !important;
      opacity: none !important;
      filter: none !important;
    }
  }

  .color-badge rect {
    fill: ${(props) =>
      props.themePreview === "Dark" && props.selectThemeId === 7
        ? globalColors.white
        : props.colorPreview} !important;
  }

  .color-loaders rect {
    fill: ${(props) =>
      props.themePreview === "Light"
        ? `${props.colorPreview} !important`
        : `${globalColors.white} !important`};
  }

  .menu-section {
    &:not(:last-child) {
      padding-bottom: 26px;
    }
  }

  .header {
    margin: 0px 20px 23px;
    height: 24px;
  }

  .loaders-theme {
    background-color: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.white
        : globalColors.grayDark};
    border-radius: 3px;
  }

  .flex {
    display: flex;
    align-items: center;
    padding: 10px 32px 0px;

    &:not(:last-child) {
      padding-bottom: 10px;
    }
  }

  .padding-right {
    height: 16px;
    padding-inline-end: 8px;
  }

  .title-section {
    height: 12px;
    margin: 0px 32px 4px;
  }

  .menu-badge {
    padding-inline-start: 93px;
    border: none;
    cursor: auto;
  }

  .select {
    padding-top: 9px;
    padding-bottom: 9px !important;
    background: ${(props) =>
      props.themePreview === "Light" ? globalColors.white : globalColors.black};
  }

  .section-tile {
      padding-block: 0;
      padding-inline: ${({ isViewTablet }) => (isViewTablet ? "20px 0" : "20px")}};
  }

  .border-color {
    border-color: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.grayStrong
        : globalColors.grayDarkStrong};
  }

  .tile {
    border-width: 1px;
    border-style: solid;
    border-radius: 12px;
    margin-bottom: 16px;
    width: ${(props) => props.isViewTablet && "64%"};
  }

  .background {
    background: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.white
        : globalColors.darkGrayLight};
  }

  .tile-name {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 14px 16px;
    height: 30px;
  }

  .tablet-tile-name {
      width: 44% !important;
      margin-inline-start: 16px;
      border-inline-end: none !important;
      border-start-start-radius: 12px !important;
      border-end-end-radius: 16px !important;
  }

  .only-tile-name {
    width: ${(props) => props.isViewTablet && "66%"};
    border-top-width: 1px;
    border-inline-width: 1px;
    border-style: solid;
    border-bottom: none;
    border-start-start-radius: 12px;
    border-start-end-radius: 12px;
  }

  .action-button {
    width: 72px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .tile-tag {
      display: flex;
      border-top-width: 1px;
      border-top-style: solid;
      padding-block: 16px;
      padding-inline: 16px 0;
  }

  .tile-container {
    display: flex;
    align-items: center;
  }

  .tile-icon {
      padding-inline-end: 12px;
  }

  .section-badge {
      padding-inline-end: 12px;
  }

  .pin {
      padding-inline-end: 14px;

    path {
      fill: ${(props) =>
        props.themePreview === "Light"
          ? `${props.colorPreview} !important`
          : `${globalColors.white} !important`};
    }
  }

  .menu-button > div {
    cursor: auto;
  }

  .main-button_text {
    color: ${globalColors.white} !important;
  }
`;

const StyledFloatingButton = styled.div.attrs(injectDefaultTheme)`
  bottom: 24px;
  inset-inline-end: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${(props) => props.colorPreview};
  text-align: center;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 12px 40px ${globalColors.popupShadow};
`;

const IconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    path {
      fill: ${(props) => props.colorCheckImg};
    }
  }
`;

const StyledMobilePreview = styled.div`
  height: 293px;
  border-radius: 16px;
  padding: 0px 16px;
  background: ${({ themePreview }) =>
    themePreview === "Light" ? globalColors.white : globalColors.black};

  border: ${({ themePreview }) =>
    themePreview === "Light"
      ? `1px solid ${globalColors.grayStrong}`
      : `1px solid ${globalColors.grayDarkStrong}`};

  .section-search {
    height: 30px;
    display: flex;
    align-items: center;
    border: 1px solid;
    border-radius: 3px;
    padding-inline-start: 8px;
  }

  .main-button-preview {
    cursor: auto;
    background-color: ${(props) => props.colorPreview};
    border-radius: 3px;

    &:active {
      background-color: ${(props) => props.colorPreview} !important;
      opacity: none !important;
      filter: none !important;
    }
  }

  .color-badge rect {
    fill: ${(props) =>
      props.themePreview === "Dark" && props.selectThemeId === 7
        ? globalColors.white
        : props.colorPreview} !important;
  }

  .color-loaders rect {
    fill: ${(props) =>
      props.themePreview === "Light"
        ? `${props.colorPreview} !important`
        : `${globalColors.white} !important`};
  }

  .menu-section {
    &:not(:last-child) {
      padding-bottom: 26px;
    }
  }

  .loaders-theme {
    background-color: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.white
        : globalColors.grayDark};
    border-radius: 3px;
  }

  .loaders-tile-theme {
    background: ${(props) =>
      props.themePreview === "Light" ? globalColors.white : globalColors.black};

    border-radius: 3px;
  }

  .loaders-tile-text-theme {
    background: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.grayStrong
        : globalColors.grayDark};

    border-radius: 3px;
  }

  .loaders-theme-avatar {
    background-color: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.white
        : globalColors.grayDark};
    border-radius: 50px;
  }

  .border-color {
    border-color: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.grayStrong
        : globalColors.grayDarkStrong};
  }

  .tile {
    border-width: 1px;
    border-style: solid;
    border-radius: 12px;
    width: ${(props) => props.isViewTablet && "64%"};
    margin-top: 24px;
  }

  .background {
    background: ${(props) =>
      props.themePreview === "Light"
        ? globalColors.white
        : globalColors.darkGrayLight};
  }

  .tile-name {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 14px;
    height: 30px;
  }

  .tablet-tile-name {
    width: 44% !important;
    margin-inline-start: 16px;
    border-inline-end: none !important;
    border-start-start-radius: 12px;
    border-end-end-radius: 16px;
  }

  .only-tile-name {
    width: ${(props) => props.isViewTablet && "66%"};
    border-top-width: 1px;
    border-inline-width: 1px;
    border-style: solid;
    border-bottom: none;
    border-start-start-radius: 12px;
    border-start-end-radius: 12px;
  }

  .action-button {
    width: 72px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .tile-tag {
    display: flex;
    border-top-width: 1px;
    border-top-style: solid;
    padding-block: 16px;
    padding-inline: 16px 0;
  }

  .tile-container {
    display: flex;
    align-items: center;
  }

  .pin {
    padding-inline-end: 14px;

    path {
      fill: ${(props) =>
        props.themePreview === "Light"
          ? `${props.colorPreview} !important`
          : `${globalColors.white} !important`};
    }
  }

  .menu-button > div {
    cursor: auto;
  }

  .preview_mobile-header {
    height: 48px;
    display: grid;
    align-items: center;
    grid-template-columns: 34px 1fr 32px;
    gap: 16px;

    margin: 0 -16px;
    padding: 0 16px;

    background: ${({ themePreview }) =>
      themePreview === "Light"
        ? globalColors.white
        : globalColors.darkGrayLight};

    border-radius: 16px 16px 0px 0px;
  }

  .preview_mobile-navigation {
    height: 53px;
    display: flex;
    align-items: center;

    .header {
      width: 45%;
    }
  }

  .color-badge rect {
    fill: ${({ themePreview, selectThemeId, colorPreview }) =>
      themePreview === "Dark" && selectThemeId === 7
        ? globalColors.white
        : colorPreview} !important;
  }
  .section-badge {
    padding-inline-end: 12px;
  }

  .tile-icon {
    padding-inline-end: 12px;
  }

  .floating-button {
    position: relative;
    margin-inline-start: auto;
    inset-inline-end: 0;
    bottom: 48px;
  }

  .icon-button_svg {
    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.common.appearance.iconFill};
      }
    }
  }
`;

export { StyledComponent, StyledFloatingButton, IconBox, StyledMobilePreview };
