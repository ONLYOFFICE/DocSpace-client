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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  FolderType,
  RoomSecurityError,
  RoomsType,
} from "@docspace/shared/enums";
import { User as ShareUser } from "@docspace/shared/components/share/sub-components/User";

import type { TOption } from "@docspace/ui-kit/components/combobox";
import type { TGroup } from "@docspace/shared/api/groups/types";

import { filterPaidRoleOptions } from "@docspace/shared/utils/filterPaidRoleOptions";
import { filterNotReadOnlyOptions } from "@docspace/shared/utils/filterNotReadOnlyOptions";

import MembersHelper from "../Members.utils";
import type { UserProps } from "../Members.types";

const User = ({
  room,

  user,
  currentUser,

  hasNextPage,

  changeUserRole,

  setEditMembersGroup,
  setEditGroupMembersDialogVisible,
  setRemoveUserConfirmation,
  isAIAgentsFolderRoot,
}: UserProps) => {
  const { t } = useTranslation([
    "InfoPanel",
    "InviteDialog",
    "Common",
    "Translations",
    "People",
    "PeopleTranslations",
    "Settings",
    "CreateEditRoomDialog",
  ]);

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
  const hideUserRole = room.rootFolderType === FolderType.RoomTemplates;

  const fullRoomRoleOptions = membersHelper.getOptionsByRoomType(
    room.roomType,
    canChangeUserRole,
  );

  const userRole = membersHelper.getOptionByUserAccess(
    user.access,
    isAIAgentsFolderRoot,
  );

  const guestInAgent =
    "isVisitor" in user && user.isVisitor && room.roomType === RoomsType.AIRoom;

  const userRoleOptions = guestInAgent
    ? filterNotReadOnlyOptions(fullRoomRoleOptions)
    : ("isGroup" in user && user.isGroup) ||
        ("isAdmin" in user &&
          !user.isAdmin &&
          !user.isOwner &&
          !user.isRoomAdmin)
      ? (filterPaidRoleOptions(fullRoomRoleOptions) as TOption[])
      : (fullRoomRoleOptions as TOption[]);

  const onRepeatInvitation = async () => {
    api.rooms
      .resendEmailInvitations(room.id, true)
      .then(() =>
        toastr.success(t("PeopleTranslations:SuccessSentMultipleInvitatios")),
      )
      .catch((err) => toastr.error(err));
  };

  const updateRole = (option: TOption, force: boolean) => {
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
          return setRemoveUserConfirmation!(true, async () => {
            await updateRole(option, true);
          });
        }

        await changeUserRole(option, user.id, currentUser?.id, hasNextPage);
      })
      .catch((err) => {
        toastr.error(err);
      });
  };

  const onOptionClick = async (option: TOption) => {
    if (option.access === userRole?.access) return;

    return updateRole(option, false);
  };

  const onOpenGroup = (group: TGroup) => {
    if (group.isSystem) return;
    setEditMembersGroup!(group);
    setEditGroupMembersDialogVisible!(true);
  };

  return (
    <ShareUser
      user={user}
      currentUser={currentUser}
      selectedOption={userRole}
      options={userRoleOptions}
      hideCombobox={hideUserRole}
      onSelectOption={onOptionClick}
      onClickGroup={onOpenGroup}
      onRepeatInvitation={onRepeatInvitation}
      showInviteIcon={showInviteIcon}
    />
  );
};

export default inject(({ dialogsStore, treeFoldersStore }: TStore) => {
  const {
    setEditMembersGroup,
    setEditGroupMembersDialogVisible,
    setRemoveUserConfirmation,
  } = dialogsStore;

  const { isAIAgentsFolderRoot } = treeFoldersStore;

  return {
    setEditMembersGroup,
    setEditGroupMembersDialogVisible,
    setRemoveUserConfirmation,
    isAIAgentsFolderRoot,
  };
})(observer(User));
