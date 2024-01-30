import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import * as Styled from "./index.styled";
import { TableBody } from "@docspace/shared/components/table";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { Base } from "@docspace/shared/themes";

import GroupsTableItem from "./GroupsTableItem";
import GroupsTableHeader from "./GroupsTableHeader";
import EmptyScreen from "../../EmptyScreen";
import { TableVersions } from "SRC_DIR/helpers/constants";

const COLUMNS_SIZE = `groupsColumnsSize_ver-${TableVersions.Groups}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelGroupsColumnsSize_ver-${TableVersions.Groups}`;

const GroupsTableView = ({
  groups,
  selection,
  sectionWidth,
  accountsViewAs,
  setViewAs,
  theme,
  userId,
  infoPanelVisible,

  fetchMoreAccounts,
  hasMoreAccounts,
  filterTotal,
  withPaging,
  isFiltered,
  currentDeviceType,
}) => {
  const ref = useRef(null);
  const [hideColumns, setHideColumns] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useViewEffect({
    view: accountsViewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return groups.length !== 0 || !isFiltered ? (
    <Styled.GroupsTableContainer useReactWindow={!withPaging} forwardedRef={ref}>
      <GroupsTableHeader
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        sectionWidth={sectionWidth}
        containerRef={ref}
        setHideColumns={setHideColumns}
        navigate={navigate}
        location={location}
      />
      <TableBody
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        infoPanelVisible={infoPanelVisible}
        fetchMoreFiles={fetchMoreAccounts}
        hasMoreFiles={hasMoreAccounts}
        itemCount={filterTotal}
        filesLength={groups.length}
        itemHeight={49}
        useReactWindow={!withPaging}
      >
        {groups.map((item, index) => (
          <GroupsTableItem
            theme={theme}
            key={item.id}
            item={item}
            isChecked={selection.includes(item)}
            hideColumns={hideColumns}
            itemIndex={index}
          />
        ))}
      </TableBody>
    </Styled.GroupsTableContainer>
  ) : (
    <EmptyScreen />
  );
};

export default inject(
  ({ peopleStore, auth, accessRightsStore, filesStore }) => {
    const {
      usersStore,
      groupsStore,
      filterStore,
      viewAs: accountsViewAs,
      setViewAs,
      changeType,
    } = peopleStore;

    const { groups, selection, setSelection } = groupsStore;

    const { theme, withPaging, currentDeviceType } = auth.settingsStore;
    const { peopleList, hasMoreAccounts, fetchMoreAccounts } = usersStore;
    const { filterTotal, isFiltered } = filterStore;

    const { isVisible: infoPanelVisible } = auth.infoPanelStore;

    return {
      groups,
      selection,
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
  }
)(observer(GroupsTableView));
