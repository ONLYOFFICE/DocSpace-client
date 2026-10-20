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

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { unlockWithPassphrase } from "@docspace/shared/services/encryption/identity";
import { InvalidPassphraseError } from "@docspace/shared/services/encryption/errors";
import { selectUserKey } from "@docspace/shared/services/encryption/select-user-key";
import { getTofuStore } from "@docspace/shared/services/encryption/tofu-store";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { ConfirmationModal } from "@docspace/shared/dialogs/confirmation-modal";
import { PassphraseModal } from "@docspace/shared/dialogs/passphrase-modal";

import { getEncryptionErrorMessage } from "./getEncryptionErrorMessage";

type Deps = {
  userId?: string;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
  onForgotPassphrase?: (target?: TEncryptionKeyPair) => void;
};

export type DeleteUnusedKeysFlow = {
  /** Envelopes the server stores for the user besides the selected key. */
  unusedCount: number;
  request: () => void;
  isPending: boolean;
  modals: ReactNode;
};

// Spec: private-rooms/key-management, "Unused keys on the server can be deleted".
export function useDeleteUnusedKeysFlow({
  userId,
  encryptionKeys,
  refreshKeysFromServer,
  onForgotPassphrase,
}: Deps): DeleteUnusedKeysFlow {
  const { t } = useTranslation(["Common"]);
  const [confirming, setConfirming] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [passphraseError, setPassphraseError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const selected = useMemo(() => selectUserKey(encryptionKeys), [encryptionKeys]);
  const unused = useMemo(
    () => (encryptionKeys ?? []).filter((k) => k !== selected),
    [encryptionKeys, selected],
  );

  const request = useCallback(() => {
    if (unused.length > 0) setConfirming(true);
  }, [unused.length]);

  const onConfirm = useCallback(() => {
    setConfirming(false);
    setPassphraseError(null);
    setVerifying(true);
  }, []);

  const onPassphraseSubmit = useCallback(
    async (passphrase: string) => {
      if (!selected) return;
      setIsPending(true);
      setPassphraseError(null);
      try {
        await unlockWithPassphrase(
          {
            publicKey: selected.publicKey,
            privateKeyEnc: selected.privateKeyEnc,
          },
          passphrase,
        );

        const results = await Promise.allSettled(
          unused.map((k) => deleteEncryptionKey(String(k.id))),
        );
        if (userId) {
          const tofu = getTofuStore(userId);
          for (let i = 0; i < unused.length; i++) {
            if (results[i].status === "fulfilled") {
              await tofu.forgetKey(userId, unused[i].publicKey);
            }
          }
        }
        await refreshKeysFromServer();

        const failures = results.filter((r) => r.status === "rejected").length;
        if (failures > 0) {
          toastr.error(
            t("Common:UnusedEncryptionKeysPartialFailure", { count: failures }),
          );
        } else {
          toastr.success(t("Common:UnusedEncryptionKeysDeleted"));
        }
        setVerifying(false);
      } catch (error) {
        if (error instanceof InvalidPassphraseError) {
          setPassphraseError(t("Common:InvalidPassphrase"));
        } else {
          toastr.error(getEncryptionErrorMessage(t, error));
          console.error("Deleting unused keys failed:", error);
          setVerifying(false);
        }
      } finally {
        setIsPending(false);
      }
    },
    [selected, unused, userId, refreshKeysFromServer, t],
  );

  const modals = (
    <>
      {confirming ? (
        <ConfirmationModal
          visible
          title={t("Common:DeleteUnusedEncryptionKeys")}
          message={t("Common:UnusedEncryptionKeysNotice", {
            count: unused.length,
          })}
          onConfirm={onConfirm}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
      {verifying ? (
        <PassphraseModal
          visible
          isNew={false}
          onSubmit={onPassphraseSubmit}
          onCancel={() => {
            setVerifying(false);
            setPassphraseError(null);
          }}
          isLoading={isPending}
          externalError={passphraseError}
          onForgotPassphrase={
            onForgotPassphrase
              ? () => {
                  setVerifying(false);
                  setPassphraseError(null);
                  onForgotPassphrase(selected ?? undefined);
                }
              : undefined
          }
        />
      ) : null}
    </>
  );

  return { unusedCount: unused.length, request, isPending, modals };
}
