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
import { isMobileOnly } from "react-device-detect";

import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";

import {
  tablet,
  mobile,
  INFO_PANEL_WIDTH,
  mobileMore,
  desktop,
  NoUserSelect,
} from "../../utils";
import { Base } from "../../themes";
import { TViewAs } from "../../types";

import { Scrollbar } from "../scrollbar";
import DragAndDrop from "../drag-and-drop/DragAndDrop";
import { SectionContainerProps } from "./Section.types";
import { SECTION_HEADER_HEIGHT } from "./Section.constants";

const StyledScrollbar = styled(Scrollbar)<{ $isScrollLocked?: boolean }>`
  ${({ $isScrollLocked }) =>
    $isScrollLocked &&
    css`
      &:first-child > .scroll-wrapper > .scroller {
        overflow: hidden !important;
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: -1px !important;
              `
            : css`
                margin-right: -1px !important;
              `}
      }
      ${isMobileOnly &&
      css`
        &:first-child > .scroll-wrapper > .scroller {
          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? css`
                  padding-left: 20px !important;
                  margin-left: -21px !important;
                `
              : css`
                  padding-right: 20px !important;
                  margin-right: -21px !important;
                `}
        }
      `}
    `}
`;

const StyledInfoPanelWrapper = styled.div.attrs(({ id }) => ({
  id,
}))`
  user-select: none;
  height: auto;
  width: auto;
  background: ${(props) => props.theme.infoPanel.blurColor};
  backdrop-filter: blur(3px);
  z-index: 300;
  @media ${tablet} {
    z-index: 309;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

const StyledInfoPanel = styled.div`
  height: 100%;
  width: ${INFO_PANEL_WIDTH}px;
  background-color: ${(props) => props.theme.infoPanel.backgroundColor};
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          border-right: ${`1px solid ${props.theme.infoPanel.borderColor}`};
        `
      : css`
          border-left: ${`1px solid ${props.theme.infoPanel.borderColor}`};
        `}
  display: flex;
  flex-direction: column;

  .scroll-body {
    padding-bottom: 20px;
  }

  @media ${tablet} {
    position: absolute;
    border: none;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0;
          `
        : css`
            right: 0;
          `}
    width: 480px;
    max-width: calc(100vw - 69px);
  }

  @media ${mobile} {
    bottom: 0;
    height: calc(100% - 64px);
    width: 100vw;
    max-width: 100vw;
  }
`;

const StyledControlContainer = styled.div`
  display: none;

  width: 17px;
  height: 17px;
  position: absolute;

  cursor: pointer;

  align-items: center;
  justify-content: center;
  z-index: 450;

  @media ${tablet} {
    display: flex;

    top: 18px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: -27px;
          `
        : css`
            left: -27px;
          `}
  }

  @media ${mobile} {
    display: flex;

    top: -27px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 10px;
          `
        : css`
            right: 10px;
          `}
    left: unset;
  }
`;

StyledControlContainer.defaultProps = { theme: Base };

const StyledCrossIcon = styled(CrossIcon)`
  width: 17px;
  height: 17px;
  z-index: 455;
  path {
    stroke: ${(props) => props.theme.catalog.control.fill};
  }
`;

StyledCrossIcon.defaultProps = { theme: Base };
StyledInfoPanelWrapper.defaultProps = { theme: Base };
StyledInfoPanel.defaultProps = { theme: Base };

const settingsStudioStyles = css<{ settingsStudio?: boolean }>`
  ${({ settingsStudio }) =>
    settingsStudio &&
    css`
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding: 0 20px 16px 7px;
            `
          : css`
              padding: 0 7px 16px 20px;
            `}

      @media ${tablet} {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding: 0 24px 16px 0;
              `
            : css`
                padding: 0 0 16px 24px;
              `}
      }

      @media ${mobile} {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding: 0 24px 16px 0;
              `
            : css`
                padding: 0 0 16px 24px;
              `}
      }
    `}
`;

const paddingStyles = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 19px 20px 16px 3px;
        `
      : css`
          padding: 19px 3px 16px 20px;
        `}
  outline: none;

  ${settingsStudioStyles};

  @media ${tablet} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0px 24px 16px 0;
          `
        : css`
            padding: 0px 0 16px 24px;
          `}
  }

  @media ${mobile} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0px 24px 16px 8px;
          `
        : css`
            padding: 0px 8px 16px 24px;
          `}
  }
