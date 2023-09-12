import { smallTablet, mobile } from "@docspace/components/utils/device";
import styled, { css } from "styled-components";

import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";
import ComboBox from "@docspace/components/combobox";

import { isMobileOnly } from "react-device-detect";

export const CategoryFilterMobile = styled(DropDown)`
  position: relative;
  width: 100%;

  /* bottom: ${(props) => props.theme.mainButtonMobile.dropDown.bottom};
  z-index: ${(props) => props.theme.mainButtonMobile.dropDown.zIndex}; */
  height: calc(100vw - 128px);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  padding: 0px;

  .section-scroll,
  .scroll-body {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-left: 0px !important;`
        : `padding-right: 0px !important;`}
  }

  .separator-wrapper {
    padding: 12px 24px;
  }

  /* .is-separator {
    height: 1px !important;
    width: calc(100% - 48px);
    padding: 0 !important;
    margin: 12px 24px !important;
    background-color: ${(props) =>
    props.theme.mainButtonMobile.dropDown.separatorBackground};
  } */

  /* .drop-down-item-button {
    color: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};

    svg {
      path[fill] {
        fill: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};
      }

      path[stroke] {
        stroke: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};
      }
    }

    &:hover {
      background-color: ${(props) =>
    isMobileOnly
      ? props.theme.mainButtonMobile.buttonOptions.backgroundColor
      : props.theme.mainButtonMobile.dropDown.hoverButtonColor};
    }
  } */

  /* .action-mobile-button {
    width: 100%;
    background-color: ${(props) =>
    props.theme.mainButtonMobile.dropDown.backgroundActionMobile};
    border-radius: 3px;
    font-size: 13px;
    display: block;
  } */
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

    ${({ isMobileOpen }) =>
      isMobileOpen &&
      css`
        transform: rotate(270deg);
      `}
  }
`;

export const StyledSubItemMobile = styled(DropDownItem)`
  margin-left: 16px;
`;
