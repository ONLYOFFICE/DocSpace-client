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
// NOTE: Excludes portal admins who are not room members from owner candidates
// (non-member admins lack DEK access in private rooms — parity with
// ChangeRoomOwnerPanel in packages/client).

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
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  EmployeeType,
  EmployeeStatus,
  MembersSubjectType,
} from "@docspace/shared/enums";
import Filter from "@docspace/shared/api/people/filter";
import { getUserList } from "@docspace/shared/api/people";
import { getRoomMembers } from "@docspace/shared/api/rooms";

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
  const { validateCandidates, changeOwner, leaveRoom, isLoading } =
    usePrivateOwnerChangeFlow();

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

  // ----- non-member admin exclusion (parity: ChangeRoomOwnerPanel) -----
  // Portal admins who are NOT room members cannot own a private room because
  // they have no DEK envelope. We build the exclusion list by fetching room
  // members and all admins in parallel, then subtracting the member set.

  const baseExclude = React.useMemo<string[]>(
    () => (currentUserId ? [currentUserId] : []),
    [currentUserId],
  );

  const [excludeItems, setExcludeItems] = React.useState<string[]>(baseExclude);
  const [excludeReady, setExcludeReady] = React.useState(false);

  React.useEffect(() => {
    setExcludeItems(baseExclude);
    setExcludeReady(false);

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
            .filter(Boolean) as string[],
        );

        const nonMemberAdmins = (admins?.items ?? [])
          .map((a) => a.id)
          .filter((id): id is string => Boolean(id) && !memberIds.has(id));

        const merged = new Set([...baseExclude, ...nonMemberAdmins]);
        setExcludeItems([...merged]);
        setExcludeReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        // On fetch failure fall back to baseExclude so the dialog still works.
        setExcludeReady(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [roomId, baseExclude]);

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
      const { validIds, skipped } = await validateCandidates({
        roomId,
        candidateIds: [newOwnerId],
        displayNames: candidate.displayName
          ? { [newOwnerId]: candidate.displayName }
          : undefined,
      });

      if (!validIds.includes(newOwnerId)) {
        const entry = skipped[0];
        const reason = entry?.reason ?? "no-key";
        // Resolve the display name the same way the reference panel does:
        // prefer the validated entry name, fall back to the selector item,
        // then the raw id.
        const name =
          entry?.displayName ||
          candidate.displayName ||
          newOwnerId;
        toastr.error(
          reason === "no-key"
            ? t("Common:EncryptedChangeOwnerNoKeys", { user: name })
            : t("Common:EncryptedChangeOwnerKeyMismatch", {
                user: name,
              }),
        );
        return;
      }

      const ok = await changeOwner({ roomId, newOwnerId });
      if (!ok) return;

      // Parity: FilesActionsStore.changeRoomOwner — when isLeaveChecked,
      // revoke current user's membership; otherwise show AppointNewOwner
      // toast. DEK wraps are NOT revoked (intentional reference parity).
      if (isLeaveChecked && currentUserId) {
        await leaveRoom({ roomId, userId: currentUserId });
      } else {
        toastr.success(t("Common:AppointNewOwner"));
      }

      onChanged?.(roomId);
      onClose();
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
        isChecked: false,
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
