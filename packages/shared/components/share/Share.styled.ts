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
import { DropDown } from "../drop-down";
import { globalColors } from "../../themes";

const StyledLinks = styled.div`
  margin-top: 20px;

  .title-link {
    margin-bottom: 12px;
    line-height: 16px;
    color: ${globalColors.gray};
  }

  .additional-link {
    display: flex;
    justify-content: space-between;
    gap: 10px;

    .link-to-viewing-icon {
      svg {
        weight: 16px;
        height: 16px;
      }
    }
  }
`;

const Strong = styled.strong`
  font-weight: 600;
`;

const StyledLinkRow = styled.div<{ isExpired?: boolean; isDisabled?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  height: 68px;

  opacity: ${({ isDisabled }) => (isDisabled ? 0.4 : 1)};

  .avatar-wrapper,
  .avatar-wrapper:hover {
    svg {
      path {
        fill: ${({ theme }) => theme.infoPanel.avatarColor};
      }
    }
  }

  .avatar_role-wrapper {
    svg {
      path:nth-child(3) {
        fill: ${({ theme }) => theme.backgroundColor};
      }
    }
  }

  .combo-box {
    padding: 0;
  }

  .combo-button {
    padding-inline-start: 8px;
  }

  .link-options {
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
  }

  .internal-combobox {
    padding: 0px;

    .combo-button-label {
      font-size: 14px;
    }
  }

  .link-options_title {
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    margin: 6px 8px;

    ${({ theme, isExpired }) =>
      isExpired &&
      css`
        color: ${theme.infoPanel.members.linkAccessComboboxExpired};
      `};
  }

  .link-options-title-room {
    margin-inline-start: 0px;
  }

  .expired-options {
    padding: 0px;

    .text {
      color: ${({ theme }) => theme.infoPanel.links.color};
      :hover {
        color: ${({ theme }) => theme.infoPanel.links.color};
        background: unset;
      }
    }

    & > span > a {
      padding: 0px !important;
    }
  }

  .expire-text {
    margin-inline-start: 8px;
    color: ${({ theme }) => theme.infoPanel.links.primaryColor};
  }

  .expire-text-room {
    margin-inline-start: 0px;
  }

  .link-time-info {
    color: ${({ theme }) => theme.infoPanel.links.primaryColor};
  }

  .link-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-inline-start: auto;

    .link-row_copy-icon {
      min-width: 16px;
      min-height: 16px;
    }

    .link-actions_copy-icon {
      min-width: 16px;
      min-height: 16px;
    }
  }

  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${(props) => props.theme.avatar.imageContainer.borderRadius};
    background-color: ${(props) => props.theme.avatar.icon.background};
    height: 32px;
    width: 32px;
    min-height: 32px;
    min-width: 32px;
  }

  .create-and-copy_link {
    width: 100%;
    color: ${({ theme }) => theme.infoPanel.members.createLink};
  }
`;

const StyledSquare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  padding: 10px;
  background: ${(props) => props.theme.avatar.icon.background};
  cursor: pointer;
  .icon-button_svg {
    cursor: pointer;
  }
`;

const StyledDropDown = styled(DropDown)`
  .share-link_calendar {
    position: fixed;
  }
`;

export { StyledLinks, StyledLinkRow, StyledSquare, StyledDropDown, Strong };
