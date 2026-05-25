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

import {
  exportIdentityToBlob,
  getPublicKeyFingerprint,
  unlockWithPassphrase,
} from "@docspace/shared/services/encryption/identity";
import { InvalidPassphraseError } from "@docspace/shared/services/encryption/errors";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { PassphraseModal } from "../modals/PassphraseModal";

import { getEncryptionErrorMessage } from "./getEncryptionErrorMessage";

type Deps = Record<string, never>;

export type ExportKeyFlow = {
  request: (keyData: TEncryptionKeyPair) => void;
  isPending: boolean;
  modals: ReactNode;
};

export function useExportKeyFlow(_deps?: Deps): ExportKeyFlow {
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
    async (passphrase: string) => {
      if (!target) return;
      setIsPending(true);
      setError(null);
      try {
        await unlockWithPassphrase(
          { publicKey: target.publicKey, privateKeyEnc: target.privateKeyEnc },
          passphrase,
        );

        const blob = exportIdentityToBlob({
          publicKey: target.publicKey,
          privateKeyEnc: target.privateKeyEnc,
        });
        const url = URL.createObjectURL(blob);
        const fingerprint = await getPublicKeyFingerprint(target.publicKey);
        const a = document.createElement("a");
        a.href = url;
        a.download = `docspace-key-${fingerprint.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toastr.success(t("Common:EncryptionKeyExported"));
        reset();
      } catch (e) {
        if (e instanceof InvalidPassphraseError) {
          setError(t("Common:InvalidPassphrase"));
        } else {
          toastr.error(getEncryptionErrorMessage(t, e));
          console.error("Key export failed:", e);
          reset();
        }
      } finally {
        setIsPending(false);
      }
    },
    [target, reset, t],
  );

  const modals = target ? (
    <PassphraseModal
      visible
      isNew={false}
      onSubmit={onSubmit}
      onCancel={reset}
      isLoading={isPending}
      externalError={error}
    />
  ) : null;

  return { request, isPending, modals };
}
