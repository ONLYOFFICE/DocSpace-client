// (c) Copyright Ascensio System SIA 2009-2024
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
import { useTranslation } from "react-i18next";
import { isMobile, isMobileOnly } from "react-device-detect";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import { Avatar } from "@docspace/shared/components/avatar";
import { ComboBox } from "@docspace/shared/components/combobox";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { decode } from "he";
import { filterUserRoleOptions } from "SRC_DIR/helpers";
import { Text } from "@docspace/shared/components/text";
import { getUserRoleOptionsByUserAccess } from "@docspace/shared/utils/room-members/getUserRoleOptionsByUserAccess";
import { getUserRoleOptionsByRoomType } from "@docspace/shared/utils/room-members/getUserRoleOptionsByRoomType";
import { updateRoomMemberRole } from "@docspace/shared/api/rooms";
import { toastr } from "@docspace/shared/components/toast";
import { HelpButton } from "@docspace/shared/components/help-button";
import { getUserRoleOptions } from "@docspace/shared/utils/room-members/getUserRoleOptions";
import { ShareAccessRights } from "@docspace/shared/enums";
import { getUserRole, getUserTypeLabel } from "@docspace/shared/utils/common";
import { TGroupMemberInvitedInRoom } from "@docspace/shared/api/groups/types";

import * as Styled from "./index.styled";

interface GroupMemberProps {
  member: TGroupMemberInvitedInRoom;
  infoPanelSelection: any;
}

const GroupMember = ({ member, infoPanelSelection }: GroupMemberProps) => {
  const { user } = member;

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("Common");

  const userRole = member.owner
    ? getUserRoleOptions(t).portalAdmin
    : getUserRoleOptionsByUserAccess(
        t,
        member.userAccess || member.groupAccess,
      );

  const fullRoomRoleOptions = getUserRoleOptionsByRoomType(
    t,
    infoPanelSelection.roomType,
    false,
  );

  const userRoleOptions = filterUserRoleOptions(fullRoomRoleOptions, user);

  const hasIndividualRightsInRoom =
    member.owner ||
    (member.userAccess && member.userAccess !== member.groupAccess);

  let type;
  if (user.isOwner) type = "owner";
  else if (user.isAdmin) type = "admin";
  else if (user.isRoomAdmin) type = "manager";
  else if (user.isCollaborator) type = "collaborator";
  else type = "user";

  const role = getUserRole(user, userRole?.type);

  const typeLabel = getUserTypeLabel(
    role as "owner" | "admin" | "user" | "collaborator" | "manager",
    t,
  );

  let selectedUserRoleCBOption;
  if (user.isOwner)
    selectedUserRoleCBOption = {
      key: "owner",
      label: t("Common:Owner"),
      access: ShareAccessRights.FullAccess,
      type: "owner",
    };
  else
    selectedUserRoleCBOption = getUserRoleOptionsByUserAccess(
      t,
      member.userAccess || member.groupAccess,
    );

  const availableUserRoleCBOptions = filterUserRoleOptions(
    fullRoomRoleOptions,
    user,
  );

  const onChangeRole = async (userRoleOption) => {
    setIsLoading(true);
    updateRoomMemberRole(infoPanelSelection.id, {
      invitations: [{ id: user.id, access: userRoleOption.access }],
      notify: false,
      sharingMessage: "",
    })
      .then(() => (member.userAccess = userRoleOption.access))
      .catch((err) => toastr.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <Styled.GroupMember isExpect={user.isExpect} key={user.id}>
      <Avatar
        role={role}
        className="avatar"
        size="min"
        userName={user.isExpect ? "" : user.displayName || user.name}
        source={
          user.isExpect
            ? AtReactSvgUrl
            : user.hasAvatar
              ? user.avatar
              : DefaultUserPhotoUrl
        }
      />

      <div className="user_body-wrapper">
        <div className="info">
          <Text
            className="name"
            data-tooltip-id={`userTooltip_${Math.random()}`}
            noSelect
          >
            {decode(user.displayName)}
          </Text>
          <Text className="email" noSelect>
            <span dir="auto">{typeLabel}</span> |{" "}
            <span dir="ltr">{user.email}</span>
          </Text>
        </div>
      </div>

      <div className="individual-rights-tooltip">
        {hasIndividualRightsInRoom && (
          <HelpButton
            place="left"
            offsetRight={0}
            openOnClick={false}
            tooltipContent={
              <Text fontSize="12px" fontWeight={600}>
                {t("PeopleTranslations:IndividualRights")}
              </Text>
            }
          />
        )}
      </div>

      {userRole && userRoleOptions && (
        <div className="role-wrapper">
          {member.canEditAccess ? (
            <ComboBox
              className="role-combobox"
              selectedOption={userRole}
              options={availableUserRoleCBOptions}
              scaled={false}
              withBackdrop={isMobile}
              size="content"
              modernView
              title={t("Common:Role")}
              manualWidth="auto"
              isMobileView={isMobileOnly}
              directionY="both"
              displaySelectedOption
              onSelect={onChangeRole}
              isLoading={isLoading}
            />
          ) : (
            <Text
              className="disabled-role-combobox"
              title={t("Common:Role")}
              fontWeight={600}
              noSelect
            >
              {userRole.label}
            </Text>
          )}
        </div>
      )}
    </Styled.GroupMember>
  );
};

export default inject(({ infoPanelStore }: any) => ({
  infoPanelSelection: infoPanelStore.infoPanelSelection,
}))(observer(GroupMember));
