import React, { useState } from "react";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import { StyledUser } from "../../styles/members";
import { Avatar } from "@docspace/shared/components/avatar";
import { ComboBox } from "@docspace/shared/components/combobox";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { toastr } from "@docspace/shared/components/toast";
import { isMobileOnly, isMobile } from "react-device-detect";
import { decode } from "he";
import { filterUserRoleOptions } from "SRC_DIR/helpers/utils";
import { getUserRole } from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";
import EmailPlusReactSvgUrl from "PUBLIC_DIR/images/e-mail+.react.svg?url";
import { StyledUserTypeHeader } from "../../styles/members";
import { IconButton } from "@docspace/shared/components/icon-button";

const User = ({
  t,
  user,
  setMembers,
  isExpect,
  membersHelper,
  currentMember,
  updateRoomMemberRole,
  infoPanelSelection,
  setInfoPanelSelection,
  changeUserType,
  setIsScrollLocked,
  isTitle,
  onRepeatInvitation,
  showInviteIcon,
  membersFilter,
  setMembersFilter,
  fetchMembers,
  hasNextPage,
}) => {
  if (!infoPanelSelection) return null;
  if (!user.displayName && !user.email) return null;

  //const [userIsRemoved, setUserIsRemoved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //if (userIsRemoved) return null;

  const canChangeUserRole = user.canEditAccess;

  const fullRoomRoleOptions = membersHelper.getOptionsByRoomType(
    infoPanelSelection.roomType,
    canChangeUserRole
  );

  const userRole = membersHelper.getOptionByUserAccess(user.access, user);

  const userRoleOptions = filterUserRoleOptions(fullRoomRoleOptions, user);

  const updateRole = (option) => {
    return updateRoomMemberRole(infoPanelSelection.id, {
      invitations: [{ id: user.id, access: option.access }],
      notify: false,
      sharingMessage: "",
    })
      .then(async () => {
        setIsLoading(false);
        const users = infoPanelSelection.members.users;
        const administrators = infoPanelSelection.members.administrators;
        const expectedMembers = infoPanelSelection.members.expected;
        if (option.key === "remove") {
          const newMembersFilter = JSON.parse(JSON.stringify(membersFilter));

          const newMembers = {
            users: users?.filter((m) => m.id !== user.id),
            administrators: administrators?.filter((m) => m.id !== user.id),
            expected: expectedMembers?.filter((m) => m.id !== user.id),
          };

          const roomId = infoPanelSelection.id;
          const newUsers = newMembers.users.length > 1 ? newMembers?.users : [];
          const newAdministrators =
            newMembers.administrators.length > 1
              ? newMembers?.administrators
              : [];
          const newExpected =
            newMembers.expected.length > 1 ? newMembers?.expected : [];

          setMembers({
            roomId,
            users: newUsers,
            administrators: newAdministrators,
            expected: newExpected,
          });

          newMembersFilter.total -= 1;

          setInfoPanelSelection({
            ...infoPanelSelection,
            members: {
              users: newUsers,
              administrators: newAdministrators,
              expected: newExpected,
            },
          });

          if (hasNextPage) {
            newMembersFilter.startIndex =
              (newMembersFilter.page + 1) * newMembersFilter.pageCount - 1;
            newMembersFilter.pageCount = 1;

            const fetchedMembers = await fetchMembers(
              infoPanelSelection.id,
              false,
              newMembersFilter
            );

            const newMembers = {
              administrators: [
                ...newAdministrators,
                ...fetchedMembers.administrators,
              ],
              users: [...newUsers, ...fetchedMembers.users],
              expected: [...newExpected, ...fetchedMembers.expected],
            };

            setMembers({
              roomId: infoPanelSelection.id,
              ...newMembers,
            });

            setInfoPanelSelection({
              ...infoPanelSelection,
              members: newMembers,
            });
          }

          setMembersFilter(newMembersFilter);

          //setUserIsRemoved(true);
        } else {
          setMembers({
            roomId: infoPanelSelection.id,
            users: users?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m
            ),
            administrators: administrators?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m
            ),
            expected: expectedMembers?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m
            ),
          });

          setInfoPanelSelection({
            ...infoPanelSelection,
            members: {
              users: users?.map((m) =>
                m.id === user.id ? { ...m, access: option.access } : m
              ),
              administrators: administrators?.map((m) =>
                m.id === user.id ? { ...m, access: option.access } : m
              ),
              expected: expectedMembers?.map((m) =>
                m.id === user.id ? { ...m, access: option.access } : m
              ),
            },
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
    setIsScrollLocked(isOpen);
  };

  const userAvatar = user.hasAvatar ? user.avatar : DefaultUserPhotoUrl;

  const role = getUserRole(user);

  const withTooltip = user.isOwner || user.isAdmin;

  const tooltipContent = `${
    user.isOwner ? t("Common:DocSpaceOwner") : t("Common:DocSpaceAdmin")
  }. ${t("Common:HasFullAccess")}`;

  return isTitle ? (
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

      <div className="name">
        {isExpect ? user.email : decode(user.displayName) || user.email}
      </div>
      {currentMember?.id === user.id && (
        <div className="me-label">&nbsp;{`(${t("Common:MeLabel")})`}</div>
      )}

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

export default User;
