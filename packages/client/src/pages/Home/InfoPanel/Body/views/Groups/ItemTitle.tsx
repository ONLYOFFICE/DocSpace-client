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

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { decode } from "he";

import { Text } from "@docspace/ui-kit/components/text";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Badge } from "@docspace/ui-kit/components/badge";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { TGroup } from "@docspace/shared/api/groups/types";

import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

import styles from "../Users/Users.module.scss";
import { getConstName } from "@docspace/shared/constants/consts";

type ItemTitleProps = {
  isRoomAdmin?: boolean;
  isCollaborator?: boolean;
  groupSelection: TGroup;
  getGroupContextOptions?: GroupsStore["getGroupContextOptions"];
};

const ItemTitle = ({
  isRoomAdmin,
  isCollaborator,
  groupSelection,
  getGroupContextOptions,
}: ItemTitleProps) => {
  const { t } = useTranslation([
    "People",
    "PeopleTranslations",
    "InfoPanel",
    "Common",
    "Translations",
    "DeleteProfileEverDialog",
  ]);

  const itemTitleRef = useRef<HTMLDivElement>(null);

  const getContextOptions = () =>
    getGroupContextOptions?.(t, groupSelection, true, false);

  const groupName = groupSelection.name
    ? decode(groupSelection.name).trim()
    : "";

  return (
    <div className={styles.userTitle} ref={itemTitleRef}>
      <Avatar
        className={styles.avatar}
        size={AvatarSize.big}
        role={AvatarRole.user}
        dataTestId="info_panel_contacts_group_avatar"
        userName={groupSelection.name}
        isGroup
      />

      <div className={styles.infoText}>
        <div className={styles.infoWrapper}>
          <Text
            className={styles.infoTextName}
            title={groupName}
            truncate
            fontSize="16px"
            fontWeight={700}
            lineHeight="22px"
          >
            {groupName}
          </Text>
        </div>
        {groupName ? (
          <Text
            className={styles.infoTextEmail}
            title={groupSelection.name}
            fontSize="13px"
            fontWeight={600}
            lineHeight="20px"
          >
            {t("PeopleTranslations:MembersCount", {
              count: groupSelection.membersCount,
            })}
          </Text>
        ) : null}

        {groupSelection?.isLDAP ? (
          <div
            data-tooltip-id="system-tooltip"
            data-tooltip-content={t("PeopleTranslations:LDAPGroupTooltip")}
            data-tooltip-place="bottom"
          >
            <Badge
              className="ldap-badge"
              label={getConstName("LDAP")}
              color={globalColors.white}
              backgroundColor={globalColors.secondPurple}
              fontSize="9px"
              fontWeight={800}
              noHover
            />
          </div>
        ) : null}
      </div>

      {!isRoomAdmin &&
      !isCollaborator &&
      !groupSelection.isLDAP &&
      getContextOptions ? (
        <ContextMenuButton
          id="info-accounts-options"
          className={styles.contextButton}
          getData={getContextOptions as () => ContextMenuModel[]}
        />
      ) : null}
    </div>
  );
};

export default inject(({ peopleStore }: TStore) => {
  const { userStore, groupsStore } = peopleStore;

  if (!userStore || !groupsStore) return {};

  const { isRoomAdmin, isCollaborator } = userStore.user!;
  const { getGroupContextOptions } = groupsStore;

  return { isRoomAdmin, isCollaborator, getGroupContextOptions };
})(observer(ItemTitle));
