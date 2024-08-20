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
import {
  commonSettingsStyles,
  UnavailableStyles,
} from "../../../utils/commonSettingsStyles";

import { tablet, mobile } from "@docspace/shared/utils";

const INPUT_LENGTH = "350px";
const TEXT_LENGTH = "700px";

const floatingButtonStyles = css`
  .layout-progress-bar {
    position: fixed;
    right: 24px;
    bottom: 24px;
  }
`;
const commonStyles = css`
  .backup_modules-description {
    margin-bottom: 8px;
    max-width: ${TEXT_LENGTH};
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .backup_modules-header_wrapper {
    svg {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin: 5px 4px 0px 0px;
            `
          : css`
              margin: 5px 0px 0px 4px;
            `}
    }
    .link-learn-more {
      display: inline-block;
      margin-bottom: 20px;
      font-weight: 600;
    }
  }

  .radio-button_text {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 7px;
          `
        : css`
            margin-right: 7px;
          `}
    font-size: 13px;
    font-weight: 600;
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
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
`;

const StyledManualBackup = styled.div`
  ${commonStyles}

  ${floatingButtonStyles}

  .manual-backup_buttons {
    margin-top: 16px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 24px;
          `
        : css`
            margin-left: 24px;
          `}
    display: flex;
    align-items: center;
    justify-content: flex-start;

    button:first-child {
      max-width: 124px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 8px;
            `
          : css`
              margin-right: 8px;
            `}
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
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 24px;
          `
        : css`
            margin-left: 24px;
          `}
    .manual-backup_buttons {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 0;
            `
          : css`
              margin-left: 0;
            `}
    }
  }
  .manual-backup_third-party-module {
    margin-top: 16px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 24px;
          `
        : css`
            margin-left: 24px;
          `}
  }
  .manual-backup_folder-input {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 24px;
          `
        : css`
            margin-left: 24px;
          `}
    margin-top: 16px;
  }
`;

const StyledAutoBackup = styled.div`
  ${commonStyles}

  ${floatingButtonStyles}
  .auto-backup_third-party-module {
    margin-top: 16px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 24px;
          `
        : css`
            margin-left: 24px;
          `}
    button {
      margin-bottom: 16px;
    }
  }
  .automatic-backup_main {
    margin-bottom: 30px;
    .radio-button_text {
      font-size: 13px;
    }
  }
  .backup_toggle-btn {
    position: static;
    margin-top: 1px;
  }

  .toggle-button-text {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .input-with-folder-path {
    margin-top: 16px;
    margin-bottom: 8px;
    width: 100%;
    max-width: ${INPUT_LENGTH};
  }
  .save-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px;
          `
        : css`
            margin-right: 8px;
          `}
  }
  .auto-backup_storages-module {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 24px;
          `
        : css`
            margin-left: 24px;
          `}
    .backup_schedule-component {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 0;
            `
          : css`
              margin-left: 0;
            `}
    }
  }
  .auto-backup_folder-input {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 24px;
          `
        : css`
            margin-left: 24px;
          `}
  }
  .backup_toggle-wrapper {
    display: flex;
    margin-bottom: 16px;
    border-radius: 6px;
    background-color: ${(props) =>
      props.theme.client.settings.backup.rectangleBackgroundColor};
    padding: 12px;
    max-width: 724px;
    box-sizing: border-box;
  }

  .toggle-caption {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .toggle-caption_title {
      display: flex;
      .auto-backup_badge {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: 4px;
              `
            : css`
                margin-left: 4px;
              `}
        cursor: auto;
      }
    }
  }

  ${(props) => !props.isEnableAuto && UnavailableStyles}
`;
const StyledStoragesModule = styled.div`
  .backup_storages-buttons {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -63px;
          `
        : css`
            margin-left: -63px;
          `}
    margin-top: 40px;
  }
`;
const StyledRestoreBackup = styled.div`
  ${commonStyles}
  ${floatingButtonStyles}

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
const StyledModules = styled.div`
  margin-bottom: 24px;
  .backup-description {
    ${(props) => props.isDisabled && `color: #A3A9AE`};
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 25px;
          `
        : css`
            margin-left: 25px;
          `}
    max-width: 700px;
  }
`;

const StyledScheduleComponent = styled.div`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 24px;
        `
      : css`
          margin-left: 24px;
        `}
  .days_option {
    grid-area: days;
    width: 100%;
    ${(props) =>
      (props.weeklySchedule || props.monthlySchedule) &&
      css`
        max-width: 138px;
      `};

    @media ${mobile} {
      grid-area: time;
      max-width: ${INPUT_LENGTH};
      width: 100%;
    }
  }
  .additional_options {
    max-width: ${INPUT_LENGTH};
    display: grid;
    grid-template-columns: ${(props) =>
      props.weeklySchedule || props.monthlySchedule ? "1fr 1fr" : "1fr"};
    grid-gap: 8px;
  }
  .weekly_option,
  .month_options {
    grid-area: weekly-monthly;
    width: 100%;
    max-width: "124px";

    @media ${mobile} {
      max-width: ${INPUT_LENGTH};
    }
  }
  .schedule-backup_combobox {
    display: inline-block;
    margin-top: 8px;
  }
  .main_options {
    max-width: 363px;

    max-width: ${INPUT_LENGTH};
    display: grid;
    ${(props) =>
      props.weeklySchedule || props.monthlySchedule
        ? css`
            grid-template-areas: "days weekly-monthly time";
            grid-template-columns: 1fr 1fr 1fr;
          `
        : css`
            grid-template-areas: "days  time";
            grid-template-columns: 1fr 1fr;
          `};
    grid-gap: 8px;

    @media ${mobile} {
      display: block;
    }
  }

  .time_options {
    grid-area: time;

    @media ${mobile} {
      max-width: ${INPUT_LENGTH};
    }
    width: 100%;
  }
  .max_copies {
    width: 100%;
    max-width: ${INPUT_LENGTH};
  }
  .combo-button {
    width: 100% !important;
  }
  .combo-button-label {
    max-width: 100% !important;
    font-weight: 400;
  }
  .schedule_description {
    font-weight: 600;
  }
  .schedule_help-section {
    display: flex;
    .schedule_help-button {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin: 3px 4px 0 0;
            `
          : css`
              margin: 3px 0 0 4px;
            `}
    }
  }
`;
const StyledBackup = styled.div`
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
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin: auto 7.29px auto 0;
              `
            : css`
                margin: auto 0 auto 7.29px;
              `}
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
const StyledBackupList = styled.div`
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
      fill: #a3a9ae;
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
    color: #a3a9ae;
    grid-area: ext;
  }
  .backup-list_radio-button {
    grid-area: radiobutton;
  }
  .radio-button {
    margin: 0 !important;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 10px;
          `
        : css`
            padding-left: 10px;
          `}
  }
  .backup-list_item {
    border-radius: 3px;
    cursor: default;
    align-items: center;
    display: grid;
    height: 48px;
    grid-template-areas: "trash icon-name full-name  radiobutton";
    grid-template-columns: 25px 32px auto 32px;
    ${(props) =>
      props.isChecked &&
      css`
        background: ${(props) =>
          props.theme.client.settings.backup.backupCheckedListItemBackground};
      `}
    padding-left: 16px;
    padding-right: 16px;
  }
  .backup-restore_dialog-scroll-body {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -16px;
            margin-left: -17px;
          `
        : css`
            margin-left: -16px;
            margin-right: -17px;
          `}

    .nav-thumb-vertical {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -8px !important;
            `
          : css`
              margin-left: -8px !important;
            `}
    }
  }
  .backup-restore_empty-list {
    margin-top: 96px;
    margin-left: 16px;
    margin-right: 16px;
    color: ${(props) => props.theme.client.settings.backup.textColor};
  }

  .backup-list_content {
    display: grid;
    height: 100%;
    grid-template-rows: max-content auto max-content;
  }
`;
const StyledSettingsHeader = styled.div`
  display: flex;
  position: fixed;
  top: ${(props) => (props.isVisible ? "48px" : "-48px")};
  transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
  -moz-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
  -ms-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
  -webkit-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
  -o-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
  background-color: #fff;
  z-index: 149;
  width: 100%;
  height: 50px;
  .backup_header {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 14.5px;
          `
        : css`
            margin-left: 14.5px;
          `}
  }
  .backup_arrow-button {
    margin: auto 0;
  }
`;

const StyledComboBoxItem = styled.div`
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

export {
  StyledModules,
  StyledRestoreBackup,
  StyledScheduleComponent,
  StyledBackup,
  StyledBackupList,
  StyledManualBackup,
  StyledAutoBackup,
  StyledStoragesModule,
  StyledSettingsHeader,
  StyledComboBoxItem,
};
