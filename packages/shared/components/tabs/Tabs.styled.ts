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
import { Base } from "../../themes";
import { TabsTypes } from "./Tabs.enums";

export const StyledTabs = styled.div<{
  stickyTop?: string;
}>`
  display: flex;
  flex-direction: column;

  .sticky {
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

    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 20.48%,
      ${(props) => props.theme.tabs.gradientColor} 100%
    );
    transform: matrix(-1, 0, 0, 1, 0, 0);
  }

  .blur-back {
    position: absolute;
    height: 32px;
    width: 60px;
    right: 0;
    pointer-events: none;

    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 20.48%,
      ${(props) => props.theme.tabs.gradientColor} 100%
    );
  }

  .tabs-body {
    width: 100%;
    display: flex;
    align-items: center;
    user-select: none;
  }
`;

StyledTabs.defaultProps = { theme: Base };

export const TabList = styled.div<{
  $type?: TabsTypes;
}>`
  display: flex;
  align-items: center;
  justify-content: inherit;

  width: 100%;
  max-height: 32px;

  overflow-x: auto;
  overflox-y: hidden;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

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
  pointer-events: ${(props) => props.isDisabled && props.$type === TabsTypes.Secondary && "none"};
  user-select: none;

  padding: ${(props) =>
    props.$type === TabsTypes.Primary ? "4px 0 0 0" : "4px 16px"};


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

    opacity: ${(props) =>
      props.$type === TabsTypes.Primary && props.isActive && 0.85};

    background-color: ${(props) =>
      props.$type === TabsTypes.Secondary &&
      !props.isActive &&
      props.theme.tabs.hoverBackgroundColorSecondary};
  };

  &:active {
    color: ${(props) =>
      props.$type === TabsTypes.Primary &&
      !props.isActive &&
      props.theme.tabs.pressedTextColorPrimary};

    opacity: ${(props) =>
      props.$type === TabsTypes.Primary && props.isActive && 1};

    background-color: ${(props) =>
      props.$type === TabsTypes.Secondary &&
      !props.isActive &&
      props.theme.tabs.pressedBackgroundColorSecondary};
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
