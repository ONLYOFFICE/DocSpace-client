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

import ArrowRightSvg from "PUBLIC_DIR/images/arrow.right.react.svg";

import { Tabs } from "../tabs";
import { mobile } from "../../utils/device";

import { ComboBox } from "../combobox";
import { Text } from "../text";

import { AccessRightSelect } from "../access-right-select";
import { injectDefaultTheme } from "../../utils";

const accessComboboxStyles = css`
  margin-bottom: 2px;
  max-height: 50px;

  .combo-button {
    min-height: 40px;
    padding-inline-start: ${({ theme }) => theme.comboBox.button.paddingLeft};
  }

  .combo-button-label,
  .combo-button-label:hover {
    font-size: 14px;
    text-decoration: none;
  }
`;

const StyledSelector = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  overflow: hidden;
`;

const StyledHeader = styled.div.attrs(injectDefaultTheme)<{
  withoutBorder?: boolean;
  withoutIcon: boolean;
}>`
  width: calc(100% - 53px);
  min-height: 53px;
  height: 53px;
  max-height: 53px;

  padding: 0 16px;

  ${(props) =>
    props.withoutBorder
      ? "border-bottom: none;"
      : `border-bottom: ${props.theme.selector.border};`}

  display: flex;
  align-items: center;

  .arrow-button {
    cursor: pointer;
    margin-inline-end: 12px;
    min-width: 17px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }

  .heading-text {
    font-weight: 700;
    font-size: 21px;
    line-height: 28px;
  }
`;

const StyledBody = styled.div.attrs(injectDefaultTheme)<{
  footerVisible: boolean;
  withHeader?: boolean;
  footerHeight: number;
  headerHeight: number;
  withTabs?: boolean;
}>`
  width: 100%;

  height: ${(props) =>
    props.footerVisible
      ? props.withHeader
        ? `calc(100% - ${props.footerHeight}px - ${props.headerHeight}px)`
        : `calc(100% - ${props.footerHeight}px)`
      : props.withHeader
        ? `calc(100% - ${props.headerHeight}px)`
        : "100%"};

  padding: ${({ withTabs }) => (withTabs ? "0" : "16px 0 0")};

  .search-input,
  .search-loader {
    padding: 0 16px;

    margin-bottom: 12px;
  }

  .body-description-text {
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 12px;

    padding: 0 16px;

    color: ${(props) => props.theme.selector.bodyDescriptionText};
  }

  .selector_info-bar {
    margin: 0px 20px 16px;
  }
`;

const StyledSelectAll = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  max-height: 61px;
  height: 61px;
  min-height: 61px;

  display: flex;
  align-items: center;

  cursor: pointer;

  border-bottom: ${(props) => props.theme.selector.border};

  box-sizing: border-box;

  padding: 8px 16px 20px;

  .select-all_avatar {
    min-width: 32px;
  }

  .label {
    // width: 100%;
    // max-width: 100%;

    line-height: 16px;

    margin-inline-start: 8px;
  }

  .checkbox {
    svg {
      margin-inline-end: 0px;
    }
  }
`;

const selectedCss = css`
  background: ${(props) =>
    props.theme.selector.item.selectedBackground} !important;
`;

const StyledItem = styled.div.attrs(injectDefaultTheme)<{
  isSelected: boolean | undefined;
  isDisabled?: boolean;
  isMultiSelect: boolean;
  noHover?: boolean;
}>`
  display: flex;
  align-items: center;

  padding: 0 16px;

  box-sizing: border-box;

  .room-logo__container {
    margin: 0;
  }

  .room-logo,
  .user-avatar {
    min-width: 32px;
  }

  .room-logo {
    height: 32px;

    border-radius: 6px;
  }

  .label {
    // width: 100%;
    // max-width: 100%;

    line-height: 18px;

    margin-inline-start: 8px;
  }

  .clicked-label {
    width: fit-content;
    cursor: pointer;
  }

  .input-component {
    margin-inline-start: 8px;
  }

  .checkbox {
    svg {
      margin-inline-end: 0px;
    }
  }

  .item-logo {
    min-width: 32px;
  }

  ${(props) =>
    props.isDisabled
      ? css`
          .item-logo,
          .user-avatar {
            opacity: 0.5;
          }

          .label {
            color: ${props.theme.selector.item.disableTextColor};
          }

          .disabled-text {
            text-align: end;
          }
        `
      : css`
          ${props.isSelected && !props.isMultiSelect && selectedCss}
          ${!props.noHover &&
          ` @media (hover: hover) {
            &:hover {
              cursor: pointer;
              background: ${props.theme.selector.item.hoverBackground};
            }
          }`}
        `}

  .selector-item_name {
    display: flex;
    align-items: center;
    gap: 6px;
    width: calc(100% - 32px);

    .label {
      width: unset;

      .item-file-exst {
        color: ${(props) => props.theme.filesSection.tableView.fileExstColor};
      }
    }

    svg {
      path {
        fill: ${({ theme }) => theme.navigation.lifetimeIconFill} !important;
        stroke: ${({ theme }) =>
          theme.navigation.lifetimeIconStroke} !important;
      }
    }
  }

  .title-icon {
    cursor: pointer;
  }
`;

