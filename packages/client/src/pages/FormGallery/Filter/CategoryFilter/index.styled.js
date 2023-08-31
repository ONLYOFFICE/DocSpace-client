import { smallTablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";

export const CategoryFilter = styled.div`
  width: 220px;
  box-sizing: border-box;

  @media ${smallTablet} {
    width: 100%;
  }

  .combobox {
    cursor: pointer;
    width: 100%;
    height: 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 5px 7px;
    background: ${(props) =>
      props.theme.createEditRoomDialog.thirdpartyStorage.combobox.background};
    border-radius: 3px;
    max-height: 32px;

    border: ${(props) =>
      `1px solid ${
        props.isOpen
          ? props.theme.createEditRoomDialog.thirdpartyStorage.combobox
              .isOpenDropdownBorderColor
          : props.theme.createEditRoomDialog.thirdpartyStorage.combobox
              .dropdownBorderColor
      }`};

    transition: all 0.2s ease;
    &:hover {
      border: ${(props) =>
        `1px solid ${
          props.isOpen
            ? props.theme.createEditRoomDialog.thirdpartyStorage.combobox
                .isOpenDropdownBorderColor
            : props.theme.createEditRoomDialog.thirdpartyStorage.combobox
                .hoverDropdownBorderColor
        }`};
    }

    &-text {
      font-weight: 400;
      font-size: 13px;
      line-height: 20px;
    }

    &-expander {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 6.35px;
      svg {
        transform: ${(props) =>
          props.isOpen ? "rotate(180deg)" : "rotate(0)"};
        width: 6.35px;
        height: auto;
        path {
          fill: ${(props) =>
            props.theme.createEditRoomDialog.thirdpartyStorage.combobox
              .arrowFill};
        }
      }
    }
  }

  .dropdown-wrapper {
    width: 100%;
    box-sizing: border-box;
    position: relative;

    .dropdown-container {
      width: 100%;
      box-sizing: border-box;
      margin-top: 4px;

      .dropdown-item {
        width: 100%;
        height: 32px;
        box-sizing: border-box;
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
        padding-top: 8px;
        padding-bottom: 8px;

        .submenu-arrow {
          margin-right: 0;
          svg {
            height: 12px;
            width: 12px;
          }
        }
      }

      .mobile-sub-open {
        .submenu-arrow {
          transform: rotate(270deg);
        }
      }

      .item-by-categories:hover + .sub-by-categories {
        visibility: visible;
      }

      .item-by-types:hover + .sub-by-types {
        visibility: visible;
      }

      .item-by-compilations:hover + .sub-by-compilations {
        visibility: visible;
      }
    }
  }
`;

export const StyledSubList = styled(DropDown)`
  position: absolute;
  top: 0;
  margin-top: ${({ marginTop }) => marginTop};
  left: calc(100% + 4px);

  visibility: hidden;
  &:hover {
    visibility: visible;
  }

  &:before {
    content: "";
    position: absolute;
    left: -4px;
    top: 0;
    width: 4px;
    height: 100%;
  }
`;

export const StyledSubItemMobile = styled(DropDownItem)`
  margin-left: 16px;
`;
