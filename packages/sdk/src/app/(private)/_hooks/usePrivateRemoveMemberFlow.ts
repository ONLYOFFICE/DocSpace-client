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
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { getGroupById } from "@docspace/shared/api/groups";
import { ShareAccessRights } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";

import { useActiveEncryptedUploadsForRoom } from "../_store/PrivateEncryptedUploadStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

type RemoveArgs = {
  roomId: number;
  userId: string;
  /** When true the userId refers to a group; members are expanded via
   *  getGroupById before the DEK revoke so every member's wrap is removed. */
  isGroup?: boolean;
};

type UsePrivateRemoveMemberFlowReturn = {
  /**
   * Removes a member from the room and re-issues file_keys without the
   * revoked user. Returns null if uploads are still in flight (guard).
   */
  remove: (args: RemoveArgs) => Promise<void>;
  /**
   * Non-null while uploads are in flight: blocks the revoke action and
   * surfaces a localized reason for the disable state.
   */
  guardReason: string | null;
  isLoading: boolean;
};

const loadRoomEncryption = () =>
  import("@docspace/shared/services/private-room/room-encryption");

export const usePrivateRemoveMemberFlow = (
  roomId: number | string,
): UsePrivateRemoveMemberFlowReturn => {
  const { t } = useTranslation(["Common"]);
  const activeUploads = useActiveEncryptedUploadsForRoom(roomId);
  const [isLoading, setIsLoading] = React.useState(false);

  const guardReason = React.useMemo(
    () =>
      activeUploads > 0
        ? t("Common:CannotRemoveMemberWhileUploads", { count: activeUploads })
        : null,
    [activeUploads, t],
  );

  const remove = React.useCallback(
    async ({ roomId: targetRoomId, userId, isGroup }: RemoveArgs) => {
      if (guardReason) {
        toastr.warning(guardReason);
        return;
      }

      const controller = registerCryptoOperation();
      setIsLoading(true);
      try {
        // 1. Revoke access on the server first (synchronous server-side ACL
        // change). If this fails, file_keys cleanup is moot.
        await api.rooms.setRoomSecurity(targetRoomId, {
          invitations: [{ id: userId, access: ShareAccessRights.None }],
          notify: false,
          message: "",
        });

        if (controller.signal.aborted) return;

        // 2. Resolve the set of user IDs whose DEK wraps must be removed.
        // For a group, expand to its member list (includeMembers=true).
        // Mirrors: packages/client/.../Members/sub-components/User.tsx:165-171
        let revokedIds: string[] = [userId];
        if (isGroup) {
          const group = await getGroupById(userId, true);
          revokedIds = (group.members ?? []).map((m) => String(m.id));
          // Empty group: nothing to revoke on the encryption side.
          if (revokedIds.length === 0) return;
        }

        if (controller.signal.aborted) return;

        // 3. Strip the revoked user(s) from every file_keys ACL in the room.
        // Best-effort: failures here leave dangling wraps but don't grant
        // decryption ability (the user lost room membership in step 1).
        try {
          const { revokeMemberFromEncryptedRoom } = await loadRoomEncryption();
          const results = await revokeMemberFromEncryptedRoom(
            Number(targetRoomId),
            revokedIds,
            {},
          );

          if (controller.signal.aborted) return;

          const failures = results.filter((r) => !r.success);
          if (failures.length > 0) {
            toastr.warning(
              t("Common:EncryptedRevokePartialFailure", {
                count: failures.length,
              }),
            );
            return;
          }
          if (results.length > 0) {
            toastr.success(t("Common:EncryptedRevokeCompleted"));
          }
        } catch {
          toastr.error(t("Common:EncryptedRevokeFailed"));
        }
      } catch (error) {
        // Step 1 (server ACL) failure: surface a localized encryption error.
        toastr.error(getEncryptionErrorMessage(t, error));
      } finally {
        releaseCryptoOperation(controller);
        setIsLoading(false);
      }
    },
    [guardReason, t],
  );

  return { remove, guardReason, isLoading };
};
