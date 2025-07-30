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

const TEXT_LENGTH = "700px";
const INPUT_LENGTH = "350px";

const UnavailableStyles = css`
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

export const StyledModules = styled.div<{ isDisabled?: boolean }>`
  margin-top: 20px;
  margin-bottom: 24px;

  .backup-description {
    margin-inline-start: 25px;
    max-width: 700px;
    color: ${(props) => props.isDisabled && props.theme.text.disableColor};
  }
`;
export const StyledAutoBackup = styled.div<{ pageIsDisabled?: boolean }>`
  ${commonStyles}

  .auto-backup_third-party-module {
    margin-top: 16px;
    margin-inline-start: 24px;
    button {
      margin-bottom: 16px;
    }
  }
  .automatic-backup_main {
    margin-bottom: 30px;
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
    margin-inline-end: 8px;
  }
  .auto-backup_storages-module {
    margin-inline-start: 24px;
    .backup_schedule-component {
      margin-inline-start: 0;
    }
  }
  .auto-backup_folder-input {
    margin-inline-start: 24px;
  }
  .backup_toggle-wrapper {
    display: flex;
    margin-top: 20px;
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
        margin-inline-start: 4px;
        cursor: auto;
      }
    }
  }

  ${(props) => props.pageIsDisabled && UnavailableStyles}
`;
