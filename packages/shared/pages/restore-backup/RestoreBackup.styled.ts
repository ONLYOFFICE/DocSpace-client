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

import { mobile } from "../../utils";
import { globalColors } from "../../themes";

import type {
  StyledBackupListProps,
  StyledComboBoxItemProps,
  StyledRestoreBackupProps,
} from "./RestoreBackup.types";

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

export const UnavailableStyles = css`
  .settings_unavailable {
    color: ${(props) => props.theme.text.disableColor};
    pointer-events: none;
    cursor: default;

    label {
      color: ${(props) => props.theme.text.disableColor};
    }

    path {
      fill: ${(props) => props.theme.text.disableColor};
    }
  }
`;

export const StyledRestoreBackup = styled.div<StyledRestoreBackupProps>`
  ${commonStyles}

  max-width: ${TEXT_LENGTH};

  .restore-backup_third-party-module {
    margin-top: 16px;

    button {
      margin-bottom: 16px;
    }
  }

  .restore-description {
    max-width: ${TEXT_LENGTH};
    font-size: 13px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    line-height: 20px;
  }

  .restore-backup_warning {
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 8px;
    font-size: 16px;
    color: ${(props) => props.theme.client.settings.backup.warningColor};
  }

  .restore-backup_warning-link {
    margin-top: 16px;
    max-width: ${TEXT_LENGTH};
  }

  .restore-backup_warning-description {
    max-width: ${TEXT_LENGTH};
  }

  .restore-backup-checkbox {
    max-width: fit-content;
    margin: 24px 0;
  }
  .restore-backup-checkbox_notification {
    max-width: fit-content;
    margin-top: 11px;

    .checkbox-text {
      white-space: normal;
    }
  }

  .restore-backup_list {
    text-decoration: underline dotted;
    cursor: ${(props) => (props.isEnableRestore ? "pointer" : "cursor")};
    font-weight: 600;
  }

  .restore-backup_input {
    margin: 16px 0;
    max-width: ${INPUT_LENGTH};

    @media ${mobile} {
      max-width: none;
    }
  }

  .restore-description {
    margin-bottom: 20px;
  }

  .restore-backup_modules {
    margin-top: 24px;
  }

  .backup_radio-button {
    margin-bottom: 16px;
  }

  .restore-backup_button-container {
    position: sticky;
    bottom: 0;
    margin-top: 24px;
    background-color: ${({ theme }) => theme.backgroundColor};

    @media ${mobile} {
      padding-block: 30px;
      position: fixed;
      padding-inline: 16px;
      inset-inline: 0;
    }
  }

  .restore-backup_button {
    @media ${mobile} {
      width: 100%;
    }
  }
  ${(props) => !props.isEnableRestore && UnavailableStyles}
`;

export const StyledBackupList = styled.div<StyledBackupListProps>`
  height: 100%;
  width: 100%;
  .loader {
    height: inherit;
  }
  .backup-list-row-list {
    height: 100%;
    width: 100%;
  }
  .backup-list_trash-icon {
    width: 16px;
    height: 16px;
  }
  .backup-restore_dialog-header {
    margin-block-start: 8px;
    margin-bottom: 16px;
  }
  .backup-restore_dialog-clear {
    text-decoration: underline dotted;
    margin: 10px 0 16px 0;
  }
  .backup-list_trash-icon {
    cursor: pointer;
    margin-top: -3px;
    grid-area: trash;
    path {
      fill: ${globalColors.gray};
    }
  }
  .backup-list_icon {
    grid-area: icon-name;
  }
  .backup-list_full-name {
    grid-area: full-name;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .backup-list_file-exst {
    color: ${globalColors.gray};
    grid-area: ext;
  }
  .backup-list_radio-button {
    grid-area: radiobutton;
  }
  .radio-button {
    margin: 0 !important;
    padding-inline-start: 10px;
  }
  .backup-list_item {
    border-radius: 3px;
    cursor: default;
    align-items: center;
    display: grid;
    height: 48px;
    grid-template-areas: "trash icon-name full-name  radiobutton";
    grid-template-columns: 25px 32px auto 32px;
    ${({ isChecked, theme }) =>
      isChecked &&
      css`
        background: ${theme.client.settings.backup
          .backupCheckedListItemBackground};
      `}
    padding-inline: 16px 8px;
  }
  .backup-restore_dialog-scroll-body {
    margin-inline: -16px -7px;

    .nav-thumb-vertical {
      margin-inline-start: -8px !important;
    }
  }

  .backup-list-dialog_checked {
    width: 16px;

    > .radio-button_text:empty {
      display: none;
    }

    > svg {
      margin: 0px;
    }
  }

  .backup-restore_empty-list {
    margin-top: 96px;
    margin-inline: 16px;
    color: ${(props) => props.theme.client.settings.backup.textColor};
  }

  .backup-list_content {
    display: grid;
    height: 100%;
    grid-template-rows: max-content auto max-content;
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
