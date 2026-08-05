/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";

import {
  TableBody,
  TableContainer,
} from "@docspace/ui-kit/components/table";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import TableStore from "SRC_DIR/store/TableStore";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import EmptyScreenGroups from "../../EmptyScreenGroups";

import styles from "./TableView.module.scss";

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
  withContentSelection?: ContactsHotkeysStore["withContentSelection"];
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
  withContentSelection,
}: GroupsTableViewProps) => {
  const ref = useRef<HTMLDivElement>(null);

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
    <TableContainer
      className={styles.groupsTableContainer}
      noSelect={!withContentSelection}
      useReactWindow
      forwardedRef={ref as React.RefObject<HTMLDivElement>}
    >
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
    </TableContainer>
  ) : (
    <EmptyScreenGroups />
  );
};

export default inject(
  ({ peopleStore, settingsStore, infoPanelStore, tableStore }: TStore) => {
    const { groupsStore, contactsHotkeysStore, viewAs, setViewAs } =
      peopleStore;

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

    const { withContentSelection } = contactsHotkeysStore!;

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
      withContentSelection,
    };
  },
)(observer(GroupsTableView));
