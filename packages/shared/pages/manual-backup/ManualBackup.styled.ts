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

import { mobile, tablet } from "../../utils";
import { globalColors } from "../../themes";

import type { StyledModulesProps } from "./ManualBackup.types";

const INPUT_LENGTH = "350px";
const TEXT_LENGTH = "700px";

const commonStyles = css`
  .backup_modules-description {
    margin-bottom: 8px;
    max-width: ${TEXT_LENGTH};
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .backup_modules-header_wrapper {
    svg {
      margin-block: 5px 0;
      margin-inline: 4px 0;
    }
    .link-learn-more {
      display: inline-block;
      margin-bottom: 20px;
      font-weight: 600;
    }
  }

  .radio-button_text {
    margin-inline-end: 7px;
  }

  .backup_radio-button {
    margin-bottom: 4px;
  }

  .backup_combo {
    margin-top: 16px;
    margin-bottom: 16px;
    width: 100%;
    max-width: ${INPUT_LENGTH};
    .combo-button-label {
      width: 100%;
      max-width: ${INPUT_LENGTH};
    }

    @media ${mobile} {
      max-width: 100%;
    }
  }

  .backup_text-input {
    margin: 4px 0 10px 0;
    width: 100%;
    max-width: ${INPUT_LENGTH};
    font-size: 13px;

    @media ${mobile} {
      max-width: 100%;
    }
  }

  .backup_checkbox {
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .backup_radio-button-settings {
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .backup_radio-button {
    max-width: fit-content;
    font-size: 12px;
    line-height: 15px;
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
  }
`;

export const StyledManualBackup = styled.div`
  ${commonStyles}

  .manual-backup_buttons {
    margin-top: 16px;
    margin-inline-start: 24px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    button:first-child {
      max-width: 124px;
      margin-inline-end: 8px;
    }
    button:last-child {
      max-width: 153px;
    }

    @media ${tablet} {
      button:first-child {
        max-width: 129px;
      }
      button:last-child {
        max-width: 160px;
      }
    }

    @media ${mobile} {
      button:first-child {
        max-width: 155px;
      }
      button:last-child {
        max-width: 155px;
      }
    }
  }
  .manual-backup_storages-module {
    margin-inline-start: 24px;
    .manual-backup_buttons {
      margin-inline-start: 0;
    }
  }
  .manual-backup_third-party-module {
    margin-top: 16px;
    margin-inline-start: 24px;
  }
  .manual-backup_folder-input {
    margin-inline-start: 24px;
    margin-top: 16px;
  }
`;

export const StyledModules = styled.div<StyledModulesProps>`
  margin-bottom: 24px;
  .backup-description {
    ${(props) => props.isDisabled && `color: ${globalColors.gray};`};
    margin-inline-start: 25px;
    max-width: 700px;
  }
`;

export const StyledComboBoxItem = styled.div<StyledModulesProps>`
  display: flex;

  .drop-down-item_text {
    color: ${({ theme, isDisabled }) =>
      isDisabled ? theme.dropDownItem.disableColor : theme.dropDownItem.color};
  }
  .drop-down-item_icon {
    display: flex;
    align-items: center;
    align-self: center;

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
