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

import styled from "styled-components";
import { tablet, mobile } from "@docspace/shared/utils/device";

import { TableContainer } from "@docspace/shared/components/table";
import { globalColors } from "@docspace/shared/themes";
import { injectDefaultTheme } from "@docspace/shared/utils";

export const WorkspacesContainer = styled.div`
  max-width: 700px;
  margin-top: 1px;

  @media ${tablet} {
    max-width: 675px;
  }

  @media ${mobile} {
    max-width: 100%;
  }

  .data-import-description {
    color: ${(props) => props.theme.client.settings.migration.descriptionColor};
    line-height: 20px;
    margin-bottom: 20px;
    max-width: 675px;
  }

  .link-learn-more {
    display: block;
    margin-top: 8px;
  }

  .data-import-subtitle {
    margin-bottom: 21px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .workspace-list {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 20px;
  }

  .workspace-item {
    box-sizing: border-box;
    background: ${(props) =>
      props.theme.client.settings.migration.workspaceBackground};
    border: ${(props) => props.theme.client.settings.migration.workspaceBorder};
    border-radius: 6px;
    width: 340px;
    height: 64px;
    box-sizing: border-box;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    .link {
      color: ${globalColors.lightBlueMain};
    }

    &:hover {
      border-color: ${globalColors.lightBlueMain};
    }

    &:active {
      background-color: ${(props) =>
        props.theme.client.settings.migration.workspaceBackground};
    }

    @media ${tablet} {
      width: 327.5px;
    }

    @media ${mobile} {
      width: 100%;
    }

    .workspace-logo {
      display: flex;
      align-items: center;
    }
  }
`;

export const Wrapper = styled.div`
  .users-without-email {
    font-size: 12px;
    margin: 0 0 16px;
  }

  .upper-buttons {
    margin-top: 16px;
    margin-bottom: 20px;

    @media ${mobile} {
      margin: 0;
    }
  }

  .data-import-progress-bar {
    width: 350px;
    margin: 12px 0 16px;

    .progress-bar_percent,
    .progress-bar_animation {
      background: ${(props) => props.theme.progressBar.animation.background};
    }
  }

  .mt-8 {
    margin-top: 8px;
  }

  .mb-17 {
    margin-bottom: 17px;
  }

  .importUsersSearch {
    margin-top: 20px;
  }

  .sendLetterBlockWrapper {
    display: flex;
    align-items: center;
    margin: 17px 0 16px;

    .checkbox {
      margin-inline-end: 8px;
    }
  }

  .step-info-block {
    display: inline-flex;
    gap: 8px;
    background: ${(props) =>
      props.theme.client.settings.migration.infoBlockBackground};
  }
`;

export const StyledTableContainer = styled(TableContainer).attrs(
  injectDefaultTheme,
)`
  margin: 0.5px 0px 20px;

  .table-container_header {
    position: absolute;
    padding-block: 0;
    padding-inline: 28px 15px;
  }

  .header-container-text {
    font-size: 12px;
  }

  .checkboxWrapper {
    padding: 0;
    padding-inline-start: 8px;
  }

  .table-list-item {
    cursor: pointer;

    padding-inline-start: 20px;

    &:hover {
      background-color: ${(props) =>
        props.theme.filesSection.tableView.row.backgroundActive};

      .table-container_cell {
        margin-top: -1px;
        border-top: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

        margin-inline-start: -24px;
        padding-inline-start: 24px;
      }

      .checkboxWrapper {
        padding-inline-start: 32px;
      }

      .table-container_row-context-menu-wrapper {
        margin-inline-end: -20px;
        padding-inline-end: 20px;
      }
    }
  }

  .table-list-item:has(.selected-table-row) {
    background-color: ${(props) =>
      props.theme.filesSection.tableView.row.backgroundActive};
  }

  .clear-icon {
    margin-inline-end: 8px;
    margin-top: 2px;
  }

  .ec-desc {
    max-width: 618px;
  }

  .buttons-box {
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
`;

export const StyledInfoBlock = styled.div.attrs(injectDefaultTheme)`
  margin: 16px 0;
  display: inline-flex;
  align-items: center;
  background: ${(props) =>
    props.theme.client.settings.migration.infoBlockBackground};
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 6px;

  @media ${mobile} {
    width: 100%;
  }

  .selected-users-count {
    color: ${(props) =>
      props.theme.client.settings.migration.infoBlockTextColor};
    font-weight: 700;
    font-size: 14px;
  }

  .selected-admins-count {
    margin-inline-end: 8px;
    color: ${(props) =>
      props.theme.client.settings.migration.infoBlockTextColor};
    font-weight: 700;
    font-size: 14px;

    span {
      font-weight: 700;
      font-size: 14px;
      margin-inline-start: 4px;
      color: ${(props) =>
        props.theme.client.settings.migration.infoBlockTextColor};
    }
  }
`;
