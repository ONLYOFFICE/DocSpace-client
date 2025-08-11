// (c) Copyright Ascensio System SIA 2009-2025
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
import { globalColors } from "@docspace/shared/themes";
import { ContextMenu } from "@docspace/shared/components/context-menu";

import {
  tablet,
  desktop,
  mobile,
  injectDefaultTheme,
} from "@docspace/shared/utils";
import TileContent from "./TileContent";

const FlexBoxStyles = css`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  justify-content: flex-start;
  align-items: center;
  align-content: center;
`;

const checkedStyle = css`
  background: ${(props) =>
    props.theme.filesSection.tilesView.tile.checkedColor} !important;
`;

const StyledTile = styled.div`
  box-sizing: border-box;
  width: 100%;
  border: ${(props) => props.theme.filesSection.tilesView.tile.border};
  border-radius: 6px;
  ${(props) =>
    props.showHotkeyBorder && `border-color: ${globalColors.lightSecondMain}`};
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  ${(props) => props.isSelected && checkedStyle}

  &:before,
  &:after {
    ${(props) =>
      props.showHotkeyBorder &&
      `border-color: ${globalColors.lightSecondMain}`};
  }

  &:before,
  &:after {
    ${(props) => props.isSelected && checkedStyle};
  }

  .file-icon {
    display: flex;
    flex: 0 0 auto;
    user-select: none;
  }

  .file-icon_container {
    width: 32px;
    height: 32px;

    margin-inline: 16px 8px;
  }

  .p-contextmenu {
    @media ${mobile} {
      z-index: 2000 !important;
      height: auto;
      position: fixed;
      width: 100%;
      top: auto;
      bottom: 0;
      inset-inline-start: 0;
    }
  }
`;

const StyledFileTileTop = styled.div`
  ${FlexBoxStyles};
  background: ${(props) =>
    props.theme.filesSection.tilesView.tile.backgroundColorTop};
  justify-content: space-between;
  align-items: baseline;
  height: 156px;
  overflow: hidden;
  position: relative;
  border-radius: 6px 6px 0 0;

  @media ${mobile} {
    position: static;
  }

  .thumbnail-image-link {
    margin: 0 auto;

    .thumbnail-image {
      pointer-events: none;
      position: relative;
      height: 100%;
      width: 100%;
      object-fit: cover;
      border-radius: 6px 6px 0 0;
      z-index: 0;
    }
  }

  .temporary-icon > .injected-svg {
    position: absolute;
    width: 100%;
    bottom: 16px;
  }
`;

const StyledFileTileBottom = styled.div`
  ${FlexBoxStyles};

  ${(props) => !props.isEdit && props.isSelected && checkedStyle}

  border-top: 1px solid transparent;
  ${(props) =>
    props.isSelected &&
    css`
      border-top: ${({ theme }) => theme.filesSection.tilesView.tile.border};
      border-radius: 0 0 6px 6px;
    `}

  padding: 9px 0;
  height: 62px;
  box-sizing: border-box;

  .tile-file-loader {
    padding-top: 4px;
    padding-inline-start: 3px;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-basis: 100%;

  a {
    display: block;
    display: -webkit-box;
    max-width: 400px;
    height: auto;
    margin: 0 auto;
    line-height: 19px;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
  }

  @media ${tablet} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledElement = styled.div`
  flex: 0 0 auto;
  display: flex;

  margin-inline-end: 4px;
  user-select: none;
  margin-top: 3px;

  height: 32px;
  width: 32px;
`;

const StyledOptionButton = styled.div.attrs(injectDefaultTheme)`
  display: block;

  .expandButton > div:first-child {
    padding-block: 8px;
    padding-inline: 12px 21px;
  }
