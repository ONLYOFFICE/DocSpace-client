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

import { memo } from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { getUserRole, getUserTypeLabel } from "@docspace/shared/utils/common";
import { TUser } from "@docspace/shared/api/people/types";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

import * as Styled from "./index.styled";

interface GroupMemberRowProps {
  groupMember: TUser;
  removeMember: (member: TUser) => void;
}

const GroupMemberRow = ({ groupMember, removeMember }: GroupMemberRowProps) => {
  const { t } = useTranslation(["Common"]);

  const role = getUserRole(groupMember);
  let avatarRole = AvatarRole.user;
  switch (role) {
    case "owner":
      avatarRole = AvatarRole.owner;
      break;
    case "admin":
      avatarRole = AvatarRole.admin;
      break;
    case "manager":
      avatarRole = AvatarRole.manager;
      break;
    case "collaborator":
      avatarRole = AvatarRole.collaborator;
      break;
    default:
  }

  const onRemove = () => {
    removeMember(groupMember);
  };

  return (
    <Styled.GroupMemberRow>
      <Avatar
        className="avatar"
        size={AvatarSize.min}
        role={avatarRole}
        source={groupMember.avatarSmall ?? groupMember.avatar}
      />
      <div className="info">
        <div className="name">{groupMember.displayName}</div>
        <div className="email">{`${getUserTypeLabel(role, t)} | ${groupMember.email}`}</div>
      </div>
      <ReactSVG
        className="remove-icon"
        src={RemoveReactSvgUrl}
        onClick={onRemove}
      />
    </Styled.GroupMemberRow>
  );
};

export default memo(GroupMemberRow);
