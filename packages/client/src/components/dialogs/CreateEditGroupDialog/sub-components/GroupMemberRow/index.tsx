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

import { memo } from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import {
  getUserType,
  getUserTypeTranslation,
} from "@docspace/shared/utils/common";
import { TUser } from "@docspace/shared/api/people/types";
import { Box } from "@docspace/shared/components/box";
import { EmployeeStatus, EmployeeType } from "@docspace/shared/enums";

import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { StyledSendClockIcon } from "SRC_DIR/components/Icons";

import * as Styled from "./index.styled";

interface GroupMemberRowProps {
  groupMember: TUser;
  removeMember: (member: TUser) => void;
}

const GroupMemberRow = ({ groupMember, removeMember }: GroupMemberRowProps) => {
  const { t } = useTranslation(["Common"]);

  const type = getUserType(groupMember);
  let avatarRole = AvatarRole.user;
  switch (type) {
    case EmployeeType.Owner:
      avatarRole = AvatarRole.owner;
      break;
    case EmployeeType.Admin:
      avatarRole = AvatarRole.admin;
      break;
    case EmployeeType.RoomAdmin:
      avatarRole = AvatarRole.manager;
      break;
    case EmployeeType.User:
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
        <Box
          displayProp="flex"
          alignItems="center"
          gapProp="8px"
          widthProp="100%"
        >
          <div className="name">{groupMember.displayName}</div>
          {groupMember.status === EmployeeStatus.Pending ? (
            <StyledSendClockIcon />
          ) : null}
        </Box>
        <div className="email">{`${getUserTypeTranslation(type, t)} | ${groupMember.email}`}</div>
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
