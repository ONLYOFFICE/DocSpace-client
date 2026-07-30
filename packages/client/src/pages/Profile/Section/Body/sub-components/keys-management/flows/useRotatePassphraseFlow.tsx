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

import { changePassphrase } from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { getActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import { updateEncryptionKeys } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { KeyRotationDialog } from "../modals/KeyRotationDialog";
import { getEncryptionErrorMessage } from "./getEncryptionErrorMessage";

type Deps = {
  userId: string | undefined;
  refreshKeysFromServer: () => Promise<void>;
  onForgotPassphrase?: (target?: TEncryptionKeyPair) => void;
};

export type RotatePassphraseFlow = {
  request: (keyData: TEncryptionKeyPair) => void;
  isPending: boolean;
  modals: ReactNode;
};

export function useRotatePassphraseFlow({
  userId,
  refreshKeysFromServer,
  onForgotPassphrase,
}: Deps): RotatePassphraseFlow {
  const { t } = useTranslation(["Common"]);
  const [target, setTarget] = useState<TEncryptionKeyPair | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const reset = useCallback(() => {
    setTarget(null);
    setError(null);
  }, []);

  const request = useCallback((keyData: TEncryptionKeyPair) => {
    setTarget(keyData);
    setError(null);
  }, []);

  const onSubmit = useCallback(
    async (oldPassphrase: string, newPassphrase: string) => {
      if (!target || !userId) return;
      setIsPending(true);
      setError(null);
      try {
        const updated = await changePassphrase(
          { publicKey: target.publicKey, privateKeyEnc: target.privateKeyEnc },
          oldPassphrase,
          newPassphrase,
        );
        await updateEncryptionKeys({
          id: target.id,
          publicKey: updated.publicKey,
          privateKeyEnc: updated.privateKeyEnc,
        });
        if (getActiveKeyId(userId) === target.id) {
          SecretStorage.lock();
        }
        await refreshKeysFromServer();
        toastr.success(t("Common:PassphraseUpdated"));
        reset();
      } catch (e) {
        // Network / API errors and the actual "invalid passphrase" case both
        // landed here previously, so a network glitch looked like a wrong
        // passphrase. getEncryptionErrorMessage classifies it correctly.
        setError(getEncryptionErrorMessage(t, e));
      } finally {
        setIsPending(false);
      }
    },
    [target, userId, refreshKeysFromServer, reset, t],
  );

  const modals = target ? (
    <KeyRotationDialog
      visible
      onSubmit={onSubmit}
      onCancel={reset}
      error={error}
      isLoading={isPending}
      onForgotPassphrase={
        onForgotPassphrase
          ? () => {
              const captured = target;
              reset();
              onForgotPassphrase(captured ?? undefined);
            }
          : undefined
      }
    />
  ) : null;

  return { request, isPending, modals };
}
