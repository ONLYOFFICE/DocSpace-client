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

import { useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import { withTranslation } from "react-i18next";

import { TfaStore } from "@docspace/shared/store/TfaStore";

import withLoader from "SRC_DIR/HOCs/withLoader";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import FilesActionStore from "SRC_DIR/store/FilesActionsStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import DialogStore from "SRC_DIR/store/contacts/DialogStore";

import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";

import { useAccountsHotkeys } from "../../Hooks";

import Users from "./Users";
import Groups from "./Groups";


type SectionBodyContentProps = {
  currentView: string;
  isUsersLoading?: UsersStore["isUsersLoading"];
  selectUser?: UsersStore["selectUser"];
  clearSelection: UsersStore["clearSelection"];
  setPeopleSelection?: UsersStore["setSelection"];
  setPeopleBufferSelection?: UsersStore["setBufferSelection"];
  setGroupsSelection?: GroupsStore["setSelection"];
  setGroupsBufferSelection?: GroupsStore["setBufferSelection"];
  setChangeOwnerDialogVisible?: DialogStore["setChangeOwnerDialogVisible"];
  enabledHotkeys?: PeopleStore["enabledHotkeys"];
  selectBottom?: ContactsHotkeysStore["selectBottom"];
  selectUpper?: ContactsHotkeysStore["selectUpper"];
  activateHotkeys?: ContactsHotkeysStore["activateHotkeys"];
  setHotkeyCaretStart?: ContactsHotkeysStore["setHotkeyCaretStart"];
  setHotkeyCaret?: ContactsHotkeysStore["setHotkeyCaret"];
  selectAll?: ContactsHotkeysStore["selectAll"];
  deselectAll?: ContactsHotkeysStore["deselectAll"];
  openItem?: ContactsHotkeysStore["openItem"];
  openContextMenu: ContactsHotkeysStore["openContextMenu"];
  onClickBack?: FilesActionStore["onClickBack"];
  getTfaType?: TfaStore["getTfaType"];
  enableSelection: ContactsHotkeysStore["enableSelection"];
  viewAs: PeopleStore["viewAs"];
  membersSelection: UsersStore["selection"];
  groupsSelection: GroupsStore["selection"];
};

const SectionBodyContent = (props: SectionBodyContentProps) => {
  const {
    currentView,
    setPeopleSelection,
    setGroupsSelection,
    setPeopleBufferSelection,
    setGroupsBufferSelection,
    setChangeOwnerDialogVisible,
    selectUser,
    clearSelection,
    enabledHotkeys,
    isUsersLoading,
    selectBottom,
    selectUpper,
    activateHotkeys,
    setHotkeyCaretStart,
    setHotkeyCaret,
    selectAll,
    deselectAll,
    openItem,
    onClickBack,
    getTfaType,
    enableSelection,
    viewAs,
    membersSelection,
    groupsSelection,
    openContextMenu,
  } = props;

  const location = useLocation();

  const selection =
    currentView !== "groups" ? membersSelection : groupsSelection;

  useAccountsHotkeys({
    enabledHotkeys: enabledHotkeys!,
    isUsersLoading: isUsersLoading!,
    selectBottom: selectBottom!,
    selectUpper: selectUpper!,
    activateHotkeys: activateHotkeys!,
    selectAll: selectAll!,
    deselectAll: deselectAll!,
    openItem: openItem!,
    onClickBack: onClickBack!,
    enableSelection,
    viewAs,
    selection,
    openContextMenu,
  });

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      const target = e.target! as HTMLElement;
      if (
        (target.closest(".scroll-body") &&
          !target.closest(".user-item") &&
          !target.closest(".group-item") &&
          !target.closest(".not-selectable") &&
          !target.closest(".info-panel") &&
          !target.closest(".table-container_group-menu")) ||
        target.closest(".files-main-button") ||
        target.closest(".add-button") ||
        target.closest(".search-input-block")
      ) {
        setPeopleSelection!([]);
        setGroupsSelection!([]);
        setPeopleBufferSelection!(null);
        setGroupsBufferSelection!(null);
        window?.getSelection()?.removeAllRanges();
        setHotkeyCaretStart!(null);
        setHotkeyCaret!(null);
      }
    },
    [
      setGroupsBufferSelection,
      setGroupsSelection,
      setHotkeyCaret,
      setHotkeyCaretStart,
      setPeopleBufferSelection,
      setPeopleSelection,
    ],
  );

  useEffect(() => {
    if (location?.state?.openChangeOwnerDialog) {
      setChangeOwnerDialogVisible!(true);
    }

    if (location?.state?.user) {
      clearSelection();
      selectUser!(location?.state?.user);
    }
  }, [
    location?.state?.openChangeOwnerDialog,
    location?.state?.user,
    selectUser,
    setChangeOwnerDialogVisible,
  ]);

  useEffect(() => {
    getTfaType && getTfaType();
    window.addEventListener("mousedown", onMouseDown);

    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [onMouseDown, getTfaType]);

  return currentView !== "groups" ? <Users /> : <Groups />;
};

export default inject(
  ({
    peopleStore,
    filesActionsStore,
    tfaStore,
  }: {
    peopleStore: PeopleStore;
    filesActionsStore: FilesActionStore;
    tfaStore: TfaStore;
  }) => {
    const {
      usersStore,
      groupsStore,
      dialogStore,
      contactsHotkeysStore,

      enabledHotkeys,
      viewAs,
    } = peopleStore;
    const {
      isFiltered,
      isUsersLoading,

      selectUser,
      clearSelection,
      setSelection: setPeopleSelection,
      setBufferSelection: setPeopleBufferSelection,
      selection: membersSelection,
    } = usersStore!;

    const {
      setSelection: setGroupsSelection,
      setBufferSelection: setGroupsBufferSelection,
      selection: groupsSelection,
    } = groupsStore!;

    const { setChangeOwnerDialogVisible } = dialogStore!;

    const {
      selectBottom,
      selectUpper,
      activateHotkeys,
      setHotkeyCaretStart,
      setHotkeyCaret,

      selectAll,
      deselectAll,
      openItem,
      openContextMenu,

      enableSelection,
    } = contactsHotkeysStore!;

    const { onClickBack } = filesActionsStore;

    const { getTfaType } = tfaStore;

    return {
      isFiltered,
      setPeopleSelection,
      setGroupsSelection,
      setPeopleBufferSelection,
      setGroupsBufferSelection,
      setChangeOwnerDialogVisible,
      selectUser,
      clearSelection,
      enabledHotkeys,
      isUsersLoading,

      selectBottom,
      selectUpper,
      activateHotkeys,
      setHotkeyCaretStart,
      setHotkeyCaret,
      selectAll,
      deselectAll,
      openItem,
      onClickBack,
      openContextMenu,

      getTfaType,

      enableSelection,
      viewAs,
      membersSelection,
      groupsSelection,
    };
  },
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(SectionBodyContent))(),
  ),
);
