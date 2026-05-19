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

import { useTranslation } from "react-i18next";

import { EmployeeStatus } from "@docspace/shared/enums";
import { TUser } from "@docspace/shared/api/people/types";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";

import { StyledSendClockIcon } from "SRC_DIR/components/Icons";

import styles from "./Groups.module.scss";

type GroupMemberProps = {
  groupMember: TUser;
  isManager: boolean;
};

const GroupMember = ({ groupMember, isManager }: GroupMemberProps) => {
  const { t } = useTranslation([
    "People",
    "Profile",
    "PeopleTranslations",
    "Common",
  ]);

  return (
    <div
      className={styles.groupMember}
      data-testid="info_panel_contacts_group_member"
    >
      <Avatar
        className={styles.avatar}
        role={AvatarRole.user}
        size={AvatarSize.min}
        source={groupMember.avatar}
        noClick
        dataTestId="info_panel_contacts_group_member_avatar"
      />

      <div className={styles.mainWrapper}>
        <div className={styles.nameWrapper}>
          <TooltipContainer
            as="div"
            className={styles.name}
            title={groupMember.displayName}
          >
            {groupMember.displayName}
          </TooltipContainer>
          {groupMember.status === EmployeeStatus.Pending ? (
            <StyledSendClockIcon />
          ) : null}
        </div>
        <TooltipContainer
          as="div"
          className={styles.email}
          title={groupMember.email}
          tooltipFitToContent
        >
          {groupMember.email}
        </TooltipContainer>
      </div>

      <div className={styles.contextBtnWrapper}>
        {isManager ? (
          <div className={styles.groupManagerTag}>
            {t("Common:HeadOfGroup")}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GroupMember;
