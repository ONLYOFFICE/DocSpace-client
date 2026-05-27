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

import { useEncryption } from "@docspace/shared/context/encryption";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

type InviteAfterSubmitArgs = {
  roomId: number;
  memberIds: string[];
  displayNames: Record<string, string>;
};

type UsePrivateInviteFlowReturn = {
  /**
   * Invoked AFTER setRoomSecurity succeeds. Requires unlock, then runs
   * addMembersToEncryptedRoom to wrap existing file DEKs for the new members.
   * Skipped recipients (no-key / TOFU-refused) surface as a toastr warning;
   * other errors propagate so InvitePanel keeps itself open.
   */
  onInviteSubmitted: (
    args: InviteAfterSubmitArgs,
  ) => Promise<void>;
  isLoading: boolean;
};

const loadRoomEncryption = () =>
  import("@docspace/shared/services/private-room/room-encryption");

export const usePrivateInviteFlow = (): UsePrivateInviteFlowReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const onInviteSubmitted = React.useCallback(
    async ({ roomId, memberIds, displayNames }: InviteAfterSubmitArgs) => {
      if (memberIds.length === 0) return;

      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        throw new Error(t("Common:EncryptionKeysNotConfigured"));
      }

      const identity = await requireIdentity();
      if (!identity) {
        // Cancelled passphrase dialog — surface as user-actionable error so
        // InvitePanel doesn't silently treat the invite as fully successful.
        throw new Error(t("Common:EncryptionUnlockRequired"));
      }

      const controller = registerCryptoOperation();
      setIsLoading(true);
      try {
        const { addMembersToEncryptedRoom } = await loadRoomEncryption();
        if (controller.signal.aborted) return;
        const result = await addMembersToEncryptedRoom(
          roomId,
          memberIds.map((id) => ({ id, displayName: displayNames[id] })),
          {
            currentUserId: userId,
            identity,
          },
        );
        if (controller.signal.aborted) return;

        if (result.skippedMembers.length > 0) {
          const names = result.skippedMembers
            .map((m) => m.displayName || m.id)
            .join(", ");
          toastr.warning(
            t("Common:EncryptionInviteSkippedMembers", { names }),
          );
        }
      } finally {
        releaseCryptoOperation(controller);
        setIsLoading(false);
      }
    },
    [requireIdentity, identityStore, t],
  );

  return { onInviteSubmitted, isLoading };
};
