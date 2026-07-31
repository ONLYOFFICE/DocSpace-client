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

import React from "react";
import { observer } from "mobx-react";
import { decode } from "he";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { toastr } from "@docspace/ui-kit/components/toast";

import { getRoomMembers } from "@docspace/shared/api/rooms";
import type {
  RoomMember,
  TGetRoomMembers,
} from "@docspace/shared/api/rooms/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TGroup } from "@docspace/shared/api/groups/types";

import { useAgentInfoPanelStore } from "../../../_store";
import styles from "../InfoPanel.module.scss";

const MembersView = observer(() => {
  const { t } = useTranslation(["Common"]);
  const { currentAgent } = useAgentInfoPanelStore();

  const [members, setMembers] = React.useState<RoomMember[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!currentAgent) return;
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    getRoomMembers(
      currentAgent.id,
      { count: 100, startIndex: 0 },
      controller.signal,
    )
      .then((res: TGetRoomMembers) => {
        if (cancelled) return;
        setMembers(res.items ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        toastr.error(err instanceof Error ? err.message : String(err));
        setMembers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentAgent]);

  if (!currentAgent) return null;

  if (loading && !members) {
    return (
      <div className={styles.emptyState}>
        <Text fontSize="13px">{t("Common:LoadingProcessing")}</Text>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text fontSize="13px">{t("Common:NotFoundMembers")}</Text>
      </div>
    );
  }

  return (
    <>
      <div className={styles.subtitle}>
        <Text fontWeight={600} fontSize="14px">
          {t("Common:Members")}
        </Text>
      </div>
      <ul className={styles.membersList}>
        {members.map((m) => {
          const sharedTo = m.sharedTo;
          const isGroup =
            (sharedTo as TGroup).isGroup === true ||
            "name" in (sharedTo as TGroup);
          const user = sharedTo as TUser;
          const group = sharedTo as TGroup;
          const name = isGroup
            ? group.name || "—"
            : user.displayName
              ? decode(user.displayName)
              : (user.email ?? "—");

          return (
            <li
              key={(sharedTo as { id?: string }).id ?? name}
              className={styles.memberRow}
            >
              <Avatar
                size={AvatarSize.min}
                role={
                  m.isOwner
                    ? AvatarRole.owner
                    : isGroup
                      ? AvatarRole.none
                      : AvatarRole.user
                }
                source={isGroup ? undefined : user.avatarSmall}
                userName={name}
                isGroup={isGroup}
                hideRoleIcon={isGroup}
              />
              <Text truncate fontSize="13px" fontWeight={600}>
                {name}
              </Text>
            </li>
          );
        })}
      </ul>
    </>
  );
});

export default MembersView;
