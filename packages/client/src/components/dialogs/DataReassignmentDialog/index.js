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

import { useState, useEffect } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import PeopleSelector from "@docspace/shared/selectors/People";
import { toastr } from "@docspace/shared/components/toast";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Backdrop } from "@docspace/shared/components/backdrop";

import Body from "./sub-components/Body";
import Footer from "./sub-components/Footer";
import api from "@docspace/shared/api";
import { EmployeeType } from "@docspace/shared/enums";
const { Filter } = api;

const StyledBodyContent = styled.div`
  display: contents;

  .avatar-name,
  .delete-profile-container {
    display: flex;
    align-items: center;
  }

  .delete-profile-checkbox {
    margin-bottom: 16px;
  }

  .list-container {
    gap: 6px;
  }
`;

const statusTerminateCompleted = 3;
let timerId;

const DataReassignmentDialog = ({
  visible,
  user,
  setDataReassignmentDialogVisible,
  dataReassignment,
  dataReassignmentProgress,
  dataReassignmentTerminate,
  currentColorScheme,
  currentUser,
  deleteProfile,
  isDeletingUserWithReassignment,
  t,
  tReady,
  getUsersList,
  setIsDeletingUserWithReassignment,
  setDataReassignmentDeleteProfile,
  dataReassignmentUrl,
  needResetUserSelection,
  setSelected,
}) => {
  const [selectorVisible, setSelectorVisible] = useState(false);
  const defaultSelectedUser = isDeletingUserWithReassignment
    ? currentUser
    : null;
  const [selectedUser, setSelectedUser] = useState(defaultSelectedUser);
  const [isDeleteProfile, setIsDeleteProfile] = useState(deleteProfile);
  const [showProgress, setShowProgress] = useState(false);
  const [isReassignCurrentUser, setIsReassignCurrentUser] = useState(false);
  const [isAbortTransfer, setIsAbortTransfer] = useState(false);

  const [percent, setPercent] = useState(0);

  const updateAccountsAfterDeleteUser = () => {
    const filter = Filter.getDefault();
    getUsersList(filter, true);
    return;
  };

  useEffect(() => {
    //If click Delete user
    if (isDeletingUserWithReassignment) onReassign();

    return () => {
      setIsDeletingUserWithReassignment(false);
      setDataReassignmentDeleteProfile(false);
      clearTimeout(timerId);
    };
  }, [isDeletingUserWithReassignment]);

  const onToggleDeleteProfile = () => {
    setIsDeleteProfile((remove) => !remove);
  };

  const onTogglePeopleSelector = () => {
    setSelectorVisible((show) => !show);
  };

  const onClose = () => {
    setDataReassignmentDialogVisible(false);
  };

  const onClosePeopleSelector = () => {
    setSelectorVisible(false);
  };

  const onStartAgain = () => {
    setShowProgress(false);
    setPercent(0);
    setIsAbortTransfer(false);
  };

  const onAccept = (item) => {
    setSelectorVisible(false);
    setSelectedUser({ ...item[0] });
  };

  const checkReassignCurrentUser = () => {
    setIsReassignCurrentUser(currentUser.id === selectedUser.id);
  };

  const checkProgress = () => {
    dataReassignmentProgress(user.id)
      .then((res) => {
        //If the task has already been interrupted and killed
        if (!res) return;

        if (res.error) {
          toastr.error(res.error);
          return;
        }

        setPercent(res.percentage);

        if (!res.isCompleted) {
          timerId = setTimeout(checkProgress, 500);
          return;
        }

        clearTimeout(timerId);
        if (res.status === statusTerminateCompleted) return;

        toastr.success(t("Common:ChangesSavedSuccessfully"));
        isDeleteProfile && updateAccountsAfterDeleteUser();
      })
      .catch((error) => {
        toastr.error(error?.response?.data?.error?.message);
      });
  };

  const onReassign = () => {
    checkReassignCurrentUser();
    setShowProgress(true);

    dataReassignment(user.id, selectedUser.id, isDeleteProfile)
      .then(() => checkProgress())
      .catch((error) => {
        toastr.error(error?.response?.data?.error?.message);
      })
      .finally(() => {
        if (isDeleteProfile || needResetUserSelection) {
          setSelected("close");
        }
      });
  };

  const onTerminate = () => {
    clearTimeout(timerId);

    dataReassignmentTerminate(user.id)
      .then((res) => {
        setPercent(res.percentage);
        setIsAbortTransfer(true);
        toastr.success(t("Common:ChangesSavedSuccessfully"));
        isDeleteProfile && updateAccountsAfterDeleteUser();
      })
      .catch((error) => {
        toastr.error(error?.response?.data?.error?.message);
      });
  };

  const filter = new Filter();
  filter.role = [EmployeeType.Admin, EmployeeType.User];

  if (selectorVisible) {
    return (
      <ModalDialog
        displayType="aside"
        visible={visible}
        onClose={onClosePeopleSelector}
        containerVisible={selectorVisible}
        withFooterBorder
        withBodyScroll
      >
        <Backdrop
          onClick={onClosePeopleSelector}
          visible={selectorVisible}
          isAside
        />
        <ModalDialog.Container>
          <PeopleSelector
            submitButtonLabel={t("Common:SelectAction")}
            onSubmit={onAccept}
            disableSubmitButton={false}
            excludeItems={[user.id]}
            currentUserId={user.id}
            withCancelButton
            cancelButtonLabel=""
            headerProps={{
              onCloseClick: onClose,
              onBackClick: onClosePeopleSelector,
              withoutBackButton: false,
              headerLabel: "",
            }}
            onBackClick={onTogglePeopleSelector}
            filter={filter}
            withHeader
            disableDisabledUsers
          />
        </ModalDialog.Container>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog
      displayType="aside"
      visible={visible}
      onClose={onClose}
      containerVisible={selectorVisible}
      withFooterBorder
      withBodyScroll
    >
      <ModalDialog.Header>
        {t("DataReassignmentDialog:DataReassignment")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
          <Body
            t={t}
            tReady={tReady}
            showProgress={showProgress}
            isReassignCurrentUser={isReassignCurrentUser}
            user={user}
            selectedUser={selectedUser}
            percent={percent}
            isAbortTransfer={isAbortTransfer}
            dataReassignmentUrl={dataReassignmentUrl}
            currentColorScheme={currentColorScheme}
            onTogglePeopleSelector={onTogglePeopleSelector}
          />
        </StyledBodyContent>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Footer
          t={t}
          showProgress={showProgress}
          isDeleteProfile={isDeleteProfile}
          onToggleDeleteProfile={onToggleDeleteProfile}
          selectedUser={selectedUser}
          onReassign={onReassign}
          percent={percent}
          isAbortTransfer={isAbortTransfer}
          onClose={onClose}
          onTerminate={onTerminate}
          onStartAgain={onStartAgain}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ settingsStore, peopleStore, setup, userStore }) => {
  const {
    setDataReassignmentDialogVisible,
    dataReassignmentDeleteProfile,
    setDataReassignmentDeleteProfile,
    isDeletingUserWithReassignment,
    setIsDeletingUserWithReassignment,
  } = peopleStore.dialogStore;
  const { currentColorScheme, dataReassignmentUrl } = settingsStore;
  const { setSelected } = peopleStore.selectionStore;
  const {
    dataReassignment,
    dataReassignmentProgress,
    dataReassignmentTerminate,
  } = setup;

  const { user: currentUser } = userStore;

  const { getUsersList, needResetUserSelection } = peopleStore.usersStore;

  return {
    setDataReassignmentDialogVisible,
    theme: settingsStore.theme,
    currentColorScheme,
    dataReassignment,
    currentUser,
    dataReassignmentProgress,
    dataReassignmentTerminate,
    deleteProfile: dataReassignmentDeleteProfile,
    setDataReassignmentDeleteProfile,
    getUsersList,
    isDeletingUserWithReassignment,
    setIsDeletingUserWithReassignment,
    dataReassignmentUrl,
    needResetUserSelection,
    setSelected,
  };
})(
  observer(
    withTranslation([
      "Common",
      "DataReassignmentDialog",
      "Translations",
      "ChangePortalOwner",
    ])(DataReassignmentDialog),
  ),
);
