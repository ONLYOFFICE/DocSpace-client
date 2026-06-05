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
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-06-05 by Ilya Oleshko

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { isMobileOnly, isMobile } from "react-device-detect";

import api from "@docspace/shared/api";
import { RoomsType } from "@docspace/shared/enums";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";
import { Avatar, AvatarRole, AvatarSize } from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  ComboBoxSize,
  type TOption,
} from "@docspace/ui-kit/components/combobox";
import { AccessRightSelect } from "@docspace/ui-kit/components/access-right-select";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";

import RemoveSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import EmailPlusSvgUrl from "PUBLIC_DIR/images/e-mail+.react.svg?url";

import MembersHelper from "../../../(docspace)/_components/info-panel/views/Members/Members.utils";
import { usePrivateRemoveMemberFlow } from "../../_hooks/usePrivateRemoveMemberFlow";
import { usePrivateDialogsStore } from "../../_store/PrivateDialogsStore";
import styles from "./PrivateMembersView.module.scss";

export type PrivateMemberUserProps = {
  roomId: number;
  userId: string;
  displayName: string;
  avatar?: string;
  /** Numeric access level (ShareAccessRights) for this member. */
  access: number;
  /** Whether the current user may change the role of this member. */
  canChangeRole: boolean;
  canRemove: boolean;
  /** Whether this member has a pending invitation (activationStatus=Pending). */
  isExpect?: boolean;
  /** Whether the current user has permission to invite/re-invite members. */
  canInvite?: boolean;
  isOwner: boolean;
  /** True when this row represents a group; remove flow expands group members. */
  isGroup?: boolean;
  onRemoved?: () => void;
  /** Called after a successful role change so the parent can refresh. */
  onRoleChanged?: () => void;
};

const PrivateMemberUser: React.FC<PrivateMemberUserProps> = ({
  roomId,
  userId,
  displayName,
  avatar,
  access,
  canChangeRole,
  canRemove,
  isExpect = false,
  canInvite = false,
  isOwner,
  isGroup = false,
  onRemoved,
  onRoleChanged,
}) => {
  const { t } = useTranslation(["Common", "People"]);
  const { remove, guardReason, isLoading } = usePrivateRemoveMemberFlow(roomId);
  const dialogs = usePrivateDialogsStore();
  const [isRoleChanging, setIsRoleChanging] = React.useState(false);

  // Build role options for CustomRoom (private rooms are always CustomRoom).
  // Mirrors: packages/client/.../Members/sub-components/User.tsx:107-128
  const membersHelper = React.useMemo(
    () => new MembersHelper({ t }),
    // MembersHelper only depends on `t`; rebuild when language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const roleOptions = membersHelper.getOptionsByRoomType(
    RoomsType.CustomRoom,
    // Never include the remove option in the role combobox — removal is
    // handled by the dedicated remove button below.
    false,
  ) as TOption[];

  const selectedRole = membersHelper.getOptionByUserAccess(access) as
    | TOption
    | undefined;

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

  // Role change — mirrors User.tsx:139-160 in the reference.
  // CRYPTO NOTE: role change does NOT touch DEK wraps (content access is
  // controlled by wrap presence, not by the role flag). No re-encryption needed.
  const onSelectRole = React.useCallback(
    async (option: TOption) => {
      if (!option.access || option.access === access) return;

      setIsRoleChanging(true);
      try {
        await api.rooms.updateRoomMemberRole(roomId, {
          invitations: [{ id: userId, access: option.access }],
          notify: true,
          sharingMessage: "",
          force: false,
        });
        toastr.success(t("Common:AccessRightsChanged"));
        onRoleChanged?.();
      } catch (error) {
        toastr.error(getEncryptionErrorMessage(t, error));
      } finally {
        setIsRoleChanging(false);
      }
    },
    [access, roomId, userId, t, onRoleChanged],
  );

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
      {/* Role combobox — shown for all non-owner members. */}
      {selectedRole && !isOwner ? (
        <div className={styles.roleWrapper}>
          {canChangeRole ? (
            <AccessRightSelect
              modernView
              className={styles.roleCombobox}
              selectedOption={selectedRole}
              usePortalBackdrop
              onSelect={onSelectRole}
              accessOptions={roleOptions}
              noSelect={false}
              manualWidth="300px"
              directionY="both"
              size={ComboBoxSize.content}
              scaled={false}
              scaledOptions={false}
              isAside={isMobile}
              withBlur={isMobile}
              isLoading={isRoleChanging}
              isMobileView={isMobileOnly}
              shouldShowBackdrop={isMobile}
              dataTestId="private_member_role_combobox"
            />
          ) : (
            <TooltipContainer
              as="div"
              className={styles.roleLabel}
              title={t("Common:Role")}
            >
              {selectedRole.label}
            </TooltipContainer>
          )}
        </div>
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
