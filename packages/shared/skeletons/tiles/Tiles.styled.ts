import styled, { css } from "styled-components";

import Base from "@docspace/shared/themes/base";
import { mobile, tablet } from "@docspace/shared/utils";

import type { StyledBottomProps } from "./Tiles.types";

export const StyledTile = styled.div`
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

StyledTile.defaultProps = { theme: Base };

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

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 8px;`
        : `margin-left: 8px;`}
  }

  ${(props) =>
    !props.isFolder &&
    css`
      border-top-style: none;
      border-radius: 0 0 6px 6px;
    `}

  .option-button {
    min-width: 16px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 8px;`
        : `margin-left: 8px;`}
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
