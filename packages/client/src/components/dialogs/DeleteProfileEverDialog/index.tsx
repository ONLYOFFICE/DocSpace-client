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
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import api from "@docspace/shared/api";
import { ButtonKeys } from "@docspace/shared/enums";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import DialogStore from "SRC_DIR/store/contacts/DialogStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

import BodyComponent from "./sub-components/BodyComponent";
import { StyledBodyContent } from "./DeleteProfileEverDialog.styled";

export type DeleteProfileEvenerDialogComponentsProps = {
  userIds: UsersStore["getUsersToRemoveIds"];
  usersToDelete: UsersStore["selection"];
  filter: UsersStore["filter"];
  contactsTab: UsersStore["contactsTab"];
  removeUsers: UsersStore["removeUsers"];
  setSelected: UsersStore["setSelected"];

  setDataReassignmentDialogVisible: DialogStore["setDataReassignmentDialogVisible"];
  setDeleteProfileDialogVisible: DialogStore["setDeleteProfileDialogVisible"];
  setDataReassignmentDeleteProfile: DialogStore["setDataReassignmentDeleteProfile"];

  setDialogData: DialogStore["setDialogData"];

  updateCurrentGroup: GroupsStore["updateCurrentGroup"];

  visible: boolean;
  onClose: VoidFunction;

  deleteWithoutReassign: boolean;
  onlyOneUser: boolean;
  dataReassignment?: boolean;
  dataReassignmentProgress?: boolean;
  dataReassignmentTerminate?: boolean;
};