`;

const commonStyles = css<{
  isDesktop?: boolean;
  withScroll?: boolean;
  viewAs?: TViewAs;
  isFormGallery?: boolean;
  settingsStudio?: boolean;
}>`
  flex-grow: 1;

  ${(props) => (props.isDesktop ? "height: auto" : "height: 100%")};

  ${(props) => !props.withScroll && `height: 100%;`}
  border-left: none;
  border-right: none;
  border-top: none;

  .section-wrapper {
    height: 100%;
    ${(props) =>
      !props.withScroll &&
      css`
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
      `};
    ${(props) => !props.withScroll && paddingStyles}
  }

  .section-wrapper-content {
    ${paddingStyles}
    flex: 1 0 auto;
    outline: none;
    ${(props) =>
      props.viewAs === "tile" &&
      css`
        ${props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 20px;
            `
          : css`
              padding-left: 20px;
            `}
      `}

    ${(props) =>
      (props.viewAs === "settings" || props.viewAs === "profile") &&
      css`
        padding-top: 0;

        @media ${tablet} {
          padding-top: 0;
        }
      `};

    @media ${`${mobileMore} and ${tablet}`} {
      ${({ isFormGallery, theme }) =>
        isFormGallery &&
        css`
          padding: ${theme.interfaceDirection === "rtl"
            ? "0 16px 20px 0"
            : "0 0    20px 16px"} !important;
        `}
    }

    @media ${mobile} {
      ${({ isFormGallery, theme }) =>
        isFormGallery &&
        css`
          padding: ${theme.interfaceDirection === "rtl"
            ? "0px 16px 16px 16px"
            : "0px 16px 16px 16px"} !important;
        `}
    }

    .section-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .files-tile-container {
      @media ${desktop} {
        margin-top: 0px;
      }
    }

    .people-row-container,
    .files-row-container {
      margin-top: 0px;

      @media ${desktop} {
        margin-top: -17px;
      }

      @media ${mobile} {
        margin-top: 0px;
      }

      @media ${desktop} {
        ${(props) =>
          props.viewAs === "row" &&
          css`
            margin-top: -15px;
          `}
      }
    }
  }
`;

const StyledSectionBody = styled.div`
  max-width: 100vw !important;
  user-select: none;

  ${commonStyles};

  ${(props) =>
    props.withScroll &&
    css`
      ${props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -20px;
          `
        : css`
            margin-left: -20px;
          `}

      @media ${tablet} {
        ${props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -24px;
            `
          : css`
              margin-left: -24px;
            `}
      }
    `}

  ${({ isFormGallery }) =>
    isFormGallery &&
    css`
      @media ${tablet} {
        margin: ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? "0 -16px 0 0 "
            : "0 0 0 -16px"};

        padding: ${(props) =>
          props.theme.interfaceDirection === "rtl" ? "0 0 0 0 " : "0 0 0 0"};
      }
    `}

  .additional-scroll-height {
    ${({ withScroll }) =>
      !withScroll &&
      css`
        height: 64px;
      `}
  }
`;

const StyledDropZoneBody = styled(DragAndDrop)`
  max-width: 100vw !important;

  ${commonStyles};

  .drag-and-drop {
    user-select: none;
    height: 100%;
  }

  ${(props) =>
    props.withScroll &&
    css`
      ${props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -20px;
          `
        : css`
            margin-left: -20px;
          `}

      @media ${tablet} {
        ${props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -24px;
            `
          : css`
              margin-left: -24px;
            `}
      }
    `}
`;

const StyledSpacer = styled.div`
  display: none;
  min-height: 64px;

  @media ${tablet} {
    display: block;
  }
`;

const tabletProps = css<{ viewAs?: TViewAs }>`
  .section-body_header {
    width: 100%;
    position: sticky;
    top: 0;
    background: ${(props) => props.theme.section.header.backgroundColor};

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0;
          `
        : css`
            padding-right: 0;
          `}
    z-index: 201;
    @media ${mobile} {
      min-width: 100vw;
      margin-inline-start: -16px;
      padding-inline-end: 16px;
      padding-inline-start: 16px;
    }
  }
  .section-body_filter {
    display: block;
    margin: 0;
  }
