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
import { Base, TColorScheme } from "../../themes";
import { ThemeTabs } from "./Tabs.enums";

export const StyledTabs = styled.div`
  display: flex;
  flex-direction: column;

  .sticky-indent {
    height: 20px;
  }
`;

StyledTabs.defaultProps = { theme: Base };

export const TabList = styled.div<{
  $theme?: ThemeTabs;
}>`
  display: flex;
  max-height: 32px;

  overflow-x: auto;
  overflox-y: hidden;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  gap: ${(props) => (props.$theme === ThemeTabs.Primary ? "20px" : "8px")};

  border-bottom: ${(props) =>
    props.$theme === ThemeTabs.Primary &&
    css`1px solid ${props.theme.tabs.lineColor}`};
`;

TabList.defaultProps = { theme: Base };

export const Tab = styled.div<{
  isActive: boolean;
  $currentColorScheme?: TColorScheme;
  $theme?: ThemeTabs;
}>`
  display: flex;
  flex-direction: column;

  gap: 4px;
  line-height: 20px;
  width: max-content;
  font-weight: 600;
  cursor: pointer;

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  padding: ${(props) =>
    props.$theme === ThemeTabs.Primary ? "4px 0 0 0" : "4px 16px"};


  color: ${(props) =>
    props.$theme === ThemeTabs.Primary
      ? css`
          ${props.isActive
            ? props.$currentColorScheme?.main?.accent
            : props.theme.tabs.textColorPrimary}
        `
      : css`
          ${props.isActive
            ? props.theme.tabs.activeTextColorSecondary
            : props.theme.tabs.textColorSecondary}
        `};

  background-color: ${(props) =>
    props.$theme === ThemeTabs.Secondary &&
    css`
      ${props.isActive
        ? props.theme.tabs.activeBackgroundColorSecondary
        : props.theme.tabs.backgroundColorSecondary}
    `};

  border: ${(props) =>
    props.$theme === ThemeTabs.Secondary &&
    css`1px solid ${props.theme.tabs.lineColor}`};}

  border-radius: ${(props) => props.$theme === ThemeTabs.Secondary && "16px"};

  &:hover {
    color: ${(props) =>
      props.$theme === ThemeTabs.Primary &&
      !props.isActive &&
      props.theme.tabs.hoverTextColorPrimary};

    background-color: ${(props) =>
      props.$theme === ThemeTabs.Secondary &&
      !props.isActive &&
      props.theme.tabs.hoverBackgroundColorSecondary};
  };

  &:active {
    color: ${(props) =>
      props.$theme === ThemeTabs.Primary &&
      !props.isActive &&
      props.theme.tabs.pressedTextColorPrimary};

    background-color: ${(props) =>
      props.$theme === ThemeTabs.Secondary &&
      !props.isActive &&
      props.theme.tabs.pressedBackgroundColorSecondary};
  };
`;

Tab.defaultProps = { theme: Base };

export const TabSubLine = styled.div<{
  isActive?: boolean;
  $currentColorScheme?: TColorScheme;
  $theme?: ThemeTabs;
}>`
  z-index: 1;
  width: 100%;
  height: 4px;
  bottom: 0px;
  border-radius: 4px 4px 0 0;
  transition: transform 0.3s ease;

  display: ${(props) => props.$theme === ThemeTabs.Secondary && "none"};

  background-color: ${(props) =>
    props.$theme === ThemeTabs.Primary && props.isActive
      ? props.$currentColorScheme?.main?.accent
      : "transparent"};
`;

export const TabPanel = styled.div``;
