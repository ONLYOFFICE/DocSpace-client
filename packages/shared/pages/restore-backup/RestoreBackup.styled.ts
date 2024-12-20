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

import { globalColors } from "@docspace/shared/themes";
import type { StyledBackupListProps } from "./RestoreBackup.types";

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
    padding-inline: 16px;
  }
  .backup-restore_dialog-scroll-body {
    margin-inline: -16px 17px;

    .nav-thumb-vertical {
      margin-inline-start: -8px !important;
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
