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

import { useEffect, useMemo, useState } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import { withTranslation } from "react-i18next";
import Filter from "@docspace/shared/api/people/filter";
import {
  EmployeeType,
  EmployeeStatus,
  MembersSubjectType,
} from "@docspace/shared/enums";
import { getUserList } from "@docspace/shared/api/people";
import { getRoomMembers } from "@docspace/shared/api/rooms";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { toastr } from "@docspace/ui-kit/components/toast";
import { validateMembersForEncryption } from "@docspace/shared/services/private-room/room-encryption";
import styles from "./ChangeRoomOwnerPanel.module.scss";

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
    roomId,
    isPrivateRoom,
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
    const candidate = user[0];
    if (!candidate?.id) {
      handleClosePanel();
      return;
    }

    if (showBackButton) {
      onOwnerChange && onOwnerChange(candidate);
      handleClosePanel();
      return;
    }

    if (isPrivateRoom && roomId) {
      const { skipped } = await validateMembersForEncryption(
        Number(roomId),
        [candidate.id],
        String(userId),
        undefined,
        { [candidate.id]: candidate.label || candidate.displayName },
      );
      if (skipped.length > 0) {
        const reason = skipped[0].reason;
        const name =
          skipped[0].displayName ||
          candidate.label ||
          candidate.displayName ||
          candidate.id;
        toastr.error(
          reason === "no-key"
            ? t("Common:EncryptedChangeOwnerNoKeys", { user: name })
            : t("Common:EncryptedChangeOwnerKeyMismatch", { user: name }),
        );
        return;
      }
    }

    await changeRoomOwner(t, candidate.id, isChecked);
    updateInfoPanelMembers();
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

  const baseExclude = useMemo(
    () => (isPrivateRoom && userId ? [userId] : []),
    [isPrivateRoom, userId],
  );

  const [excludeItems, setExcludeItems] = useState(baseExclude);
  const [excludeReady, setExcludeReady] = useState(!isPrivateRoom);

  useEffect(() => {
    setExcludeItems(baseExclude);
    setExcludeReady(!isPrivateRoom);

    if (!isPrivateRoom || !roomId) return undefined;

    const controller = new AbortController();
    let cancelled = false;

    const adminsFilter = Filter.getDefault();
    adminsFilter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];
    adminsFilter.employeeStatus = EmployeeStatus.Active;
    adminsFilter.pageCount = 100;

    Promise.all([
      getRoomMembers(roomId, { count: 100 }, controller.signal),
      getUserList(adminsFilter, controller.signal),
    ])
      .then(([members, admins]) => {
        if (cancelled) return;
        const memberIds = new Set(
          (members?.items ?? [])
            .filter((m) => m?.subjectType === MembersSubjectType.User)
            .map((m) => m?.sharedTo?.id)
            .filter(Boolean),
        );
        const nonMemberAdmins = (admins?.items ?? [])
          .map((a) => a.id)
          .filter((id) => id && !memberIds.has(id));
        const merged = new Set([...baseExclude, ...nonMemberAdmins]);
        setExcludeItems([...merged]);
        setExcludeReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setExcludeReady(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isPrivateRoom, roomId, baseExclude]);

  const ownerIsCurrentUser = roomOwnerId === userId;

  const headerLabel = isAIAgent
    ? t("Files:ChangeTheAgentOwner")
    : t("Common:ChangeTheRoomOwner");

  const infoText = isAIAgent
    ? t("Files:ChangeAgentOwnerSelectorInfo")
    : t("Common:PeopleSelectorInfo");

  const footerCheckboxLabel = isAIAgent
    ? t("Common:LeaveTheAgent")
    : t("Common:LeaveTheRoom");

  const selectorComponent = excludeReady ? (
    <PeopleSelector
      withCancelButton
      onCancel={handleClosePanel}
      cancelButtonLabel=""
      disableSubmitButton={false}
      submitButtonLabel={showBackButton ? "" : t("Common:AssignOwner")}
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
      excludeItems={
        isPrivateRoom && excludeItems.length ? excludeItems : undefined
      }
      withInfo
      infoText={infoText}
      emptyScreenHeader={t("Common:NotFoundMembers")}
      emptyScreenDescription={infoText}
      className={styles.changeOwnerPeopleSelector}
      data-test-id="change_owner_people_selector"
    />
  ) : (
    <div className={styles.changeOwnerLoader}>
      <Loader type={LoaderTypes.track} />
    </div>
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
      roomId: room?.id,
      isPrivateRoom: !!(room?.isPrivateRoom ?? room?.private),
    };
  },
)(
  observer(
    withTranslation(["Files", "CreateEditRoomDialog", "Common"])(
      ChangeRoomOwner,
    ),
  ),
);

