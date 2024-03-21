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

  if (groups.length === 0) return <EmptyScreenGroups />;

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

  hasMoreGroups: peopleStore.groupsStore.hasMoreGroups,
  fetchMoreGroups: peopleStore.groupsStore.fetchMoreGroups,
  filterTotal: peopleStore.groupsStore.groupsFilterTotal,
  isFiltered: peopleStore.groupsStore.groupsIsFiltered,

  withPaging: settingsStore.withPaging,
  currentDeviceType: settingsStore.currentDeviceType,
}))(observer(RowView));
