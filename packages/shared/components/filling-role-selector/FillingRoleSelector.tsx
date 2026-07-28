/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import { decode } from "he";
import React from "react";
import { useTranslation } from "react-i18next";

import CrossIcon from "PUBLIC_DIR/images/icons/16/circle.cross.svg";

import {
  Avatar,
  AvatarSize,
  AvatarRole,
} from "@docspace/ui-kit/components/avatar";

import styles from "./FillingRoleSelector.module.scss";
import type { IFillingRoleSelectorProps } from "./FillingRoleSelector.types";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";

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
            <TooltipContainer
              as="button"
              title={role.name}
              type="button"
              className={styles.button}
            >
              <span
                className={styles.plus}
                style={{ backgroundColor: role.color }}
              />
              <span className={styles.name}>{role.name}</span>
            </TooltipContainer>
          )}
        </li>
      ))}
    </ol>
  );
};

export default FillingRoleSelector;
