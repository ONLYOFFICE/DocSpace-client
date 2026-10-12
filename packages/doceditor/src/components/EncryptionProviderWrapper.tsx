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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  EncryptionProvider,
  type PassphraseDialogProps,
} from "@docspace/shared/context/encryption";
import {
  getActiveKeyId,
  selectActiveKey,
} from "@docspace/shared/services/encryption/active-key-preference";
import { getEncryptionKeys } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import {
  PassphraseModal,
  usePasskeyUnlock,
} from "@docspace/shared/dialogs/passphrase-modal";
import { KeyChangeDialog } from "@docspace/shared/dialogs/key-change-dialog";
import { useRecoverKeyFlow } from "@docspace/shared/dialogs/key-recovery";

type EncryptionKeysData = {
  userId: string | undefined;
  encryptionKeys: TEncryptionKeyPair[] | null;
  refreshKeysFromServer: () => Promise<void>;
};

const EncryptionKeysDataContext = React.createContext<EncryptionKeysData>({
  userId: undefined,
  encryptionKeys: null,
  refreshKeysFromServer: async () => undefined,
});

const PassphraseUnlockAdapter = ({
  visible,
  isLoading,
  error,
  onSubmit,
  onCancel,
  onUnlocked,
}: PassphraseDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { userId, encryptionKeys, refreshKeysFromServer } = React.useContext(
    EncryptionKeysDataContext,
  );
  const [isRecovering, setIsRecovering] = React.useState(false);

  const handleRecoveryClosed = React.useCallback(
    (recovered: IdentityKeyPair | null) => {
      setIsRecovering(false);
      if (recovered) onUnlocked?.(recovered);
    },
    [onUnlocked],
  );

  const recover = useRecoverKeyFlow({
    userId,
    encryptionKeys,
    refreshKeysFromServer,
    onClosed: handleRecoveryClosed,
  });

  const passkey = usePasskeyUnlock(userId, onUnlocked);

  const handleForgotPassphrase = () => {
    passkey.abort();
    if (recover.available) {
      setIsRecovering(true);
      recover.request();
      return;
    }
    onCancel();
    window.location.href = "/profile/keys-management";
  };

  if (isRecovering) return recover.modals;

  return (
    <PassphraseModal
      visible={visible}
      isNew={false}
      isLoading={isLoading}
      externalError={error}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onForgotPassphrase={handleForgotPassphrase}
      submitLabel={t("Common:Confirm")}
      showRememberDevice
      onPasskeyUnlock={passkey.available ? passkey.unlock : undefined}
      isPasskeyUnlocking={passkey.isUnlocking}
    />
  );
};

export const EncryptionKeysReadyContext = React.createContext(false);

export const useEncryptionKeysReady = () =>
  React.useContext(EncryptionKeysReadyContext);

type TEncryptionProviderWrapperProps = {
  user?: TUser;
  children: React.ReactNode;
};

const EncryptionProviderWrapper = ({
  user,
  children,
}: TEncryptionProviderWrapperProps) => {
  const [keys, setKeys] = React.useState<TEncryptionKeyPair[] | null>(null);
  const [keysReady, setKeysReady] = React.useState(false);

  const userId = user?.id ? String(user.id) : undefined;

  React.useEffect(() => {
    if (!userId) {
      setKeysReady(true);
      return undefined;
    }

    let cancelled = false;

    getEncryptionKeys()
      .then((res) => {
        if (!cancelled) setKeys(res ?? []);
      })
      .catch(() => {
        if (!cancelled) setKeys([]);
      })
      .finally(() => {
        if (!cancelled) setKeysReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const chosen = selectActiveKey(keys, getActiveKeyId(userId));

  const userKeys =
    chosen && userId
      ? {
          publicKey: chosen.publicKey,
          privateKeyEnc: chosen.privateKeyEnc,
          userId,
        }
      : null;

  const refreshKeysFromServer = React.useCallback(async () => {
    try {
      const fresh = await getEncryptionKeys();
      setKeys(fresh ?? []);
    } catch (e) {
      console.error("Failed to refresh keys:", e);
    }
  }, []);

  const keysData = React.useMemo<EncryptionKeysData>(
    () => ({ userId, encryptionKeys: keys, refreshKeysFromServer }),
    [userId, keys, refreshKeysFromServer],
  );

  return (
    <EncryptionKeysDataContext.Provider value={keysData}>
      <EncryptionProvider
        userKeys={userKeys}
        PassphraseDialog={PassphraseUnlockAdapter}
        KeyChangeDialog={KeyChangeDialog}
      >
        <EncryptionKeysReadyContext.Provider value={keysReady}>
          {children}
        </EncryptionKeysReadyContext.Provider>
      </EncryptionProvider>
    </EncryptionKeysDataContext.Provider>
  );
};

export default EncryptionProviderWrapper;
