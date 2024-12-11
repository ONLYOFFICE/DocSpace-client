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
import { globalColors } from "../../themes";
import { IconButtonProps } from "./IconButton.types";
import { injectDefaultTheme } from "../../utils";

const StyledOuter = styled.div.attrs(injectDefaultTheme)<IconButtonProps>`
  width: ${(props) => (props.size ? `${props.size}px` : "20px")};
  height: ${(props) => (props.size ? `${props.size}px` : "20px")};
  cursor: ${(props) =>
    props.isDisabled || !props.isClickable ? "default" : "pointer"};
  line-height: 0;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  ${(props) =>
    props.isStroke &&
    css`
      svg {
        &:not(:root) {
          width: 100%;
          height: 100%;
        }
        path {
          stroke: ${props.color || props.theme.iconButton.color};
        }
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          svg {
            path {
              stroke: ${props.isDisabled
                ? props.theme.iconButton.color
                : props.color || props.theme.iconButton.hoverColor};
            }
          }
        }
      }
    `}

  ${(props) =>
    props.isFill &&
    !props.isStroke &&
    css`
      svg {
        &:not(:root) {
          width: 100%;
          height: 100%;
        }
        path {
          fill: ${props.color || props.theme.iconButton.color};
        }
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          svg {
            path {
              fill: ${props.isDisabled
                ? props.theme.iconButton.color
                : props.color || props.theme.iconButton.hoverColor};
            }
          }
        }
      }
    `}
`;

export default StyledOuter;
