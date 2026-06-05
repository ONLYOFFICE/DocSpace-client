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

// PARITY-SOURCE: packages/client/src/pages/Home/InfoPanel/Body/views/Members/sub-components/User.tsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { Avatar, AvatarRole, AvatarSize } from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { toastr } from "@docspace/ui-kit/components/toast";

import RemoveSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import EmailPlusSvgUrl from "PUBLIC_DIR/images/e-mail+.react.svg?url";

import { usePrivateRemoveMemberFlow } from "../../_hooks/usePrivateRemoveMemberFlow";
import { usePrivateDialogsStore } from "../../_store/PrivateDialogsStore";
import styles from "./PrivateMembersView.module.scss";

export type PrivateMemberUserProps = {
  roomId: number;
  userId: string;
  displayName: string;
  avatar?: string;
  accessLabel: string;
  canRemove: boolean;
  /** Whether this member has a pending invitation (activationStatus=Pending). */
  isExpect?: boolean;
  /** Whether the current user has permission to invite/re-invite members. */
  canInvite?: boolean;
  isOwner: boolean;
  /** True when this row represents a group; remove flow expands group members. */
  isGroup?: boolean;
  onRemoved?: () => void;
};

const PrivateMemberUser: React.FC<PrivateMemberUserProps> = ({
  roomId,
  userId,
  displayName,
  avatar,
  accessLabel,
  canRemove,
  isExpect = false,
  canInvite = false,
  isOwner,
  isGroup = false,
  onRemoved,
}) => {
  const { t } = useTranslation(["Common", "People"]);
  const { remove, guardReason, isLoading } = usePrivateRemoveMemberFlow(roomId);
  const dialogs = usePrivateDialogsStore();

  // Re-invite icon is shown only for pending members when the current user
  // has invite permission — mirrors User.tsx:101-103 in the reference.
  const showInviteIcon = canInvite && isExpect;

  const onRepeatInvitation = React.useCallback(() => {
    api.rooms
      .resendEmailInvitations(roomId, true)
      .then(() =>
        toastr.success(
          t("Common:RoomSuccessSentMultipleInvitatios"),
        ),
      )
      .catch((err) => toastr.error(err));
  }, [roomId, t]);

  const handleRemoveClick = React.useCallback(() => {
    if (guardReason || isLoading) return;
    dialogs.openRemoveUser({
      roomId,
      userId,
      displayName,
      onConfirm: async () => {
        await remove({ roomId, userId, isGroup });
        onRemoved?.();
      },
    });
  }, [
    guardReason,
    isLoading,
    roomId,
    userId,
    displayName,
    isGroup,
    remove,
    onRemoved,
    dialogs,
  ]);

  return (
    <div className={styles.userRow}>
      <Avatar
        size={AvatarSize.min}
        role={isOwner ? AvatarRole.owner : AvatarRole.user}
        source={avatar || ""}
        userName={displayName}
      />
      <div className={styles.userBody}>
        <Text className={styles.userName}>{displayName}</Text>
        <Text className={styles.userAccess}>{accessLabel}</Text>
      </div>
      {showInviteIcon ? (
        <IconButton
          iconName={EmailPlusSvgUrl}
          size={16}
          isClickable
          onClick={onRepeatInvitation}
          title={t("Common:RepeatInvitation")}
          data-testid="member_repeat_invitation_button"
        />
      ) : null}
      {canRemove && !isOwner ? (
        <IconButton
          iconName={RemoveSvgUrl}
          size={16}
          isClickable={!isLoading}
          isDisabled={!!guardReason || isLoading}
          onClick={handleRemoveClick}
          title={guardReason ?? t("People:RemoveUser")}
        />
      ) : null}
    </div>
  );
};

export default PrivateMemberUser;
