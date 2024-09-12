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

import { tablet, mobile } from "../../utils";
import { Base, globalColors } from "../../themes";
import { TViewAs } from "../../types";

import { SearchInput } from "../search-input";
import { ToggleButton } from "../toggle-button";
import { Text } from "../text";

const StyledFilterInput = styled.div`
  width: 100%;

  display: flex;

  flex-direction: column;

  margin: 0;
  padding: 0;

  .filter-input_filter-row {
    width: 100%;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: start;

    margin-bottom: 8px;
  }

  .filter-input_selected-row {
    width: 100%;
    min-height: 32px;

    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;

    margin-bottom: 8px;

    .clear-all-link {
      margin-inline-start: 12px;
    }
  }
`;

const StyledSearchInput = styled(SearchInput)`
  width: 100%;
`;

const StyledButton = styled.div<{ isOpen: boolean }>`
  width: 32px;
  min-width: 32px;
  height: 32px;

  position: relative;

  border: ${(props) => props.theme.filterInput.button.border};
  border-radius: 3px;

  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0;
  padding: 0;

  margin-inline-start: 8px;

  cursor: pointer;

  &:hover {
    border: ${(props) => props.theme.filterInput.button.hoverBorder};
    svg {
      path {
        fill: ${(props) => props.theme.iconButton.hoverColor};
      }
    }
  }

  div {
    cursor: pointer;
  }

  ${(props) =>
    props.isOpen &&
    css`
      background: ${props.theme.filterInput.button.openBackground};
      pointer-events: none;

      svg {
        path {
          fill: ${props.theme.filterInput.button.openFill};
        }
      }

      .dropdown-container {
        margin-top: 5px;
        min-width: 200px;
        width: 200px;
      }
    `}

  -webkit-tap-highlight-color: ${globalColors.tapHighlight};
`;

StyledButton.defaultProps = { theme: Base };

const StyledFilterBlock = styled.div`
  position: fixed;
  top: 0;

  inset-inline-end: 0;

  width: 480px;
  height: 100%;

  z-index: 400;

  display: flex;
  flex-direction: column;

  background: ${(props) => props.theme.filterInput.filter.background};

  @media ${tablet} {
    max-width: 100%;
  }

  @media ${mobile} {
    bottom: 0;
    top: unset;
    height: 100%;
    width: 100%;
    max-width: 100%;
  }

  .people-selector {
    height: 100%;
    width: 100%;

    .selector-wrapper,
    .column-options {
      width: 100%;
    }
  }

  .filter-body {
    height: calc(100% - 125px);

    .combo-item {
      padding: 0;
    }

    .combo-button {
      justify-content: space-between;

      .combo-button-label {
        font-size: 13px;
        font-weight: 400;
        line-height: 20px;
      }
    }
  }
`;

StyledFilterBlock.defaultProps = { theme: Base };

const StyledFilterBlockItem = styled.div<{
  withoutHeader: boolean;
  isFirst?: boolean;
}>`
  margin: ${(props) =>
    props.withoutHeader ? "0" : props.isFirst ? "12px 0 0" : "16px 0 0"};
  padding-inline: 0 16px;
  max-width: 100%;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: start;
`;

const StyledFilterBlockItemHeader = styled.div`
  height: 16px;
  line-height: 16px;
  margin-inline-end: -16px;

  display: flex;
  align-items: center;
`;

const StyledFilterBlockItemContent = styled.div<{
  withoutSeparator?: boolean;
  withMultiItems?: boolean;
}>`
  margin-block: ${(props) => (props.withoutSeparator ? "12px 0" : "12px 16px")};
  margin-inline: 0 -16px;
  height: fit-content;

  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;

  gap: ${(props) => (props.withMultiItems ? "12px 8px" : "8px")};
`;

const StyledFilterBlockItemSelector = styled.div`
  height: 32px;
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledFilterBlockItemSelectorText = styled(Text)`
  font-weight: 600;
  font-size: 13px;
  line-height: 15px;
  color: ${(props) => props.theme.filterInput.filter.color};
  margin-inline-start: 8px;
  cursor: pointer;
`;

StyledFilterBlockItemSelectorText.defaultProps = { theme: Base };

// const selectedItemTag = css`
//   background: ${(props) =>
//     props.theme.filterInput.filter.selectedItem.background};
//   border-color: ${(props) =>
//     props.theme.filterInput.filter.selectedItem.border};
// `;

const selectedItemTagText = css`
  color: ${(props) => props.theme.filterInput.filter.selectedItem.color};
  font-weight: 600;
`;

