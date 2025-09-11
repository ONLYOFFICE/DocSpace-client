// (c) Copyright Ascensio System SIA 2009-2025
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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { FolderType, RoomSecurityError } from "@docspace/shared/enums";
import { User as ShareUser } from "@docspace/shared/components/share/sub-components/User";

import type { TOption } from "@docspace/shared/components/combobox";
import type { TGroup } from "@docspace/shared/api/groups/types";

import { filterPaidRoleOptions } from "SRC_DIR/helpers";

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
}: UserProps) => {
  const { t } = useTranslation([
    "InfoPanel",
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

  const userRole = membersHelper.getOptionByUserAccess(user.access);

  const userRoleOptions =
    ("isGroup" in user && user.isGroup) ||
    ("isAdmin" in user && !user.isAdmin && !user.isOwner && !user.isRoomAdmin)
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
        notify: false,
        sharingMessage: "",
        force,
      })
      .then(async (item) => {
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

export default inject(({ dialogsStore }: TStore) => {
  const {
    setEditMembersGroup,
    setEditGroupMembersDialogVisible,
    setRemoveUserConfirmation,
  } = dialogsStore;

  return {
    setEditMembersGroup,
    setEditGroupMembersDialogVisible,
    setRemoveUserConfirmation,
  };
})(observer(User));
