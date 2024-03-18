// (c) Copyright Ascensio System SIA 2010-2024
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
import { TableContainer } from "@docspace/shared/components/table";
import { Base } from "@docspace/shared/themes";

export const Wrapper = styled.div`
  .users-without-email {
    font-size: 12px;
    margin: 0 0 16px;
  }

  .upper-buttons {
    margin-top: 16px;
    margin-bottom: 20px;
  }

  .data-import-progress-bar {
    width: 350px;
    margin: 12px 0 16px;
  }

  .save-cancel-buttons {
    margin-bottom: 16px;
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
      margin-right: 8px;
    }
  }
`;

export const UsersInfoBlock = styled.div`
  display: flex;
  align-items: center;
  max-width: 660px;
  background: #f8f9f9;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  .selected-users-count {
    margin-right: 24px;
  }

  .selected-admins-count {
    margin-right: 8px;
  }
`;

export const StyledTableContainer = styled(TableContainer)`
  margin: 0.5px 0px 20px;

  .table-container_header {
    position: absolute;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0px 28px 0 15px;
          `
        : css`
            padding: 0px 15px 0 28px;
          `}
  }

  .header-container-text {
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  }

  .checkboxWrapper {
    padding: 0;
    padding-inline-start: 8px;
  }

  .table-list-item {
    cursor: pointer;

    padding-left: 20px;

    &:hover {
      background-color: ${(props) =>
        props.theme.filesSection.tableView.row.backgroundActive};

      .table-container_cell {
        margin-top: -1px;
        border-top: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

        margin-left: -24px;
        padding-left: 24px;
      }

      .checkboxWrapper {
        padding-left: 32px;
      }

      .table-container_row-context-menu-wrapper {
        margin-right: -20px;
        padding-right: 20px;
      }
    }
  }

  .table-list-item:has(.selected-table-row) {
    background-color: ${(props) =>
      props.theme.filesSection.tableView.row.backgroundActive};
  }

  .clear-icon {
    margin-right: 8px;
    margin-top: 2px;
  }

  .ec-desc {
    max-width: 618px;
  }
`;

StyledTableContainer.defaultProps = { theme: Base };
