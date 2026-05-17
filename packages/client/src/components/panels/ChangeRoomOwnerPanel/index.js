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

import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import { withTranslation } from "react-i18next";
import Filter from "@docspace/shared/api/people/filter";
import { EmployeeType, EmployeeStatus } from "@docspace/shared/enums";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import styles from "./ChangeRoomOwnerPanel.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const ChangeRoomOwner = (props) => {
  const {
    t,
    tReady,
    visible,
    setIsVisible,
    showBackButton,
    onOwnerChange,
    roomOwnerId,
    changeRoomOwner,
    userId,
    useModal = true,
    isAIAgent,
    updateInfoPanelMembers,
  } = props;

  const handleClosePanel = () => {
    const { onClose } = props;
    if (onClose) onClose();
    setIsVisible(false);
  };

  const onChangeRoomOwner = async (
    user,
    selectedAccess,
    newFooterInputValue,
    isChecked,
  ) => {
    if (showBackButton) {
      onOwnerChange && onOwnerChange(user[0]);
    } else {
      await changeRoomOwner(t, user[0]?.id, isChecked);
      updateInfoPanelMembers();
    }
    handleClosePanel();
  };

  const onBackClick = () => {
    handleClosePanel();
  };

  const filter = useMemo(() => {
    const newFilter = Filter.getDefault();
    newFilter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];
    newFilter.employeeStatus = EmployeeStatus.Active;
    return newFilter;
  }, []);

  const ownerIsCurrentUser = roomOwnerId === userId;

  const headerLabel = isAIAgent
    ? t("Files:ChangeTheAgentOwner")
    : t("Files:ChangeTheRoomOwner");

  const infoText = isAIAgent
    ? t("Files:ChangeAgentOwnerSelectorInfo", {
        productName: getBrandName("ProductName"),
      })
    : t("CreateEditRoomDialog:PeopleSelectorInfo", {
        productName: getBrandName("ProductName"),
      });

  const footerCheckboxLabel = isAIAgent
    ? t("Files:LeaveTheAgent")
    : t("Files:LeaveTheRoom");

  const selectorComponent = (
    <PeopleSelector
      withCancelButton
      onCancel={handleClosePanel}
      cancelButtonLabel=""
      disableSubmitButton={false}
      submitButtonLabel={showBackButton ? "" : t("Files:AssignOwner")}
      onSubmit={onChangeRoomOwner}
      withHeader
      headerProps={{
        onCloseClick: handleClosePanel,
        onBackClick,
        withoutBackButton: !showBackButton,
        headerLabel,
      }}
      filter={filter}
      withFooterCheckbox={!showBackButton ? ownerIsCurrentUser : null}
      footerCheckboxLabel={footerCheckboxLabel}
      isChecked={!showBackButton}
      withOutCurrentAuthorizedUser
      filterUserId={roomOwnerId}
      currentUserId={userId}
      disableDisabledUsers
      withInfo
      infoText={infoText}
      emptyScreenHeader={t("Common:NotFoundMembers")}
      emptyScreenDescription={infoText}
      className={styles.changeOwnerPeopleSelector}
      data-test-id="change_owner_people_selector"
    />
  );

  return useModal ? (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={handleClosePanel}
      displayType={ModalDialogType.aside}
      withoutPadding
    >
      <ModalDialog.Body>
        <div
          className={classNames(styles.changeRoomOwner, {
            [styles.withFooterCheckbox]: !showBackButton
              ? ownerIsCurrentUser
              : false,
          })}
        >
          {selectorComponent}
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  ) : (
    selectorComponent
  );
};

export default inject(
  ({
    dialogsStore,
    filesStore,
    selectedFolderStore,
    filesActionsStore,
    userStore,
    infoPanelStore,
  }) => {
    const { changeRoomOwnerIsVisible, setChangeRoomOwnerIsVisible } =
      dialogsStore;
    const { selection, bufferSelection } = filesStore;

    const { updateInfoPanelMembers } = infoPanelStore;

    const room = selection.length
      ? selection[0]
      : bufferSelection || selectedFolderStore;

    const { id } = userStore.user;

    return {
      visible: changeRoomOwnerIsVisible,
      setIsVisible: setChangeRoomOwnerIsVisible,
      roomOwnerId: room?.createdBy?.id,
      changeRoomOwner: filesActionsStore.changeRoomOwner,
      userId: id,
      isAIAgent: room?.isAIAgent,
      updateInfoPanelMembers,
    };
  },
)(
  observer(
    withTranslation(["Files", "CreateEditRoomDialog", "Common"])(
      ChangeRoomOwner,
    ),
  ),
);
