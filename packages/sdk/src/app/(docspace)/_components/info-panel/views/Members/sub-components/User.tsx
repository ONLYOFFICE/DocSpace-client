// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  RoomSecurityError,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { User as ShareUser } from "@docspace/shared/components/share/sub-components/User";

import type { TOption } from "@docspace/ui-kit/components/combobox";
import type { TGroup } from "@docspace/shared/api/groups/types";

import { filterPaidRoleOptions } from "@docspace/shared/utils/filterPaidRoleOptions";
import { filterNotReadOnlyOptions } from "@docspace/shared/utils/filterNotReadOnlyOptions";

import type { UserProps } from "../Members.types";
import MembersHelper from "../Members.utils";
import RemoveUserDialog from "./RemoveUserDialog";

const User = ({
  room,
  user,
  currentUser,
  hasNextPage,
  changeUserRole,
  onOpenGroup,
}: UserProps) => {
  const { t } = useTranslation(["Common"]);

  const [removeConfirm, setRemoveConfirm] = useState<{
    action: () => Promise<void>;
    isEncrypted?: boolean;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const membersHelper = new MembersHelper({ t });

  if (
    "displayName" in user &&
    !user.displayName &&
    "name" in user &&
    !user.name &&
    "email" in user &&
    !user.email
  )
    return null;

  const security = room?.security;
  const isExpect = user.isExpect;
  const canInviteUserInRoomAbility = security?.EditAccess;
  const showInviteIcon = canInviteUserInRoomAbility && isExpect;
  const canChangeUserRole = user.canEditAccess;
  const hideUserRole = false;

  const fullRoomRoleOptions = membersHelper.getOptionsByRoomType(
    room.roomType,
    canChangeUserRole,
  );

  const userRole = membersHelper.getOptionByUserAccess(user.access);

  const guestInAgent =
    "isVisitor" in user && user.isVisitor && room.roomType === RoomsType.AIRoom;

  const userRoleOptions = guestInAgent
    ? filterNotReadOnlyOptions(
        fullRoomRoleOptions as Parameters<typeof filterNotReadOnlyOptions>[0],
      )
    : ("isGroup" in user && user.isGroup) ||
        ("isAdmin" in user &&
          !user.isAdmin &&
          !user.isOwner &&
          !user.isRoomAdmin)
      ? (filterPaidRoleOptions(
          fullRoomRoleOptions as Parameters<typeof filterPaidRoleOptions>[0],
        ) as TOption[])
      : (fullRoomRoleOptions as TOption[]);

  const onRepeatInvitation = async () => {
    api.rooms
      .resendEmailInvitations(room.id, true)
      .then(() =>
        toastr.success(t("Common:RoomSuccessSentMultipleInvitatios")),
      )
      .catch((err) => toastr.error(err));
  };

  const updateRole = (option: TOption, force: boolean): Promise<void> => {
    return api.rooms
      .updateRoomMemberRole(room.id, {
        invitations: [{ id: user.id, access: option.access }],
        notify: true,
        sharingMessage: "",
        force,
      })
      .then(async (item) => {
        toastr.success(t("Common:AccessRightsChanged"));

        if (item?.error === RoomSecurityError.FormRoleBlockingDeletion) {
          setRemoveConfirm({ action: () => updateRole(option, true) });
          return;
        }

        await changeUserRole(option, user.id, currentUser?.id, hasNextPage);
      })
      .catch((err) => {
        toastr.error(err);
      });
  };

  const onOptionClick = async (option: TOption) => {
    if (option.access === userRole?.access) return;

    const isRemoval = option.access === ShareAccessRights.None;
    const isPrivateRoom = room.private;

    if (isRemoval && isPrivateRoom) {
      setRemoveConfirm({
        action: () => updateRole(option, false),
        isEncrypted: true,
      });
      return;
    }

    return updateRole(option, false);
  };

  const onConfirmRemove = async () => {
    if (!removeConfirm) return;
    try {
      setIsRemoving(true);
      await removeConfirm.action();
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setIsRemoving(false);
      setRemoveConfirm(null);
    }
  };

  const onOpenGroupClick = (group: TGroup) => {
    if (group.isSystem) return;
    onOpenGroup(group);
  };

  return (
    <>
      <ShareUser
        user={user}
        currentUser={currentUser}
        selectedOption={userRole}
        options={userRoleOptions}
        hideCombobox={hideUserRole}
        onSelectOption={onOptionClick}
        onClickGroup={onOpenGroupClick}
        onRepeatInvitation={onRepeatInvitation}
        showInviteIcon={showInviteIcon}
      />

      {removeConfirm ? (
        <RemoveUserDialog
          isEncrypted={removeConfirm.isEncrypted}
          isRemoving={isRemoving}
          onConfirm={onConfirmRemove}
          onClose={() => setRemoveConfirm(null)}
        />
      ) : null}
    </>
  );
};

export default User;
