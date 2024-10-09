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
import { useTheme } from "styled-components";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import { StyledUser } from "../../styles/members";
import { Avatar } from "@docspace/shared/components/avatar";
import { ComboBox } from "@docspace/shared/components/combobox";
import DefaultUserPhotoUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { toastr } from "@docspace/shared/components/toast";
import { isMobileOnly, isMobile } from "react-device-detect";
import { decode } from "he";
import { filterPaidRoleOptions } from "SRC_DIR/helpers";

import { getUserRole, getUserTypeLabel } from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";
import EmailPlusReactSvgUrl from "PUBLIC_DIR/images/e-mail+.react.svg?url";
import { StyledUserTypeHeader } from "../../styles/members";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Link } from "@docspace/shared/components/link";
import { ShareAccessRights } from "@docspace/shared/enums";

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
  searchValue,
  resendEmailInvitations,
  setEditMembersGroup,
  setEditGroupMembersDialogVisible,
}) => {
  if (!infoPanelSelection) return null;
  if (!user.displayName && !user.name && !user.email) return null;

  const theme = useTheme();

  const security = infoPanelSelection ? infoPanelSelection.security : {};
  const isExpect = user.isExpect;
  const canInviteUserInRoomAbility = security?.EditAccess;
  const showInviteIcon = canInviteUserInRoomAbility && isExpect;
  const canChangeUserRole = user.canEditAccess;
  const withoutTitles = !!searchValue;

  const [isLoading, setIsLoading] = useState(false);

  const fullRoomRoleOptions = membersHelper.getOptionsByRoomType(
    infoPanelSelection.roomType,
    canChangeUserRole,
  );

  const userRole = membersHelper.getOptionByUserAccess(user.access, user);
  const userRoleOptions =
    user.isGroup || (!user.isAdmin && !user.isOwner && !user.isRoomAdmin)
      ? filterPaidRoleOptions(fullRoomRoleOptions)
      : fullRoomRoleOptions;

  const onRepeatInvitation = async () => {
    resendEmailInvitations(infoPanelSelection.id, true)
      .then(() =>
        toastr.success(t("PeopleTranslations:SuccessSentMultipleInvitatios")),
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
              (m) => m.id !== user.id,
            ),
            expected: infoPanelMembers.expected?.filter(
              (m) => m.id !== user.id,
            ),
            groups: infoPanelMembers.groups?.filter((m) => m.id !== user.id),
            guests: infoPanelMembers.guests?.filter((m) => m.id !== user.id),
          };

          const roomId = infoPanelSelection.id;
          const minItemsCount = withoutTitles ? 0 : 1;
          const newUsers =
            newMembers.users.length > minItemsCount ? newMembers?.users : [];
          const newAdministrators =
            newMembers.administrators.length > minItemsCount
              ? newMembers?.administrators
              : [];
          const newExpected =
            newMembers.expected.length > minItemsCount
              ? newMembers?.expected
              : [];
          const newGroups =
            newMembers.groups.length > minItemsCount ? newMembers?.groups : [];

          const newGuests =
            newMembers.guests.length > minItemsCount ? newMembers?.guests : [];

          setInfoPanelMembers({
            roomId,
            users: newUsers,
            administrators: newAdministrators,
            expected: newExpected,
            groups: newGroups,
            guests: newGuests,
          });

          newMembersFilter.total -= 1;

          if (hasNextPage) {
            const oldStartIndex = newMembersFilter.startIndex;
            const oldPageCount = newMembersFilter.pageCount;

            newMembersFilter.startIndex =
              (newMembersFilter.page + 1) * newMembersFilter.pageCount - 1;
            newMembersFilter.pageCount = 1;

            const fetchedMembers = await fetchMembers(
              t,
              false,
              withoutTitles,
              newMembersFilter,
            );

            const newMembers = {
              administrators: [
                ...newAdministrators,
                ...fetchedMembers.administrators,
              ],
              users: [...newUsers, ...fetchedMembers.users],
              expected: [...newExpected, ...fetchedMembers.expected],
              groups: [...newGroups, ...fetchedMembers.groups],
              guests: [...newMembersFilter.guests],
            };

            setInfoPanelMembers({
              roomId: infoPanelSelection.id,
              ...newMembers,
            });

            newMembersFilter.startIndex = oldStartIndex;
            newMembersFilter.pageCount = oldPageCount;
          }

          setMembersFilter(newMembersFilter);
        } else {
          setInfoPanelMembers({
            roomId: infoPanelSelection.id,
            users: infoPanelMembers.users?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m,
            ),
            administrators: infoPanelMembers.administrators?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m,
            ),
            expected: infoPanelMembers.expected?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m,
            ),
            groups: infoPanelMembers.groups?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m,
            ),
            guests: infoPanelMembers.guests?.map((m) =>
              m.id === user.id ? { ...m, access: option.access } : m,
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

    setIsLoading(true);
    updateRole(option);
  };

  const getUserType = (item) => {
    if (item.isOwner) return "owner";
    if (item.isAdmin) return "admin";
    if (item.isRoomAdmin) return "manager";
    if (item.isCollaborator) return "collaborator";
    return "user";
  };

  const type = getUserType(user);
  const role = getUserRole(user, userRole?.type);
  const typeLabel = getUserTypeLabel(type, t);

  const onOpenGroup = (group) => {
    setEditMembersGroup(group);
    setEditGroupMembersDialogVisible(true);
  };

  const userAvatar = user.hasAvatar
    ? user.avatar
    : user.isGroup
      ? ""
      : DefaultUserPhotoUrl;

  const withTooltip = user.isOwner || user.isAdmin;

  const uniqueTooltipId = `userTooltip_${Math.random()}`;

  const tooltipContent = `${
    user.isOwner
      ? t("Common:PortalOwner", { productName: t("Common:ProductName") })
      : t("Common:PortalAdmin", { productName: t("Common:ProductName") })
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
        userName={isExpect ? "" : user.displayName || user.name}
        withTooltip={withTooltip}
        tooltipContent={tooltipContent}
        hideRoleIcon={!withTooltip}
        isGroup={user.isGroup}
      />
      <div className="user_body-wrapper">
        <div className="name-wrapper">
          {user.isGroup ? (
            <Link
              className="name"
              type="action"
              onClick={() => onOpenGroup(user)}
            >
              {decode(user.name)}
            </Link>
          ) : (
            <Text className="name" data-tooltip-id={uniqueTooltipId}>
              {user?.displayName && decode(user.displayName)}
            </Text>
          )}
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
        {!user.isGroup && (
          <div className="role-email" style={{ display: "flex" }}>
            <Text
              className="label"
              fontWeight={400}
              fontSize="12px"
              noSelect
              truncate
              color={theme.infoPanel.members.subtitleColor}
              dir="auto"
            >
              {`${typeLabel} | ${user.email}`}
            </Text>
          </div>
        )}
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
      )}
    </StyledUser>
  );
};

export default inject(
  ({ infoPanelStore, filesStore, peopleStore, dialogsStore }) => {
    const {
      infoPanelSelection,
      setIsScrollLocked,
      infoPanelMembers,
      setInfoPanelMembers,
      fetchMembers,
      searchValue,
    } = infoPanelStore;

    const {
      updateRoomMemberRole,
      resendEmailInvitations,
      membersFilter,
      setMembersFilter,
    } = filesStore;

    const { changeType: changeUserType } = peopleStore.usersStore;

    const { setEditMembersGroup, setEditGroupMembersDialogVisible } =
      dialogsStore;

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
      searchValue,
      setEditMembersGroup,
      setEditGroupMembersDialogVisible,
    };
  },
)(observer(User));
