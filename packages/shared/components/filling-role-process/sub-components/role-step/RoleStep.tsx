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

import { decode } from "he";
import { useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg";
import AvatarBaseReactSvgUrl from "PUBLIC_DIR/images/avatar.base.react.svg?url";
import AvatarDarkReactSvgUrl from "PUBLIC_DIR/images/avatar.dark.react.svg?url";

import RoleHistories from "../role-histories/RoleHistories";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";

import styles from "./RoleStep.module.scss";
import type { RoleStepProps } from "./RoleStep.types";

const RoleStep = ({
  user,
  processStatus,
  roleName,
  histories,
  currentUserId,
  stoppedBy,
  withHistory = true,
}: RoleStepProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const { isBase } = useTheme();
  const { t } = useTranslation("Common");

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const hasMoreThanOneHistory = histories.length > 1;

  const lastHistory = histories.at(-1);

  const history =
    hasMoreThanOneHistory && collapsed
      ? lastHistory
        ? [lastHistory]
        : []
      : histories;

  const hasAvatar = user.hasAvatar;

  const userName = decode(user.displayName);

  return (
    <div data-process-status={processStatus} className={styles.roleContainer}>
      <div className={styles.role}>
        <picture className={styles.avatarContainer}>
          <img
            className={styles.avatar}
            src={
              hasAvatar
                ? user.avatar
                : isBase
                  ? AvatarBaseReactSvgUrl
                  : AvatarDarkReactSvgUrl
            }
            alt={user.userName}
          />
        </picture>
        <TooltipContainer as="h5" title={roleName} className={styles.roleTitle}>
          {roleName}
        </TooltipContainer>
        <p className={styles.userName}>
          {userName}{" "}
          {currentUserId === user.id ? `(${t("Common:MeLabel")})` : null}
        </p>
        {hasMoreThanOneHistory ? (
          <ArrowIcon
            onClick={toggleCollapse}
            className={classNames(styles.arrow, {
              [styles.rotated]: collapsed,
            })}
          />
        ) : null}
      </div>
      {withHistory ? (
        <RoleHistories
          className={styles.roleHistories}
          histories={history}
          stoppedBy={stoppedBy}
        />
      ) : null}
    </div>
  );
};

export default RoleStep;
