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

import { injectDefaultTheme, mobile, tablet } from "@docspace/shared/utils";

import type { StyledBottomProps } from "./Tiles.types";

export const StyledTile = styled.div.attrs(injectDefaultTheme)`
  position: relative;
  display: grid;
  width: 100%;

  @media ${mobile} {
    &:nth-of-type(n + 3) {
      display: none;
    }
  }

  @media ${tablet} {
    &:nth-of-type(n + 8) {
      display: none;
    }
  }
`;

export const StyledMainContent = styled.div`
  height: 156px;

  .main-content {
    box-sizing: border-box;
    border: ${(props) => props.theme.filesSection.tilesView.tile.border};
    border-bottom-style: none;
    border-radius: 6px 6px 0 0;
  }
`;

export const StyledBottom = styled.div<StyledBottomProps>`
  display: flex;
  align-items: center;
  border: ${(props) => props.theme.filesSection.tilesView.tile.border};
  border-radius: 6px;
  padding: 15px;

  .first-content {
    height: 32px;
    width: 32px;
    min-width: 32px;
  }

  .second-content {
    width: 100%;

    margin-inline-start: 8px;
  }

  ${(props) =>
    !props.isFolder &&
    css`
      border-top-style: none;
      border-radius: 0 0 6px 6px;
    `}

  .option-button {
    min-width: 16px;
    margin-inline-start: 8px;
  }
`;

export const StyledTilesSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 216px);
  width: 100%;
  grid-gap: 16px;

  @media ${tablet} {
    grid-template-columns: repeat(auto-fill, 214px);
  }

  @media ${mobile} {
    grid-template-columns: repeat(auto-fill, minmax(214px, 1fr));
  }
`;

export const StyledTilesWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 16px;
`;

export const StyledRoomTile = styled.div`
  border: ${(props) => props.theme.filesSection.tilesView.tile.border};
  border-radius: 6px;
  height: 120px;
`;

export const StyledRoomTileTopContent = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 24px;
  gap: 8px;
  align-items: center;
  height: 61px;
  border-bottom: ${(props) => props.theme.filesSection.tilesView.tile.border};
  padding: 0 8px 0 16px;
`;

export const StyledRoomTileBottomContent = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 4px;
`;
