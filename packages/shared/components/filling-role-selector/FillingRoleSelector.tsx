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
import AddRoleButton from "PUBLIC_DIR/images/add.role.button.react.svg?url";
import EveryoneRoleIcon from "PUBLIC_DIR/images/everyone.role.button.react.svg?url";

import {
  FillingRoleSelectorProps,
  TRole,
  TUser,
} from "./FillingRoleSelector.types";

import styles from "./FillingRoleSelector.module.scss";

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
      <div className={styles.row}>
        <div className={styles.number}>{everyoneRole?.order}</div>
        <ReactSVG className={styles.everyoneRoleIcon} src={EveryoneRoleIcon} />
        <div className={styles.everyoneRoleContainer}>
          <div className={styles.title}>
            <div className={styles.role}>{everyoneRole?.name}</div>
            <div className={styles.assignedRole}>{everyoneRole?.everyone}</div>
          </div>
          <div className={styles.roleDescription}>{descriptionEveryone}</div>
        </div>
      </div>
      <div className={styles.tooltip}>{descriptionTooltip}</div>
    </>
  );

  return (
    <div
      {...props}
      className={styles.fillingRoleSelector}
      data-testid="filling-role-selector"
    >
      {everyoneRole ? everyoneRoleNode : null}
      {sortedInOrderRoles.map((role: TRole) => {
        if (role.everyone) return;
        const roleWithUser = users?.find(
          (user: TUser) => user.role === role.name,
        );

        return roleWithUser ? (
          <div className={styles.userRow} key={`${role.name}`}>
            <div className={styles.content}>
              <div className={styles.number}>{role.order}</div>
              <img
                className={styles.avatar}
                alt=""
                src={
                  roleWithUser.hasAvatar
                    ? roleWithUser.avatar
                    : AvatarBaseReactSvgUrl
                }
              />
              <div className={styles.userWithRole}>
                <div className={styles.role}>{roleWithUser.displayName}</div>
                <div className={styles.assignedRole}>{roleWithUser.role}</div>
              </div>
            </div>
            <ReactSVG
              data-testid="remove-icon"
              src={RemoveSvgUrl}
              onClick={() => onRemoveUser(roleWithUser.id)}
            />
          </div>
        ) : (
          <div className={styles.row} key={`${role.name}`}>
            <div className={styles.number}>{role.order}</div>
            <ReactSVG
              data-testid="add-role-button"
              className={styles.addRoleButton}
              style={{ "--color": role.color } as React.CSSProperties}
              src={AddRoleButton}
              onClick={onAddUser}
            />
            <div className={styles.role}>{role.name}</div>
          </div>
        );
      })}
    </div>
  );
};

export { FillingRoleSelector };
