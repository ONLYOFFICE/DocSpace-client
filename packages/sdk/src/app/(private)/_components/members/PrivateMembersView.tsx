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

// PARITY-SOURCE: packages/client/src/pages/Home/InfoPanel/Body/views/Members/index.tsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko
// NOTE: Slim fork — drops SharedLinks, PublicRoomBar, LinkRow, template/AI
// branches. Members are listed without role-change combobox in v1; admins
// revoke + re-invite to change roles (out-of-scope optimization for M3).

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import type { RoomMember, TGetRoomMembers } from "@docspace/shared/api/rooms/types";
import type { TUser } from "@docspace/shared/api/people/types";
import { EmployeeActivationStatus } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { Text } from "@docspace/ui-kit/components/text";

import PrivateMemberUser from "./PrivateMemberUser";
import styles from "./PrivateMembersView.module.scss";

const PAGE_SIZE = 100;

export type PrivateMembersViewProps = {
  roomId: number;
  currentUserId: string;
  canInvite?: boolean;
  onAddUsersClick?: () => void;
  /** Re-fetches when bumped (e.g. after invite/remove). */
  refreshKey?: number;
};

const PrivateMembersView: React.FC<PrivateMembersViewProps> = ({
  roomId,
  currentUserId,
  canInvite = false,
  onAddUsersClick,
  refreshKey,
}) => {
  const { t } = useTranslation(["Common"]);
  const [members, setMembers] = React.useState<RoomMember[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const fetchMembers = React.useCallback(
    async (startIndex: number) => {
      const data: TGetRoomMembers = await api.rooms.getRoomMembers(roomId, {
        startIndex,
        count: PAGE_SIZE,
      });
      return data;
    },
    [roomId],
  );

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchMembers(0)
      .then((data) => {
        if (cancelled) return;
        setMembers(data.items);
        setTotal(data.total);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchMembers, refreshKey]);

  const handleLoadMore = React.useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const data = await fetchMembers(members.length);
      setMembers((prev) => [...prev, ...data.items]);
      setTotal(data.total);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMembers, members.length]);

  const handleMemberRemoved = React.useCallback((userId: string) => {
    setMembers((prev) =>
      prev.filter((m) => !("id" in m.sharedTo && m.sharedTo.id === userId)),
    );
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loaderRoot}>
        <Loader type={LoaderTypes.dualRing} size="32px" />
      </div>
    );
  }

  const hasMore = members.length < total;

  return (
    <div className={styles.root}>
      {canInvite && onAddUsersClick ? (
        <Button
          size={ButtonSize.normal}
          label={t("Common:AddUsers")}
          onClick={onAddUsersClick}
          primary
        />
      ) : null}

      <ul className={styles.list}>
        {members.map((member) => {
          const user = member.sharedTo as TUser & { isGroup?: boolean };
          const isGroup = Boolean(user.isGroup);
          // A pending member has activationStatus=Pending — mirrors
          // Share.helpers.tsx:546-558 isExpect derivation in the reference.
          // Groups never have activationStatus so default to false.
          const isExpect =
            !isGroup &&
            "activationStatus" in user &&
            user.activationStatus ===
              EmployeeActivationStatus.Pending;
          return (
            <li key={user.id} className={styles.listItem}>
              <PrivateMemberUser
                roomId={roomId}
                userId={user.id}
                displayName={user.displayName || user.email || ""}
                avatar={user.avatar}
                accessLabel={accessToLabel(member.access, member.isOwner, t)}
                canRemove={member.canEditAccess && user.id !== currentUserId}
                isExpect={isExpect}
                canInvite={canInvite}
                isOwner={member.isOwner}
                isGroup={isGroup}
                onRemoved={() => handleMemberRemoved(user.id)}
              />
            </li>
          );
        })}
      </ul>

      {hasMore ? (
        <Button
          size={ButtonSize.small}
          label={
            isLoadingMore
              ? t("Common:LoadingProcessing")
              : t("Common:ShowMore")
          }
          onClick={handleLoadMore}
          isDisabled={isLoadingMore}
        />
      ) : null}

      {members.length === 0 ? (
        <Text className={styles.empty}>
          {t("Common:NotFoundMembers")}
        </Text>
      ) : null}
    </div>
  );
};

function accessToLabel(
  access: number,
  isOwner: boolean,
  t: (key: string) => string,
): string {
  if (isOwner) return t("Common:Owner");
  // Numeric access codes vary; keep label generic for v1.
  return t("Common:Member");
}

export default PrivateMembersView;
