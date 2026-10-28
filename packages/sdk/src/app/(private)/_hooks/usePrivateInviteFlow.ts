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
import type { TInviteOutcome } from "@docspace/shared/services/private-room/room-member-flows";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import { usePrivateDialogsStore } from "../_store/PrivateDialogsStore";
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
   * Invoked once the room security update has succeeded: wraps the room's
   * file keys for the new members through the shared flow, with the
   * re-encryption progress in the dialogs store, and resolves with how the
   * invitation ended for each of them, or `null` when there is nothing to
   * report.
   */
  onInviteSubmitted: (
    args: InviteAfterSubmitArgs,
  ) => Promise<TInviteOutcome | null>;
  /**
   * Pre-submit identity gate for InvitePanel's `onBeforeSubmit`: unlocks
   * before the server grants room access, and refuses with
   * `EncryptionLockedAddMembers` when the user cancels.
   */
  onBeforeSubmit: () => Promise<boolean>;
};

const loadMemberFlows = () =>
  import("@docspace/shared/services/private-room/room-member-flows");

export const usePrivateInviteFlow = (): UsePrivateInviteFlowReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const dialogs = usePrivateDialogsStore();

  const onInviteSubmitted = React.useCallback(
    async ({ roomId, memberIds, displayNames }: InviteAfterSubmitArgs) => {
      if (memberIds.length === 0) return null;

      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        throw new Error(t("Common:EncryptionKeysNotConfigured"));
      }

      const identity = await requireIdentity();
      if (!identity) {
        throw new Error(t("Common:EncryptionUnlockRequired"));
      }

      const controller = registerCryptoOperation();
      dialogs.setReencryptPercent(0);
      try {
        const { rewrapForInvitedMembers } = await loadMemberFlows();
        let outcome: TInviteOutcome | null = null;
        const notices = await rewrapForInvitedMembers({
          t,
          roomId,
          newMembers: memberIds.map((id) => ({
            id,
            displayName: displayNames[id],
          })),
          currentUserId: userId,
          identity,
          onProgress: ({ percent, completed }) => {
            if (!completed) dialogs.setReencryptPercent(percent);
          },
          onOutcome: (value) => {
            outcome = value;
          },
        });
        // A lock or a navigation aborts the operation; nothing is reported.
        if (controller.signal.aborted) return null;
        for (const { level, text } of notices) toastr[level](text);
        return outcome;
      } finally {
        releaseCryptoOperation(controller);
        dialogs.setReencryptPercent(null);
      }
    },
    [requireIdentity, identityStore, dialogs, t],
  );

  const onBeforeSubmit = React.useCallback(async (): Promise<boolean> => {
    const identity = await requireIdentity();
    if (!identity) {
      toastr.error(t("Common:EncryptionLockedAddMembers"));
      return false;
    }
    return true;
  }, [requireIdentity, t]);

  return { onInviteSubmitted, onBeforeSubmit };
};
