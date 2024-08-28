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

import React from "react";
import PropTypes from "prop-types";
import { matchPath } from "react-router";
import { withTranslation } from "react-i18next";

import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { mobileMore } from "@docspace/shared/utils";
import api from "@docspace/shared/api";

import ModalDialogContainer from "../ModalDialogContainer";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import BodyComponent from "./sub-components/BodyComponent";

const { deleteUser } = api.people;

const StyledModalDialogContainer = styled(ModalDialogContainer)`
  #modal-dialog {
    ${(props) =>
      props.needReassignData &&
      css`
        width: auto;

        @media ${mobileMore} {
          .delete-button,
          .cancel-button {
            width: auto;
          }
        }
      `}

    max-width: 520px;
    max-height: none;
  }

  .user-delete {
    line-height: 20px;
    ${(props) =>
      (!props.areUsersOnly || props.deleteWithoutReassign) &&
      css`
        padding-bottom: 16px;
      `}
  }

  .text-warning {
    color: ${(props) => props.theme.peopleDialogs.deleteUser.textColor};
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
  }

  .text-delete-description {
    line-height: 20px;
    padding: 8px 0;

    ${(props) =>
      !props.needReassignData &&
      css`
        padding-bottom: 0;
      `}
  }

  .reassign-data {
    line-height: 15px;
  }
`;

const DeleteProfileEverDialogComponent = (props) => {
  const {
    usersToDelete,
    t,
    onClose,
    tReady,
    visible,
    setDataReassignmentDialogVisible,
    setDeleteProfileDialogVisible,
    setDataReassignmentDeleteProfile,
    setIsDeletingUserWithReassignment,
    setDialogData,
    getUsersList,
    needResetUserSelection,
    removeUser,
    userIds,
    filter,
    refreshInsideGroup,
    setSelected,
    deleteWithoutReassign,
    onlyOneUser,
  } = props;
  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const needReassignData =
    onlyOneUser &&
    (usersToDelete[0].isRoomAdmin ||
      usersToDelete[0].isOwner ||
      usersToDelete[0].isAdmin ||
      usersToDelete[0].isCollaborator);

  const areUsersOnly = usersToDelete.every((user) => user.isVisitor);

  const isInsideGroup = matchPath(
    "/accounts/groups/:groupId/filter",
    location.pathname,
  );

  const onDeleteUser = (id) => {
    setIsRequestRunning(true);

    deleteUser(id)
      .then(() => {
        return isInsideGroup
          ? refreshInsideGroup()
          : getUsersList(filter, true);
      })
      .then(() => {
        toastr.success(t("SuccessfullyDeleteUserInfoMessage"));
      })
      .catch((error) => toastr.error(error))
      .finally(() => {
        setIsRequestRunning(false);
        setSelected("close");
        onClose();
      });
  };
  const onDeleteUsers = (ids) => {
    setIsRequestRunning(true);
    removeUser(ids, filter, isInsideGroup)
      .then(() => {
        toastr.success(t("DeleteGroupUsersSuccessMessage"));
      })
      .catch((error) => toastr.error(error))
      .finally(() => {
        onClose();
        setIsRequestRunning(false);
        setSelected("close");
      });
  };
  const onDeleteProfileEver = () => {
    if (deleteWithoutReassign) {
      onDeleteUsers(userIds);
      return;
    }

    if (!needReassignData) {
      onlyOneUser ? onDeleteUser(usersToDelete[0].id) : onDeleteUsers(userIds);
      return;
    }

    setDialogData(usersToDelete[0]);

    setIsDeletingUserWithReassignment(true);
    setDataReassignmentDialogVisible(true);
    setDataReassignmentDeleteProfile(true);
    setDeleteProfileDialogVisible(false);
  };

  const onClickReassignData = () => {
    setDialogData(usersToDelete[0]);

    setDataReassignmentDialogVisible(true);
    setDataReassignmentDeleteProfile(true);
    setDeleteProfileDialogVisible(false);
  };

  return (
    <StyledModalDialogContainer
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
      needReassignData={needReassignData}
      deleteWithoutReassign={deleteWithoutReassign}
      areUsersOnly={areUsersOnly}
    >
      <ModalDialog.Header>
        {onlyOneUser ? t("DeleteUser") : t("DeletingUsers")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <BodyComponent
          needReassignData={needReassignData}
          onClickReassignData={onClickReassignData}
          deleteWithoutReassign={deleteWithoutReassign}
          users={usersToDelete}
          onlyOneUser={onlyOneUser}
          areUsersOnly={areUsersOnly}
          t={t}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="delete-button"
          key="OKBtn"
          label={t("Common:Delete")}
          size="normal"
          primary={true}
          scale
          onClick={onDeleteProfileEver}
          isLoading={isRequestRunning}
        />
        <Button
          className="cancel-button"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </StyledModalDialogContainer>
  );
};

const DeleteProfileEverDialog = withTranslation([
  "DeleteProfileEverDialog",
  "Common",
  "PeopleTranslations",
])(DeleteProfileEverDialogComponent);

DeleteProfileEverDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default inject(({ peopleStore }, { users }) => {
  const { dialogStore, selectionStore, filterStore, usersStore } = peopleStore;
  const { refreshInsideGroup } = peopleStore.groupsStore;

  const { getUsersList, needResetUserSelection } = peopleStore.usersStore;

  const {
    setDataReassignmentDialogVisible,
    setDeleteProfileDialogVisible,
    setDataReassignmentDeleteProfile,
    setIsDeletingUserWithReassignment,
    setDialogData,
  } = dialogStore;

  const {
    getUsersToRemoveIds: userIds,
    setSelected,
    selection,
  } = selectionStore;

  const usersToDelete = users.length ? users : selection;

  const onlyUsers = usersToDelete.every((el) => el.role === "user");
  const deleteWithoutReassign = usersToDelete.length > 1 && !onlyUsers;
  const onlyOneUser = usersToDelete.length === 1;

  return {
    setDataReassignmentDialogVisible,
    setDeleteProfileDialogVisible,
    setDataReassignmentDeleteProfile,
    setIsDeletingUserWithReassignment,
    setDialogData,
    setSelected,
    removeUser: usersStore.removeUser,
    needResetUserSelection,
    filter: filterStore.filter,
    refreshInsideGroup,
    getUsersList,
    deleteWithoutReassign,
    onlyOneUser,
    userIds,
    usersToDelete,
  };
})(observer(DeleteProfileEverDialog));
