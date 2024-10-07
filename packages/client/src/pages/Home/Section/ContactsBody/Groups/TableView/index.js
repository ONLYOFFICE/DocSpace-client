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

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router-dom";
import * as Styled from "./index.styled";
import { TableBody } from "@docspace/shared/components/table";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import GroupsTableItem from "./GroupsTableItem";
import GroupsTableHeader from "./GroupsTableHeader";
import EmptyScreenGroups from "../../EmptyScreenGroups";
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

  withPaging,
  currentDeviceType,

  fetchMoreGroups,
  hasMoreGroups,
  groupsIsFiltered,
  groupsFilterTotal,

  peopleAccountsGroupsColumnIsEnabled,
  managerAccountsGroupsColumnIsEnabled,
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

  return groups.length ? (
    <Styled.GroupsTableContainer
      useReactWindow={!withPaging}
      forwardedRef={ref}
    >
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
        fetchMoreFiles={fetchMoreGroups}
        hasMoreFiles={hasMoreGroups}
        itemCount={groupsFilterTotal}
        filesLength={groups.length}
        itemHeight={48}
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
            managerAccountsGroupsColumnIsEnabled={
              managerAccountsGroupsColumnIsEnabled
            }
            peopleAccountsGroupsColumnIsEnabled={
              peopleAccountsGroupsColumnIsEnabled
            }
          />
        ))}
      </TableBody>
    </Styled.GroupsTableContainer>
  ) : (
    <EmptyScreenGroups />
  );
};

export default inject(
  ({
    peopleStore,
    accessRightsStore,
    filesStore,
    settingsStore,
    infoPanelStore,
    userStore,
    tableStore,
  }) => {
    const {
      usersStore,
      groupsStore,
      viewAs: accountsViewAs,
      setViewAs,
    } = peopleStore;

    const {
      groups,
      selection,
      setSelection,

      fetchMoreGroups,
      hasMoreGroups,
      groupsIsFiltered,
      groupsFilterTotal,
    } = groupsStore;

    const { theme, withPaging, currentDeviceType } = settingsStore;
    const { fetchMoreUsers } = usersStore;
    const { id: userId } = userStore.user;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    const {
      managerAccountsGroupsColumnIsEnabled,
      peopleAccountsGroupsColumnIsEnabled,
    } = tableStore;

    return {
      groups,
      selection,
      accountsViewAs,
      setViewAs,
      theme,
      infoPanelVisible,
      withPaging,

      fetchMoreUsers,
      currentDeviceType,

      userId,

      fetchMoreGroups,
      hasMoreGroups,
      groupsIsFiltered,
      groupsFilterTotal,

      peopleAccountsGroupsColumnIsEnabled,
      managerAccountsGroupsColumnIsEnabled,
    };
  },
)(observer(GroupsTableView));