const StyledEmptyScreen = styled.div.attrs(injectDefaultTheme)<{
  withSearch: boolean;
}>`
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;

  margin-top: ${(props) => (props.withSearch ? "80px" : "64px")};
  padding: 0 28px;

  box-sizing: border-box;

  .buttons {
    position: relative;

    width: 100%;

    margin-top: 32px;

    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;

    .empty-folder_container-links {
      display: flex;
      align-items: center;
      gap: 8px;

      .empty-folder_link {
        color: ${(props) => props.theme.selector.emptyScreen.buttonColor};
      }

      &:hover {
        .empty-folder_link {
          color: ${(props) =>
            props.theme.selector.emptyScreen.hoverButtonColor};
        }

        svg path {
          fill: ${(props) => props.theme.selector.emptyScreen.hoverButtonColor};
        }
      }
    }
  }

  .empty-image {
    max-width: 72px;
    max-height: 72px;

    margin-bottom: 32px;
  }

  .empty-header {
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;

    margin: 0;
  }

  .empty-description {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;

    text-align: center;

    color: ${(props) => props.theme.selector.emptyScreen.descriptionColor};

    margin-top: 8px;
  }
`;

const StyledNewEmptyScreen = styled.section.attrs(injectDefaultTheme)`
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;

  padding: 0 28px;

  box-sizing: border-box;

  .empty-image {
    margin-top: 64px;
  }

  .empty-header {
    font-size: 16px;
    line-height: 22px;
    font-weight: 700;
    text-align: center;

    margin: 0;

    margin-top: 32px;
  }

  .empty-description {
    font-size: 12px;
    line-height: 16px;
    text-align: center;

    margin-top: 8px;

    color: ${(props) => props.theme.selector.emptyScreen.pressedButtonColor};
  }

  .empty_button-wrapper {
    display: flex;
    justify-content: flex-start;

    align-self: flex-start;

    align-items: center;
    gap: 16px;

    padding: 12px 0;
    margin-top: 16px;
  }

  .empty-button {
    width: 36px;
    height: 36px;
  }

  .empty-button-label {
    cursor: pointer;
  }
`;

const StyledBreadCrumbs = styled.div.attrs(injectDefaultTheme)<{
  itemsCount: number;
  gridTemplateColumns: string;
}>`
  width: 100%;
  height: 38px;

  padding: 0 16px 16px;

  box-sizing: border-box;

  display: grid;

  grid-template-columns: ${(props) => props.gridTemplateColumns};

  grid-column-gap: 8px;

  align-items: center;

  .context-menu-button {
    transform: rotate(90deg);
    svg {
      path {
        fill: ${(props) => props.theme.selector.breadCrumbs.prevItemColor};
      }
    }
  }
`;

const StyledItemText = styled(Text).attrs(injectDefaultTheme)<{
  isCurrent: boolean;
  isLoading?: boolean;
}>`
  ${(props) =>
    !props.isCurrent &&
    css`
      color: ${props.theme.selector.breadCrumbs.prevItemColor};

      ${!props.isLoading && `cursor: pointer`};
    `}
`;

const StyledArrowRightSvg = styled(ArrowRightSvg).attrs(injectDefaultTheme)`
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}

  path {
    fill: ${(props) => props.theme.selector.breadCrumbs.arrowRightColor};
  }
`;

