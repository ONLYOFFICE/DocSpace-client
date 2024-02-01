import { useState } from "react";
import { inject, observer } from "mobx-react";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import { StyledUser } from "../../styles/members";
import { Avatar } from "@docspace/shared/components/avatar";
import { ComboBox } from "@docspace/shared/components/combobox";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { toastr } from "@docspace/shared/components/toast";
import { isMobileOnly, isMobile } from "react-device-detect";
import { decode } from "he";
import { filterUserRoleOptions } from "SRC_DIR/helpers/utils";
import {
  firstLetterToUppercase,
  getUserRole,
} from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";
import EmailPlusReactSvgUrl from "PUBLIC_DIR/images/e-mail+.react.svg?url";
import { StyledUserTypeHeader } from "../../styles/members";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Tooltip } from "@docspace/shared/components/tooltip";

const User = ({
  t,
  user,
  membersHelper,
  currentMember,
  updateRoomMemberRole,
  infoPanelSelection,
  changeUserType,
  setIsScrollLocked,
  membersFilter,
  setMembersFilter,
  fetchMembers,
  hasNextPage,
  showTooltip,
  infoPanelMembers,
  setInfoPanelMembers,
}) => {
  if (!infoPanelSelection) return null;
  if (!user.displayName && !user.email) return null;

  const security = infoPanelSelection ? infoPanelSelection.security : {};
  const isExpect = user.isExpect;
  const canInviteUserInRoomAbility = security?.EditAccess;
  const showInviteIcon = canInviteUserInRoomAbility && isExpect;
  const canChangeUserRole = user.canEditAccess;

  const [isLoading, setIsLoading] = useState(false);

  const fullRoomRoleOptions = membersHelper.getOptionsByRoomType(
    infoPanelSelection.roomType,
    canChangeUserRole
  );

  const userRole = membersHelper.getOptionByUserAccess(user.access, user);
  const userRoleOptions = filterUserRoleOptions(fullRoomRoleOptions, user);

  const onRepeatInvitation = async () => {
    resendEmailInvitations(infoPanelSelection.id, true)
      .then(() =>
        toastr.success(t("PeopleTranslations:SuccessSentMultipleInvitatios"))
      )
      .catch((err) => toastr.error(err));
  };

  const updateRole = (option) => {
    return updateRoomMemberRole(infoPanelSelection.id, {
      invitations: [{ id: user.id, access: option.access }],
      notify: false,
      sharingMessage: "",
    })
      .then(async () => {
        setIsLoading(false);

        if (option.key === "remove") {
          const newMembersFilter = JSON.parse(JSON.stringify(membersFilter));

          const newMembers = {
            users: infoPanelMembers.users?.filter((m) => m.id !== user.id),
            administrators: infoPanelMembers.administrators?.filter(
              (m) => m.id !== user.id
            ),
            expected: infoPanelMembers.expected?.filter(
              (m) => m.id !== user.id
            ),
          };

          const roomId = infoPanelSelection.id;
          const newUsers = newMembers.users.length > 1 ? newMembers?.users : [];
          const newAdministrators =
            newMembers.administrators.length > 1
              ? newMembers?.administrators
              : [];
          const newExpected =
            newMembers.expected.length > 1 ? newMembers?.expected : [];

          setInfoPanelMembers({
            roomId,
            users: newUsers,
            administrators: newAdministrators,
            expected: newExpected,
          });

          newMembersFilter.total -= 1;

          if (hasNextPage) {
            newMembersFilter.startIndex =
              (newMembersFilter.page + 1) * newMembersFilter.pageCount - 1;
            newMembersFilter.pageCount = 1;

            const fetchedMembers = await fetchMembers(t, false);

            const newMembers = {
              administrators: [
                ...newAdministrators,
                ...fetchedMembers.administrators,
              ],
              users: [...newUsers, ...fetchedMembers.users],
              expected: [...newExpected, ...fetchedMembers.expected],
            };

            setInfoPanelMembers({
              roomId: infoPanelSelection.id,
              ...newMembers,
            });
          }

          setMembersFilter(newMembersFilter);
        } else {
          setInfoPanelMembers({
            roomId: infoPanelSelection.id,
            users: infoPanelMembers.users?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m
            ),
            administrators: infoPanelMembers.administrators?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m
            ),
            expected: infoPanelMembers.expected?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m
            ),
          });
        }
      })
      .catch((err) => {
        toastr.error(err);
        setIsLoading(false);
      });
  };

  const abortCallback = () => {
    setIsLoading(false);
  };

  const onOptionClick = (option) => {
    if (option.access === userRole.access) return;

    const userType =
      option.key === "owner"
        ? "admin"
        : option.key === "roomAdmin"
          ? "manager"
          : option.key === "collaborator"
            ? "collaborator"
            : "user";

    const successCallback = () => {
      updateRole(option);
    };

    setIsLoading(true);

    const needChangeUserType =
      ((user.isVisitor || user.isCollaborator) && userType === "manager") ||
      (user.isVisitor && userType === "collaborator");

    if (needChangeUserType) {
      changeUserType(userType, [user], successCallback, abortCallback);
    } else {
      updateRole(option);
    }
  };

  const onToggle = (e, isOpen) => {
    // setIsScrollLocked(isOpen);
  };

  const getTooltipContent = () => (
    <div>
      <Text fontSize="14px" fontWeight={600} noSelect truncate>
        {decode(user.displayName)}
      </Text>
      <Text
        className="label"
        fontWeight={400}
        fontSize="12px"
        noSelect
        truncate
        color="#A3A9AE !important"
        dir="auto"
      >
        {`${firstLetterToUppercase(role)} | ${user.email}`}
      </Text>
    </div>
  );

  const userAvatar = user.hasAvatar ? user.avatar : DefaultUserPhotoUrl;

  const role = getUserRole(user);

  const withTooltip = user.isOwner || user.isAdmin;

  const uniqueTooltipId = `userTooltip_${Math.random()}`;

  const tooltipContent = `${
    user.isOwner ? t("Common:DocSpaceOwner") : t("Common:DocSpaceAdmin")
  }. ${t("Common:HasFullAccess")}`;

  return user.isTitle ? (
    <StyledUserTypeHeader isExpect={isExpect}>
      <Text className="title">{user.displayName}</Text>

      {showInviteIcon && (
        <IconButton
          className={"icon"}
          title={t("Common:RepeatInvitation")}
          iconName={EmailPlusReactSvgUrl}
          isFill={true}
          onClick={onRepeatInvitation}
          size={16}
        />
      )}
    </StyledUserTypeHeader>
  ) : (
    <StyledUser isExpect={isExpect} key={user.id}>
      <Avatar
        role={role}
        className="avatar"
        size="min"
        source={isExpect ? AtReactSvgUrl : userAvatar || ""}
        userName={isExpect ? "" : user.displayName}
        withTooltip={withTooltip}
        tooltipContent={tooltipContent}
        hideRoleIcon={!withTooltip}
      />
      <div className="user_body-wrapper">
        <div className="name-wrapper">
          <Text className="name" data-tooltip-id={uniqueTooltipId}>
            {decode(user.displayName)}
          </Text>
          {/* TODO: uncomment when information about online statuses appears */}
          {/* {showTooltip && (
            <Tooltip
              float
              id={uniqueTooltipId}
              getContent={getTooltipContent}
              place="bottom"
            />
          )} */}
          {currentMember?.id === user.id && (
            <div className="me-label">&nbsp;{`(${t("Common:MeLabel")})`}</div>
          )}
        </div>
        <div className="role-email" style={{ display: "flex" }}>
          <Text
            className="label"
            fontWeight={400}
            fontSize="12px"
            noSelect
            truncate
            color="#A3A9AE"
            dir="auto"
          >
            {`${firstLetterToUppercase(role)} | ${user.email}`}
          </Text>
        </div>
      </div>

      {userRole && userRoleOptions && (
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
              manualWidth={"fit-content"}
              isLoading={isLoading}
              isMobileView={isMobileOnly}
              directionY="both"
              onToggle={onToggle}
              displaySelectedOption
            />
          ) : (
            <div className="disabled-role-combobox" title={t("Common:Role")}>
              {userRole.label}
            </div>
          )}
        </div>
      )}
    </StyledUser>
  );
};

export default inject(({ auth, filesStore, peopleStore }) => {
  const {
    infoPanelSelection,
    setIsScrollLocked,
    infoPanelMembers,
    setInfoPanelMembers,
    fetchMembers,
  } = auth.infoPanelStore;
  const {
    updateRoomMemberRole,
    resendEmailInvitations,
    membersFilter,
    setMembersFilter,
  } = filesStore;

  const { changeType: changeUserType } = peopleStore;

  return {
    infoPanelSelection,
    setIsScrollLocked,
    updateRoomMemberRole,
    resendEmailInvitations,
    changeUserType,
    membersFilter,
    setMembersFilter,
    infoPanelMembers,
    setInfoPanelMembers,
    fetchMembers,
  };
})(observer(User));