const StyledFilterBlockItemTagText = styled(Text)<{ isSelected?: boolean }>`
  height: 20px;

  font-weight: 400;
  font-size: 13px;
  line-height: 20px;

  ${(props) => props.isSelected && selectedItemTagText}
`;

StyledFilterBlockItemTagText.defaultProps = { theme: Base };

const StyledFilterBlockItemTagIcon = styled.div`
  margin-inline-start: 8px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    path {
      fill: ${(props) => props.theme.filterInput.filter.selectedItem.color};
    }
  }
`;

StyledFilterBlockItemTagIcon.defaultProps = { theme: Base };

const StyledFilterBlockItemToggle = styled.div`
  width: 100%;
  height: 36px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const StyledFilterBlockItemToggleText = styled(Text)`
  font-weight: 600;
  font-size: 13px;
  line-height: 36px;
`;

const StyledFilterBlockItemToggleButton = styled(ToggleButton)`
  position: static;

  grid-gap: 0px;
`;
const StyledFilterBlockItemCheckboxContainer = styled.div`
  .checkbox {
    margin-inline-end: 8px !important;
  }

  .checkbox-text {
    line-height: 20px;
  }
`;

const StyledFilterBlockItemSeparator = styled.div`
  height: 1px;
  width: calc(100% + 16px);
  margin-inline-end: 16px;

  background: ${(props) => props.theme.filterInput.filter.separatorColor};
`;

StyledFilterBlockItemToggleButton.defaultProps = { theme: Base };

const selectedViewIcon = css`
  svg {
    path {
      fill: ${(props) => props.theme.filterInput.sort.selectedViewIcon};
    }
  }
`;

const notSelectedViewIcon = css`
  svg {
    path {
      fill: ${(props) => props.theme.filterInput.sort.viewIcon};
    }
  }
`;

const StyledSortButton = styled.div<{ viewAs: TViewAs; isDesc: boolean }>`
  .combo-button {
    background: ${(props) =>
      props.theme.filterInput.sort.background} !important;
    padding-inline-end: 4px;

    .icon-button_svg {
      cursor: pointer;
    }
    :hover {
      border-color: ${(props) => props.theme.iconButton.color};
      svg {
        path {
          fill: ${(props) => props.theme.iconButton.hoverColor};
        }
      }
    }
  }

  .sort-combo-box {
    width: 32px;
    height: 32px;

    margin-inline-start: 8px;

    .dropdown-container {
      top: 102%;
      bottom: auto;
      min-width: 200px;
      margin-top: 3px;
      width: auto;

      .view-selector-item {
        display: flex;
        align-items: center;
        justify-content: space-between;

        cursor: auto;

        .view-selector {
          width: 44px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          cursor: auto;

          .view-selector-icon {
            border: none;
            background: transparent;
            padding: 0;

            div {
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }

          .view-selector-icon:nth-child(1) {
            ${(props) =>
              props.viewAs === "row" ? selectedViewIcon : notSelectedViewIcon};
          }

          .view-selector-icon:nth-child(2) {
            ${(props) =>
              props.viewAs !== "row" ? selectedViewIcon : notSelectedViewIcon};
          }
        }
      }

      .option-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-width: 200px;

        svg {
          width: 16px;
          height: 16px;
        }

        .option-item__icon {
          display: flex;
          visibility: hidden;
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
            visibility: visible;
          }
        }
      }

      .selected-option-item {
        background: ${(props) => props.theme.filterInput.sort.hoverBackground};
        cursor: pointer;

        .selected-option-item__icon {
          visibility: visible;
        }
      }
    }

    .optionalBlock {
      display: flex;
      align-items: center;
      justify-content: center;

      margin-inline-end: 0;
    }

    .combo-buttons_arrow-icon {
      display: none;
    }

    .backdrop-active {
      display: none;
    }
  }
`;

StyledSortButton.defaultProps = { theme: Base };

const StyledFilterBlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .additional-icons-container {
    margin-inline: 16px;
  }
`;

export {
  StyledSortButton,
  StyledFilterBlock,
  StyledFilterBlockItem,
  StyledFilterBlockItemHeader,
  StyledFilterBlockItemContent,
  StyledFilterBlockItemSelector,
  StyledFilterBlockItemSelectorText,
  StyledFilterBlockItemTagText,
  StyledFilterBlockItemTagIcon,
  StyledFilterBlockItemToggle,
  StyledFilterBlockItemToggleText,
  StyledFilterBlockItemToggleButton,
  StyledFilterBlockItemCheckboxContainer,
  StyledFilterBlockItemSeparator,
  StyledFilterBlockHeader,
};

export { StyledFilterInput, StyledSearchInput, StyledButton };
