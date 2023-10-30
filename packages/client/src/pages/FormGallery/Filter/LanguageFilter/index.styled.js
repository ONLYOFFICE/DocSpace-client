import DropDownItem from "@docspace/components/drop-down-item";
import styled, { css } from "styled-components";
import Base from "@docspace/components/themes/base";
import ComboBox from "@docspace/components/combobox";
import { mobile } from "@docspace/components/utils/device";

export const LanguageFilter = styled.div`
  width: 41px;
  box-sizing: border-box;

  .dropdown-container {
    width: 100%;
    box-sizing: border-box;
    margin-top: 4px;
  }
`;

export const LanguangeComboBox = styled(ComboBox)`
  width: 41px;
  padding: 0;
  box-sizing: border-box;

  .combo-button {
    padding: 8px;
    gap: 4px;

    .optionalBlock {
      margin: 0;
      & > div {
        width: 16px;
        height: 16px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .combo-button-label {
      display: none;
    }

    .combo-buttons_arrow-icon {
      margin: 0;
    }
  }
`;

export const LanguageFilterSelectedItem = styled(DropDownItem)`
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  .drop-down-icon {
    margin: 0;
    width: 16px;
    height: 16px;
    & > div {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const LanguageFilterItem = styled(DropDownItem)`
  height: 32px;
  width: 41px;
  box-sizing: border-box;
  padding: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.dropDownItem.hoverBackgroundColor};
    `}

  .drop-down-icon {
    margin: 0;
    width: 16px;
    height: 16px;
    line-height: 0 !important;
  }

  @media ${mobile} {
    height: 36px;
    width: 100%;
    justify-content: start;
    gap: 8px;
  }
`;

LanguageFilterItem.defaultProps = { theme: Base };