`;

const SimpleFilesTileContent = styled(TileContent)`
  .row-main-container {
    height: auto;
    max-width: 100%;
    align-self: flex-end;
  }

  .main-icons {
    align-self: flex-end;
  }

  .item-file-name {
    display: -webkit-box;
  }

  .badge {
    margin-inline-end: 8px;
    cursor: pointer;
    height: 16px;
    width: 16px;
  }

  .new-items {
    position: absolute;
    inset-inline-end: 29px;
    top: 19px;
  }

  .badges {
    display: flex;
    align-items: center;
  }

  .share-icon {
    margin-top: -4px;
    padding-inline-end: 8px;
  }

  .favorite,
  .can-convert,
  .edit {
    svg:not(:root) {
      width: 14px;
      height: 14px;
    }
  }

  @media ${tablet} {
    display: inline-flex;
    height: auto;

    & > div {
      margin-top: 0;
    }
  }
`;

const StyledTileContainer = styled.div.attrs(injectDefaultTheme)`
  position: relative;
  height: 100%;

  @media ${tablet} {
    margin-inline-end: 0 !important;
  }

  .tile-item-wrapper {
    position: relative;
    width: 100%;

    &.file {
      padding: 0;
    }
    &.folder {
      padding: 0;
    }
  }

  .tile-items-heading {
    margin: 0;
    margin-bottom: 15px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    div {
      cursor: pointer !important;

      .sort-combo-box {
        margin-inline-end: 3px;
        .dropdown-container {
          top: 104%;
          bottom: auto;
          min-width: 200px;
          margin-top: 3px;

          .option-item {
            display: flex;
            align-items: center;
            justify-content: space-between;

            min-width: 200px;

            svg {
              width: 16px;
              height: 16px;
            }

            .option-item__icon {
              display: none;
              cursor: pointer;
              ${(props) =>
                !props.isDesc &&
                css`
                  transform: rotate(180deg);
                `}

              path {
                fill: ${(props) => props.theme.filterInput.sort.sortFill};
              }
            }

            :hover {
              .option-item__icon {
                display: flex;
              }
            }
          }

          .selected-option-item {
            background: ${(props) =>
              props.theme.filterInput.sort.hoverBackground};
            cursor: auto;

            .selected-option-item__icon {
              display: flex;
            }
          }
        }

        .optionalBlock {
          display: flex;
          flex-direction: row;
          align-items: center;

          font-size: 12px;
          font-weight: 600;

          color: ${(props) => props.theme.filterInput.sort.tileSortColor};

          .sort-icon {
            margin-inline-end: 8px;
            svg {
              path {
                fill: ${(props) => props.theme.filterInput.sort.tileSortFill};
              }
            }
          }
        }

        .combo-buttons_arrow-icon {
          display: none;
        }
      }
    }
  }

  @media ${tablet} {
    margin-inline-end: -3px;
  }
`;

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  /* Cards should all have same height with dynamic content */
  &.Card {
    height: 100%;
  }
`;

const StyledItem = styled.div`
  display: grid;

  /* Default: 2 FileTiles per row for screens < 600px */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 1fr; /* Force all rows to be the same height */

  width: 100%;
  box-sizing: border-box;

  /* Ensure all Cards in a row have identical heights */
  .Card {
    height: 100%;
  }

  @media (min-width: 600px) and (max-width: 839px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 840px) and (max-width: 1199px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (min-width: 1200px) and (max-width: 1439px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  @media (min-width: 1440px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  ${(props) =>
    props.isOneTile &&
    css`
      grid-template-columns: 1fr;
    `}

  /* Maintain 16px gap between items in all directions */
  grid-gap: 16px;
`;

const StyledContextMenu = styled(ContextMenu)`
  @media ${mobile} {
    position: fixed;
    height: min-content;
    top: auto !important;
    bottom: 0;
    inset-inline-start: 0;
    width: 100%;
  }
`;

export {
  StyledTile,
  StyledFileTileTop,
  StyledFileTileBottom,
  StyledContent,
  StyledElement,
  StyledOptionButton,
  SimpleFilesTileContent,
  StyledTileContainer,
  StyledCard,
  StyledItem,
  StyledContextMenu,
};
