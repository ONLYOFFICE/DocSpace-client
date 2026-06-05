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
import { ShareAccessRights } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

export type CandidateValidationResult = {
  validIds: string[];
  skipped: Array<{ id: string; displayName?: string; reason: string }>;
};

type ValidateArgs = {
  roomId: number;
  candidateIds: string[];
  displayNames?: Record<string, string | undefined>;
};

type ChangeOwnerArgs = {
  roomId: number;
  newOwnerId: string;
};

type LeaveRoomArgs = {
  roomId: number;
  userId: string;
};

type UsePrivateOwnerChangeFlowReturn = {
  /**
   * Pre-check: which candidates can actually be wrapped against the room's
   * file_keys. Skipped reasons surface to the dialog UI so admins know who
   * was filtered and why.
   */
  validateCandidates: (
    args: ValidateArgs,
  ) => Promise<CandidateValidationResult>;
  /** Transfer ownership via files/owner; server handles ACL/file_keys handoff. */
  changeOwner: (args: ChangeOwnerArgs) => Promise<boolean>;
  /**
   * Leave the room by revoking the current user's membership (access=None).
   * Parity with FilesActionsStore.onLeaveRoom — does NOT revoke DEK wraps.
   */
  leaveRoom: (args: LeaveRoomArgs) => Promise<void>;
  isLoading: boolean;
};

const loadRoomEncryption = () =>
  import("@docspace/shared/services/private-room/room-encryption");

export const usePrivateOwnerChangeFlow =
  (): UsePrivateOwnerChangeFlowReturn => {
    const { t } = useTranslation(["Common"]);
    const identityStore = useEncryptionIdentityStore();
    const [isLoading, setIsLoading] = React.useState(false);

    const validateCandidates = React.useCallback(
      async ({ roomId, candidateIds, displayNames }: ValidateArgs) => {
        const scopeUserId = identityStore.userKeys?.userId;
        if (!scopeUserId) {
          throw new Error(t("Common:EncryptionKeysNotConfigured"));
        }
        const { validateMembersForEncryption } = await loadRoomEncryption();
        const result = await validateMembersForEncryption(
          roomId,
          candidateIds,
          scopeUserId,
          undefined,
          displayNames,
        );
        return {
          validIds: result.valid.map((v) => v.id),
          skipped: result.skipped.map((s) => ({
            id: s.id,
            displayName: s.displayName,
            reason: s.reason,
          })),
        };
      },
      [identityStore, t],
    );

    const changeOwner = React.useCallback(
      async ({ roomId, newOwnerId }: ChangeOwnerArgs): Promise<boolean> => {
        const controller = registerCryptoOperation();
        setIsLoading(true);
        try {
          await api.files.setFileOwner(newOwnerId, [roomId]);
          return true;
        } catch (error) {
          toastr.error(getEncryptionErrorMessage(t, error));
          return false;
        } finally {
          releaseCryptoOperation(controller);
          setIsLoading(false);
        }
      },
      [t],
    );

    // Parity with FilesActionsStore.onLeaveRoom — revoke membership by setting
    // access=None. Does NOT revoke DEK wraps (intentional: reference parity).
    const leaveRoom = React.useCallback(
      async ({ roomId, userId }: LeaveRoomArgs): Promise<void> => {
        await api.rooms.updateRoomMemberRole(roomId, {
          invitations: [{ id: userId, access: ShareAccessRights.None }],
        });
      },
      [],
    );

    return { validateCandidates, changeOwner, leaveRoom, isLoading };
  };
