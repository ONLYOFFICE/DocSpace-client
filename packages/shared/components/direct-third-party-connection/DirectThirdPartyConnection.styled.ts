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

import { mobile } from "@docspace/shared/utils";

import type {
  StyledBackupProps,
  StyledComboBoxItemProps,
} from "./DirectThirdPartyConnection.types";

export const commonSettingsStyles = css`
  .category-item-wrapper {
    margin-bottom: 40px;

    .category-item-heading {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }

    .category-item-subheader {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .category-item-description {
      color: ${(props) => props.theme.client.settings.descriptionColor};
      font-size: 12px;
      max-width: 1024px;
    }

    .inherit-title-link {
      margin-inline-end: 7px;
      font-size: 19px;
      font-weight: 600;
    }

    .link-text {
      margin: 0;
    }
  }
`;

export const StyledBackup = styled.div<StyledBackupProps>`
  ${commonSettingsStyles}
  .backup_connection {
    display: flex;
    margin-bottom: 12px;
    display: grid;

    ${(props) =>
      props.isConnectedAccount
        ? "grid-template-columns:minmax(100px,  310px) 32px"
        : "grid-template-columns:minmax(100px,  350px) 32px"};
    grid-gap: 8px;

    @media ${mobile} {
      ${(props) =>
        !props.isMobileScale
          ? ""
          : props.isConnectedAccount
            ? "grid-template-columns:minmax(100px,  1fr) 32px"
            : "grid-template-columns:minmax(100px,  1fr)"};
    }
  }

  .backup_modules-separation {
    margin-bottom: 28px;
    border-bottom: ${(props) =>
      props.theme.client.settings.backup.separatorBorder};
  }
  .backup_modules-header {
    font-size: 16px;
    font-weight: bold;
    padding-bottom: 8px;
  }
  .layout-progress-bar {
    cursor: default;
  }
  .backup-section_wrapper {
    margin-bottom: 27px;
    .backup-section_heading {
      display: flex;
      margin-bottom: 8px;
      .backup-section_text {
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
      }
      .backup-section_arrow-button {
        margin-block: auto;
        margin-inline: 7.29px 0;
      }
    }
  }
  .backup_third-party-context {
    margin-top: 4px;

    svg {
      width: 16px;
      height: 16px;
      padding: 7px;
    }
  }
`;

export const StyledComboBoxItem = styled.div<StyledComboBoxItemProps>`
  display: flex;

  .drop-down-item_text {
    color: ${({ theme, isDisabled }) =>
      isDisabled ? theme.dropDownItem.disableColor : theme.dropDownItem.color};
  }
  .drop-down-item_icon {
    display: flex;
    align-items: center;

    div {
      display: flex;
    }

    margin-inline-start: auto;

    svg {
      min-height: 16px;
      min-width: 16px;
    }
  }
`;
