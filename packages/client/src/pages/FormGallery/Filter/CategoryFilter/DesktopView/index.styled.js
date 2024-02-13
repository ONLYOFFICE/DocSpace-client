import styled, { css } from "styled-components";

import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { ComboBox } from "@docspace/shared/components/combobox";
import { Base } from "@docspace/shared/themes";

export const CategoryFilterWrapper = styled.div`
  position: relative;
  width: 220px;
  height: 32px;
  box-sizing: border-box;
`;

export const CategoryFilter = styled(ComboBox)`
  width: 220px;
  box-sizing: border-box;
  padding: 0;

  .combo-button-label {
    font-weight: 400;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    line-height: 20px;
  }

  .dropdown-container {
    margin-top: 4px;
  }
`;

export const CategoryFilterItem = styled(DropDownItem)`
  width: 220px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  box-sizing: border-box;
  padding: 8px 12px;

  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  font-weight: 600;
  line-height: 16px;

  span {
    width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    text-align: ${({ theme }) =>
      theme.interfaceDirection !== "rtl" ? `left` : `right`};
  }

  .submenu-arrow {
    margin: 0;
    svg {
      height: 12px;
      width: 12px;
    }
  }
`;
CategoryFilterItem.defaultProps = { theme: Base };

export const CategoryFilterSubList = styled(DropDown)`
  position: absolute;
  top: 0;
  margin-top: ${({ marginTop }) => marginTop};
  padding: 4px 0;

  ${({ theme }) =>
    theme.interfaceDirection !== "rtl"
      ? css`
          left: calc(100% + 4px);
        `
      : css`
          right: calc(100% + 4px);
        `};

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

    ${({ theme }) =>
      theme.interfaceDirection !== "rtl"
        ? css`
            left: -5px;
          `
        : css`
            right: -5px;
          `};

    top: 0;
    width: 4px;
    height: 100%;
  }
`;
CategoryFilterSubList.defaultProps = { theme: Base };

export const CategoryFilterSubListItem = styled(DropDownItem)`
  width: 208px;
  height: 36px;

  box-sizing: border-box;
  padding: 8px 16px;

  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  font-weight: 600;
  line-height: 20px;
`;
