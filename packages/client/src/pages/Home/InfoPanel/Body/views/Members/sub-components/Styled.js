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
import { zIndex } from "@docspace/shared/themes";
import { injectDefaultTheme } from "@docspace/shared/utils";

const LinksBlock = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  height: 100%;

  align-items: center;
  justify-content: space-between;

  padding-bottom: 3px;
  box-sizing: border-box;

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

const StyledLinkRow = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
  background: ${(props) => props.theme.backgroundColor};

  ${(props) =>
    !props.isArchiveFolder &&
    css`
      cursor: pointer;

      .icon-button_svg {
        cursor: pointer;
      }
    `};

  .create-link-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    padding: 10px;
    background: ${(props) => props.theme.avatar.icon.background};
  }

  .external-row-link {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .external-row-icons {
    margin-inline-start: auto;
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
      inset-inline-start: 0px;
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

const ROOMS_ITEM_HEADER_HEIGHT = "80px";

export const StyledPublicRoomBarContainer = styled.div`
  position: sticky;
  top: ${ROOMS_ITEM_HEADER_HEIGHT};
  background: ${(props) => props.theme.backgroundColor};
  overflow: hidden;
  z-index: ${zIndex.content};

  .public-room-bar {
    margin-top: 0;
  }
`;

export { LinksBlock, StyledLinkRow };
