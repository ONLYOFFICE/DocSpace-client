import { inject, observer } from "mobx-react";
import { tablet } from "@docspace/components/utils/device";
import styled, { css } from "styled-components";

import RowContainer from "@docspace/components/row-container";
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
      border-top: 1px solid #2da7db !important;
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
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    color: #a3a9ae;
  }

  .table-container_header {
    position: absolute;
  }
`;

const RowView = (props) => {
  const { t, sectionWidth, sessionsData } = props;

  return (
    <StyledRowContainer
      className="people-row-container"
      useReactWindow={false}
      hasMoreFiles={false}
      itemHeight={58}
      itemCount={sessionsData.length}
      filesLength={sessionsData.length}
      fetchMoreFiles={() => {}}
    >
      {sessionsData.map((item) => (
        <SessionsRow
          t={t}
          key={item.id}
          item={item}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ auth, setup }) => {
  const { id: userId } = auth.userStore.user;
  const {
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  } = setup;

  return {
    userId,
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  };
})(observer(RowView));
