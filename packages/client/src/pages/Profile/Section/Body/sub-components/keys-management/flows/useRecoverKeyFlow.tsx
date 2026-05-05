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

import {
  serializeIdentity,
  unlockWithRecoveryPhrase,
} from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secretStorage";
import { InvalidRecoveryPhraseError } from "@docspace/shared/services/encryption/errors";
import { updateEncryptionKeys } from "@docspace/shared/api/privacy";
import type {
  IdentityKeyPair,
  SerializedIdentity,
} from "@docspace/shared/services/encryption/types";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import { PassphraseModal } from "../PassphraseModal";
import { RecoveryPhraseInputModal } from "../RecoveryPhraseInputModal";

type Step = "idle" | "phrase" | "new-passphrase";

type Deps = {
  userId: string | undefined;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
};

export type RecoverKeyFlow = {
  request: () => void;
  isPending: boolean;
  available: boolean;
  modals: ReactNode;
};

export function useRecoverKeyFlow({
  userId,
  encryptionKeys,
  refreshKeysFromServer,
}: Deps): RecoverKeyFlow {
  const { t } = useTranslation(["Common"]);
  const [step, setStep] = useState<Step>("idle");
  const [isPending, setIsPending] = useState(false);
  const [keyPair, setKeyPair] = useState<IdentityKeyPair | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setKeyPair(null);
    setMnemonic(null);
    setError(null);
  }, []);

  const available = !!encryptionKeys && encryptionKeys.length > 0;

  const request = useCallback(() => {
    setError(null);
    setStep("phrase");
  }, []);

  const onPhraseSubmit = useCallback(
    async (input: string) => {
      if (!encryptionKeys || encryptionKeys.length === 0) return;
      const target = encryptionKeys[0];
      setError(null);
      setIsPending(true);
      try {
        const envelope: SerializedIdentity = {
          publicKey: target.publicKey,
          privateKeyEnc: target.privateKeyEnc,
        };
        const kp = await unlockWithRecoveryPhrase(envelope, input);
        setKeyPair(kp);
        setMnemonic(input);
        setStep("new-passphrase");
      } catch (e) {
        if (e instanceof InvalidRecoveryPhraseError) {
          setError(t("Common:InvalidRecoveryPhrase"));
        } else {
          console.error("Recovery unlock failed:", e);
          setError(t("Common:EncryptionError"));
        }
      } finally {
        setIsPending(false);
      }
    },
    [encryptionKeys, t],
  );

  const onNewPassphrase = useCallback(
    async (newPassphrase: string) => {
      if (!keyPair || !mnemonic || !userId) return;
      setIsPending(true);
      try {
        const serialized = await serializeIdentity(keyPair, newPassphrase, {
          recoveryMnemonic: mnemonic,
        });
        await updateEncryptionKeys({
          publicKey: serialized.publicKey,
          privateKeyEnc: serialized.privateKeyEnc,
        });
        SecretStorage.cacheUnlocked(userId, keyPair);
        await refreshKeysFromServer();
        toastr.success(t("Common:RecoveryPhraseRestored"));
      } catch (e) {
        toastr.error(t("Common:EncryptionError"));
        console.error("Recovery re-encrypt failed:", e);
      } finally {
        setIsPending(false);
        reset();
      }
    },
    [keyPair, mnemonic, userId, refreshKeysFromServer, reset, t],
  );

  const modals = (
    <>
      {step === "phrase" ? (
        <RecoveryPhraseInputModal
          visible
          onSubmit={onPhraseSubmit}
          onCancel={reset}
          error={error}
          isLoading={isPending}
        />
      ) : null}
      {step === "new-passphrase" ? (
        <PassphraseModal
          visible
          onSubmit={onNewPassphrase}
          onCancel={reset}
          isNew
          isLoading={isPending}
        />
      ) : null}
    </>
  );

  return { request, isPending, available, modals };
}
