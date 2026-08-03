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

import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { resetGhostStateGate } from "@docspace/shared/services/encryption/ghost-state-notifier";
import { clearActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import { clearRotationState } from "@docspace/shared/services/encryption/rotation-state";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { ResetKeysConfirmDialog } from "../modals/ResetKeysConfirmDialog";

type Deps = {
  userId?: string;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
};

export type ResetKeysFlow = {
  request: () => void;
  isPending: boolean;
  available: boolean;
  modals: ReactNode;
};

export function useResetKeysFlow({
  userId,
  encryptionKeys,
  refreshKeysFromServer,
}: Deps): ResetKeysFlow {
  const { t } = useTranslation(["Common"]);
  const [confirming, setConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const hasKeys = !!encryptionKeys && encryptionKeys.length > 0;

  const request = useCallback(() => {
    if (!hasKeys) return;
    setConfirming(true);
  }, [hasKeys]);

  const onConfirm = useCallback(async () => {
    if (isPending) return;
    const keys = encryptionKeys ?? [];
    if (keys.length === 0) {
      setConfirming(false);
      return;
    }

    setIsPending(true);
    try {
      // Drop in-memory state regardless of partial failure — a stale cached
      // identity must not outlive a half-completed reset.
      const results = await Promise.allSettled(
        keys.map((k) => deleteEncryptionKey(String(k.id))),
      );
      clearActiveKeyId(userId);
      clearRotationState(userId);
      SecretStorage.lock();
      resetGhostStateGate();
      await refreshKeysFromServer();

      const failures = results.filter((r) => r.status === "rejected").length;
      if (failures > 0) {
        toastr.warning(
          t("Common:ResetEncryptionKeysPartialFailure", { count: failures }),
        );
      } else {
        toastr.success(t("Common:ResetEncryptionKeysSuccess"));
      }
    } catch (error) {
      console.error("Identity reset failed:", error);
      toastr.error(t("Common:ResetEncryptionKeysFailed"));
    } finally {
      setIsPending(false);
      setConfirming(false);
    }
  }, [encryptionKeys, isPending, userId, refreshKeysFromServer, t]);

  const modals = confirming ? (
    <ResetKeysConfirmDialog
      visible
      onConfirm={onConfirm}
      onCancel={() => {
        if (isPending) return;
        setConfirming(false);
      }}
      isPending={isPending}
    />
  ) : null;

  return { request, isPending, available: hasKeys, modals };
}
