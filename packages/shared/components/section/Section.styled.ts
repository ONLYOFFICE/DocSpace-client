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
import { Base, globalColors } from "../../themes";
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
        margin-inline-end: -1px !important;
      }
      ${isMobileOnly &&
      css`
        & .scroll-wrapper > .scroller {
          padding-inline-end: 20px !important;
          margin-inline-end: -21px !important;
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
  z-index: 300;
  @media ${tablet} {
    z-index: 309;
    position: fixed;
    inset: 0;
  }
`;

const StyledInfoPanel = styled.div`
  height: 100%;
  width: ${INFO_PANEL_WIDTH}px;
  background-color: ${(props) => props.theme.infoPanel.backgroundColor};
  border-inline-start: 1px solid ${({ theme }) => theme.infoPanel.borderColor};
  display: flex;
  flex-direction: column;

  .scroll-body {
    padding-bottom: 20px;
  }

  @media ${tablet} {
    position: absolute;
    border: none;
    inset-inline-end: 0;
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
    inset-inline-start: -27px;
  }

  @media ${mobile} {
    display: flex;

    top: -27px;
    inset-inline-end: 10px;
    inset-inline-start: unset;
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
      padding-block: 0 16px;
      padding-inline: 20px 7px;

      @media ${tablet} {
        padding-inline: 24px 0;
      }

      @media ${mobile} {
        padding-inline: 24px 0;
      }
    `}
`;

const paddingStyles = css`
  padding-block: 19px 16px;
  padding-inline: 20px 3px;

  outline: none;

  ${settingsStudioStyles};

  @media ${tablet} {
    padding-block: 0 16px;
    padding-inline: 24px 0;
  }

  @media ${mobile} {
    padding-inline: 24px 8px;
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
  border-inline: none;
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
    ${(props) => props.viewAs === "tile" && "padding-inline-start: 20px;"}

    ${(props) =>
      (props.viewAs === "settings" || props.viewAs === "profile") &&
      css`
        padding-top: 0;

        @media ${tablet} {
          padding-top: 0;
        }
      `};

    @media ${`${mobileMore} and ${tablet}`} {
      ${({ isFormGallery }) =>
        isFormGallery &&
        css`
          padding-block: 0 20px !important;
          padding-inline: 16px 0 !important;
        `}
    }

    @media ${mobile} {
      ${({ isFormGallery }) =>
        isFormGallery && "padding: 0px 16px 16px !important;"}
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
      margin-inline-start: -20px;

      @media ${tablet} {
        margin-inline-start: -24px;
      }
    `}

  ${({ isFormGallery }) =>
    isFormGallery &&
    css`
      @media ${tablet} {
        margin-block: 0;
        margin-inline: -16px 0;
        padding: 0;
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
      margin-inline-start: -20px;

      @media ${tablet} {
        margin-inline-start: -24px;
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
    padding-inline-end: 0;
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

  .section-scroll {
    > .scroll-body {
      display: flex;
      flex-direction: column;
      padding-inline-start: 20px !important;

      @media ${tablet} {
        padding-inline-start: 16px !important;
      }
    }

    > .resize-triggers {
      direction: ltr;
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
            margin-inline-start: calc(${closeIconSize} + ${sizeBetweenIcons});
          `}
      }

      .layout-progress-bar_close-icon {
        position: static;
        width: ${closeIconSize};
        height: ${closeIconSize};

        margin-inline-end: ${sizeBetweenIcons};

        ${(props) =>
          props.showTwoProgress &&
          css`
            margin-inline-end: -${closeIconSize};
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
    margin-inline-end: 16px;
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
      -webkit-tap-highlight-color: ${globalColors.tapHighlight};
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
  padding-inline-end: 3px;

  @media ${tablet} {
    padding-inline-end: 0;
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
