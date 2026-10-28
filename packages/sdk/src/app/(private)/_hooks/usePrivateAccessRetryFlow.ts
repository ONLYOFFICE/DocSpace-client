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
import type { NewRoomMember } from "@docspace/shared/services/private-room/room-encryption";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import { usePrivateDialogsStore } from "../_store/PrivateDialogsStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

const loadMemberFlows = () =>
  import("@docspace/shared/services/private-room/room-member-flows");

/**
 * Retries the pending access of a member of a private room through the
 * shared flow, with the re-encryption progress in the dialogs store.
 */
export const usePrivateAccessRetryFlow = (
  roomId: number,
): ((member: NewRoomMember) => Promise<void>) => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const dialogs = usePrivateDialogsStore();

  return React.useCallback(
    async (member: NewRoomMember) => {
      const userId = identityStore.userKeys?.userId;
      const identity = userId ? await requireIdentity() : null;
      if (!userId || !identity) {
        toastr.error(t("Common:EncryptionUnlockRequired"));
        return;
      }

      const controller = registerCryptoOperation();
      dialogs.setReencryptPercent(0);
      try {
        const { retryPendingAccess } = await loadMemberFlows();
        const notice = await retryPendingAccess({
          t,
          roomId,
          member,
          currentUserId: userId,
          identity,
          onProgress: ({ percent, completed }) => {
            if (!completed) dialogs.setReencryptPercent(percent);
          },
        });
        // A lock or a navigation aborts the operation; nothing is reported.
        if (controller.signal.aborted) return;
        if (notice) toastr[notice.level](notice.text);
      } finally {
        releaseCryptoOperation(controller);
        dialogs.setReencryptPercent(null);
      }
    },
    [roomId, requireIdentity, identityStore, dialogs, t],
  );
};
