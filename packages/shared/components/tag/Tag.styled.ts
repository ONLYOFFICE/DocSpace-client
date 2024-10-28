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

import { ReactSVG } from "react-svg";
import styled, { css } from "styled-components";

import { Text } from "../text";

import { globalColors } from "../../themes";
import { injectDefaultTheme } from "../../utils";

const StyledTag = styled.div.attrs(injectDefaultTheme)<{
  tagMaxWidth?: string;
  isLast?: boolean;
  isDisabled?: boolean;
  isDeleted?: boolean;
  isNewTag?: boolean;
  isDefault?: boolean;
  isClickable?: boolean;
}>`
  width: fit-content;

  max-width: ${(props) => (props.tagMaxWidth ? props.tagMaxWidth : "100%")};

  display: flex;
  align-items: center;

  box-sizing: border-box;

  padding: 2px 10px;
  margin-inline-end: ${({ isLast }) => (isLast ? "0" : "4px")};

  background: ${(props) =>
    props.isDisabled
      ? props.theme.tag.disabledBackground
      : props.isNewTag
        ? props.theme.tag.newTagBackground
        : props.theme.tag.background};

  border-radius: 6px;

  .tag-text {
    color: ${(props) =>
      props.isDefault
        ? props.theme.tag.defaultTagColor
        : props.theme.tag.color};
    line-height: 20px;
    pointer-events: none;
  }

  ${({ isDeleted, theme }) =>
    isDeleted &&
    css`
      background: ${theme.tag.deletedBackground};
      .tag-text {
        text-decoration: line-through;
        color: ${theme.tag.deletedColor};
      }
    `}

  .tag-icon {
    margin-inline-start: 12px;

    cursor: pointer;
  }

  .third-party-tag {
    padding: 2px 0px;
    width: 16px;
    height: 16px;

    ${(props) =>
      !props.theme.isBase &&
      css`
        svg {
          path[fill] {
            fill: ${globalColors.white};
        }

          path[stroke] {
            stroke: ${globalColors.white};
          }
        `}
    }
  }

  ${(props) =>
    props.isClickable &&
    !props.isDisabled &&
    !props.isDeleted &&
    css`
      cursor: pointer;
      &:hover {
        background: ${!props.isNewTag
          ? props.theme.tag.hoverBackground
          : props.theme.tag.newTagHoverBackground};
      }
    `}
`;

const StyledDropdownIcon = styled(ReactSVG)`
  display: flex;
  align-items: center;

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      transform: scaleX(-1);
    `}

  pointer-events: none;

  svg {
    path:first-child {
      stroke: ${(props) => props.theme.tag.color};
    }
    path:last-child {
      fill: ${(props) => props.theme.tag.color};
    }
  }
`;

const StyledDropdownText = styled(Text)<{ removeTagIcon?: boolean }>`
  line-height: 30px;
  display: block;
  pointer-events: none;
  ${(props) =>
    !props.removeTagIcon &&
    css`
      ${props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 8px !important;
          `
        : css`
            margin-left: 8px !important;
          `}
    `}
`;

export { StyledTag, StyledDropdownText, StyledDropdownIcon };