`;

const closeIconSize = "24px";
const sizeBetweenIcons = "8px";

const StyledSectionContainer = styled.section<SectionContainerProps>`
  position: relative;

  ${(props) => !props.withBodyScroll && "padding-inline-start: 20px;"}
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  user-select: none;

  width: 100%;
  max-width: 100%;

  @media ${tablet} {
    width: 100%;
    max-width: 100vw !important;

    ${(props) => !props.withBodyScroll && "padding-inline-start: 16px;"}
    ${tabletProps};
  }

  @media ${mobile} {
    width: 100vw !important;
    max-width: 100vw !important;
    padding-inline-start: 16px;
  }

  .section-scroll > .scroll-body {
    display: flex;
    flex-direction: column;
    padding-inline-start: 20px !important;

    @media ${tablet} {
      padding-inline-start: 16px !important;
    }
  }

  .section-sticky-container {
    position: sticky;
    top: 0;
    background: ${(props) => props.theme.section.header.backgroundColor};
    z-index: 201;
    padding-inline: 20px;
    margin-inline: -20px -17px;

    @media ${tablet} {
      padding-inline: 16px;
      margin-inline: -16px;
    }
  }

  .progress-bar_container {
    position: fixed;
    bottom: 0;

    display: grid;
    grid-gap: 24px;
    margin-bottom: 24px;
    margin-inline-end: 24px;
    inset-inline-end: ${(props) =>
      props.isInfoPanelVisible ? INFO_PANEL_WIDTH : 0}px;

    .layout-progress-bar_wrapper {
      position: static;
      width: fit-content;
      height: fit-content;
      display: flex;
      grid-template-columns: 1fr 1fr;
      flex-direction: row-reverse;
      align-items: center;

      .layout-progress-bar,
      .layout-progress-second-bar {
        ${(props) =>
          props.showTwoProgress &&
          css`
            ${props.theme.interfaceDirection === "rtl"
              ? `margin-right:calc(${closeIconSize} + ${sizeBetweenIcons}); `
              : `margin-left:calc(${closeIconSize} + ${sizeBetweenIcons})`}
          `}
      }

      .layout-progress-bar_close-icon {
        position: static;
        width: ${closeIconSize};
        height: ${closeIconSize};

        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: ${sizeBetweenIcons};
              `
            : css`
                margin-right: ${sizeBetweenIcons};
              `}

        ${(props) =>
          props.showTwoProgress &&
          css`
            ${props.theme.interfaceDirection === "rtl"
              ? `margin-left:-${closeIconSize}`
              : `margin-right:-${closeIconSize}`}
          `}
      }
    }
  }

  ${(props) =>
    !props.isSectionHeaderAvailable &&
    css`
      width: 100vw !important;
      max-width: 100vw !important;
      box-sizing: border-box;
    `}
`;

StyledSectionContainer.defaultProps = { theme: Base };

const StyledSectionFilter = styled.div`
  @media ${tablet} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 16px;
          `
        : css`
            margin-right: 16px;
          `}
  }
`;

StyledSectionFilter.defaultProps = { theme: Base };

const StyledSectionFooter = styled.div`
  margin-top: 40px;

  @media ${mobile} {
    margin-top: 32px;
  }
`;

const StyledSectionHeader = styled.div<{ isFormGallery?: boolean }>`
  position: relative;
  display: flex;

  height: ${SECTION_HEADER_HEIGHT.desktop};
  min-height: ${SECTION_HEADER_HEIGHT.desktop};

  @media ${tablet} {
    height: ${SECTION_HEADER_HEIGHT.tablet};
    min-height: ${SECTION_HEADER_HEIGHT.tablet};

    ${({ isFormGallery }) =>
      isFormGallery &&
      css`
        height: ${SECTION_HEADER_HEIGHT.desktop};
        min-height: ${SECTION_HEADER_HEIGHT.desktop};
      `}

    .header-container {
      margin-bottom: 1px;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }
  }

  @media ${mobile} {
    height: ${SECTION_HEADER_HEIGHT.mobile};
    min-height: ${SECTION_HEADER_HEIGHT.mobile};
  }

  box-sizing: border-box;

  ${NoUserSelect}

  display: grid;
  align-items: center;

  width: 100%;
  max-width: 100%;

  .header-container {
    display: flex;
  }

  @media ${mobile} {
    margin-inline-end: 0;
  }
`;

StyledSectionHeader.defaultProps = { theme: Base };

const StyledSectionPaging = styled.div`
  margin: 16px 0 0;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding-left: 3px;
        `
      : css`
          padding-right: 3px;
        `}

  @media ${tablet} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
  }
`;

StyledSectionPaging.defaultProps = { theme: Base };

const StyledSectionSubmenu = styled.div`
  background: ${(props) => props.theme.section.header.backgroundColor};
  width: 100%;
  z-index: 1;

  @media ${tablet} {
    width: calc(100% + 32px);
    position: sticky;
    top: ${SECTION_HEADER_HEIGHT.tablet};
    margin: 0 -16px;
    & > div {
      padding: 0 16px;
    }
  }

  @media ${mobile} {
    position: sticky;
    top: ${SECTION_HEADER_HEIGHT.mobile};
  }
`;

export {
  StyledSectionPaging,
  StyledSectionHeader,
  StyledSectionFooter,
  StyledSectionFilter,
  StyledScrollbar,
  StyledInfoPanel,
  StyledInfoPanelWrapper,
  StyledControlContainer,
  StyledCrossIcon,
  StyledDropZoneBody,
  StyledSectionBody,
  StyledSpacer,
  StyledSectionContainer,
  StyledSectionSubmenu,
};