const StyledFooter = styled.div.attrs(injectDefaultTheme)<{
  withFooterInput?: boolean;
  withFooterCheckbox?: boolean;
}>`
  width: calc(100% - 32px);
  max-height: ${(props) =>
    props.withFooterCheckbox
      ? "181px"
      : props.withFooterInput
        ? "145px"
        : "73px"};
  height: ${(props) =>
    props.withFooterCheckbox
      ? "181px"
      : props.withFooterInput
        ? "145px"
        : "73px"};
  min-height: ${(props) =>
    props.withFooterCheckbox
      ? "181px"
      : props.withFooterInput
        ? "145px"
        : "73px"};

  padding: 0 16px;

  background-color: ${(props) => props.theme.backgroundColor};

  border-top: ${(props) => props.theme.selector.border};

  .button {
    min-height: 40px;

    margin-bottom: 2px;
  }
`;

const StyledNewNameContainer = styled.div`
  margin-top: 16px;

  .new-file-input {
    margin-bottom: 16px;
  }
`;

const StyledNewNameHeader = styled(Text)`
  margin-bottom: 4px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;

  margin-top: 16px;
`;

const StyledComboBox = styled(ComboBox).attrs(injectDefaultTheme)`
  ${accessComboboxStyles}
`;

const StyledAccessSelector = styled(AccessRightSelect)`
  ${accessComboboxStyles}
`;

const StyledTabs = styled(Tabs)`
  padding: 0 16px;
  margin-bottom: 16px;

  .sticky-indent {
    height: 0;
  }
`;

const StyledInfo = styled.div.attrs(injectDefaultTheme)`
  width: calc(100% - 32px);

  padding: 12px 16px;
  margin: 0 16px 12px;

  border-radius: 6px;
  box-sizing: border-box;

  background-color: ${(props) => props.theme.selector.info.backgroundColor};

  .text {
    color: ${(props) => props.theme.selector.info.color};
  }
`;

const StyledInputWrapper = styled.div.attrs(injectDefaultTheme)`
  width: 32px;
  height: 32px;

  margin-inline-start: 8px;

  border: 1px solid ${(props) => props.theme.selector.item.inputButtonBorder};
  border-radius: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;

  :hover {
    div {
      cursor: pointer;
    }
    cursor: pointer;

    border-color: ${(props) =>
      props.theme.selector.item.inputButtonBorderHover};

    path {
      fill: ${(props) => props.theme.selector.item.inputButtonBorderHover};
    }
  }
`;

// fix empty container padding with calc +24px
const StyledCreateDropDown = styled.div.attrs(injectDefaultTheme)<{
  isEmpty: boolean;
}>`
  width: ${(props) =>
    props.isEmpty ? `calc(100% + 24px)` : `calc(100% - 32px)`};
  height: fit-content;

  position: absolute;

  top: ${(props) => (props.isEmpty ? "32px" : "48px")};
  inset-inline-start: ${(props) => (props.isEmpty ? "-12px" : "16px")};
  z-index: 453;

  padding-top: 8px;

  background-color: ${(props) => props.theme.backgroundColor};

  display: flex;
  flex-direction: column;

  box-sizing: border-box;

  border: 1px solid;
  border-color: ${(props) => props.theme.selector.item.inputButtonBorder};
  border-radius: 6px;

  box-shadow: ${(props) => props.theme.dropDown.boxShadow};

  overflow: hidden;

  @media ${mobile} {
    width: 100%;

    position: fixed;
    top: unset;
    bottom: 0;
    inset-inline: 0;

    border-radius: 6px 6px 0 0;
  }
`;

export {
  StyledSelector,
  StyledHeader,
  StyledBody,
  StyledSelectAll,
  StyledItem,
  StyledEmptyScreen,
  StyledBreadCrumbs,
  StyledItemText,
  StyledArrowRightSvg,
  StyledFooter,
  StyledNewNameContainer,
  StyledNewNameHeader,
  StyledButtonContainer,
  StyledComboBox,
  StyledTabs,
  StyledInfo,
  StyledAccessSelector,
  StyledInputWrapper,
  StyledCreateDropDown,
  StyledNewEmptyScreen,
};
