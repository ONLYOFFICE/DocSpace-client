// (c) Copyright Ascensio System SIA 2009-2025
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

  .empty-button p {
    padding-inline-start: 16px;
  }
`;

const StyledArrowRightSvg = styled(ArrowRightSvg).attrs(injectDefaultTheme)`
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}

  path {
    fill: ${(props) => props.theme.selector.breadCrumbs.arrowRightColor};
  }
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
  StyledEmptyScreen,
  StyledArrowRightSvg,
  StyledComboBox,
  StyledTabs,
  StyledAccessSelector,
  StyledInputWrapper,
  StyledCreateDropDown,
  StyledNewEmptyScreen,
};
