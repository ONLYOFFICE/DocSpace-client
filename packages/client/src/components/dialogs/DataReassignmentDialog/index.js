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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";

import api from "@docspace/shared/api";
import { EmployeeActivationStatus, EmployeeType } from "@docspace/shared/enums";
import Body from "./sub-components/Body";
import Footer from "./sub-components/Footer";
import styles from "./DataReassignment.module.scss";

const { Filter } = api;

const statusTerminateCompleted = 3;
let timerId;

const DataReassignmentDialog = ({
  visible,
  setDataReassignmentDialogVisible,
  currentColorScheme,
  currentUser,
  deleteProfile,
  t,
  tReady,
  setDataReassignmentDeleteProfile,
  dataReassignmentUrl,
  needResetUserSelection,
  setSelected,
  data,
}) => {
  const {
    user,
    getReassignmentProgress,
    reassignUserData,
    cancelReassignment,
    showDeleteProfileCheckbox,
    toType,
    currentUserAsDefault,
    noRoomFilesToMove,
  } = data;

  const [selectorVisible, setSelectorVisible] = useState(false);
  const defaultTargetUser = currentUserAsDefault ? currentUser : null;
  const [targetUser, setTargetUser] = useState(defaultTargetUser);
  const [isDeleteProfile, setIsDeleteProfile] = useState(deleteProfile);
  const [showProgress, setShowProgress] = useState(false);
  const [isReassignCurrentUser, setIsReassignCurrentUser] = useState(false);
  const [isAbortTransfer, setIsAbortTransfer] = useState(false);

  const [percent, setPercent] = useState(0);

  // const updateAccountsAfterDeleteUser = () => {
  //   const filter = Filter.getDefault();

  //   filter.area = "people";

  //   getUsersList(filter, true);
  // };

  const checkReassignCurrentUser = () => {
    setIsReassignCurrentUser(currentUser.id === targetUser.id);
  };

  const checkProgress = () => {
    getReassignmentProgress(user.id)
      .then((res) => {
        // If the task has already been interrupted and killed
        if (!res) return;

        if (res.error) {
          toastr.error(res.error);
          setIsAbortTransfer(true);

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
      })
      .catch((error) => {
        toastr.error(error?.response?.data?.error?.message);
      });
  };

  const handleReassignUserData = (userId, targetUserId) => {
    if (toType) return reassignUserData(toType, userId, targetUserId);
    return reassignUserData(userId, targetUserId, isDeleteProfile);
  };

  const onReassign = () => {
    checkReassignCurrentUser();
    setShowProgress(true);

    handleReassignUserData(user.id, targetUser.id)
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

  useEffect(() => {
    // If click Delete user
    if (currentUserAsDefault) onReassign();

    return () => {
      setDataReassignmentDeleteProfile(false);
      clearTimeout(timerId);
    };
  }, [currentUserAsDefault]);

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
    setTargetUser({ ...item[0] });
  };

  const filter = Filter.getDefault();
  filter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];
  filter.employeeStatus = EmployeeActivationStatus.Activated;

  if (selectorVisible) {
    return (
      <ModalDialog
        displayType="aside"
        visible={visible}
        onClose={onClosePeopleSelector}
        containerVisible={selectorVisible}
        withBodyScroll
      >
        <Backdrop
          onClick={onClosePeopleSelector}
          visible={selectorVisible}
          isAside
        />
        <ModalDialog.Container>
          <PeopleSelector
            submitButtonLabel=""
            disableSubmitButton={false}
            onSubmit={onAccept}
            excludeItems={[user.id]}
            currentUserId={user.id}
            withCancelButton
            onCancel={onClosePeopleSelector}
            cancelButtonLabel=""
            withHeader
            headerProps={{
              onCloseClick: onClose,
              onBackClick: onClosePeopleSelector,
              withoutBackButton: false,
              headerLabel: "",
            }}
            filter={filter}
            disableDisabledUsers
          />
        </ModalDialog.Container>
      </ModalDialog>
    );
  }

  const onTerminate = () => {
    cancelReassignment(user.id)
      .then(() => {
        toastr.success(t("Common:ChangesSavedSuccessfully"));
        setIsAbortTransfer(true);
      })
      .catch((error) => {
        toastr.error(error?.response?.data?.error?.message);
      });
  };

  return (
    <ModalDialog
      displayType="aside"
      visible={visible}
      onClose={onClose}
      containerVisible={selectorVisible}
      withBodyScroll
    >
      <ModalDialog.Header>
        {t("DataReassignmentDialog:DataReassignment")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.bodyContent}>
          <Body
            t={t}
            tReady={tReady}
            showProgress={showProgress}
            isReassignCurrentUser={isReassignCurrentUser}
            user={user}
            targetUser={targetUser}
            percent={percent}
            isAbortTransfer={isAbortTransfer}
            dataReassignmentUrl={dataReassignmentUrl}
            currentColorScheme={currentColorScheme}
            onTogglePeopleSelector={onTogglePeopleSelector}
            noRoomFilesToMove={noRoomFilesToMove}
          />
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Footer
          t={t}
          showProgress={showProgress}
          isDeleteProfile={isDeleteProfile}
          onToggleDeleteProfile={onToggleDeleteProfile}
          targetUser={targetUser}
          onReassign={onReassign}
          percent={percent}
          isAbortTransfer={isAbortTransfer}
          onClose={onClose}
          onTerminate={onTerminate}
          onStartAgain={onStartAgain}
          showDeleteProfileCheckbox={showDeleteProfileCheckbox}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({ settingsStore, peopleStore, userStore, infoPanelStore }) => {
    const {
      setDataReassignmentDialogVisible,
      dataReassignmentDeleteProfile,
      setDataReassignmentDeleteProfile,
    } = peopleStore.dialogStore;
    const { currentColorScheme, dataReassignmentUrl } = settingsStore;

    const { user: currentUser } = userStore;

    const { needResetUserSelection, setSelected } = peopleStore.usersStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    return {
      setDataReassignmentDialogVisible,
      theme: settingsStore.theme,
      currentColorScheme,
      currentUser,
      deleteProfile: dataReassignmentDeleteProfile,
      setDataReassignmentDeleteProfile,

      dataReassignmentUrl,
      needResetUserSelection: !infoPanelVisible || needResetUserSelection,
      setSelected,
    };
  },
)(
  observer(
    withTranslation([
      "Common",
      "DataReassignmentDialog",
      "Translations",
      "ChangePortalOwner",
    ])(DataReassignmentDialog),
  ),
);
