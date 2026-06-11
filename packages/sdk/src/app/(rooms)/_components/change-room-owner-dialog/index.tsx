// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import PeopleSelector from "@docspace/ui-kit/selectors/People";
import type { PeopleFilter } from "@docspace/ui-kit/selectors/People/PeopleSelector.types";
import type { TOnSubmit } from "@docspace/ui-kit/components/selector";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";
import api from "@docspace/shared/api";
import { EmployeeType, EmployeeStatus } from "@docspace/shared/enums";
import { ShareAccessRights } from "@docspace/ui-kit/enums";
import { getBrandName } from "@docspace/shared/constants/brands";

import styles from "./ChangeRoomOwnerDialog.module.scss";

type ChangeRoomOwnerDialogProps = {
  visible: boolean;
  onClose: () => void;
  roomId: number;
  roomOwnerId?: string;
  currentUserId?: string;
  onChanged?: (roomId: number) => void;
  onLeave?: (roomId: number) => void;
};

const ChangeRoomOwnerDialog = ({
  visible,
  onClose,
  roomId,
  roomOwnerId,
  currentUserId,
  onChanged,
  onLeave,
}: ChangeRoomOwnerDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const filter = React.useMemo<PeopleFilter>(
    () => ({
      role: [EmployeeType.Admin, EmployeeType.RoomAdmin],
      employeeStatus: EmployeeStatus.Active,
    }),
    [],
  );

  const ownerIsCurrentUser = !!currentUserId && roomOwnerId === currentUserId;

  const headerLabel = t("Common:ChangeTheRoomOwner");
  const infoText = t("Common:PeopleSelectorInfo", {
    productName: getBrandName("ProductName"),
  });

  const onSubmit: TOnSubmit = async (users, _access, _name, isLeaveChecked) => {
    const newOwnerId = users[0]?.id;
    if (!newOwnerId || typeof newOwnerId !== "string") return;

    let didLeave = false;
    try {
      await api.files.setFileOwner(newOwnerId, [roomId]);

      if (isLeaveChecked) {
        await api.rooms.updateRoomMemberRole(roomId, {
          invitations: [{ id: currentUserId!, access: ShareAccessRights.None }],
          force: false,
        });
        didLeave = true;
        toastr.success(t("Common:LeftAndAppointNewOwner"));
      } else {
        toastr.success(t("Common:AppointNewOwner"));
      }

      onChanged?.(roomId);
    } catch (e) {
      toastr.error(e as Error);
    }
    onClose();
    if (didLeave) onLeave?.(roomId);
  };

  const checkboxProps = ownerIsCurrentUser
    ? {
        withFooterCheckbox: true as const,
        footerCheckboxLabel: t("Common:LeaveTheRoom"),
        isChecked: true,
      }
    : {};

  const infoProps = {
    withInfo: true as const,
    infoText,
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withoutPadding
    >
      <ModalDialog.Body>
        <div
          className={classNames(styles.changeRoomOwner, {
            [styles.withFooterCheckbox]: ownerIsCurrentUser,
          })}
        >
          <PeopleSelector
            withCancelButton
            onCancel={onClose}
            cancelButtonLabel=""
            disableSubmitButton={false}
            submitButtonLabel={t("Common:AssignOwner")}
            onSubmit={onSubmit}
            withHeader
            headerProps={{
              onCloseClick: onClose,
              headerLabel,
            }}
            filter={filter}
            {...checkboxProps}
            {...infoProps}
            withOutCurrentAuthorizedUser
            filterUserId={roomOwnerId}
            currentUserId={currentUserId}
            disableDisabledUsers
            emptyScreenHeader={t("Common:NotFoundMembers")}
            emptyScreenDescription={infoText}
            className={styles.changeOwnerPeopleSelector}
            data-test-id="change_owner_people_selector"
          />
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default ChangeRoomOwnerDialog;

