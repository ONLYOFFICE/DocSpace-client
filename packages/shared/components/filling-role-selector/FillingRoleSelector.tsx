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
    <StyledFillingRoleSelector {...props}>
      {everyoneRole && everyoneRoleNode}
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
