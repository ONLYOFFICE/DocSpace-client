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

/* eslint-disable jsx-a11y/control-has-associated-label */

"use client";

import { decode } from "he";
import React from "react";
import { useTranslation } from "react-i18next";

import CrossIcon from "PUBLIC_DIR/images/icons/16/circle.cross.svg";

import { Avatar, AvatarSize, AvatarRole } from "../avatar";

import styles from "./FillingRoleSelector.module.scss";
import type { IFillingRoleSelectorProps } from "./FillingRoleSelector.types";

const FillingRoleSelector = ({
  roles,
  onSelect,
  removeUserFromRole,
  currentUserId,
}: IFillingRoleSelectorProps) => {
  const { t } = useTranslation(["Common"]);

  const onRemoveUserFromRole = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
    idx: number,
  ) => {
    event.stopPropagation();
    removeUserFromRole(idx);
  };

  return (
    <ol className={styles.roles}>
      {roles.map((role, idx) => (
        <li
          key={role.name}
          className={styles.role}
          onClick={() => onSelect(idx)}
        >
          <span className={styles.count}>{idx + 1}</span>
          {role.user ? (
            <>
              <Avatar
                source={role.user.avatar ?? ""}
                size={AvatarSize.min}
                role={AvatarRole.user}
              />
              <div className={styles.info}>
                <h5>
                  {decode(role.user.displayName)} &nbsp;
                  {currentUserId === role.user.id ? (
                    <span className={styles.me}>({t("Common:MeLabel")})</span>
                  ) : null}
                </h5>
                <span>{role.name}</span>
              </div>
              <CrossIcon
                className={styles.remove}
                onClick={(e: React.MouseEvent<SVGSVGElement, MouseEvent>) =>
                  onRemoveUserFromRole(e, idx)
                }
              />
            </>
          ) : (
            <button title={role.name} type="button" className={styles.button}>
              <span
                className={styles.plus}
                style={{ backgroundColor: role.color }}
              />
              <span className={styles.name}>{role.name}</span>
            </button>
          )}
        </li>
      ))}
    </ol>
  );
};

export default FillingRoleSelector;
