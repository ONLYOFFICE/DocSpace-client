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
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-06-05 by Ilya Oleshko
// NOTE: Slim fork — drops SharedLinks, PublicRoomBar, LinkRow, template/AI
// branches. Role-change ComboBox is included (wave 3 — task #39).

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

import MembersEmptyContainer from "@/app/(docspace)/_components/info-panel/views/Members/sub-components/EmptyContainer";

import PrivateMemberUser from "./PrivateMemberUser";
import {
  classifyMembers,
  type MemberSectionKey,
} from "./PrivateMembersView.utils";
import styles from "./PrivateMembersView.module.scss";

const PAGE_SIZE = 100;

export type PrivateMembersViewProps = {
  roomId: number;
  currentUserId: string;
  canInvite?: boolean;
  /** True when the current user may change member roles (security.EditRoom). */
  canEditMembers?: boolean;
  filterValue?: string;
  /** Re-fetches when bumped (e.g. after invite/remove). */
  refreshKey?: number;
};

const PrivateMembersView: React.FC<PrivateMembersViewProps> = ({
  roomId,
  currentUserId,
  canInvite = false,
  canEditMembers = false,
  filterValue,
  refreshKey,
}) => {
  const { t } = useTranslation(["Common"]);
  const [members, setMembers] = React.useState<RoomMember[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  // Bumped after an internal mutation (e.g. role change) to trigger a reload.
  const [internalRefreshKey, setInternalRefreshKey] = React.useState(0);

  const handleRoleChanged = React.useCallback(() => {
    setInternalRefreshKey((k) => k + 1);
  }, []);

  const fetchMembers = React.useCallback(
    async (startIndex: number, signal?: AbortSignal) => {
      const data: TGetRoomMembers = await api.rooms.getRoomMembers(
        roomId,
        {
          filterType: 0,
          filterValue: filterValue?.trim() || undefined,
          startIndex,
          count: PAGE_SIZE,
        },
        signal,
      );
      return data;
    },
    [roomId, filterValue],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    fetchMembers(0, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setMembers(data.items);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [fetchMembers, refreshKey, internalRefreshKey]);

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
  const isSearching = !!filterValue?.trim();
  const sections = classifyMembers(members);

  const sectionTitle = (key: MemberSectionKey): string => {
    switch (key) {
      case "administrators":
        return t("Common:RoomAdministration");
      case "users":
        return t("Common:RoomUsers");
      case "expected":
        return t("Common:RoomExpectUsers");
      default:
        return "";
    }
  };

  const renderMember = (member: RoomMember) => {
    const user = member.sharedTo as TUser & { isGroup?: boolean };
    const isGroup = Boolean(user.isGroup);
    const isExpect =
      !isGroup &&
      "activationStatus" in user &&
      user.activationStatus === EmployeeActivationStatus.Pending;
    const canChangeRole =
      canEditMembers &&
      member.canEditAccess &&
      !member.isOwner &&
      user.id !== currentUserId;
    return (
      <li key={user.id} className={styles.listItem}>
        <PrivateMemberUser
          roomId={roomId}
          userId={user.id}
          displayName={user.displayName || user.email || ""}
          avatar={user.avatar}
          access={member.access}
          canChangeRole={canChangeRole}
          canRemove={member.canEditAccess && user.id !== currentUserId}
          isExpect={isExpect}
          canInvite={canInvite}
          isOwner={member.isOwner}
          isGroup={isGroup}
          onRemoved={() => handleMemberRemoved(user.id)}
          onRoleChanged={handleRoleChanged}
        />
      </li>
    );
  };

  return (
    <div className={styles.root}>
      <ul className={styles.list}>
        {isSearching
          ? members.map(renderMember)
          : sections.map((section) =>
              section.members.length === 0 ? null : (
                <React.Fragment key={section.key}>
                  <li className={styles.sectionTitle}>
                    <Text
                      fontSize="12px"
                      fontWeight={600}
                      className={styles.sectionTitleLabel}
                    >
                      {sectionTitle(section.key)}
                    </Text>
                  </li>
                  {section.members.map(renderMember)}
                </React.Fragment>
              ),
            )}
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

      {members.length === 0 ? <MembersEmptyContainer /> : null}
    </div>
  );
};

export default PrivateMembersView;
