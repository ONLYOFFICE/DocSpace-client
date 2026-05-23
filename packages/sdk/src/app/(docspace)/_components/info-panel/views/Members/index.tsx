// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { ShareAccessRights } from "@docspace/ui-kit/enums";
import api from "@docspace/shared/api";
import { MembersSubjectType } from "@docspace/shared/enums";
import type { RoomMember } from "@docspace/shared/api/rooms/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TGroup } from "@docspace/shared/api/groups/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import DefaultUserAvatarSmall from "PUBLIC_DIR/images/default_user_photo_size_32-32.png?url";

import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";

import commonStyles from "../../helpers/Common.module.scss";
import styles from "./Members.module.scss";

const ADMIN_ROLES = new Set([
  ShareAccessRights.FullAccess,
  ShareAccessRights.RoomManager,
]);

const USER_SUBJECT_TYPES = new Set([
  MembersSubjectType.User,
  MembersSubjectType.Group,
]);

const getAvatarRole = (member: RoomMember): AvatarRole => {
  if (member.isOwner) return AvatarRole.owner;
  if (member.access === ShareAccessRights.FullAccess) return AvatarRole.admin;
  if (member.access === ShareAccessRights.RoomManager) return AvatarRole.manager;
  const user = member.sharedTo as TUser;
  if (user.isVisitor) return AvatarRole.guest;
  if (member.access === ShareAccessRights.Collaborator)
    return AvatarRole.collaborator;
  return AvatarRole.user;
};

const getRoleLabel = (member: RoomMember, t: ReturnType<typeof useTranslation>["t"]): string => {
  if (member.isOwner) return t("Common:Owner");
  switch (member.access) {
    case ShareAccessRights.FullAccess:
      return t("Common:RoomAdmin");
    case ShareAccessRights.RoomManager:
      return t("Common:RoomManager");
    case ShareAccessRights.Editing:
      return t("Common:Editor");
    case ShareAccessRights.Collaborator:
      return t("Common:Collaborator");
    case ShareAccessRights.Review:
      return t("Common:RoleReviewer");
    case ShareAccessRights.Comment:
      return t("Common:RoleCommentator");
    case ShareAccessRights.FormFilling:
      return t("Common:RoleFormFiller");
    case ShareAccessRights.CustomFilter:
      return t("Common:CustomFilter");
    case ShareAccessRights.ReadOnly:
      return t("Common:RoleViewer");
    default:
      return "";
  }
};

type MemberRowProps = {
  member: RoomMember;
  t: ReturnType<typeof useTranslation>["t"];
};

const MemberRow = ({ member, t }: MemberRowProps) => {
  const isGroup = member.subjectType === MembersSubjectType.Group;
  const displayName = isGroup
    ? (member.sharedTo as TGroup).name
    : (member.sharedTo as TUser).displayName;
  const avatarSrc = isGroup
    ? ""
    : ((member.sharedTo as TUser).avatar || DefaultUserAvatarSmall);
  const roleLabel = getRoleLabel(member, t);
  const avatarRole = isGroup ? AvatarRole.user : getAvatarRole(member);

  return (
    <div className={styles.memberRow}>
      <Avatar
        size={AvatarSize.min}
        role={avatarRole}
        source={avatarSrc}
        userName={displayName}
        isGroup={isGroup}
      />
      <div className={styles.memberInfo}>
        <Text className={styles.memberName} truncate>
          {displayName}
        </Text>
        {roleLabel ? (
          <Text className={styles.memberRole} truncate>
            {roleLabel}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

type MemberGroupProps = {
  title: string;
  members: RoomMember[];
  t: ReturnType<typeof useTranslation>["t"];
};

const MemberGroup = ({ title, members, t }: MemberGroupProps) => {
  if (!members.length) return null;
  return (
    <div className={styles.memberGroup}>
      <Text className={commonStyles.subtitle + " " + styles.groupTitle}>
        {title}
      </Text>
      {members.map((member) => (
        <MemberRow
          key={`${member.subjectType}-${member.sharedTo.id}`}
          member={member}
          t={t}
        />
      ))}
    </div>
  );
};

type MembersProps = {
  selection: TFile | TFolder;
};

const Members = ({ selection }: MembersProps) => {
  const { t } = useTranslation(["InfoPanel", "Common"]);
  const [members, setMembers] = React.useState<RoomMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    api.rooms
      .getRoomMembers(selection.id, {}, controller.signal)
      .then((res) => {
        setMembers(
          res.items.filter((m) => USER_SUBJECT_TYPES.has(m.subjectType)),
        );
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [selection.id]);

  const admins = members.filter(
    (m) => m.isOwner || ADMIN_ROLES.has(m.access),
  );
  const guests = members.filter(
    (m) =>
      !m.isOwner &&
      !ADMIN_ROLES.has(m.access) &&
      m.subjectType === MembersSubjectType.User &&
      (m.sharedTo as TUser).isVisitor,
  );
  const pending = members.filter(
    (m) => !m.isOwner && m.access === ShareAccessRights.None,
  );
  const usersSet = new Set([...admins, ...guests, ...pending]);
  const users = members.filter((m) => !usersSet.has(m));

  if (isLoading) return <InfoPanelViewLoader view="members" />;

  return (
    <div
      className={styles.membersList}
      data-testid="info_panel_members"
    >
      <MemberGroup
        title={t("InfoPanel:Administration")}
        members={admins}
        t={t}
      />
      <MemberGroup
        title={t("InfoPanel:Users")}
        members={users}
        t={t}
      />
      <MemberGroup
        title={t("Common:Guests")}
        members={guests}
        t={t}
      />
      <MemberGroup
        title={t("InfoPanel:ExpectUsers")}
        members={pending}
        t={t}
      />
    </div>
  );
};

export default Members;
