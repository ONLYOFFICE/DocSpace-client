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

import styled, { css } from "styled-components";

import ExpanderDownIcon from "PUBLIC_DIR/images/expander-down.react.svg";
import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg";

import { tablet, mobile, commonIconsStyles } from "../../utils";
import { Base } from "../../themes";

import { ColorTheme } from "../color-theme";
import { Heading } from "../heading";
import { Text } from "../text";

const StyledContainer = styled.div<{
  isDropBoxComponent?: boolean;
  isDesktop: boolean;
  isInfoPanelVisible: boolean;
  isTrashFolder?: boolean;
  isRootFolder?: boolean;
  withLogo: boolean;
  isDesktopClient?: boolean;
  width?: number;
  isPublicRoom?: boolean;
  showNavigationButton?: boolean;
}>`
  ${(props) =>
    !props.isDropBoxComponent &&
    props.isDesktop &&
    !props.isPublicRoom &&
    css`
      width: 100%;
      max-width: 100%;
    `}

  display: grid;
  align-items: center;

  grid-template-columns: ${({
    isRootFolder,
    withLogo,
    showNavigationButton,
  }) =>
    isRootFolder
      ? withLogo
        ? "1fr auto 1fr"
        : "auto 1fr"
      : showNavigationButton
        ? "49px auto minmax(186px, 1fr)"
        : withLogo
          ? "1fr 49px auto 1fr"
          : "49px auto 1fr"};

  .navigation-logo {
    display: flex;
    height: 24px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 16px;
          `
        : css`
            margin-right: 16px;
          `}

    @media ${tablet} {
      .logo-icon_svg {
        display: none;
      }
    }

    .header_separator {
      display: ${({ isRootFolder }) => (isRootFolder ? "block" : "none")};
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              border-right: 1px solid #dfe2e3;
              margin: 0 15px 0 0;
            `
          : css`
              border-left: 1px solid #dfe2e3;
              margin: 0 0 0 15px;
            `}

      height: 21px;
    }

    .header-burger {
      cursor: pointer;
      display: none;
      margin-top: -2px;

      img {
        height: 28px;
        width: 28px;
      }

      @media ${tablet} {
        display: flex;
      }

      @media ${mobile} {
        display: none;
      }
    }
  }

  .drop-box-logo {
    display: none;

    @media ${tablet} {
      display: grid;
    }
  }

  height: 100%;
  ${(props) =>
    props.isDesktopClient &&
    props.isDropBoxComponent &&
    css`
      max-height: 32px;
    `}

  .navigation-arrow-container {
    display: flex;
  }

  .arrow-button {
    padding-top: 2px;
    width: 17px;
    min-width: 17px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && `transform: scaleX(-1);`}
    }
  }

  .title-container {
    display: grid;
    grid-template-columns: minmax(1px, max-content) auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .room-title {
      cursor: pointer;
      min-height: 33px;
    }
  }

  .navigation-header-separator {
    display: block;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 16px;
            border-left: ${`1px solid ${props.theme.navigation.icon.stroke}`};
          `
        : css`
            padding-left: 16px;
            border-right: ${`1px solid ${props.theme.navigation.icon.stroke}`};
          `}

    height: 21px;
    @media ${mobile} {
      display: none;
    }
  }

  .headline-heading {
    display: flex;
    height: 32px;
    align-items: center;
  }

  .title-block {
    display: flex;
    align-items: center;
    flex-direction: row;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    min-height: 33px;
    gap: 8px;

    @media ${mobile} {
      min-height: auto;
    }

    ${(props) =>
      props.showNavigationButton &&
      css`
        min-width: 43px;
      `}

    .title-icon {
      min-width: 16px;
      min-height: 16px;
      width: 16px;
      height: 16px;
    }
  }

  @media ${tablet} {
    width: 100%;
    grid-template-columns: ${({ isRootFolder, withLogo }) =>
      isRootFolder
        ? withLogo
          ? "59px 1fr auto"
          : "1fr auto"
        : withLogo
          ? "43px 49px 1fr auto"
          : "49px 1fr auto"};
  }

  @media ${mobile} {
    .navigation-logo {
      display: none;
    }

    grid-template-columns: ${(props) =>
      props.isRootFolder ? "auto 1fr" : "29px auto 1fr"};
  }
