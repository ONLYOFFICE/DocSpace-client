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
import { NoUserSelect } from "../../utils";
import { Base, TColorScheme } from "../../themes";

import { Scrollbar } from "../scrollbar";

const StyledScrollbar = styled(Scrollbar)`
  width: ${(props) => props.theme.tabsContainer.scrollbar.width} !important;
  height: ${(props) => props.theme.tabsContainer.scrollbar.height} !important;
`;

StyledScrollbar.defaultProps = { theme: Base };

const NavItem = styled.div`
  position: relative;
  white-space: nowrap;
  display: flex;
`;
NavItem.defaultProps = { theme: Base };

const Label = styled.div<{ isDisabled?: boolean; selected?: boolean }>`
  height: ${(props) => props.theme.tabsContainer.label.height};
  border-radius: ${(props) => props.theme.tabsContainer.label.borderRadius};
  min-width: ${(props) => props.theme.tabsContainer.label.minWidth};
  width: ${(props) => props.theme.tabsContainer.label.width};

  .title_style {
    text-align: center;
    margin: ${(props) => props.theme.tabsContainer.label.title.margin};
    overflow: ${(props) =>
      props.theme.interfaceDirection === "rtl" ? "visible" : "hidden"};
    ${NoUserSelect};
  }

  ${(props) =>
    props.isDisabled &&
    css`
      pointer-events: none;
    `}

  ${(props) =>
    props.selected
      ? css`
          cursor: default;
          background-color: ${props.theme.tabsContainer.label.backgroundColor};
          .title_style {
            color: ${props.theme.tabsContainer.label.title.color};
          }
        `
      : css`
          &:hover {
            cursor: pointer;
            background-color: ${props.theme.tabsContainer.label
              .hoverBackgroundColor};
            .title_style {
              color: ${props.theme.tabsContainer.label.title.hoverColor};
            }
          }
        `}

${(props) =>
    props.isDisabled &&
    props.selected &&
    css`
      background-color: ${props.theme.tabsContainer.label
        .disableBackgroundColor};
      .title_style {
        color: ${props.theme.tabsContainer.label.title.disableColor};
      }
    `}
`;

Label.defaultProps = { theme: Base };

const StyledLabelTheme = styled(Label)<{ $currentColorScheme?: TColorScheme }>`
  background-color: ${(props) =>
    props.selected && props.$currentColorScheme?.main?.accent} !important;

  .title_style {
    color: ${(props) =>
      props.selected && props.$currentColorScheme?.text?.accent};
  }
`;

export { NavItem, Label, StyledScrollbar, StyledLabelTheme };
