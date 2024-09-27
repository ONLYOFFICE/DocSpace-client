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

import { inject, observer } from "mobx-react";
import { tablet } from "@docspace/shared/utils";
import styled, { css } from "styled-components";
import { globalColors } from "@docspace/shared/themes";

import { RowContainer } from "@docspace/shared/components/row-container";
import { SessionsRowProps } from "../../SecuritySessions.types";

import SessionsRow from "./SessionsRow";

const marginStyles = css`
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;

  @media ${tablet} {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 24px;

  .row-selected + .row-wrapper:not(.row-selected) {
    .user-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .row-wrapper:not(.row-selected) + .row-selected {
    .user-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .row-hotkey-border + .row-selected {
    .user-row {
      border-top: 1px solid ${globalColors.lightBlueMain} !important;
    }
  }

  .row-selected:last-child {
    .user-row {
      border-bottom: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      padding-bottom: 1px;

      ${marginStyles}
    }
    .user-row::after {
      height: 0px;
    }
  }
  .row-selected:first-child {
    .user-row {
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      margin-top: -3px;

      ${marginStyles}
    }
  }

  .header-container-text {
    font-size: 12px;
    color: ${globalColors.gray};
  }

  .table-container_header {
    position: absolute;
  }
`;

const RowView = (props: SessionsRowProps) => {
  const { t, sectionWidth, sessionsData } = props;

  return (
    <StyledRowContainer
      className="people-row-container"
      useReactWindow={false}
      hasMoreFiles={false}
      itemHeight={58}
      itemCount={sessionsData.length}
      filesLength={sessionsData.length}
      onScroll={() => {}}
      fetchMoreFiles={() => Promise.resolve()}
    >
      {sessionsData.map((item) => (
        <SessionsRow
          t={t}
          key={item.id}
          userId={item.id}
          item={item}
          sectionWidth={sectionWidth}
          displayName={item.displayName}
          status={item.status}
          connections={item.connections}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject<TStore>(({ userStore }) => {
  const userId = userStore.user?.id ?? null;

  return {
    userId,
  };
})(observer(RowView));
