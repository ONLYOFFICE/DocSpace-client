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

import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";

import { commonIconsStyles } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

const StyledCrossIcon = styled(CrossReactSvg)`
  ${commonIconsStyles}

  g {
    path {
      fill: #657077;
    }
  }

  path {
    fill: #999976;
  }
`;

const LinksBlock = styled.div`
  display: flex;
  height: 100%;
  padding-top: 3px;
  align-items: center;
  justify-content: space-between;

  p {
    color: ${({ theme }) => theme.infoPanel.members.subtitleColor};
  }

  .link-to-viewing-icon {
    svg {
      weight: 16px;
      height: 16px;
    }
  }
`;

LinksBlock.defaultProps = { theme: Base };

const StyledLinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
  background: ${(props) => props.theme.backgroundColor};

  .external-row-link {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .external-row-icons {
    margin-left: auto;
    display: flex;
    gap: 16px;
  }

  .avatar-wrapper {
    ${({ theme }) => css`
      svg {
        path {
          fill: ${theme.infoPanel.links.primaryColor} !important;
        }
      }
    `}
  }

  .clock-icon {
    svg {
      position: absolute;
      top: 0px;
      left: 0px;
    }

    width: 12px;
    height: 12px;
    border: ${(props) => `1px solid ${props.theme.backgroundColor}`};
    border-radius: 50%;
  }

  .avatar_role-wrapper {
    ${({ isExpired, theme }) => css`
      svg {
        path {
          fill: ${isExpired
            ? theme.infoPanel.links.iconErrorColor
            : theme.infoPanel.links.iconColor};
        }
      }

      circle {
        fill: ${(props) => props.theme.backgroundColor};
      }
    `}
  }
`;

StyledLinkRow.defaultProps = { theme: Base };

export { StyledCrossIcon, LinksBlock, StyledLinkRow };
