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

import React from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import {
  EncryptionProvider,
  useEncryption,
} from "@docspace/shared/context/encryption";
import {
  getActiveKeyId,
  selectActiveKey,
} from "@docspace/shared/services/encryption/active-key-preference";
import {
  registerGhostStateHandler,
  clearGhostStateHandler,
} from "@docspace/shared/services/encryption/ghost-state-notifier";
import { PassphraseModal } from "@docspace/shared/dialogs/passphrase-modal";
import { KeyChangeDialog } from "@docspace/shared/dialogs/key-change-dialog";
import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";

const FilenameRecoveryEffect = inject(({ filesStore }) => ({
  recover: filesStore?.recoverEncryptedFilenamesForCurrentView,
}))(
  observer(({ recover }) => {
    const { isUnlocked } = useEncryption();
    React.useEffect(() => {
      if (isUnlocked && recover) recover();
    }, [isUnlocked, recover]);
    return null;
  }),
);

const GhostStateToastEffect = () => {
  const { t } = useTranslation(["Common"]);
  React.useEffect(() => {
    registerGhostStateHandler(() => {
      toastr.warning(
        <Trans
          i18nKey="Common:GhostStateDetected"
          t={t}
          components={[
            <Link
              key="reset"
              tag="a"
              isHovered
              color="accent"
              onClick={() => {
                toastr.clear();
                window.location.href = "/profile/keys-management";
              }}
            />,
          ]}
        />,
        null,
        60000,
        true,
      );
    });
    return () => clearGhostStateHandler();
  }, [t]);
  return null;
};

const DEVICE_SETUP_HINT_SESSION_KEY = "encryption-device-setup-hint-shown";

const DeviceSetupHintEffect = inject(({ selectedFolderStore }) => ({
  isPrivate: selectedFolderStore?.private,
}))(
  observer(({ isPrivate }) => {
    const { hasConfiguredKey } = useEncryption();
    const { t } = useTranslation(["Common"]);

    React.useEffect(() => {
      if (!isPrivate || hasConfiguredKey) return;
      try {
        if (sessionStorage.getItem(DEVICE_SETUP_HINT_SESSION_KEY) === "1")
          return;
        sessionStorage.setItem(DEVICE_SETUP_HINT_SESSION_KEY, "1");
      } catch {}

      toastr.info(
        <Trans
          i18nKey="Common:EncryptionDeviceSetupHint"
          t={t}
          components={[
            <Link
              key="setup"
              tag="a"
              isHovered
              color="accent"
              onClick={() => {
                toastr.clear();
                window.location.href = "/profile/keys-management";
              }}
            />,
          ]}
        />,
        null,
        30000,
        true,
      );
    }, [isPrivate, hasConfiguredKey, t]);

    return null;
  }),
);

const PassphraseUnlockAdapter = ({
  visible,
  isLoading,
  error,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation(["Common"]);

  const handleForgotPassphrase = () => {
    onCancel();
    window.location.href = "/profile/keys-management";
  };

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
    />
  );
};

const EncryptionProviderWrapper = ({ userKeys, children }) => {
  return (
    <EncryptionProvider
      userKeys={userKeys}
      PassphraseDialog={PassphraseUnlockAdapter}
      KeyChangeDialog={KeyChangeDialog}
    >
      <FilenameRecoveryEffect />
      <DeviceSetupHintEffect />
      <GhostStateToastEffect />
      {children}
    </EncryptionProvider>
  );
};

export default inject(({ userStore }) => {
  const keys = userStore?.encryptionKeys;
  const ownerId = userStore?.user?.id;
  const ownerIdStr = ownerId ? String(ownerId) : undefined;

  const chosen = selectActiveKey(keys, getActiveKeyId(ownerIdStr));

  const userKeys =
    chosen && ownerIdStr
      ? {
          publicKey: chosen.publicKey,
          privateKeyEnc: chosen.privateKeyEnc,
          userId: ownerIdStr,
        }
      : null;

  return {
    userKeys,
  };
})(observer(EncryptionProviderWrapper));
