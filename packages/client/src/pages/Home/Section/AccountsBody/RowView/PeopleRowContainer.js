import React from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";

import { useViewEffect } from "@docspace/common/hooks";

import RowContainer from "@docspace/components/row-container";
import { tablet } from "@docspace/components/utils/device";

import EmptyScreen from "../EmptyScreen";
import SimpleUserRow from "./SimpleUserRow";

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
`;

const PeopleRowContainer = ({
  peopleList,
  sectionWidth,
  accountsViewAs,
  setViewAs,
  theme,
  infoPanelVisible,
  isFiltered,
  fetchMoreAccounts,
  hasMoreAccounts,
  filterTotal,
  withPaging,
  currentDeviceType,
}) => {
  useViewEffect({
    view: accountsViewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return peopleList.length !== 0 || !isFiltered ? (
    <StyledRowContainer
      className="people-row-container"
      useReactWindow={!withPaging}
      fetchMoreFiles={fetchMoreAccounts}
      hasMoreFiles={hasMoreAccounts}
      itemCount={filterTotal}
      filesLength={peopleList.length}
      itemHeight={58}
    >
      {peopleList.map((item, index) => (
        <SimpleUserRow
          theme={theme}
          key={item.id}
          item={item}
          itemIndex={index}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  ) : (
    <EmptyScreen />
  );
};

export default inject(({ peopleStore, auth, filesStore }) => {
  const {
    usersStore,
    filterStore,
    viewAs: accountsViewAs,
    setViewAs,
  } = peopleStore;
  const { theme, withPaging, currentDeviceType } = auth.settingsStore;
  const { peopleList, hasMoreAccounts, fetchMoreAccounts } = usersStore;
  const { filterTotal, isFiltered } = filterStore;

  const { isVisible: infoPanelVisible } = auth.infoPanelStore;

  return {
    peopleList,
    accountsViewAs,
    setViewAs,
    theme,
    infoPanelVisible,
    withPaging,

    fetchMoreAccounts,
    hasMoreAccounts,
    filterTotal,
    isFiltered,
    currentDeviceType,
  };
})(observer(PeopleRowContainer));
