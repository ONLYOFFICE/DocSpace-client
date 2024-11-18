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

import React from "react";
import styled, { css } from "styled-components";
import { decode } from "he";

import { TableCell, TableRow } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Base } from "@docspace/shared/themes";
import { TSession } from "@docspace/shared/types/ActiveSessions";

import withSessionsContent from "SRC_DIR/HOCs/withSessionsContent";

import { SessionsTableRowProps } from "../../SecuritySessions.types";

const Wrapper = styled.div`
  display: contents;
`;

const StyledTableRow = styled(TableRow)<{
  checked: boolean;
  isActive: boolean;
}>`
  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
      border-top: ${(props) =>
        `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
      margin-top: -1px;
    }

    .table-container_user-name-cell {
      margin-inline-start: -24px;
      padding-inline-start: 24px;
    }
    .table-container_row-context-menu-wrapper {
      margin-inline-end: -20px;
      padding-inline-end: 20px;
    }
  }

  .table-container_cell {
    height: 48px;
    max-height: 48px;

    background: ${(props) =>
      (props.checked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
  }

  .table-container_row-checkbox-wrapper {
    padding-inline-end: 0;
    min-width: 48px;

    .table-container_row-checkbox {
      margin-inline-start: -4px;
      padding-block: 16px;
      padding-inline: 12px 8px;
    }
  }

  .table-cell_username {
    margin-inline-end: 12px;
  }

  .table-container_row-context-menu-wrapper {
    justify-content: flex-end;
    padding-inline-end: 0;
  }

  .session-info {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
    ::first-letter {
      text-transform: uppercase;
    }
  }

  .divider {
    display: inline-block;
    height: 12px;
    width: 2px;
    background-color: ${(props) =>
      props.theme.profile.activeSessions.dividerColor};
    margin: -2px 5px;
  }

  .online {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
    ::first-letter {
      text-transform: uppercase;
    }
  }
`;

StyledTableRow.defaultProps = { theme: Base };

const getLocationText = (session: TSession) => {
  const { country, city, ip } = session;

  if (country && city) return `${country}, ${city}`;

  return country || city || ip;
};

const SessionsTableRow = (props: SessionsTableRowProps) => {
  const {
    item,
    isChecked,
    isActive,
    onRowClick,
    onRowContextClick,
    contextOptions,
    getContextModel,
    onCheckBoxSelect,
    avatarElement,
    statusText,
  } = props;

  const { userId, displayName, session } = item;
  const { status, browser, platform } = session;

  const onCheckBoxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckBoxSelect(e.target.checked);
  };

  return (
    <Wrapper
      className={`user-item ${
        isChecked || isActive ? "table-row-selected" : ""
      }`}
    >
      <StyledTableRow
        key={userId}
        className="table-row"
        checked={isChecked}
        isActive={isActive}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        contextOptions={contextOptions}
        getContextModel={getContextModel}
      >
        <TableCell className="table-container_user-name-cell">
          <TableCell
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
            hasAccess
          >
            <div className="table-container_element">{avatarElement}</div>
            <Checkbox
              className="table-container_row-checkbox"
              isChecked={isChecked}
              onChange={onCheckBoxChange}
            />
          </TableCell>
          <Text className="table-cell_username" fontWeight="600">
            {decode(displayName)}
          </Text>
        </TableCell>

        <TableCell className="table-cell_status">
          <Text
            className={status === "online" ? "online" : "session-info"}
            truncate
          >
            {statusText}
          </Text>
        </TableCell>

        <TableCell className="table-cell_platform">
          <Text className="session-info" truncate>
            {platform},&nbsp;
          </Text>
          <Text className="session-info" truncate>
            {browser?.split(".")[0] ?? ""}
          </Text>
        </TableCell>

        <TableCell className="table-cell_location">
          <Text className="session-info" truncate>
            {getLocationText(session)}
          </Text>
        </TableCell>
      </StyledTableRow>
    </Wrapper>
  );
};

export default withSessionsContent(SessionsTableRow);
