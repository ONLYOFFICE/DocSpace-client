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

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import {
  generateIdentityKeyPair,
  serializeIdentity,
} from "@docspace/shared/services/encryption/identity";
import { generateRecoveryMnemonic } from "@docspace/shared/services/encryption/recovery";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { setActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import { setEncryptionKeys } from "@docspace/shared/api/privacy";
import { useEncryption } from "@docspace/shared/context/encryption";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

import { PassphraseModal } from "../modals/PassphraseModal";
import { RecoveryPhraseDisplayModal } from "../modals/RecoveryPhraseDisplayModal";

type Step = "idle" | "passphrase" | "recovery-display";

type Deps = {
  userId: string | undefined;
  refreshKeysFromServer: () => Promise<void>;
};

export type GenerateKeyFlow = {
  request: () => void;
  isPending: boolean;
  modals: ReactNode;
};

export function useGenerateKeyFlow({
  userId,
  refreshKeysFromServer,
}: Deps): GenerateKeyFlow {
  const { t } = useTranslation(["Common"]);
  const { suspendAutoLock } = useEncryption();
  const [step, setStep] = useState<Step>("idle");
  const [isPending, setIsPending] = useState(false);
  const [keyPair, setKeyPair] = useState<IdentityKeyPair | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffect(() => {
    if (step !== "recovery-display") return undefined;
    return suspendAutoLock();
  }, [step, suspendAutoLock]);

  const reset = useCallback(() => {
    setStep("idle");
    setKeyPair(null);
    setPassphrase(null);
    setMnemonic(null);
  }, []);

  const request = useCallback(() => {
    setStep("passphrase");
  }, []);

  const onPassphraseSubmit = useCallback(
    async (input: string) => {
      if (!userId) {
        toastr.error(t("Common:EncryptionError"));
        return;
      }
      setIsPending(true);
      try {
        const kp = await generateIdentityKeyPair();
        const m = await generateRecoveryMnemonic();
        setKeyPair(kp);
        setPassphrase(input);
        setMnemonic(m);
        setStep("recovery-display");
      } catch (error) {
        toastr.error(t("Common:EncryptionError"));
        console.error("Key/mnemonic generation failed:", error);
        reset();
      } finally {
        setIsPending(false);
      }
    },
    [reset, t, userId],
  );

  const onRecoveryConfirm = useCallback(async () => {
    if (!keyPair || !passphrase || !mnemonic || !userId) return;
    setIsPending(true);
    try {
      const serialized = await serializeIdentity(keyPair, passphrase, {
        recoveryMnemonic: mnemonic,
      });
      const payload = {
        id: crypto.randomUUID(),
        publicKey: serialized.publicKey,
        privateKeyEnc: serialized.privateKeyEnc,
      };
      await setEncryptionKeys(payload);
      setActiveKeyId(userId, payload.id);
      SecretStorage.cacheUnlocked(userId, keyPair);
      await refreshKeysFromServer();
      toastr.success(t("Common:EncryptionKeyGenerated"));
    } catch (error) {
      toastr.error(t("Common:EncryptionError"));
      console.error("Key generation upload failed:", error);
    } finally {
      setIsPending(false);
      reset();
    }
  }, [keyPair, passphrase, mnemonic, userId, refreshKeysFromServer, reset, t]);

  const modals = (
    <>
      {step === "passphrase" ? (
        <PassphraseModal
          visible
          onSubmit={onPassphraseSubmit}
          onCancel={reset}
          isNew
          isLoading={isPending}
        />
      ) : null}
      {step === "recovery-display" && mnemonic ? (
        <RecoveryPhraseDisplayModal
          visible
          mnemonic={mnemonic}
          onConfirm={onRecoveryConfirm}
          onCancel={reset}
          isLoading={isPending}
        />
      ) : null}
    </>
  );

  return { request, isPending, modals };
}
