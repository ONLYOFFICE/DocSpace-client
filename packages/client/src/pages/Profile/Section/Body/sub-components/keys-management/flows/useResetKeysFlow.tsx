// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { ResetKeysConfirmDialog } from "../modals/ResetKeysConfirmDialog";

type Deps = {
  encryptionKeys?: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
};

export type ResetKeysFlow = {
  request: () => void;
  isPending: boolean;
  available: boolean;
  modals: ReactNode;
};

/**
 * Hard reset of the user's encryption identity.
 *
 * Use case: user has lost both their passphrase AND their recovery phrase
 * for every device, so there is no path back to the existing wrapped DEKs.
 * This flow deletes every encryption key the user has registered on the
 * server, wipes the in-memory unlocked state, and re-fetches so the UI
 * drops back to the "no identity" entry point.
 *
 * Existing encrypted files become permanently inaccessible to this user
 * unless a room owner re-shares them after the user generates a new
 * identity. The confirmation dialog requires the user to type a literal
 * token to defend against accidental clicks.
 */
export function useResetKeysFlow({
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
      // Delete every server-side envelope. We must drop the in-memory
      // unlocked state regardless of partial failure, otherwise a stale
      // cached identity could silently outlive a half-completed reset.
      const results = await Promise.allSettled(
        keys.map((k) => deleteEncryptionKey(String(k.id))),
      );
      SecretStorage.lock();
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
  }, [encryptionKeys, isPending, refreshKeysFromServer, t]);

  const modals = (
    <ResetKeysConfirmDialog
      visible={confirming}
      onConfirm={onConfirm}
      onCancel={() => {
        if (isPending) return;
        setConfirming(false);
      }}
      isPending={isPending}
    />
  );

  return { request, isPending, available: hasKeys, modals };
}
