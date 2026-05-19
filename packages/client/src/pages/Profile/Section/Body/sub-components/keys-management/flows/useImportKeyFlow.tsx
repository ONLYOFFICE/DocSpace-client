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

import React, { useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import {
  importIdentityFromFile,
  unlockWithPassphrase,
} from "@docspace/shared/services/encryption/identity";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import { setActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import { setEncryptionKeys } from "@docspace/shared/api/privacy";
import { InvalidPassphraseError } from "@docspace/shared/services/encryption/errors";
import type { SerializedIdentity } from "@docspace/shared/services/encryption/types";

import { PassphraseModal } from "../modals/PassphraseModal";

import { getEncryptionErrorMessage } from "./getEncryptionErrorMessage";

type Step = "idle" | "passphrase";

type Deps = {
  userId: string | undefined;
  refreshKeysFromServer: () => Promise<void>;
};

export type ImportKeyFlow = {
  request: () => void;
  isPending: boolean;
  fileInput: ReactNode;
  modals: ReactNode;
};

export function useImportKeyFlow({
  userId,
  refreshKeysFromServer,
}: Deps): ImportKeyFlow {
  const { t } = useTranslation(["Common"]);
  const [step, setStep] = useState<Step>("idle");
  const [isPending, setIsPending] = useState(false);
  const [imported, setImported] = useState<SerializedIdentity | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setImported(null);
  }, []);

  const request = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChosen = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsPending(true);
      try {
        const data = await importIdentityFromFile(file);
        setImported(data);
        setStep("passphrase");
      } catch (error) {
        toastr.error(getEncryptionErrorMessage(t, error));
        console.error("Key import failed:", error);
        setImported(null);
      } finally {
        setIsPending(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [t],
  );

  const onPassphraseSubmit = useCallback(
    async (passphrase: string) => {
      if (!imported || !userId) return;
      setIsPending(true);
      try {
        const kp = await unlockWithPassphrase(imported, passphrase);
        const id = crypto.randomUUID();
        await setEncryptionKeys({
          id,
          publicKey: imported.publicKey,
          privateKeyEnc: imported.privateKeyEnc,
        });
        setActiveKeyId(userId, id);
        SecretStorage.cacheUnlocked(userId, kp);
        await refreshKeysFromServer();
        toastr.success(t("Common:EncryptionKeyImported"));
        reset();
      } catch (error) {
        const message =
          error instanceof InvalidPassphraseError
            ? t("Common:InvalidPassphrase")
            : getEncryptionErrorMessage(t, error);
        toastr.error(message);
        console.error("Import passphrase verification failed:", error);
      } finally {
        setIsPending(false);
      }
    },
    [imported, userId, refreshKeysFromServer, t, reset],
  );

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      style={{ display: "none" }}
      onChange={onFileChosen}
    />
  );

  const modals = (
    <>
      {step === "passphrase" ? (
        <PassphraseModal
          visible
          onSubmit={onPassphraseSubmit}
          onCancel={reset}
          isNew={false}
          isLoading={isPending}
        />
      ) : null}
    </>
  );

  return { request, isPending, fileInput, modals };
}
