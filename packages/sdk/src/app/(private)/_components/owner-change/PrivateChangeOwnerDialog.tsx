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
// NOTE: Adds validateMembersForEncryption pre-check before setFileOwner so we
// don't transfer ownership to a user whose envelope can't unwrap room DEKs.

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import PeopleSelector from "@docspace/ui-kit/selectors/People";
import type { PeopleFilter } from "@docspace/ui-kit/selectors/People/PeopleSelector.types";
import type { TOnSubmit } from "@docspace/ui-kit/components/selector";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";
import { EmployeeType, EmployeeStatus } from "@docspace/shared/enums";

import { usePrivateOwnerChangeFlow } from "../../_hooks/usePrivateOwnerChangeFlow";

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
  const { validateCandidates, changeOwner, isLoading } =
    usePrivateOwnerChangeFlow();

  const filter = React.useMemo<PeopleFilter>(
    () => ({
      role: [EmployeeType.Admin, EmployeeType.RoomAdmin],
      employeeStatus: EmployeeStatus.Active,
    }),
    [],
  );

  const headerLabel = t("Common:ChangeTheRoomOwner");
  const infoText = t("Common:PrivateOwnerEncryptionHint");

  const onSubmit: TOnSubmit = async (users) => {
    const candidate = users[0];
    const newOwnerId = candidate?.id;
    if (!newOwnerId || typeof newOwnerId !== "string") return;

    try {
      const { validIds, skipped } = await validateCandidates({
        roomId,
        candidateIds: [newOwnerId],
        displayNames: candidate.displayName
          ? { [newOwnerId]: candidate.displayName }
          : undefined,
      });

      if (!validIds.includes(newOwnerId)) {
        const reason = skipped[0]?.reason || "no-key";
        toastr.error(
          t("Common:PrivateOwnerCannotBeAssigned", { reason }),
        );
        return;
      }

      const ok = await changeOwner({ roomId, newOwnerId });
      if (!ok) return;
      toastr.success(t("Common:AppointNewOwner"));
      onChanged?.(roomId);
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toastr.error(msg);
    }
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withoutPadding
    >
      <ModalDialog.Body>
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
          emptyScreenHeader={t("Common:NotFoundMembers")}
          emptyScreenDescription={infoText}
          data-test-id="private_change_owner_selector"
        />
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default PrivateChangeOwnerDialog;
