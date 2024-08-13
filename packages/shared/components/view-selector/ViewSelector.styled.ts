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
import { Base } from "../../themes";

const StyledViewSelector = styled.div<{
  isFilter?: boolean;
  countItems: number;
}>`
  height: 32px;
  width: ${(props) =>
    props.isFilter ? `32px` : `calc(${props.countItems} * 32px)`};
  position: relative;
  box-sizing: border-box;
  display: flex;

  ${(props) =>
    props.isFilter
      ? css``
      : props.countItems > 2
        ? css`
            .view-selector-icon:hover {
              z-index: 2;
            }
            .view-selector-icon:not(:first-child) {
              margin-inline-start: -1px;
            }
          `
        : css`
            .view-selector-icon:first-child {
              border-inline-end: none;
            }
            .view-selector-icon:last-child {
              border-inline-start: none;
            }
          `}
`;

const firstItemStyle = css`
  border-start-start-radius: 3px;
  border-end-start-radius: 3px;
`;

const lastItemStyle = css`
  border-start-end-radius: 3px;
  border-end-end-radius: 3px;
`;

const IconWrapper = styled.div<{
  isDisabled?: boolean;
  isChecked?: boolean;
  firstItem?: boolean;
  lastItem?: boolean;
  isFilter?: boolean;
}>`
  position: relative;
  padding: 7px;
  box-sizing: border-box;
  border: 1px solid;

  ${(props) => props.isChecked && `z-index: 1;`}

  border-color: ${(props) =>
    props.isDisabled
      ? props.theme.viewSelector.disabledFillColor
      : props.isChecked
        ? props.theme.viewSelector.checkedFillColor
        : props.theme.viewSelector.borderColor};

  ${(props) =>
    props.isFilter &&
    css`
      border-radius: 3px;
    `}

  ${(props) => props.firstItem && firstItemStyle}
  
  ${(props) => props.lastItem && lastItemStyle}

  background-color: ${(props) =>
    props.isChecked
      ? props.isDisabled
        ? props.theme.viewSelector.disabledFillColor
        : props.theme.viewSelector.checkedFillColor
      : props.isDisabled
        ? props.theme.viewSelector.fillColorDisabled
        : props.theme.viewSelector.fillColor};

  &:hover {
    ${(props) =>
      props.isDisabled || props.isChecked
        ? css`
            cursor: default;
          `
        : css`
            cursor: pointer;
            border: 1px solid ${props.theme.viewSelector.hoverBorderColor};
          `}
    svg {
      path {
        fill: ${(props) => props.theme.iconButton.hoverColor};
      }
    }
  }

  & > div {
    width: 16px;
    height: 16px;
  }

  svg {
    width: 16px;
    height: 16px;

    ${(props) =>
      !props.isDisabled
        ? !props.isChecked
          ? css`
              path {
                fill: ${props.theme.viewSelector.checkedFillColor};
              }
            `
          : css`
              path {
                fill: ${props.theme.viewSelector.fillColor};
              }
            `
        : css`
            path {
              fill: ${props.theme.viewSelector.disabledFillColorInner};
            }
          `};
  }
`;

IconWrapper.defaultProps = { theme: Base };

StyledViewSelector.defaultProps = { theme: Base };

export { StyledViewSelector, IconWrapper };
