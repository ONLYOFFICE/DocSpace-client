import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import * as Styled from "./index.styled";
import EmptyScreen from "../../EmptyScreen";
import GroupsRow from "./GroupsRow";

const RowView = ({
  groups,
  sectionWidth,
  accountsViewAs,
  setViewAs,
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

  if (groups.length === 0 && !isFiltered) return <EmptyScreen />;

  return (
    <Styled.GroupsRowContainer
      className="people-row-container"
      useReactWindow={!withPaging}
      fetchMoreFiles={fetchMoreAccounts}
      hasMoreFiles={hasMoreAccounts}
      itemCount={filterTotal}
      filesLength={groups.length}
      itemHeight={58}
    >
      {groups.map((item, index) => (
        <GroupsRow
          key={item.id}
          item={item}
          itemIndex={index}
          sectionWidth={sectionWidth}
        />
      ))}
    </Styled.GroupsRowContainer>
  );
};

export default inject(({ peopleStore, settingsStore }) => ({
  groups: peopleStore.groupsStore.groups,
  accountsViewAs: peopleStore.viewAs,
  setViewAs: peopleStore.setViewAs,

  peopleList: peopleStore.usersStore.peopleList,
  hasMoreAccounts: peopleStore.usersStore.hasMoreAccounts,
  fetchMoreAccounts: peopleStore.usersStore.fetchMoreAccounts,

  filterTotal: peopleStore.filterStore.filterTotal,
  isFiltered: peopleStore.filterStore.isFiltered,

  withPaging: settingsStore.withPaging,
  currentDeviceType: settingsStore.currentDeviceType,
}))(observer(RowView));
