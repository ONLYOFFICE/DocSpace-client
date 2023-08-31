import DropDownItem from "@docspace/components/drop-down-item";
import styled, { css } from "styled-components";
import Base from "@docspace/components/themes/base";

export const LanguageFilter = styled.div`
  width: 41px;
  box-sizing: border-box;

  .combobox {
    cursor: pointer;
    width: 100%;
    height: 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 4px;
    padding: 8px;
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

    &-icon {
      width: 16px;
      height: 16px;
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
    }

    .dropdown-item {
      width: 100%;
      height: 32px;
      width: 41px;
      box-sizing: border-box;
      padding: 8px;

      display: flex;
      align-items: center;
      justify-content: center;

      .drop-down-icon {
        margin-right: 0;
        width: 16px;
        height: 16px;
        line-height: 0 !important;
      }
    }
  }
`;

export const LanguageFilterItem = styled(DropDownItem)`
  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.dropDownItem.hoverBackgroundColor};
    `}
`;
LanguageFilterItem.defaultProps = { theme: Base };
