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

import { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { isMobileOnly, isMobile } from "react-device-detect";
import { decode } from "he";
import classNames from "classnames";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { toastr } from "@docspace/shared/components/toast";
import {
  getUserType,
  getUserTypeTranslation,
} from "@docspace/shared/utils/common";
import { TUser } from "@docspace/shared/api/people/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link, LinkType } from "@docspace/shared/components/link";
import api from "@docspace/shared/api";
import { FolderType, RoomSecurityError } from "@docspace/shared/enums";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import EmailPlusReactSvgUrl from "PUBLIC_DIR/images/e-mail+.react.svg?url";

import { filterPaidRoleOptions } from "SRC_DIR/helpers";

import MembersHelper from "../Members.utils";
import { UserProps } from "../Members.types";
import styles from "../Members.module.scss";

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
  const theme = useTheme();
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

  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(false);

        if (item?.error === RoomSecurityError.FormRoleBlockingDeletion) {
          return setRemoveUserConfirmation!(true, async () => {
            await updateRole(option, true);
          });
        }

        await changeUserRole(option, user.id, currentUser?.id, hasNextPage);
      })
      .catch((err) => {
        toastr.error(err);
        setIsLoading(false);
      });
  };

  const onOptionClick = (option: TOption) => {
    if (option.access === userRole?.access) return;

    setIsLoading(true);
    updateRole(option, false);
  };

  const type = getUserType(user as unknown as TUser);
  const typeLabel = getUserTypeTranslation(type, t);

  const onOpenGroup = (group: TGroup) => {
    setEditMembersGroup!(group);
    setEditGroupMembersDialogVisible!(true);
  };

  const userAvatar =
    "hasAvatar" in user && user.hasAvatar
      ? user.avatar
      : "isGroup" in user && user.isGroup
        ? ""
        : DefaultUserPhotoUrl;

  const withTooltip = "isOwner" in user && (user.isOwner || user.isAdmin);

  const uniqueTooltipId = `userTooltip_${Math.random()}`;

  const tooltipContent = `${
    "isOwner" in user && user.isOwner
      ? t("Common:PortalOwner", { productName: t("Common:ProductName") })
      : t("Common:PortalAdmin", { productName: t("Common:ProductName") })
  }. ${t("Common:HasFullAccess")}`;

  return "isTitle" in user && user.isTitle ? (
    <div
      className={classNames(styles.userTypeHeader, {
        [styles.isExpect]: isExpect,
      })}
    >
      <Text className="title">
        {"displayName" in user ? user.displayName : ""}
      </Text>

      {showInviteIcon ? (
        <IconButton
          className="icon"
          title={t("Common:RepeatInvitation")}
          iconName={EmailPlusReactSvgUrl}
          isFill
          onClick={onRepeatInvitation}
          size={16}
        />
      ) : null}
    </div>
  ) : (
    <div
      className={classNames(styles.user, { [styles.isExpect]: isExpect })}
      key={user.id}
    >
      <Avatar
        role={type as unknown as AvatarRole}
        className="avatar"
        size={AvatarSize.min}
        source={isExpect ? AtReactSvgUrl : userAvatar || ""}
        userName={
          isExpect ? "" : "displayName" in user ? user.displayName : user.name
        }
        withTooltip={withTooltip}
        tooltipContent={tooltipContent}
        hideRoleIcon={!withTooltip}
        isGroup={"isGroup" in user ? user.isGroup : false}
      />
      <div className="user_body-wrapper">
        <div className="name-wrapper">
          {"isGroup" in user && user.isGroup ? (
            <Link
              className="name"
              type={LinkType.action}
              onClick={() => onOpenGroup(user)}
              title={decode(user.name)}
            >
              {decode(user.name)}
            </Link>
          ) : (
            <Text className="name" data-tooltip-id={uniqueTooltipId}>
              {"displayName" in user && user.displayName
                ? decode(user.displayName)
                : null}
            </Text>
          )}

          {currentUser?.id === user.id ? (
            <div className="me-label">&nbsp;{`(${t("Common:MeLabel")})`}</div>
          ) : null}
        </div>
        {!("isGroup" in user) ? (
          <div className="role-email" style={{ display: "flex" }}>
            <Text
              className="label"
              fontWeight={400}
              fontSize="12px"
              truncate
              color={theme.infoPanel.members.subtitleColor}
              dir="auto"
            >
              {`${typeLabel} | ${(user as TUser).email}`}
            </Text>
          </div>
        ) : null}
      </div>

      {userRole && userRoleOptions && !hideUserRole ? (
        <div className="role-wrapper">
          {canChangeUserRole ? (
            <ComboBox
              className="role-combobox"
              selectedOption={userRole}
              options={userRoleOptions}
              onSelect={onOptionClick}
              scaled={false}
              withBackdrop={isMobile}
              size="content"
              modernView
              title={t("Common:Role")}
              manualWidth="auto"
              isLoading={isLoading}
              isMobileView={isMobileOnly}
              directionY="both"
              displaySelectedOption
            />
          ) : (
            <div className="disabled-role-combobox" title={t("Common:Role")}>
              {userRole.label}
            </div>
          )}
        </div>
      ) : null}
    </div>
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
