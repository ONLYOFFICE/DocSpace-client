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

  .dropdown-container {
    margin-top: 4px;

    .combo-button-label {
      font-weight: 400;
      font-size: 13px;
      line-height: 20px;
    }
  }
`;

export const CategoryFilterItem = styled(DropDownItem)`
  width: 220px;
  height: 32px;

  box-sizing: border-box;
  padding: 8px 16px;

  font-size: 12px;
  font-weight: 600;
  line-height: 16px;

  span {
    width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .submenu-arrow {
    margin-right: 0;
    svg {
      height: 12px;
      width: 12px;
    }
  }
`;

export const CategoryFilterSubList = styled(DropDown)`
  position: absolute;
  top: 0;
  margin-top: ${({ marginTop }) => marginTop};
  left: calc(100% + 4px);
  padding: 4px 0;

  max-height: 296px;
  max-width: auto;

  visibility: hidden;
  ${({ open, isSubHovered }) =>
    open &&
    css`
      &:hover {
        visibility: visible;
      }
      ${isSubHovered &&
      css`
        visibility: visible;
      `}
    `}

  &:before {
    content: "";
    position: absolute;
    left: -4px;
    top: 0;
    width: 4px;
    height: 100%;
  }
`;

export const CategoryFilterSubListItem = styled(DropDownItem)`
  width: 208px;
  height: 36px;

  box-sizing: border-box;
  padding: 8px 16px;

  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
`;
