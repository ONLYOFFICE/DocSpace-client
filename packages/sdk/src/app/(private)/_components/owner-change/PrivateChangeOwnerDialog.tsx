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

// PARITY-SOURCE: packages/sdk/src/app/(rooms)/_components/change-room-owner-dialog/index.tsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko
// NOTE: Takes the owner candidates and the new owner's key check from shared,
// moved there from ChangeRoomOwnerPanel in packages/client.

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import PeopleSelector from "@onlyoffice/apps-ui-kit/selectors/People";
import type { PeopleFilter } from "@onlyoffice/apps-ui-kit/selectors/People/PeopleSelector.types";
import type { TOnSubmit } from "@onlyoffice/apps-ui-kit/components/selector";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Loader, LoaderTypes } from "@onlyoffice/apps-ui-kit/components/loader";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { EmployeeType, EmployeeStatus } from "@docspace/shared/enums";
import { usePrivateRoomOwnerExclusions } from "@docspace/shared/hooks/usePrivateRoomOwnerExclusions";
import { getNewOwnerKeyRefusal } from "@docspace/shared/services/private-room/room-member-flows";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import { usePrivateOwnerChangeFlow } from "../../_hooks/usePrivateOwnerChangeFlow";
import { usePrivateRoute } from "../../_hooks/usePrivateRoute";

type PrivateChangeOwnerDialogProps = {
  visible: boolean;
  onClose: () => void;
  roomId: number;
  roomOwnerId?: string;
  currentUserId?: string;
  onChanged?: (roomId: number) => void;
};

const PrivateChangeOwnerDialog: React.FC<PrivateChangeOwnerDialogProps> = ({
  visible,
  onClose,
  roomId,
  roomOwnerId,
  currentUserId,
  onChanged,
}) => {
  const { t } = useTranslation(["Common"]);
  const router = useRouter();
  const privateRoute = usePrivateRoute();
  const filesListStore = useFilesListStore();
  const { changeOwner, leaveRoom, isLoading } = usePrivateOwnerChangeFlow();

  // Show the leave-room checkbox only when the current user is the room owner.
  // Parity: ChangeRoomOwnerPanel — withFooterCheckbox={ownerIsCurrentUser}.
  const ownerIsCurrentUser =
    !!currentUserId && !!roomOwnerId && roomOwnerId === currentUserId;

  const filter = React.useMemo<PeopleFilter>(
    () => ({
      role: [EmployeeType.Admin, EmployeeType.RoomAdmin],
      employeeStatus: EmployeeStatus.Active,
    }),
    [],
  );

  // Spec: private-rooms/sdk-surface, "Membership from every entry point"
  const { excludeItems, excludeReady } = usePrivateRoomOwnerExclusions({
    isPrivateRoom: true,
    roomId,
    userId: currentUserId,
  });

  const headerLabel = t("Common:ChangeTheRoomOwner");
  const infoText = t("Common:PrivateOwnerEncryptionHint");

  const onSubmit: TOnSubmit = async (
    users,
    _access,
    _fileName,
    isLeaveChecked,
  ) => {
    const candidate = users[0];
    const newOwnerId = candidate?.id;
    if (!newOwnerId || typeof newOwnerId !== "string") return;

    try {
      const refusal = await getNewOwnerKeyRefusal(
        t,
        roomId,
        {
          id: newOwnerId,
          label: candidate.label,
          displayName: candidate.displayName,
        },
        currentUserId ?? "",
      );
      if (refusal) {
        toastr.error(refusal);
        return;
      }

      const ok = await changeOwner({ roomId, newOwnerId });
      if (!ok) return;

      // Parity: FilesActionsStore.changeRoomOwner, which leaves through
      // onLeaveRoom when the leave option is checked.
      const leaving = !!isLeaveChecked && !!currentUserId;
      const leftOpenRoom =
        leaving && String(filesListStore.currentFolder?.id) === String(roomId);
      if (leaving) {
        await leaveRoom({ roomId, userId: currentUserId as string });
        toastr.success(t("Common:YouLeftTheRoom"));
      } else {
        toastr.success(t("Common:AppointNewOwner"));
      }

      onChanged?.(roomId);
      onClose();
      if (leftOpenRoom) router.push(privateRoute("/private"));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toastr.error(msg);
    }
  };

  // Checkbox props: only pass the complete set when the current user is owner.
  // WithFlag<"withFooterCheckbox", ...> requires either all props or none.
  const footerCheckboxProps = ownerIsCurrentUser
    ? ({
        withFooterCheckbox: true as const,
        footerCheckboxLabel: t("Common:LeaveTheRoom"),
        isChecked: true,
      } as const)
    : {};

  const selectorContent = excludeReady ? (
    <PeopleSelector
      withCancelButton
      onCancel={onClose}
      cancelButtonLabel=""
      disableSubmitButton={isLoading}
      submitButtonLabel={t("Common:AssignOwner")}
      onSubmit={onSubmit}
      withHeader
      headerProps={{
        onCloseClick: onClose,
        headerLabel,
      }}
      filter={filter}
      withInfo
      infoText={infoText}
      withOutCurrentAuthorizedUser
      filterUserId={roomOwnerId}
      currentUserId={currentUserId}
      disableDisabledUsers
      excludeItems={excludeItems.length > 0 ? excludeItems : undefined}
      emptyScreenHeader={t("Common:NotFoundMembers")}
      emptyScreenDescription={infoText}
      data-test-id="private_change_owner_selector"
      {...footerCheckboxProps}
    />
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        minHeight: "240px",
      }}
    >
      <Loader type={LoaderTypes.track} />
    </div>
  );

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withoutPadding
    >
      <ModalDialog.Body>{selectorContent}</ModalDialog.Body>
    </ModalDialog>
  );
};

export default PrivateChangeOwnerDialog;
