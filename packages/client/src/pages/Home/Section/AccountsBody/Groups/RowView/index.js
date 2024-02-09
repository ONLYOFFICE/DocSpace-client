import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import * as Styled from "./index.styled";
import EmptyScreenGroups from "../../EmptyScreenGroups";
import GroupsRow from "./GroupsRow";

const RowView = ({
  groups,
  sectionWidth,
  accountsViewAs,
  setViewAs,
  isFiltered,
  hasMoreGroups,
  fetchMoreGroups,
  filterTotal,
  withPaging,
  currentDeviceType,
}) => {
  useViewEffect({
    view: accountsViewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  if (groups.length === 0 || !isFiltered) return <EmptyScreenGroups />;

  console.log(groups);
  return (
    <Styled.GroupsRowContainer
      className="people-row-container"
      useReactWindow={!withPaging}
      fetchMoreFiles={fetchMoreGroups}
      hasMoreFiles={hasMoreGroups}
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
  hasMoreGroups: peopleStore.groupsStore.hasMoreGroups,
  fetchMoreGroups: peopleStore.groupsStore.fetchMoreGroups,

  filterTotal: peopleStore.groupsStore.groupsFilterTotal,
  isFiltered: peopleStore.groupsStore.groupsIsFiltered,

  withPaging: settingsStore.withPaging,
  currentDeviceType: settingsStore.currentDeviceType,
}))(observer(RowView));
