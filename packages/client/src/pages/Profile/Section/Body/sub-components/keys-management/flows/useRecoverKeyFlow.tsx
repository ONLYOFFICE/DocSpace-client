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
  serializeIdentity,
  unlockWithRecoveryPhrase,
} from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { InvalidRecoveryPhraseError } from "@docspace/shared/services/encryption/errors";
import { setActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import { updateEncryptionKeys } from "@docspace/shared/api/privacy";
import type {
  IdentityKeyPair,
  SerializedIdentity,
} from "@docspace/shared/services/encryption/types";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { PassphraseModal } from "@docspace/shared/dialogs/passphrase-modal";
import { RecoveryPhraseInputModal } from "../modals/RecoveryPhraseInputModal";

import { getEncryptionErrorMessage } from "./getEncryptionErrorMessage";

type Step = "idle" | "phrase" | "new-passphrase";

type Deps = {
  userId: string | undefined;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
  onClosed?: (recovered: IdentityKeyPair | null) => void;
};

export type RecoverKeyFlow = {
  request: (target?: TEncryptionKeyPair) => void;
  isPending: boolean;
  available: boolean;
  modals: ReactNode;
};

export function useRecoverKeyFlow({
  userId,
  encryptionKeys,
  refreshKeysFromServer,
  onClosed,
}: Deps): RecoverKeyFlow {
  const { t } = useTranslation(["Common"]);
  const [step, setStep] = useState<Step>("idle");
  const [isPending, setIsPending] = useState(false);
  const [keyPair, setKeyPair] = useState<IdentityKeyPair | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [targetKeyId, setTargetKeyId] = useState<string | null>(null);
  const [scopedTarget, setScopedTarget] = useState<TEncryptionKeyPair | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setKeyPair(null);
    setMnemonic(null);
    setTargetKeyId(null);
    setScopedTarget(null);
    setError(null);
  }, []);

  const available = !!encryptionKeys && encryptionKeys.length > 0;

  const request = useCallback((target?: TEncryptionKeyPair) => {
    setError(null);
    setScopedTarget(target ?? null);
    setStep("phrase");
  }, []);

  const onPhraseSubmit = useCallback(
    async (input: string) => {
      const pool: TEncryptionKeyPair[] = scopedTarget
        ? [scopedTarget]
        : (encryptionKeys ?? []);
      if (pool.length === 0) return;
      setError(null);
      setIsPending(true);
      try {
        let unlocked: { kp: IdentityKeyPair; id: string } | null = null;
        for (const candidate of pool) {
          try {
            const envelope: SerializedIdentity = {
              publicKey: candidate.publicKey,
              privateKeyEnc: candidate.privateKeyEnc,
            };
            const kp = await unlockWithRecoveryPhrase(envelope, input);
            unlocked = { kp, id: candidate.id };
            break;
          } catch (e) {
            if (e instanceof InvalidRecoveryPhraseError) continue;
            throw e;
          }
        }
        if (!unlocked) {
          setError(t("Common:InvalidRecoveryPhrase"));
          return;
        }
        setKeyPair(unlocked.kp);
        setTargetKeyId(unlocked.id);
        setMnemonic(input);
        setStep("new-passphrase");
      } catch (e) {
        console.error("Recovery unlock failed:", e);
        setError(getEncryptionErrorMessage(t, e));
      } finally {
        setIsPending(false);
      }
    },
    [encryptionKeys, scopedTarget, t],
  );

  const handleDismiss = useCallback(() => {
    reset();
    onClosed?.(null);
  }, [reset, onClosed]);

  const onNewPassphrase = useCallback(
    async (newPassphrase: string) => {
      if (!keyPair || !mnemonic || !userId || !targetKeyId) return;
      setIsPending(true);
      let recovered: IdentityKeyPair | null = null;
      try {
        const serialized = await serializeIdentity(keyPair, newPassphrase, {
          recoveryMnemonic: mnemonic,
        });
        await updateEncryptionKeys({
          id: targetKeyId,
          publicKey: serialized.publicKey,
          privateKeyEnc: serialized.privateKeyEnc,
        });
        setActiveKeyId(userId, targetKeyId);
        SecretStorage.cacheUnlocked(userId, keyPair);
        await refreshKeysFromServer();
        recovered = keyPair;
        toastr.success(t("Common:RecoveryPhraseRestored"));
      } catch (e) {
        toastr.error(getEncryptionErrorMessage(t, e));
        console.error("Recovery re-encrypt failed:", e);
      } finally {
        setIsPending(false);
        reset();
        onClosed?.(recovered);
      }
    },
    [
      keyPair,
      mnemonic,
      userId,
      targetKeyId,
      refreshKeysFromServer,
      reset,
      onClosed,
      t,
    ],
  );

  const modals = (
    <>
      {step === "phrase" ? (
        <RecoveryPhraseInputModal
          visible
          onSubmit={onPhraseSubmit}
          onCancel={handleDismiss}
          error={error}
          isLoading={isPending}
        />
      ) : null}
      {step === "new-passphrase" ? (
        <PassphraseModal
          visible
          onSubmit={onNewPassphrase}
          onCancel={handleDismiss}
          isNew
          isLoading={isPending}
        />
      ) : null}
    </>
  );

  return { request, isPending, available, modals };
}