const DeleteProfileEverDialogComponent = ({
  usersToDelete,
  userIds,
  filter,
  contactsTab,
  removeUsers,
  setSelected,

  visible,
  onClose,

  setDataReassignmentDialogVisible,
  setDeleteProfileDialogVisible,
  setDataReassignmentDeleteProfile,

  setDialogData,
  updateCurrentGroup,

  deleteWithoutReassign,
  onlyOneUser,
  dataReassignment,
  dataReassignmentProgress,
  dataReassignmentTerminate,
}: DeleteProfileEvenerDialogComponentsProps) => {
  const { t } = useTranslation([
    "DeleteProfileEverDialog",
    "Common",
    "PeopleTranslations",
  ]);

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const isInsideGroup = contactsTab === "inside_group";
  const isGuests = contactsTab === "guests";

  // const needReassignData =
  //   onlyOneUser &&
  //   (usersToDelete[0].isRoomAdmin ||
  //     usersToDelete[0].isOwner ||
  //     usersToDelete[0].isAdmin);

  const needReassignData = true;

  const onlyGuests = usersToDelete.every((user) => user.isVisitor);

  const onDeleteUser = React.useCallback(
    (id: string) => {
      if (isRequestRunning) return;

      setIsRequestRunning(true);

      api.people
        .deleteUser(id)
        .then(async () => {
          const actions: Promise<unknown>[] = [];

          if (isInsideGroup && filter.group)
            actions.push(updateCurrentGroup(filter.group));

          await Promise.all(actions);
        })
        .then(() => {
          toastr.success(
            isGuests
              ? t("SuccessfullyDeleteGuestInfoMessage")
              : t("SuccessfullyDeleteUserInfoMessage"),
          );
        })
        .catch((error) => toastr.error(error))
        .finally(() => {
          setIsRequestRunning(false);
          setSelected("close");
          onClose();
        });
    },
    [
      filter,
      isGuests,
      isInsideGroup,
      isRequestRunning,
      onClose,
      setSelected,
      t,
      updateCurrentGroup,
    ],
  );

  const onDeleteUsers = React.useCallback(
    (ids: string[]) => {
      if (isRequestRunning) return;
      setIsRequestRunning(true);
      removeUsers(ids)
        .then(() => {
          toastr.success(
            isGuests
              ? t("DeleteGroupGuestsSuccessMessage")
              : t("DeleteGroupUsersSuccessMessage"),
          );
        })
        .catch((error) => toastr.error(error))
        .finally(() => {
          onClose();
          setIsRequestRunning(false);
          setSelected("close");
        });
    },
    [isGuests, isRequestRunning, onClose, removeUsers, setSelected, t],
  );

  const onDeleteProfileEver = React.useCallback(() => {
    if (deleteWithoutReassign || isGuests) {
      if (onlyOneUser) onDeleteUser(usersToDelete[0].id);
      else onDeleteUsers(userIds);

      return;
    }

    if (!needReassignData) {
      if (onlyOneUser) {
        onDeleteUser(usersToDelete[0].id);

        return;
      }

      onDeleteUsers(userIds);
      return;
    }

    setDialogData({
      user: usersToDelete[0],
      reassignUserData: dataReassignment,
      getReassignmentProgress: dataReassignmentProgress,
      cancelReassignment: dataReassignmentTerminate,
      currentUserAsDefault: true,
    });

    setDataReassignmentDialogVisible(true);
    setDataReassignmentDeleteProfile(true);
    setDeleteProfileDialogVisible(false);
  }, [
    deleteWithoutReassign,
    isGuests,
    needReassignData,
    onDeleteUser,
    onDeleteUsers,
    onlyOneUser,
    setDataReassignmentDeleteProfile,
    setDataReassignmentDialogVisible,
    setDeleteProfileDialogVisible,
    setDialogData,
    userIds,
    usersToDelete,
  ]);

  const onClickReassignData = () => {
    setDialogData({
      user: usersToDelete[0],
      reassignUserData: dataReassignment,
      getReassignmentProgress: dataReassignmentProgress,
      cancelReassignment: dataReassignmentTerminate,
      showDeleteProfileCheckbox: true,
    });

    setDataReassignmentDialogVisible(true);
    setDataReassignmentDeleteProfile(true);
    setDeleteProfileDialogVisible(false);
  };

  const onKeyUpHandler = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.esc) onClose();
      if (e.key === ButtonKeys.enter) onDeleteProfileEver();
    },
    [onClose, onDeleteProfileEver],
  );

  React.useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [onKeyUpHandler]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      isLarge
      autoMaxHeight
    >
      <ModalDialog.Header>
        {onlyOneUser
          ? isGuests
            ? t("DeleteGuest")
            : t("DeleteUser")
          : isGuests
            ? t("DeleteGuests")
            : t("DeletingUsers")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent needReassignData={needReassignData}>
          <BodyComponent
            needReassignData={needReassignData}
            onClickReassignData={onClickReassignData}
            deleteWithoutReassign={deleteWithoutReassign}
            users={usersToDelete}
            onlyOneUser={onlyOneUser}
            onlyGuests={onlyGuests}
            t={t}
          />
        </StyledBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="delete-button"
          key="OKBtn"
          label={t("Common:Delete")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onDeleteProfileEver}
          isLoading={isRequestRunning}
        />
        <Button
          className="cancel-button"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          isDisabled={isRequestRunning}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  (
    { peopleStore, setup, infoPanelStore }: TStore,
    { users }: { users: UsersStore["selection"] },
  ) => {
    const { dialogStore, usersStore, groupsStore } = peopleStore;

    const { updateCurrentGroup } = groupsStore!;

    const {
      needResetUserSelection,
      filter,
      removeUsers,
      getUsersToRemoveIds: userIds,
      setSelected,
      selection,
      contactsTab,
    } = usersStore!;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    const {
      setDataReassignmentDialogVisible,
      setDeleteProfileDialogVisible,
      setDataReassignmentDeleteProfile,

      setDialogData,
    } = dialogStore!;

    const {
      dataReassignment,
      dataReassignmentProgress,
      dataReassignmentTerminate,
    } = setup;

    const usersToDelete = users.length ? users : selection;

    // const onlyGuests = usersToDelete.every(
    //   (el) => el.role === EmployeeType.Guest,
    // );

    // const deleteWithoutReassign = usersToDelete.length > 1 && !onlyGuests;
    const deleteWithoutReassign = false;
    const onlyOneUser = usersToDelete.length === 1;

    return {
      setDataReassignmentDialogVisible,
      setDeleteProfileDialogVisible,
      setDataReassignmentDeleteProfile,

      setDialogData,
      setSelected,
      removeUsers,
      needResetUserSelection: !infoPanelVisible || needResetUserSelection,
      filter,
      updateCurrentGroup,
      deleteWithoutReassign,
      onlyOneUser,
      userIds,
      usersToDelete,
      contactsTab,
      dataReassignment,
      dataReassignmentProgress,
      dataReassignmentTerminate,
    };
  },
)(observer(DeleteProfileEverDialogComponent));
