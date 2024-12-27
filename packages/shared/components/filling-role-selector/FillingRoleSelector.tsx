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

import React from "react";
import { ReactSVG } from "react-svg";

import AvatarBaseReactSvgUrl from "PUBLIC_DIR/images/avatar.base.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";

import {
  StyledFillingRoleSelector,
  StyledRow,
  StyledNumber,
  StyledAddRoleButton,
  StyledEveryoneRoleIcon,
  StyledRole,
  StyledEveryoneRoleContainer,
  StyledTooltip,
  StyledAssignedRole,
  StyledAvatar,
  StyledUserRow,
} from "./FillingRoleSelector.styled";
import {
  FillingRoleSelectorProps,
  TRole,
  TUser,
} from "./FillingRoleSelector.types";

const FillingRoleSelector = ({
  roles,
  users,
  onAddUser,
  onRemoveUser,
  descriptionEveryone,
  descriptionTooltip,
  ...props
}: FillingRoleSelectorProps) => {
  // If the roles in the roles array come out of order
  const cloneRoles = JSON.parse(JSON.stringify(roles));
  const sortedInOrderRoles = cloneRoles.sort((a: TRole, b: TRole) =>
    a.order > b.order ? 1 : -1,
  );

  const everyoneRole = roles.find((item: TRole) => item.everyone);

  const everyoneRoleNode = (
    <>
      <StyledRow>
        <StyledNumber>{everyoneRole?.order}</StyledNumber>
        <StyledEveryoneRoleIcon />
        <StyledEveryoneRoleContainer>
          <div className="title">
            <StyledRole>{everyoneRole?.name}</StyledRole>
            <StyledAssignedRole>{everyoneRole?.everyone}</StyledAssignedRole>
          </div>
          <div className="role-description">{descriptionEveryone}</div>
        </StyledEveryoneRoleContainer>
      </StyledRow>
      <StyledTooltip>{descriptionTooltip}</StyledTooltip>
    </>
  );

  return (
    <StyledFillingRoleSelector {...props} data-testid="filling-role-selector">
      {everyoneRole ? everyoneRoleNode : null}
      {sortedInOrderRoles.map((role: TRole) => {
        if (role.everyone) return;
        const roleWithUser = users?.find(
          (user: TUser) => user.role === role.name,
        );

        return roleWithUser ? (
          <StyledUserRow key={`${role.name}`}>
            <div className="content">
              <StyledNumber>{role.order}</StyledNumber>
              <StyledAvatar
                src={
                  roleWithUser.hasAvatar
                    ? roleWithUser.avatar
                    : AvatarBaseReactSvgUrl
                }
              />
              <div className="user-with-role">
                <StyledRole>{roleWithUser.displayName}</StyledRole>
                <StyledAssignedRole>{roleWithUser.role}</StyledAssignedRole>
              </div>
            </div>
            <ReactSVG
              src={RemoveSvgUrl}
              onClick={() => onRemoveUser(roleWithUser.id)}
            />
          </StyledUserRow>
        ) : (
          <StyledRow key={`${role.name}`}>
            <StyledNumber>{role.order}</StyledNumber>
            <StyledAddRoleButton onClick={onAddUser} color={role.color} />
            <StyledRole>{role.name}</StyledRole>
          </StyledRow>
        );
      })}
    </StyledFillingRoleSelector>
  );
};

export { FillingRoleSelector };
