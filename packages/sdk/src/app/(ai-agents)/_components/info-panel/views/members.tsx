// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

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