`;

const StyledInfoPanelToggleColorThemeWrapper = styled(ColorTheme)<{
  isInfoPanelVisible?: boolean;
  isRootFolder?: boolean;
}>`
  align-self: center;

  margin-inline-start: 20px;

  margin-bottom: 1px;
  padding: 0;

  svg {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && `transform: scaleX(-1)`}
  }

  .info-panel-toggle {
    margin-inline-end: 8px;
  }

  ${(props) =>
    props.isInfoPanelVisible &&
    css`
      .info-panel-toggle-bg {
        height: 30px;
        width: 30px;
        background: ${props.theme.backgroundAndSubstrateColor};
        border: 1px solid ${props.theme.backgroundAndSubstrateColor};
        border-radius: 50%;
        .info-panel-toggle {
          margin: auto;
          margin-top: 25%;
        }
      }
    `}

  @media ${tablet} {
    display: none;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: ${props.isRootFolder ? "auto" : "0"};
          `
        : css`
            margin-left: ${props.isRootFolder ? "auto" : "0"};
          `}
  }
`;
StyledInfoPanelToggleColorThemeWrapper.defaultProps = { theme: Base };

const StyledControlButtonContainer = styled.div<{
  isFrame?: boolean;
  showTitle?: boolean;
}>`
  ${(props) =>
    props.showTitle &&
    (props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 16px;
        `
      : css`
          margin-left: 16px;
        `)}
  display: flex;
  align-items: center;
  gap: 16px;
  height: 32px;

  @media ${tablet} {
    flex-direction: row-reverse;
  }

  .add-button {
    min-width: 15px;

    @media ${tablet} {
      display: ${(props) => (props.isFrame ? "flex" : "none")};
    }
  }

  .add-drop-down {
    margin-top: 8px;
  }

  .option-button {
    min-width: 17px;

    /* ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 16px;
          `
        : css`
            margin-right: 16px;
          `} */

    /* @media ${tablet} {
      ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 9px;
          `
        : css`
            margin-right: 9px;
          `}
    } */
  }

  .trash-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 16px;
          `
        : css`
            margin-right: 16px;
          `}
    min-width: 15px;
  }
`;

const StyledInfoPanelToggleWrapper = styled.div<{
  isRootFolder: boolean;
  isInfoPanelVisible: boolean;
}>`
  display: flex;
  align-items: center;
  align-self: center;
  justify-content: center;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: auto;
        `
      : css`
          margin-left: auto;
        `}

  @media ${tablet} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: ${props.isRootFolder ? "auto" : "0"};
          `
        : css`
            margin-left: ${props.isRootFolder ? "auto" : "0"};
          `}
  }

  .info-panel-toggle-bg {
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: ${(props) =>
      props.isInfoPanelVisible
        ? props.theme.infoPanel.sectionHeaderToggleBgActive
        : props.theme.infoPanel.sectionHeaderToggleBg};

    path {
      fill: ${(props) =>
        props.isInfoPanelVisible
          ? props.theme.infoPanel.sectionHeaderToggleIconActive
          : props.theme.infoPanel.sectionHeaderToggleIcon};
    }
  }
`;
StyledInfoPanelToggleWrapper.defaultProps = { theme: Base };

const StyledTrashWarning = styled.div`
  box-sizing: border-box;
  height: 32px;
  padding: 8px 12px;
  border-radius: 6px;

  display: grid;
  justify-content: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `right` : `left`};

  .warning-text {
    color: ${({ theme }) => theme.section.header.trashErasureLabelText};

    font-weight: 400;
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    line-height: 16px;

    width: 100%;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  background: ${({ theme }) =>
    theme.section.header.trashErasureLabelBackground};

  @media ${tablet} {
    margin-bottom: 16px;
  }
`;

StyledTrashWarning.defaultProps = { theme: Base };

const StyledTextContainer = styled.div<{
  isRootFolder: boolean;
  isRootFolderTitle: boolean;
}>`
  display: flex;

  align-items: center;

  flex-direction: row;

  position: relative;

  ${(props) =>
    !props.isRootFolder && !props.isRootFolderTitle && "cursor: pointer"};
  ${(props) =>
    props.isRootFolderTitle &&
    (props.theme.interfaceDirection === "rtl"
      ? "padding-left: 3px;"
      : "padding-right: 3px;")};

  ${(props) =>
    !props.isRootFolderTitle &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `};
`;

const StyledHeading = styled(Heading)<{ isRootFolderTitle: boolean }>`
  font-weight: 700;
  font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
  line-height: 24px;

  margin: 0;

  ${(props) =>
    props.isRootFolderTitle &&
    `color: ${props.theme.navigation.rootFolderTitleColor}`};

  @media ${tablet} {
    font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    line-height: 28px;
  }

  @media ${mobile} {
    font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    line-height: 24px;
  }
