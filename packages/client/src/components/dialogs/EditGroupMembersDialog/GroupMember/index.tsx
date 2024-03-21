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

import { inject, observer } from "mobx-react";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
// import { StyledUser } from "../../styles/members";
import { Avatar } from "@docspace/shared/components/avatar";
import { ComboBox } from "@docspace/shared/components/combobox";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { isMobileOnly, isMobile } from "react-device-detect";
import { decode } from "he";
import { filterUserRoleOptions } from "SRC_DIR/helpers";
import { Text } from "@docspace/shared/components/text";
import * as Styled from "./index.styled";
import { getUserRoleOptionsByUserAccess } from "@docspace/shared/utils/room-members/getUserRoleOptionsByUserAccess";
import { getUserRoleOptionsByRoomType } from "@docspace/shared/utils/room-members/getUserRoleOptionsByRoomType";
import { updateRoomMemberRole } from "@docspace/shared/api/rooms";
import { toastr } from "@docspace/shared/components/toast";
import { useState } from "react";
import { HelpButton } from "@docspace/shared/components/help-button";

interface GroupMemberProps {
  t: any;
  user: any;
  infoPanelSelection: any;
}

const GroupMember = ({ t, user, infoPanelSelection }: GroupMemberProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const fullRoomRoleOptions = getUserRoleOptionsByRoomType(
    t,
    infoPanelSelection.roomType,
    false,
  );
  const selectedUserRoleCBOption = getUserRoleOptionsByUserAccess(
    t,
    user.userAccess || user.groupAccess,
  );
  const availableUserRoleCBOptions = filterUserRoleOptions(
    fullRoomRoleOptions,
    user,
  );

  console.log(
    "GroupMember",
    user,
    selectedUserRoleCBOption,
    availableUserRoleCBOptions,
    fullRoomRoleOptions,
  );

  const onChangeRole = async (userRoleOption) => {
    setIsLoading(true);
    updateRoomMemberRole(infoPanelSelection.id, {
      invitations: [{ id: user.id, access: userRoleOption.access }],
      notify: false,
      sharingMessage: "",
    })
      .then(() => (user.userAccess = userRoleOption.access))
      .catch((err) => toastr.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <Styled.GroupMember isExpect={user.isExpect} key={user.id}>
      <Avatar
        role={selectedUserRoleCBOption?.type}
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
        <div className="name-wrapper">
          <Text
            className="name"
            data-tooltip-id={`userTooltip_${Math.random()}`}
          >
            {decode(user.displayName)}
          </Text>
        </div>
      </div>

      <div className="individual-rights-tooltip">
        {user.userAccess && user.userAccess !== user.groupAccess && (
          <HelpButton
            place="left"
            offsetRight={0}
            tooltipContent={
              <Text fontSize="12px" fontWeight={600}>
                {t("PeopleTranslations:IndividualRights")}
              </Text>
            }
          />
        )}
      </div>

      {selectedUserRoleCBOption && availableUserRoleCBOptions && (
        <div className="role-wrapper">
          {user.canEditAccess ? (
            <ComboBox
              className="role-combobox"
              selectedOption={selectedUserRoleCBOption}
              options={availableUserRoleCBOptions}
              scaled={false}
              withBackdrop={isMobile}
              size="content"
              modernView
              title={t("Common:Role")}
              manualWidth={"fit-content"}
              isMobileView={isMobileOnly}
              directionY="both"
              displaySelectedOption
              onSelect={onChangeRole}
              isLoading={isLoading}
            />
          ) : (
            <div className="disabled-role-combobox" title={t("Common:Role")}>
              {selectedUserRoleCBOption.label}
            </div>
          )}
        </div>
      )}
    </Styled.GroupMember>
  );
};

export default inject(({ infoPanelStore }) => ({
  infoPanelSelection: infoPanelStore.infoPanelSelection,
}))(observer(GroupMember));
