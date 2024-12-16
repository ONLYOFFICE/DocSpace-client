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
import { injectDefaultTheme, NoUserSelect } from "../../utils";
import { TColorScheme, TTheme, globalColors } from "../../themes";

const hoveredCss = css`
  background-color: ${(props) => props.theme.mainButton.hoverBackgroundColor};
  cursor: pointer;
`;
const clickCss = css`
  background-color: ${(props) => props.theme.mainButton.clickBackgroundColor};
  cursor: pointer;
`;

const notDisableStyles = css`
  &:hover {
    ${hoveredCss}
  }

  &:active {
    ${clickCss}
  }
`;

const notDropdown = css`
  &:after {
    display: none;
  }
`;

const GroupMainButton = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
`;

const StyledMainButton = styled.div.attrs(injectDefaultTheme)<{
  isDisabled?: boolean;
  isDropdown?: boolean;
}>`
  ${NoUserSelect}

  -webkit-tap-highlight-color: ${globalColors.tapHighlight};
  position: relative;
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  box-sizing: border-box;

  background-color: ${(props) =>
    props.isDisabled
      ? `${props.theme.mainButton.disableBackgroundColor}`
      : `${props.theme.mainButton.backgroundColor}`};

  padding: ${(props) => props.theme.mainButton.padding};
  border-radius: ${(props) => props.theme.mainButton.borderRadius};
  -moz-border-radius: ${(props) => props.theme.mainButton.borderRadius};
  -webkit-border-radius: ${(props) => props.theme.mainButton.borderRadius};
  line-height: ${(props) => props.theme.mainButton.lineHeight};
  border-radius: 3px;

  ${(props) => !props.isDisabled && notDisableStyles}

  ${(props) => !props.isDropdown && notDropdown}

  & > svg {
    display: block;
    margin: ${(props) => props.theme.mainButton.svg.margin};
    height: ${(props) => props.theme.mainButton.svg.height};
  }

  .main-button_text {
    display: inline;
    font-size: ${(props) => props.theme.mainButton.fontSize};
    font-weight: ${(props) => props.theme.mainButton.fontWeight};
    color: ${(props) =>
      !props.isDisabled
        ? props.theme.mainButton.textColor
        : props.theme.mainButton.textColorDisabled};
  }

  .main-button_img {
    svg {
      padding-bottom: 1px;
      path {
        fill: ${(props) => props.theme.mainButton.svg.fill};
      }
    }
  }
`;

export { StyledMainButton, GroupMainButton };

const disableStyles = css`
  opacity: 0.6;

  &:hover {
    opacity: 0.6;
    cursor: default;
  }

  &:active {
    opacity: 0.6;
    cursor: default;
    filter: none;
  }
`;

const getDefaultStyles = ({
  $currentColorScheme,
  isDisabled,
  theme,
}: {
  $currentColorScheme?: TColorScheme;
  theme: TTheme;
  isDisabled?: boolean;
}) =>
  $currentColorScheme &&
  css`
    background-color: ${$currentColorScheme.main?.accent};

    &:hover {
      background-color: ${$currentColorScheme.main?.accent};
      opacity: 0.85;
      cursor: pointer;
    }

    &:active {
      background-color: ${$currentColorScheme.main?.accent};
      opacity: 1;
      filter: ${theme.isBase ? "brightness(90%)" : "brightness(82%)"};
      cursor: pointer;
    }

    .main-button_text {
      color: ${$currentColorScheme.text?.accent};
    }

    .main-button_img svg path {
      fill: ${$currentColorScheme.text?.accent};
    }

    ${isDisabled &&
    `
    ${disableStyles}
    `}
  `;

const StyledThemeMainButton = styled(StyledMainButton)(getDefaultStyles);

export { StyledThemeMainButton };
