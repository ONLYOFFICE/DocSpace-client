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
import {
  clearActiveKeyId,
  getActiveKeyId,
} from "@docspace/shared/services/encryption/active-key-preference";
import { unlockWithPassphrase } from "@docspace/shared/services/encryption/identity";
import { InvalidPassphraseError } from "@docspace/shared/services/encryption/errors";
import { getTofuStore } from "@docspace/shared/services/encryption/tofu-store";
import { deleteEncryptionKey } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { ConfirmationModal } from "@docspace/shared/dialogs/confirmation-modal";
import { PassphraseModal } from "@docspace/shared/dialogs/passphrase-modal";

import { getEncryptionErrorMessage } from "./getEncryptionErrorMessage";

type Deps = {
  userId?: string;
  refreshKeysFromServer: () => Promise<void>;
  onForgotPassphrase?: (target?: TEncryptionKeyPair) => void;
};

export type DeleteKeyFlow = {
  request: (keyData: TEncryptionKeyPair) => void;
  isPending: boolean;
  pendingId: string | null;
  modals: ReactNode;
};

export function useDeleteKeyFlow({
  userId,
  refreshKeysFromServer,
  onForgotPassphrase,
}: Deps): DeleteKeyFlow {
  const { t } = useTranslation(["Common"]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<TEncryptionKeyPair | null>(null);
  const [verifying, setVerifying] = useState<TEncryptionKeyPair | null>(null);
  const [passphraseError, setPassphraseError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const request = useCallback((keyData: TEncryptionKeyPair) => {
    setConfirming(keyData);
  }, []);

  const onConfirm = useCallback(() => {
    if (!confirming) return;
    setVerifying(confirming);
    setConfirming(null);
    setPassphraseError(null);
  }, [confirming]);

  const onPassphraseSubmit = useCallback(
    async (passphrase: string) => {
      if (!verifying) return;
      setIsPending(true);
      setPendingId(verifying.id);
      setPassphraseError(null);
      try {
        await unlockWithPassphrase(
          {
            publicKey: verifying.publicKey,
            privateKeyEnc: verifying.privateKeyEnc,
          },
          passphrase,
        );

        await deleteEncryptionKey(verifying.id);
        if (getActiveKeyId(userId) === verifying.id) {
          clearActiveKeyId(userId);
        }
        if (userId) {
          await getTofuStore(userId).forgetKey(userId, verifying.publicKey);
        }
        SecretStorage.lock();
        await refreshKeysFromServer();
        toastr.success(t("Common:EncryptionKeyDeleted"));
        setVerifying(null);
      } catch (error) {
        if (error instanceof InvalidPassphraseError) {
          setPassphraseError(t("Common:InvalidPassphrase"));
        } else {
          toastr.error(getEncryptionErrorMessage(t, error));
          console.error("Key deletion failed:", error);
          setVerifying(null);
        }
      } finally {
        setIsPending(false);
        setPendingId(null);
      }
    },
    [verifying, userId, refreshKeysFromServer, t],
  );

  const modals = (
    <>
      {confirming !== null ? (
        <ConfirmationModal
          visible
          title={t("Common:DeleteKey")}
          message={t("Common:DeleteKeyWarning")}
          onConfirm={onConfirm}
          onCancel={() => setConfirming(null)}
        />
      ) : null}
      {verifying !== null ? (
        <PassphraseModal
          visible
          isNew={false}
          onSubmit={onPassphraseSubmit}
          onCancel={() => {
            setVerifying(null);
            setPassphraseError(null);
          }}
          isLoading={isPending}
          externalError={passphraseError}
          onForgotPassphrase={
            onForgotPassphrase
              ? () => {
                  const target = verifying;
                  setVerifying(null);
                  setPassphraseError(null);
                  onForgotPassphrase(target ?? undefined);
                }
              : undefined
          }
        />
      ) : null}
    </>
  );

  return { request, isPending, pendingId, modals };
}
