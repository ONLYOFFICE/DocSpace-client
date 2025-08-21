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
import { useTranslation } from "react-i18next";
import { isMobile, isMobileOnly } from "react-device-detect";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import { Avatar, AvatarSize } from "@docspace/shared/components/avatar";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@docspace/shared/components/combobox";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { decode } from "he";
import { Text } from "@docspace/shared/components/text";
import { updateRoomMemberRole } from "@docspace/shared/api/rooms";
import { toastr } from "@docspace/shared/components/toast";
import { HelpButton } from "@docspace/shared/components/help-button";
import { EmployeeStatus, ShareAccessRights } from "@docspace/shared/enums";
import {
  getUserAvatarRoleByType,
  getUserType,
  getUserTypeTranslation,
} from "@docspace/shared/utils/common";
import { TGroupMemberInvitedInRoom } from "@docspace/shared/api/groups/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { getUserRoleOptions } from "@docspace/shared/utils/room-members/getUserRoleOptions";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

import { StyledSendClockIcon } from "SRC_DIR/components/Icons";
import { filterPaidRoleOptions } from "SRC_DIR/helpers";

import * as Styled from "./index.styled";

interface GroupMemberProps {
  member: TGroupMemberInvitedInRoom;
  infoPanelSelection?: TRoom; // Todo: Change to InfoPanelStore["infoPanelSelection"] when store has types
  standalone?: SettingsStore["standalone"];
}

const GroupMember = ({
  member,
  infoPanelSelection,
  standalone,
}: GroupMemberProps) => {
  const { user } = member;
  const isExpect = user.status === EmployeeStatus.Pending;

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("Common");

  const fullRoomRoleOptions = getAccessOptions(
    t,
    infoPanelSelection?.roomType,
    false,
    false,
    member.owner,
    user.isAdmin,
    standalone,
  );

  const userRoleOptions =
    user.isAdmin || user.isOwner || user.isRoomAdmin
      ? fullRoomRoleOptions
      : filterPaidRoleOptions(
          fullRoomRoleOptions as {
            access: ShareAccessRights;
            key: string;
            label: string;
          }[],
        );

  const userRole = member.owner
    ? getUserRoleOptions(t).portalAdmin
    : fullRoomRoleOptions.find(
        (option) =>
          "access" in option &&
          option.access === (member.userAccess || member.groupAccess),
      );

  const hasIndividualRightsInRoom =
    member.owner ||
    (member.userAccess && member.userAccess !== member.groupAccess);

  const type = getUserType(user);

  const avatarRole = getUserAvatarRoleByType(type);

  const typeLabel = getUserTypeTranslation(type, t);

  const onChangeRole = async (userRoleOption: TOption) => {
    setIsLoading(true);
    updateRoomMemberRole(infoPanelSelection?.id, {
      invitations: [{ id: user.id, access: userRoleOption.access }],
      notify: false,
      sharingMessage: "",
    })
      .then(() => {
        if (userRoleOption.access) {
          member.userAccess = userRoleOption.access;
        }
      })
      .catch((err) => toastr.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <Styled.GroupMember isExpect={isExpect} key={user.id}>
      <Avatar
        role={avatarRole}
        className="avatar"
        size={AvatarSize.min}
        userName={isExpect ? "" : user.displayName}
        source={
          isExpect
            ? AtReactSvgUrl
            : user.hasAvatar
              ? user.avatar
              : DefaultUserPhotoUrl
        }
      />

      <div className="user_body-wrapper">
        <div className="info">
          <div className="info-box">
            <Text
              className="name"
              data-tooltip-id={`userTooltip_${Math.random()}`}
              noSelect
            >
              {decode(user.displayName)}
            </Text>
            {isExpect ? <StyledSendClockIcon /> : null}
          </div>
          <Text className="email" noSelect>
            <span dir="auto">{typeLabel}</span> |{" "}
            <span dir="ltr">{user.email}</span>
          </Text>
        </div>
      </div>

      <div className="individual-rights-tooltip">
        {hasIndividualRightsInRoom ? (
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
        ) : null}
      </div>

      {userRole && userRoleOptions ? (
        <div className="role-wrapper">
          {member.canEditAccess ? (
            <ComboBox
              className="role-combobox"
              selectedOption={userRole as TOption}
              options={userRoleOptions as TOption[]}
              scaled={false}
              withBackdrop={isMobile}
              size={ComboBoxSize.content}
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
              {"label" in userRole ? userRole.label : false}
            </Text>
          )}
        </div>
      ) : null}
    </Styled.GroupMember>
  );
};

export default inject(({ infoPanelStore, settingsStore }: TStore) => {
  const { infoPanelSelection } = infoPanelStore;
  const { standalone } = settingsStore;

  return {
    infoPanelSelection,
    standalone,
  };
})(observer(GroupMember));
