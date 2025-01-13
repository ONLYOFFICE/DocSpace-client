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

import styled from "styled-components";

import { injectDefaultTheme, tablet } from "../../../utils";

import { StyledInfoPanelHeaderProps } from "./Header.types";

const getHeaderHeight = ({
  withSubmenu,
  isTablet,
}: StyledInfoPanelHeaderProps) => {
  let res = isTablet ? 53 : 69;
  if (withSubmenu) res += 32;
  return `${res}px`;
};

const getMainHeight = ({
  withSubmenu,
  isTablet,
}: StyledInfoPanelHeaderProps) => {
  let res = isTablet ? 52 : 68;
  if (withSubmenu) res += 1;
  return `${res}px`;
};

const StyledInfoPanelHeader = styled.div.attrs(
  injectDefaultTheme,
)<StyledInfoPanelHeaderProps>`
  width: 100%;
  max-width: 100%;

  height: ${(props) => getHeaderHeight(props)};
  min-height: ${(props) => getHeaderHeight(props)};
  @media ${tablet} {
    height: ${(props) => getHeaderHeight({ ...props, isTablet: true })};
    min-height: ${(props) => getHeaderHeight({ ...props, isTablet: true })};
  }

  display: flex;
  flex-direction: column;
  border-bottom: ${(props) =>
    props.withSubmenu
      ? "none"
      : `1px solid ${props.theme.infoPanel.borderColor}`};
  .main {
    padding: 0 20px;
    box-sizing: border-box;
    height: ${(props) => getMainHeight(props)};
    min-height: ${(props) => getMainHeight(props)};
    @media ${tablet} {
      height: ${(props) => getMainHeight({ ...props, isTablet: true })};
      min-height: ${(props) => getMainHeight({ ...props, isTablet: true })};
    }

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .submenu {
    display: flex;
    height: 32px;
    width: 100%;
    justify-content: center;
    align-items: center;
    gap: 40px;
    border-bottom: ${(props) =>
      `1px solid ${props.theme.infoPanel.borderColor}`};
  }
`;

export { StyledInfoPanelHeader };
