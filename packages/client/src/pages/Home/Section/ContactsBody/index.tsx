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
import { getContactsView } from "SRC_DIR/helpers/contacts";
import { TUser } from "@docspace/shared/api/people/types";
import { TGroup } from "@docspace/shared/api/groups/types";

import { useAccountsHotkeys } from "../../Hooks";

import Users from "./Users";
import Groups from "./Groups";

type SectionBodyContentProps = {
  isUsersLoading?: UsersStore["isUsersLoading"];
  selectUser?: UsersStore["selectUser"];
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
  onClickBack?: FilesActionStore["onClickBack"];
  getTfaType?: TfaStore["getTfaType"];
  enableSelection: ContactsHotkeysStore["enableSelection"];
  viewAs: PeopleStore["viewAs"];
  membersSelection: TUser[];
  groupsSelection: TGroup[];
};

const SectionBodyContent = (props: SectionBodyContentProps) => {
  const {
    setPeopleSelection,
    setGroupsSelection,
    setPeopleBufferSelection,
    setGroupsBufferSelection,
    setChangeOwnerDialogVisible,
    selectUser,
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
  } = props;

  const location = useLocation();

  const contactsTab = getContactsView(location);

  const selection =
    contactsTab !== "groups" ? membersSelection : groupsSelection;

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

  return contactsTab !== "groups" ? <Users /> : <Groups />;
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
    };
  },
)(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(SectionBodyContent))(),
  ),
);
