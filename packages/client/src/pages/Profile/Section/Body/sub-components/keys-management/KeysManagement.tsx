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

import { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useEncryption } from "@docspace/shared/context/encryption";
import { setActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import { getEncryptionKeys } from "@docspace/shared/api/privacy";

import { AutoLockSetting } from "./AutoLockSetting";
import { KeysList } from "./KeysList";
import { useGenerateKeyFlow } from "@docspace/shared/dialogs/key-generation";
import { useImportKeyFlow } from "./flows/useImportKeyFlow";
import { useRecoverKeyFlow } from "./flows/useRecoverKeyFlow";
import { useDeleteKeyFlow } from "./flows/useDeleteKeyFlow";
import { useExportKeyFlow } from "./flows/useExportKeyFlow";
import { useRotatePassphraseFlow } from "./flows/useRotatePassphraseFlow";
import { useResetKeysFlow } from "./flows/useResetKeysFlow";

import styles from "./KeysManagement.module.scss";

type KeysManagementProps = {
  encryptionKeys?: TEncryptionKeyPair[] | null;
  setUserEncryptionKeys?: (keys: TEncryptionKeyPair[]) => void;
  userId?: string;
};

const KeysManagement = ({
  encryptionKeys,
  setUserEncryptionKeys,
  userId,
}: KeysManagementProps) => {
  const { t } = useTranslation(["Common"]);
  const { isUnlocked, lock } = useEncryption();

  const hasKeys = !!encryptionKeys && encryptionKeys.length > 0;

  const refreshKeysFromServer = useCallback(async () => {
    try {
      const fresh = await getEncryptionKeys();
      setUserEncryptionKeys?.(fresh ?? []);
    } catch (error) {
      console.error("Failed to refresh keys:", error);
    }
  }, [setUserEncryptionKeys]);

  const generate = useGenerateKeyFlow({ userId, refreshKeysFromServer });
  const importFlow = useImportKeyFlow({
    userId,
    refreshKeysFromServer,
  });
  const recover = useRecoverKeyFlow({
    userId,
    encryptionKeys,
    refreshKeysFromServer,
  });
  const reset = useResetKeysFlow({
    userId,
    encryptionKeys,
    refreshKeysFromServer,
  });

  const handleForgotPassphrase = useCallback(
    (target?: TEncryptionKeyPair) => {
      if (recover.available) {
        recover.request(target);
      } else if (reset.available) {
        reset.request();
      }
    },
    [recover, reset],
  );

  const remove = useDeleteKeyFlow({
    userId,
    refreshKeysFromServer,
    onForgotPassphrase: handleForgotPassphrase,
  });
  const exportFlow = useExportKeyFlow({
    onForgotPassphrase: handleForgotPassphrase,
  });
  const rotate = useRotatePassphraseFlow({
    userId,
    refreshKeysFromServer,
    onForgotPassphrase: handleForgotPassphrase,
  });

  const busy =
    generate.isPending ||
    importFlow.isPending ||
    remove.isPending ||
    exportFlow.isPending ||
    rotate.isPending ||
    recover.isPending ||
    reset.isPending;

  const handleSelectActive = useCallback(
    (keyId: string) => {
      if (!userId) return;
      setActiveKeyId(userId, keyId);
      // The cached identity belongs to the previously-active key. Lock so the
      // next op prompts for the new key's passphrase rather than silently
      // failing with a wrap/identity mismatch.
      SecretStorage.lock();
      void refreshKeysFromServer();
      toastr.success(t("Common:EncryptionKeyActivated"));
    },
    [userId, refreshKeysFromServer, t],
  );

  return (
    <div className={styles.sectionBody}>
      <KeysList
        keys={encryptionKeys || []}
        onDelete={remove.request}
        onExport={exportFlow.request}
        onRotate={rotate.request}
        onSelectActive={handleSelectActive}
        isDeleting={remove.isPending}
        deletingKeyId={remove.pendingId}
      />
      <div className={styles.contentBody}>
        <div className={styles.inputGroup}>
          <Button
            primary
            size={ButtonSize.small}
            onClick={generate.request}
            label={t("Common:GenerateNewKey")}
            isLoading={generate.isPending}
            isDisabled={busy}
          />
          <div className={styles.buttonsSeparator}>{t("Common:Or")}</div>
          <Button
            size={ButtonSize.small}
            onClick={importFlow.request}
            label={t("Common:ImportKey")}
            isLoading={importFlow.isPending}
            isDisabled={busy}
          />
          {importFlow.fileInput}
          {recover.available ? (
            <Button
              size={ButtonSize.small}
              onClick={() => recover.request()}
              label={t("Common:UseRecoveryPhrase")}
              isDisabled={busy}
            />
          ) : null}
          {hasKeys && isUnlocked ? (
            <Button
              size={ButtonSize.small}
              onClick={() => {
                lock();
                toastr.success(t("Common:EncryptionLocked"));
              }}
              label={t("Common:LockNow")}
              isDisabled={busy}
            />
          ) : null}
        </div>
        {hasKeys ? <AutoLockSetting /> : null}
      </div>
      {reset.available ? (
        <div className={styles.resetSection}>
          <span className={styles.resetHint}>
            {t("Common:ResetEncryptionKeysHint")}
          </span>
          <Button
            className={styles.resetButton}
            size={ButtonSize.small}
            onClick={reset.request}
            label={t("Common:ResetEncryptionKeysCta")}
            isLoading={reset.isPending}
            isDisabled={busy}
          />
        </div>
      ) : null}
      {generate.modals}
      {importFlow.modals}
      {recover.modals}
      {remove.modals}
      {exportFlow.modals}
      {rotate.modals}
      {reset.modals}
    </div>
  );
};

export default inject(({ userStore }: TStore) => {
  const { encryptionKeys, setUserEncryptionKeys, user } = userStore;
  return {
    encryptionKeys,
    setUserEncryptionKeys,
    userId: user?.id ? String(user.id) : undefined,
  };
})(observer(KeysManagement));
