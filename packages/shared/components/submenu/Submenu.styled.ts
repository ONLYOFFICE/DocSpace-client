// (c) Copyright Ascensio System SIA 2010-2024
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

export const StyledSubmenu = styled.div<{ topProps?: string }>`
  display: flex;
  flex-direction: column;

  .scrollbar {
    width: 100%;
    height: auto;
  }

  .text {
    width: auto;
    display: inline-block;
    position: absolute;
  }

  .sticky {
    position: sticky;
    top: ${(props) => (props.topProps ? props.topProps : 0)};
    background: ${(props) => props.theme.submenu.backgroundColor};
    z-index: 1;
  }

  .sticky-indent {
    height: 20px;
  }
`;

StyledSubmenu.defaultProps = { theme: Base };

export const StyledSubmenuBottomLine = styled.div`
  height: 1px;
  width: 100%;
  margin-top: -1px;
  background: ${(props) => props.theme.submenu.lineColor};
`;

StyledSubmenuBottomLine.defaultProps = { theme: Base };

export const StyledSubmenuContentWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const StyledSubmenuItems = styled.div`
  overflow: scroll;

  display: flex;
  flex-direction: row;
  gap: 4px;

  width: max-content;
  overflow: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const StyledSubmenuItem = styled.div.attrs((props) => ({
  id: props.id,
}))`
  scroll-behavior: smooth;
  cursor: pointer;
  display: flex;
  gap: 4px;
  flex-direction: column;
  padding-top: 4px;
  line-height: 20px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: 17px;
        `
      : css`
          &:not(:last-child) {
            margin-right: 17px;
          }
        `}
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
`;

export const StyledSubmenuItemText = styled.div<{ isActive?: boolean }>`
  width: max-content;
  display: flex;

  .item-text {
    color: ${(props) =>
      props.isActive
        ? props.theme.submenu.activeTextColor
        : props.theme.submenu.textColor};
    font-weight: 600;
  }
`;

StyledSubmenuItemText.defaultProps = { theme: Base };

export const StyledSubmenuItemLabel = styled.div<{ isActive?: boolean }>`
  z-index: 1;
  width: 100%;
  height: 4px;
  bottom: 0px;
  border-radius: 4px 4px 0 0;
  background-color: ${(props) =>
    props.isActive ? props.theme.submenu.bottomLineColor : ""};
`;

StyledSubmenuItemLabel.defaultProps = { theme: Base };

export const SubmenuScroller = styled.div`
  position: relative;
  display: inline-block;
  flex: 1 1 auto;
  white-space: nowrap;
  scrollbar-width: none; // Firefox
  &::-webkit-scrollbar {
    display: none; // Safari + Chrome
  }
  overflow-x: auto;
  overflow-y: hidden;
`;

export const SubmenuRoot = styled.div`
  overflow: hidden;
  min-height: 32px;
  // Add iOS momentum scrolling for iOS < 13.0
  -webkit-overflow-scrolling: touch;
  display: flex;
`;

export const SubmenuScrollbarSize = styled.div`
  height: 32;
  position: absolute;
  top: -9999;
  overflow-x: auto;
  overflow-y: hidden;
  // Hide dimensionless scrollbar on macOS
  scrollbar-width: none; // Firefox
  &::-webkit-scrollbar {
    display: none; // Safari + Chrome
  }
`;

export const StyledItemLabelTheme = styled(StyledSubmenuItemLabel)<{
  $currentColorScheme?: TColorScheme;
}>`
  background-color: ${(props) =>
    props.isActive ? props.$currentColorScheme?.main?.accent : "none"};

  &:hover {
    background-color: ${(props) =>
      props.isActive && props.$currentColorScheme?.main?.accent};
  }
`;
