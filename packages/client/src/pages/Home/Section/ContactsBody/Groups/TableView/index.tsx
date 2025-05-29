// (c) Copyright Ascensio System SIA 2009-2025
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
import { useNavigate, useLocation } from "react-router";

import { TableBody } from "@docspace/shared/components/table";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import TableStore from "SRC_DIR/store/TableStore";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import EmptyScreenGroups from "../../EmptyScreenGroups";

import { GroupsTableContainer } from "./TableView.styled";

import GroupsTableItem from "./TableItem";
import GroupsTableHeader from "./TableHeader";

type GroupsTableViewProps = {
  groups?: GroupsStore["groups"];
  selection?: GroupsStore["selection"];
  fetchMoreGroups?: GroupsStore["fetchMoreGroups"];
  hasMoreGroups?: GroupsStore["hasMoreGroups"];
  groupsFilterTotal?: GroupsStore["groupsFilterTotal"];

  sectionWidth?: number;

  viewAs?: PeopleStore["viewAs"];
  setViewAs?: PeopleStore["setViewAs"];

  infoPanelVisible?: InfoPanelStore["isVisible"];

  currentDeviceType?: SettingsStore["currentDeviceType"];

  peopleGroupsColumnIsEnabled?: TableStore["peopleGroupsColumnIsEnabled"];
  managerGroupsColumnIsEnabled?: TableStore["managerGroupsColumnIsEnabled"];

  columnStorageName?: TableStore["columnStorageName"];
  columnInfoPanelStorageName?: TableStore["columnInfoPanelStorageName"];
};

const GroupsTableView = ({
  groups,
  selection,

  sectionWidth,

  viewAs,
  setViewAs,

  infoPanelVisible,

  currentDeviceType,

  fetchMoreGroups,
  hasMoreGroups,
  groupsFilterTotal,

  peopleGroupsColumnIsEnabled,
  managerGroupsColumnIsEnabled,

  columnStorageName,
  columnInfoPanelStorageName,
}: GroupsTableViewProps) => {
  const ref = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useViewEffect({
    view: viewAs!,
    setView: (view: string) => {
      setViewAs!(view as TContactsViewAs);
    },
    currentDeviceType: currentDeviceType!,
  });

  return groups?.length ? (
    <GroupsTableContainer useReactWindow forwardedRef={ref}>
      <GroupsTableHeader
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        sectionWidth={sectionWidth!}
        containerRef={ref}
        navigate={navigate}
        location={location}
      />
      <TableBody
        columnStorageName={columnStorageName!}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        infoPanelVisible={infoPanelVisible}
        fetchMoreFiles={fetchMoreGroups!}
        hasMoreFiles={hasMoreGroups!}
        itemCount={groupsFilterTotal!}
        filesLength={groups.length}
        itemHeight={48}
        useReactWindow
        isIndexEditingMode={false}
      >
        {groups.map((item, index) => (
          <GroupsTableItem
            key={item.id}
            item={item}
            isChecked={selection?.includes(item) ?? false}
            itemIndex={index}
            managerGroupsColumnIsEnabled={managerGroupsColumnIsEnabled ?? false}
            peopleGroupsColumnIsEnabled={peopleGroupsColumnIsEnabled ?? false}
          />
        ))}
      </TableBody>
    </GroupsTableContainer>
  ) : (
    <EmptyScreenGroups />
  );
};

export default inject(
  ({ peopleStore, settingsStore, infoPanelStore, tableStore }: TStore) => {
    const { groupsStore, viewAs, setViewAs } = peopleStore;

    const {
      groups,
      selection,

      fetchMoreGroups,
      hasMoreGroups,

      groupsFilterTotal,
    } = groupsStore!;

    const { currentDeviceType } = settingsStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    const {
      managerGroupsColumnIsEnabled,
      peopleGroupsColumnIsEnabled,

      columnStorageName,
      columnInfoPanelStorageName,
    } = tableStore;

    return {
      groups,
      selection,

      viewAs,
      setViewAs,

      infoPanelVisible,

      currentDeviceType,

      fetchMoreGroups,
      hasMoreGroups,
      groupsFilterTotal,

      peopleGroupsColumnIsEnabled,
      managerGroupsColumnIsEnabled,

      columnStorageName,
      columnInfoPanelStorageName,
    };
  },
)(observer(GroupsTableView));
