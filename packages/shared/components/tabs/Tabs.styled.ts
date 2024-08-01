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
import { Scrollbar } from "../scrollbar";
import { Base } from "../../themes";
import { TabsTypes } from "./Tabs.enums";

export const StyledTabs = styled.div<{
  stickyTop?: string;
}>`
  display: flex;
  flex-direction: column;

  .sticky {
    height: 33px;
    position: sticky;
    position: -webkit-sticky;
    top: ${(props) => (props.stickyTop ? props.stickyTop : 0)};
    background: ${(props) => props.theme.tabs.backgroundColorPrimary};
    z-index: 1;

    display: flex;
    flex-direction: row;
  }

  .sticky-indent {
    height: 20px;
  }

  .blur-ahead {
    position: absolute;
    height: 32px;
    width: 60px;
    pointer-events: none;

    background: ${(props) =>
      props.theme.interfaceDirection === "ltr"
        ? `linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 20.48%,
      ${props.theme.tabs.gradientColor} 100%
    )`
        : `linear-gradient(
      270deg,
      rgba(255, 255, 255, 0) 20.48%,
      ${props.theme.tabs.gradientColor} 100%)`};

    transform: matrix(-1, 0, 0, 1, 0, 0);

    z-index: 1;
  }

  .blur-back {
    position: absolute;
    height: 32px;
    width: 60px;
    inset-inline-end: 0;
    pointer-events: none;

    background: ${(props) =>
      props.theme.interfaceDirection === "ltr"
        ? `linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 20.48%,
      ${props.theme.tabs.gradientColor} 100%
    )`
        : `linear-gradient(
      270deg,
      rgba(255, 255, 255, 0) 20.48%,
      ${props.theme.tabs.gradientColor} 100%)`};

    z-index: 1;
  }

  .tabs-body {
    width: 100%;
    display: flex;
    align-items: center;
    user-select: none;
  }
`;

StyledTabs.defaultProps = { theme: Base };

export const ScrollbarTabs = styled(Scrollbar)<{
  $type?: TabsTypes;
}>`
  .scroller {
    scroll-behavior: smooth;
  }

  .scroll-body {
    position: absolute;
    padding-inline-end: 0 !important;
  }

  .track {
    z-index: 0;
    padding: 0;
  }

  .track > .thumb-horizontal {
    height: 1px !important;
  }

  .thumb {
    display: ${(props) =>
      props.$type === TabsTypes.Primary ? "block" : "none"};
    background-color: rgba(100, 104, 112, 0.2) !important;
  }

  .thumb:active,
  .thumb.dragging {
    background-color: rgba(6, 22, 38, 0.3) !important;
  }
`;

export const TabList = styled.div<{
  $type?: TabsTypes;
}>`
  display: flex;
  align-items: center;
  justify-content: inherit;

  width: 100%;
  height: 32px;

  gap: ${(props) => (props.$type === TabsTypes.Primary ? "20px" : "8px")};

  border-bottom: ${(props) =>
    props.$type === TabsTypes.Primary &&
    css`1px solid ${props.theme.tabs.lineColor}`};
`;

TabList.defaultProps = { theme: Base };

export const Tab = styled.div<{
  isActive: boolean;
  isDisabled?: boolean;
  $type?: TabsTypes;
}>`
  display: flex;
  white-space: nowrap;
  flex-direction: column;
  gap: 4px;

  width: max-content;
  height: inhert;
  font-weight: 600;
  line-height: 20px;
  cursor: pointer;
  opacity: ${(props) => (props.isDisabled && props.$type === TabsTypes.Secondary ? 0.6 : 1)};
  pointer-events: ${(props) => ((props.isDisabled && props.$type === TabsTypes.Secondary) || props.isActive) && "none"};
  user-select: none;

  padding: ${(props) =>
    props.$type === TabsTypes.Primary ? "4px 0 0" : "4px 16px"};


  color: ${(props) =>
    props.$type === TabsTypes.Primary
      ? css`
          ${props.isActive
            ? props.theme.tabs.activeTextColorPrimary ||
              props.theme.currentColorScheme?.main?.accent
            : props.theme.tabs.textColorPrimary}
        `
      : css`
          ${props.isActive
            ? props.theme.tabs.activeTextColorSecondary
            : props.theme.tabs.textColorSecondary}
        `};

  background-color: ${(props) =>
    props.$type === TabsTypes.Secondary &&
    css`
      ${props.isActive
        ? props.theme.tabs.activeBackgroundColorSecondary
        : props.theme.tabs.backgroundColorSecondary}
    `};

  border: ${(props) =>
    props.$type === TabsTypes.Secondary &&
    css`1px solid ${props.theme.tabs.lineColor}`};}

  border-radius: ${(props) => props.$type === TabsTypes.Secondary && "16px"};

  &:hover {
    color: ${(props) =>
      props.$type === TabsTypes.Primary &&
      !props.isActive &&
      props.theme.tabs.hoverTextColorPrimary};

    background-color: ${(props) =>
      props.$type === TabsTypes.Secondary &&
      !props.isActive &&
      props.theme.tabs.hoverBackgroundColorSecondary};

     border: ${(props) =>
       props.$type === TabsTypes.Secondary &&
       !props.isActive &&
       css`1px solid ${props.theme.tabs.hoverBackgroundColorSecondary}`};
  };

  &:active {
    color: ${(props) =>
      props.$type === TabsTypes.Primary &&
      !props.isActive &&
      props.theme.tabs.pressedTextColorPrimary};

    background-color: ${(props) =>
      props.$type === TabsTypes.Secondary &&
      !props.isActive &&
      props.theme.tabs.pressedBackgroundColorSecondary};

    border: ${(props) =>
      props.$type === TabsTypes.Secondary &&
      !props.isActive &&
      css`1px solid ${props.theme.tabs.pressedBackgroundColorSecondary}`};
  };
`;

Tab.defaultProps = { theme: Base };

export const TabSubLine = styled.div<{
  isActive?: boolean;
  $type?: TabsTypes;
}>`
  z-index: 1;
  width: 100%;
  height: 4px;
  bottom: 0px;
  border-radius: 4px 4px 0 0;
  border-radius: 4px 4px 0 0;
  transition: transform 0.3s ease;

  display: ${(props) => props.$type === TabsTypes.Secondary && "none"};

  background-color: ${(props) =>
    props.$type === TabsTypes.Primary && props.isActive
      ? props.theme.currentColorScheme?.main?.accent
      : "transparent"};
`;
