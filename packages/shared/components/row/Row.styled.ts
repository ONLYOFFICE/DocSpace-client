// (c) Copyright Ascensio System SIA 2010-2024
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
import { isMobile } from "react-device-detect";

import {
  desktop,
  mobile,
  tablet,
  getCorrectFourValuesStyle,
} from "../../utils";
import { Base } from "../../themes";

import { TMode } from "./Row.types";

const StyledRow = styled.div<{
  withoutBorder?: boolean;
  checked?: boolean;
  mode: TMode;
}>`
  cursor: default;
  position: relative;
  min-height: ${(props) => props.theme.row.minHeight};
  width: ${(props) => props.theme.row.width};
  border-bottom: ${(props) =>
    props.withoutBorder ? "none" : "2px solid transparent"};

  ${(props) =>
    !props.withoutBorder &&
    css`
      ::after {
        position: absolute;
        display: block;
        bottom: 0px;
        width: 100%;
        height: 1px;
        background-color: ${props.theme.row.borderBottom};
        content: "";
      }
    `}

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  justify-content: flex-start;
  align-items: center;
  align-content: center;

  .row-progress-loader {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 9px;`
        : `margin-left: 9px;`}
    padding: 0;
    display: flex;
    align-items: center;
    justify-items: center;
    min-width: 32px;
  }

  ${(props) =>
    props.mode === "modern" &&
    css`
      .checkbox {
        display: ${props.checked ? "flex" : "none"};

        padding: ${getCorrectFourValuesStyle(
          "10px 1px 10px 8px",
          props.theme.interfaceDirection,
        )};
        ${props.theme.interfaceDirection === "rtl"
          ? `margin-right: -4px;`
          : `margin-left: -4px;`}
      }

      .styled-element {
        display: ${props.checked ? "none" : "flex"};
      }
    `}
`;
StyledRow.defaultProps = { theme: Base };

const StyledContent = styled.div`
  display: flex;
  flex-basis: 100%;

  min-width: ${(props) => props.theme.row.minWidth};

  @media ${tablet} {
    white-space: nowrap;
    overflow: ${(props) => props.theme.row.overflow};
    text-overflow: ${(props) => props.theme.row.textOverflow};
    height: ${(props) => props.theme.rowContent.height};
  }
`;
StyledContent.defaultProps = { theme: Base };

const StyledCheckbox = styled.div<{ mode: TMode }>`
  display: flex;
  flex: 0 0 16px;
  height: 56px;
  max-height: 56px;
  justify-content: center;
  align-items: center;

  min-width: 41px;
  width: 41px;
  ${(props) =>
    props.mode === "modern" &&
    !isMobile &&
    css`
      :hover {
        .checkbox {
          display: flex;
          opacity: 1;
          user-select: none;
        }
        .styled-element {
          display: none;
        }
      }
    `}
`;

const StyledElement = styled.div`
  flex: 0 0 auto;
  display: flex;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `
      margin-left: ${theme.row.element.marginRight};
      margin-right: ${theme.row.element.marginLeft};
        `
      : `
      margin-right: ${theme.row.element.marginRight};
      margin-left: ${theme.row.element.marginLeft};
        `}
  user-select: none;

  .react-svg-icon svg {
    margin-top: 4px;
  }
  /* .react-svg-icon.is-edit svg {
    margin: 4px 0 0 28px;
  } */
`;
StyledElement.defaultProps = { theme: Base };

const StyledContentElement = styled.div`
  margin-top: 0px;
  user-select: none;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 24px;
        `
      : css`
          margin-left: 24px;
        `}

  :empty, :has(.badges__quickButtons:empty) {
    display: none;
  }
`;

const StyledOptionButton = styled.div<{ spacerWidth?: string }>`
  display: flex;
  width: ${(props) => props.spacerWidth && props.spacerWidth};
  justify-content: flex-end;
  align-items: center;
  height: 100%;

  .expandButton > div:first-child {
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle(
        theme.row.optionButton.padding,
        theme.interfaceDirection,
      )};

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 0px;`
        : `margin-right: 0px;`}

    @media ${desktop} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-left: -1px;`
          : `margin-right: -1px;`}
    }
    @media ${mobile} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `padding-right: 10px;`
          : `padding-left: 10px;`}
    }
  }

  //margin-top: -1px;
  @media ${tablet} {
    margin-top: unset;
  }
`;
StyledOptionButton.defaultProps = { theme: Base };

export {
  StyledOptionButton,
  StyledContentElement,
  StyledElement,
  StyledCheckbox,
  StyledContent,
  StyledRow,
};
