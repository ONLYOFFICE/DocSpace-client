import styled, { css } from "styled-components";

import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";
import ComboBox from "@docspace/components/combobox";

export const CategoryFilterWrapper = styled.div`
  position: relative;
  width: 220px;
  box-sizing: border-box;
`;

export const CategoryFilter = styled(ComboBox)`
  width: 220px;
  box-sizing: border-box;

  .combo-button-label {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
  }

  .dropdown-container {
    margin-top: 4px;
  }
`;

export const CategoryFilterItem = styled(DropDownItem)`
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
  ${({ isSubHovered }) =>
    isSubHovered &&
    css`
      visibility: visible;
    `};

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
