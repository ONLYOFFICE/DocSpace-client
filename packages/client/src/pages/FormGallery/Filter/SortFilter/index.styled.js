import Backdrop from "@docspace/components/backdrop";
import DropDownItem from "@docspace/components/drop-down-item";
import { mobile } from "@docspace/components/utils/device";
import styled, { css } from "styled-components";
import DropDown from "@docspace/components/drop-down";
import ComboBox from "@docspace/components/combobox";

export const SortBackdrop = styled(Backdrop)`
  /* position: relative; */
`;

export const SortButton = styled.div`
  .combo-button {
    background: ${(props) =>
      props.theme.filterInput.sort.background} !important;

    .icon-button_svg {
      cursor: pointer;
    }
  }

  .sort-combo-box {
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;

    .dropdown-container {
      top: 102%;
      bottom: auto;
      min-width: 200px;
      margin-top: 3px;

      @media ${mobile} {
        position: absolute;
        width: 100%;
        bottom: 0;
        left: 0;
        top: auto;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .optionalBlock {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }

    .combo-buttons_arrow-icon {
      display: none;
    }

    .backdrop-active {
      display: none;
    }
  }
`;

export const SortDropDown = styled(DropDown)``;

export const SortComboBox = styled(ComboBox)`
  @media ${mobile} {
    position: static;
  }
`;

export const SortDropdownItem = styled(DropDownItem)`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 200px;
  line-height: 30px;

  .sortorder-arrow {
    width: 16px;
    height: 16px;
    display: flex;
    visibility: hidden;
    cursor: pointer;

    path {
      fill: ${(props) => props.theme.filterInput.sort.sortFill};
    }
  }

  &:hover {
    .sortorder-arrow {
      visibility: visible;
    }
  }

  ${({ isSelected, theme }) =>
    isSelected
      ? css`
          background: ${theme.filterInput.sort.hoverBackground};
          cursor: auto;
          .sortorder-arrow {
            visibility: visible;
          }
        `
      : css`
          .sortorder-arrow {
            pointer-events: none;
          }
        `}

  ${({ isDescending }) =>
    isDescending &&
    css`
      .sortorder-arrow {
        transform: rotate(180deg);
      }
    `}
`;
