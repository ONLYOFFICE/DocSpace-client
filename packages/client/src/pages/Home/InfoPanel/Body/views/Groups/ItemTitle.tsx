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

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { decode } from "he";

import { Text } from "@docspace/shared/components/text";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Badge } from "@docspace/shared/components/badge";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { globalColors } from "@docspace/shared/themes";
import { TGroup } from "@docspace/shared/api/groups/types";

import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

import styles from "../Users/Users.module.scss";

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
          <>
            <Badge
              id="ldap-badge-info-panel"
              className="ldap-badge"
              label={t("Common:LDAP")}
              color={globalColors.white}
              backgroundColor={globalColors.secondPurple}
              fontSize="9px"
              fontWeight={800}
              noHover
            />
            <Tooltip anchorSelect={`div[id='ldap-badge-info-panel'] div`}>
              {t("PeopleTranslations:LDAPGroupTooltip")}
            </Tooltip>
          </>
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
