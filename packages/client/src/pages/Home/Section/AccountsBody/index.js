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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useParams } from "react-router-dom";

import People from "./People";
import Groups from "./Groups";
import InsideGroup from "./InsideGroup";

import { withTranslation } from "react-i18next";
import withLoader from "SRC_DIR/HOCs/withLoader";
import { useAccountsHotkeys } from "../../Hooks";

const SectionBodyContent = (props) => {
  const {
    tReady,
    accountsViewAs,
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
  } = props;

  const location = useLocation();
  const { groupId } = useParams();

  useAccountsHotkeys({
    enabledHotkeys,
    isUsersLoading,
    selectBottom,
    selectUpper,
    activateHotkeys,
    selectAll,
    deselectAll,
    openItem,
    onClickBack,
  });

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);

    if (location?.state?.openChangeOwnerDialog) {
      setChangeOwnerDialogVisible(true);
    }

    if (location?.state?.user) {
      selectUser(location?.state?.user);
    }

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const onMouseDown = (e) => {
    if (
      (e.target.closest(".scroll-body") &&
        !e.target.closest(".user-item") &&
        !e.target.closest(".group-item") &&
        !e.target.closest(".not-selectable") &&
        !e.target.closest(".info-panel") &&
        !e.target.closest(".table-container_group-menu")) ||
      e.target.closest(".files-main-button") ||
      e.target.closest(".add-button") ||
      e.target.closest(".search-input-block")
    ) {
      setPeopleSelection([]);
      setGroupsSelection([]);
      setPeopleBufferSelection(null);
      setGroupsBufferSelection(null);
      window?.getSelection()?.removeAllRanges();
      setHotkeyCaretStart(null);
      setHotkeyCaret(null);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    if (location?.state?.openChangeOwnerDialog)
      setChangeOwnerDialogVisible(true);

    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <>
      {location.pathname.includes("/accounts/people") ||
      location.pathname.includes("/accounts/guests") ? (
        <People />
      ) : !groupId ? (
        <Groups />
      ) : (
        <InsideGroup />
      )}
    </>
  );
};

export default inject(({ peopleStore, filesActionsStore }) => {
  const {
    viewAs: accountsViewAs,
    usersStore,
    enabledHotkeys,
    setEnabledHotkeys,
  } = peopleStore;
  const {
    isFiltered,
    isUsersLoading,
    setSelection: setPeopleSelection,
    setBufferSelection: setPeopleBufferSelection,
    selectUser,
  } = usersStore;

  const {
    setSelection: setGroupsSelection,
    setBufferSelection: setGroupsBufferSelection,
  } = peopleStore.groupsStore;

  const { setChangeOwnerDialogVisible } = peopleStore.dialogStore;

  const {
    selectBottom,
    selectUpper,
    activateHotkeys,
    setHotkeyCaretStart,
    setHotkeyCaret,

    selectAll,
    deselectAll,
    openItem,
  } = peopleStore.contactsHotkeysStore;
  const { onClickBack } = filesActionsStore;

  return {
    accountsViewAs,
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
    setEnabledHotkeys,
    setHotkeyCaretStart,
    setHotkeyCaret,
    selectAll,
    deselectAll,
    openItem,
    onClickBack,
  };
})(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(SectionBodyContent))(),
  ),
);
