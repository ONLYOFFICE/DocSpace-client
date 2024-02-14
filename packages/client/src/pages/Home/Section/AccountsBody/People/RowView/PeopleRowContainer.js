import React from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { RowContainer } from "@docspace/shared/components/row-container";
import { tablet } from "@docspace/shared/utils";

import EmptyScreen from "../../EmptyScreen";
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
      ${marginStyles}
    }
  }

  .row-wrapper:not(.row-selected) + .row-selected {
    .user-row {
      ${marginStyles}
    }
  }

  .row-list-item:first-child {
    .user-row {
      border-top: 2px solid transparent;
    }

    .row-selected {
      .user-row {
        border-top-color: ${(props) =>
          `${props.theme.filesSection.tableView.row.borderColor} !important`};
      }
    }
  }

  .row-list-item {
    margin-top: -1px;
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

export default inject(({ peopleStore, settingsStore, infoPanelStore }) => {
  const {
    usersStore,
    filterStore,
    viewAs: accountsViewAs,
    setViewAs,
  } = peopleStore;
  const { theme, withPaging, currentDeviceType } = settingsStore;
  const { peopleList, hasMoreAccounts, fetchMoreAccounts } = usersStore;
  const { filterTotal, isFiltered } = filterStore;

  const { isVisible: infoPanelVisible } = infoPanelStore;

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
