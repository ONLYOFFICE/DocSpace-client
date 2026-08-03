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

import { inject, observer } from "mobx-react";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import { RowContainer } from "@docspace/ui-kit/components/rows";

import EmptyScreenGroups from "../../EmptyScreenGroups";

import GroupsRow from "./GroupsRow";
import styles from "./RowView.module.scss";

type RowViewProps = {
  sectionWidth?: number;

  groups?: GroupsStore["groups"];
  hasMoreGroups?: GroupsStore["hasMoreGroups"];
  fetchMoreGroups?: GroupsStore["fetchMoreGroups"];
  filterTotal?: GroupsStore["groupsFilterTotal"];

  viewAs?: PeopleStore["viewAs"];
  setViewAs?: PeopleStore["setViewAs"];

  currentDeviceType?: SettingsStore["currentDeviceType"];
  withContentSelection?: ContactsHotkeysStore["withContentSelection"];
};

const RowView = ({
  groups,
  sectionWidth,
  viewAs,
  setViewAs,
  hasMoreGroups,
  fetchMoreGroups,
  filterTotal,
  currentDeviceType,
  withContentSelection,
}: RowViewProps) => {
  useViewEffect({
    view: viewAs as string,
    setView: (view: string) => {
      setViewAs!(view as TContactsViewAs);
    },
    currentDeviceType: currentDeviceType!,
  });

  if (groups && groups?.length === 0) return <EmptyScreenGroups />;

  return (
    <RowContainer
      className={`${styles.groupsRowContainer} people-row-container`}
      useReactWindow
      fetchMoreFiles={fetchMoreGroups!}
      hasMoreFiles={hasMoreGroups!}
      itemCount={filterTotal!}
      filesLength={groups!.length}
      itemHeight={58}
      onScroll={() => {}}
      noSelect={!withContentSelection}
    >
      {groups!.map((item, index) => (
        <GroupsRow
          key={item.id}
          item={item}
          sectionWidth={sectionWidth!}
          itemIndex={index}
        />
      ))}
    </RowContainer>
  );
};

export default inject(({ peopleStore, settingsStore }: TStore) => ({
  groups: peopleStore.groupsStore!.groups,
  viewAs: peopleStore.viewAs,
  setViewAs: peopleStore.setViewAs,
  hasMoreGroups: peopleStore.groupsStore!.hasMoreGroups,
  fetchMoreGroups: peopleStore.groupsStore!.fetchMoreGroups,
  filterTotal: peopleStore.groupsStore!.groupsFilterTotal,
  isFiltered: peopleStore.groupsStore!.groupsIsFiltered,
  currentDeviceType: settingsStore.currentDeviceType,
  withContentSelection: peopleStore.contactsHotkeysStore!.withContentSelection,
}))(observer(RowView));
