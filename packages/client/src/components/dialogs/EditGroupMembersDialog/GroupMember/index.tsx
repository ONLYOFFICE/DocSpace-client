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
                {t("Individual rights in room")}
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