`;

const StyledExpanderDownIcon = styled(ExpanderDownIcon)`
  min-width: 8px !important;
  width: 8px !important;
  min-height: 18px !important;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 0 4px 0 2px;
        `
      : css`
          padding: 0 2px 0 4px;
        `}
  path {
    fill: ${(props) => props.theme.navigation.expanderColor};
  }

  ${commonIconsStyles};
`;

const StyledArrowIcon = styled(ArrowIcon)`
  height: 12px;
  min-width: 12px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding-right: 6px;
        `
      : css`
          padding-left: 6px;
        `}
  path {
    fill: ${(props) => props.theme.navigation.rootFolderTitleColor};
  }
`;

StyledExpanderDownIcon.defaultProps = { theme: Base };

const StyledExpanderDownIconRotate = styled(ExpanderDownIcon)`
  min-width: 8px !important;
  width: 8px !important;
  min-height: 18px !important;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 0 2px 0 4px;
        `
      : css`
          padding: 0 4px 0 2px;
        `}
  transform: rotate(-180deg);

  path {
    fill: ${(props) => props.theme.navigation.expanderColor};
  }

  ${commonIconsStyles};
`;

StyledExpanderDownIconRotate.defaultProps = { theme: Base };

const StyledItem = styled.div<{ isRoot: boolean; withLogo: boolean }>`
  height: auto;
  width: auto !important;
  position: relative;
  display: grid;
  align-items: ${(props) => (props.isRoot ? "baseline" : "end")};
  grid-template-columns: 17px auto;
  cursor: pointer;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `margin-right: 0;` : `margin-left: 0;`}

  @media ${tablet} {
    ${({ withLogo }) =>
      withLogo &&
      css`
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: 44px;
              `
            : css`
                margin-left: 44px;
              `}
      `};
  }

  @media ${mobile} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 0;
          `
        : css`
            margin-left: 0;
          `}
  }
`;

const StyledText = styled(Text)<{ isRoot: boolean }>`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 10px;
        `
      : css`
          margin-left: 10px;
        `}
  position: relative;
  bottom: ${(props) => (props.isRoot ? "2px" : "-1px")};
`;

const StyledBox = styled.div<{
  withLogo: boolean;
  height: number | null;
  dropBoxWidth: number;
}>`
  position: absolute;
  top: 0px;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          right: -20px;
          ${props.withLogo && `right: 207px;`};
        `
      : css`
          left: -20px;
          ${props.withLogo && `left: 207px;`};
        `}
  padding: 0 20px;
  padding-top: 18px;

  width: unset;

  height: ${(props) => (props.height ? `${props.height}px` : "fit-content")};
  max-height: calc(100vh - 48px);

  z-index: 401;
  display: table;
  margin: auto;
  flex-direction: column;

  background: ${(props) => props.theme.navigation.background};

  box-shadow: ${(props) => props.theme.navigation.boxShadow};
  border-radius: 0px 0px 6px 6px;

  .title-container {
    display: grid;
    grid-template-columns: minmax(1px, max-content) auto;
  }

  .title-block-text {
    margin-top: 1px;

    @media ${tablet} {
      margin: 0;
    }
  }

  @media ${tablet} {
    width: ${({ dropBoxWidth }) => `${dropBoxWidth}px`};
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: -16px;
          `
        : css`
            left: -16px;
          `}
    padding: 0 16px;
    padding-top: 14px;
  }

  @media ${mobile} {
    width: ${({ dropBoxWidth }) => `${dropBoxWidth}px`};
    padding-top: 10px !important;
  }
`;

StyledBox.defaultProps = { theme: Base };

const StyledTariffWrapper = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? css`
          justify-content: left;
          margin-right: auto;
        `
      : css`
          justify-content: right;
          margin-left: auto;
        `}

  @media ${tablet} {
    flex-direction: row-reverse;
  }
`;

export {
  StyledContainer,
  StyledInfoPanelToggleColorThemeWrapper,
  StyledControlButtonContainer,
  StyledInfoPanelToggleWrapper,
  StyledTrashWarning,
  StyledTextContainer,
  StyledArrowIcon,
  StyledExpanderDownIcon,
  StyledExpanderDownIconRotate,
  StyledHeading,
  StyledText,
  StyledItem,
  StyledBox,
  StyledTariffWrapper,
};
