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

import { useLocation } from "react-router";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";

import { SelectionArea as SelectionAreaComponent } from "@docspace/ui-kit/components/selection-area";
import { TOnMove } from "@docspace/ui-kit/components/selection-area/SelectionArea.types";

import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import { getContactsView } from "SRC_DIR/helpers/contacts";

type SelectionAreaProps = {
  viewAs: PeopleStore["viewAs"];
  setSelectionsPeople: UsersStore["setSelections"];
  setSelectionsGroups: GroupsStore["setSelections"];
  selectionAreaIsEnabled: ContactsHotkeysStore["selectionAreaIsEnabled"];
  setWithContentSelection: ContactsHotkeysStore["setWithContentSelection"];
};

const SelectionArea = ({
  viewAs,
  setSelectionsPeople,
  setSelectionsGroups,
  selectionAreaIsEnabled,
  setWithContentSelection,
}: SelectionAreaProps) => {
  const location = useLocation();

  const isPeopleSelections = getContactsView(location) !== "groups";

  const onMove = ({ added, removed, clear }: TOnMove) => {
    if (isPeopleSelections) setSelectionsPeople(added, removed, clear);
    else setSelectionsGroups(added, removed, clear);
  };

  return isMobile || !selectionAreaIsEnabled ? null : (
    <SelectionAreaComponent
      containerClass="section-scroll"
      scrollClass="section-scroll"
      itemsContainerClass="ReactVirtualized__Grid__innerScrollContainer"
      selectableClass="window-item"
      itemClass={isPeopleSelections ? "user-item" : "group-item"}
      onMove={onMove}
      viewAs={viewAs}
      onMouseDown={() => setWithContentSelection(false)}
    />
  );
};

export default inject(({ peopleStore }: { peopleStore: PeopleStore }) => {
  const { viewAs, usersStore, groupsStore, contactsHotkeysStore } = peopleStore;

  const { setSelections: setSelectionsPeople } = usersStore!;
  const { setSelections: setSelectionsGroups } = groupsStore!;
  const { selectionAreaIsEnabled, setWithContentSelection } =
    contactsHotkeysStore!;

  return {
    viewAs,
    setSelectionsPeople,
    setSelectionsGroups,
    selectionAreaIsEnabled,
    setWithContentSelection,
  };
})(observer(SelectionArea));
