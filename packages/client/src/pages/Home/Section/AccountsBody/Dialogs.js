import React from "react";
import { inject, observer } from "mobx-react";

import { unlinkTfaApp } from "@docspace/shared/api/settings";

import {
  ChangeEmailDialog,
  ChangePasswordDialog,
  ChangePortalOwnerDialog,
  DeleteSelfProfileDialog,
  DeleteProfileEverDialog,
  ChangeUserTypeDialog,
  ChangeUserStatusDialog,
  SendInviteDialog,
  ChangeNameDialog,
  ResetApplicationDialog,
  DataReassignmentDialog,
} from "SRC_DIR/components/dialogs";

const Dialogs = ({
  changeOwner,
  deleteSelfProfile,
  deleteProfileEver,
  data,
  closeDialogs,
  changeUserTypeDialogVisible,
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
}) => {
  return (
    <>
      {changeEmailVisible && (
        <ChangeEmailDialog
          visible={changeEmailVisible}
          onClose={closeDialogs}
          user={data}
          fromList
        />
      )}
      {changePasswordVisible && (
        <ChangePasswordDialog
          visible={changePasswordVisible}
          onClose={() => setChangePasswordVisible(false)}
          email={data.email}
        />
      )}
      {changeOwner && (
        <ChangePortalOwnerDialog visible={changeOwner} onClose={closeDialogs} />
      )}
      {deleteSelfProfile && (
        <DeleteSelfProfileDialog
          visible={deleteSelfProfile}
          onClose={closeDialogs}
          email={data.email}
        />
      )}
      {deleteProfileEver && (
        <DeleteProfileEverDialog
          visible={deleteProfileEver}
          onClose={closeDialogs}
          users={data}
        />
      )}
      {changeUserTypeDialogVisible && (
        <ChangeUserTypeDialog
          visible={changeUserTypeDialogVisible}
          onClose={closeDialogs}
          {...data}
        />
      )}
      {changeUserStatusDialogVisible && (
        <ChangeUserStatusDialog
          visible={changeUserStatusDialogVisible}
          onClose={closeDialogs}
          {...data}
        />
      )}
      {sendInviteDialogVisible && (
        <SendInviteDialog
          visible={sendInviteDialogVisible}
          onClose={closeDialogs}
        />
      )}

      {changeNameVisible && (
        <ChangeNameDialog
          visible={changeNameVisible}
          onClose={() => setChangeNameVisible(false)}
          profile={profile}
          fromList
        />
      )}

      {resetAuthDialogVisible && (
        <ResetApplicationDialog
          visible={resetAuthDialogVisible}
          onClose={closeDialogs}
          resetTfaApp={unlinkTfaApp}
          id={data}
        />
      )}

      {dataReassignmentDialogVisible && (
        <DataReassignmentDialog
          visible={dataReassignmentDialogVisible}
          user={data}
        />
      )}
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

    changeUserTypeDialogVisible,
    guestDialogVisible,
    changeUserStatusDialogVisible,
    disableDialogVisible,
    sendInviteDialogVisible,
    resetAuthDialogVisible,
    dataReassignmentDialogVisible,
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

    changeUserTypeDialogVisible,
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
  };
})(observer(Dialogs));
