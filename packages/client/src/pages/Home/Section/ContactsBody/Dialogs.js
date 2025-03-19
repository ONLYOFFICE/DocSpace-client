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

import React from "react";
import { inject, observer } from "mobx-react";

import { unlinkTfaApp } from "@docspace/shared/api/settings";

import {
  ChangeEmailDialog,
  ChangePasswordDialog,
  ChangePortalOwnerDialog,
  DeleteSelfProfileDialog,
  DeleteProfileEverDialog,
  ChangeUserStatusDialog,
  SendInviteDialog,
  ChangeNameDialog,
  ResetApplicationDialog,
  DataReassignmentDialog,
  DeleteGroupDialog,
  RemoveGuestDialog,
} from "SRC_DIR/components/dialogs";

const Dialogs = ({
  changeOwner,
  deleteSelfProfile,
  deleteProfileEver,
  data,
  closeDialogs,
  changeUserStatusDialogVisible,

  sendInviteDialogVisible,
  resetAuthDialogVisible,

  changeEmailVisible,

  changePasswordVisible,
  setChangePasswordVisible,

  changeNameVisible,
  setChangeNameVisible,

  profile,

  dataReassignmentDialogVisible,
  deleteGroupDialogVisible,
  removeGuestDialogVisible,
}) => {
  return (
    <>
      {changeEmailVisible ? (
        <ChangeEmailDialog
          visible={changeEmailVisible}
          onClose={closeDialogs}
          user={data}
          fromList
        />
      ) : null}
      {changePasswordVisible ? (
        <ChangePasswordDialog
          visible={changePasswordVisible}
          onClose={() => setChangePasswordVisible(false)}
          email={data.email}
        />
      ) : null}
      {changeOwner ? (
        <ChangePortalOwnerDialog visible={changeOwner} onClose={closeDialogs} />
      ) : null}
      {deleteSelfProfile ? (
        <DeleteSelfProfileDialog
          visible={deleteSelfProfile}
          onClose={closeDialogs}
          email={data.email}
        />
      ) : null}
      {deleteProfileEver ? (
        <DeleteProfileEverDialog
          visible={deleteProfileEver}
          onClose={closeDialogs}
          users={data}
        />
      ) : null}

      {changeUserStatusDialogVisible ? (
        <ChangeUserStatusDialog
          visible={changeUserStatusDialogVisible}
          onClose={closeDialogs}
          {...data}
        />
      ) : null}
      {sendInviteDialogVisible ? (
        <SendInviteDialog
          visible={sendInviteDialogVisible}
          onClose={closeDialogs}
        />
      ) : null}

      {changeNameVisible ? (
        <ChangeNameDialog
          visible={changeNameVisible}
          onClose={() => setChangeNameVisible(false)}
          profile={profile}
          fromList
        />
      ) : null}

      {resetAuthDialogVisible ? (
        <ResetApplicationDialog
          visible={resetAuthDialogVisible}
          onClose={closeDialogs}
          resetTfaApp={unlinkTfaApp}
          id={data}
        />
      ) : null}

      {dataReassignmentDialogVisible ? (
        <DataReassignmentDialog
          visible={dataReassignmentDialogVisible}
          data={data}
        />
      ) : null}

      {deleteGroupDialogVisible ? (
        <DeleteGroupDialog
          visible={deleteGroupDialogVisible}
          onClose={closeDialogs}
        />
      ) : null}

      {removeGuestDialogVisible ? (
        <RemoveGuestDialog
          visible={removeGuestDialogVisible}
          onClose={closeDialogs}
        />
      ) : null}
    </>
  );
};

export default inject(({ peopleStore, userStore }) => {
  const {
    changeOwner,
    deleteSelfProfile,
    deleteProfileEver,
    data,
    closeDialogs,
    changeEmailVisible,

    guestDialogVisible,
    changeUserStatusDialogVisible,
    disableDialogVisible,
    sendInviteDialogVisible,
    resetAuthDialogVisible,
    dataReassignmentDialogVisible,
    deleteGroupDialogVisible,

    removeGuestDialogVisible,
  } = peopleStore.dialogStore;

  const { user: profile } = userStore;

  const {
    changeNameVisible,
    changePasswordVisible,
    setChangePasswordVisible,
    setChangeNameVisible,
  } = peopleStore.targetUserStore;

  return {
    changeOwner,
    deleteSelfProfile,
    deleteProfileEver,
    data,
    closeDialogs,

    guestDialogVisible,
    changeUserStatusDialogVisible,
    disableDialogVisible,
    sendInviteDialogVisible,
    resetAuthDialogVisible,

    changeEmailVisible,

    changePasswordVisible,
    setChangePasswordVisible,

    changeNameVisible,
    setChangeNameVisible,

    profile,

    dataReassignmentDialogVisible,
    deleteGroupDialogVisible,
    removeGuestDialogVisible,
  };
})(observer(Dialogs));
