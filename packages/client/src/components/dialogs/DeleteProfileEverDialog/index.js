import React from "react";
import PropTypes from "prop-types";
import Button from "@docspace/components/button";
import ModalDialog from "@docspace/components/modal-dialog";
import { withTranslation } from "react-i18next";
import api from "@docspace/common/api";
import toastr from "@docspace/components/toast/toastr";
import ModalDialogContainer from "../ModalDialogContainer";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { mobileMore } from "@docspace/components/utils/device";
import BodyComponent from "./sub-components/BodyComponent";

const { deleteUser } = api.people;
const { Filter } = api;

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
    padding-bottom: 16px;
  }

  .text-warning {
    color: #f24724;
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
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
    users,
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
    setSelected,
    deleteWithoutReassign,
    onlyOneUser,
  } = props;
  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const needReassignData =
    onlyOneUser &&
    (users[0].isRoomAdmin ||
      users[0].isOwner ||
      users[0].isAdmin ||
      users[0].isCollaborator);

  const onDeleteUser = (id) => {
    const filter = Filter.getDefault();
    setIsRequestRunning(true);

    deleteUser(id)
      .then(() => {
        toastr.success(t("SuccessfullyDeleteUserInfoMessage"));
        getUsersList(filter, true);

        return;
      })
      .catch((error) => toastr.error(error))
      .finally(() => {
        setIsRequestRunning(false);
        needResetUserSelection && setSelected("close");
        onClose();
      });
  };
  const onDeleteUsers = (ids) => {
    setIsRequestRunning(true);
    removeUser(ids, filter)
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
      onlyOneUser ? onDeleteUser(users[0].id) : onDeleteUsers(userIds);
      return;
    }

    setDialogData(users[0]);

    setIsDeletingUserWithReassignment(true);
    setDataReassignmentDialogVisible(true);
    setDataReassignmentDeleteProfile(true);
    setDeleteProfileDialogVisible(false);
  };

  const onClickReassignData = () => {
    setDialogData(users[0]);

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
    >
      <ModalDialog.Header>
        {onlyOneUser ? t("DeleteUser") : t("DeletingUsers")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <BodyComponent
          needReassignData={needReassignData}
          onClickReassignData={onClickReassignData}
          deleteWithoutReassign={deleteWithoutReassign}
          users={users}
          onlyOneUser={onlyOneUser}
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

  const { getUsersList, needResetUserSelection } = peopleStore.usersStore;

  const {
    setDataReassignmentDialogVisible,
    setDeleteProfileDialogVisible,
    setDataReassignmentDeleteProfile,
    setIsDeletingUserWithReassignment,
    setDialogData,
  } = dialogStore;

  const { getUsersToRemoveIds: userIds, setSelected } = selectionStore;

  const onlyUsers = users.every((el) => el.role === "user");
  const deleteWithoutReassign = users.length > 1 && !onlyUsers;
  const onlyOneUser = users.length === 1;

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
    getUsersList,
    deleteWithoutReassign,
    onlyOneUser,
    userIds,
  };
})(observer(DeleteProfileEverDialog));
