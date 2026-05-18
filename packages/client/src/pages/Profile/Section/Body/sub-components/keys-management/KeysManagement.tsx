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

import { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useEncryption } from "@docspace/shared/context/encryption";
import {
  exportIdentityToBlob,
  getPublicKeyFingerprint,
} from "@docspace/shared/services/encryption/identity";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import { getEncryptionKeys } from "@docspace/shared/api/privacy";

import { AutoLockSetting } from "./AutoLockSetting";
import { KeysList } from "./KeysList";
import { useGenerateKeyFlow } from "./flows/useGenerateKeyFlow";
import { useImportKeyFlow } from "./flows/useImportKeyFlow";
import { useRecoverKeyFlow } from "./flows/useRecoverKeyFlow";
import { useDeleteKeyFlow } from "./flows/useDeleteKeyFlow";
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

  // Re-fetch after each POST/PUT so we have server-assigned key ids.
  const refreshKeysFromServer = useCallback(async () => {
    try {
      const fresh = await getEncryptionKeys();
      setUserEncryptionKeys?.(fresh ?? []);
    } catch (error) {
      console.error("Failed to refresh keys:", error);
    }
  }, [setUserEncryptionKeys]);

  const generate = useGenerateKeyFlow({ userId, hasKeys, refreshKeysFromServer });
  const importFlow = useImportKeyFlow({
    userId,
    hasKeys,
    refreshKeysFromServer,
  });
  const recover = useRecoverKeyFlow({
    userId,
    encryptionKeys,
    refreshKeysFromServer,
  });
  const remove = useDeleteKeyFlow({ refreshKeysFromServer });
  const rotate = useRotatePassphraseFlow({ userId, refreshKeysFromServer });
  const reset = useResetKeysFlow({ encryptionKeys, refreshKeysFromServer });

  const busy =
    generate.isPending ||
    importFlow.isPending ||
    remove.isPending ||
    rotate.isPending ||
    recover.isPending ||
    reset.isPending;

  const handleExport = useCallback(
    async (keyData: TEncryptionKeyPair) => {
      try {
        const blob = exportIdentityToBlob({
          publicKey: keyData.publicKey,
          privateKeyEnc: keyData.privateKeyEnc,
        });
        const url = URL.createObjectURL(blob);
        const fingerprint = await getPublicKeyFingerprint(keyData.publicKey);
        const a = document.createElement("a");
        a.href = url;
        a.download = `docspace-key-${fingerprint.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toastr.success(t("Common:EncryptionKeyExported"));
      } catch (error) {
        toastr.error(t("Common:EncryptionError"));
        console.error("Key export failed:", error);
      }
    },
    [t],
  );

  return (
    <div className={styles.sectionBody}>
      <KeysList
        keys={encryptionKeys || []}
        onDelete={remove.request}
        onExport={handleExport}
        onRotate={rotate.request}
        isDeleting={remove.isPending}
        deletingKeyId={remove.pendingId}
      />
      <div className={styles.contentBody}>
        <div className={styles.inputGroup}>
          <Button
            size={ButtonSize.small}
            onClick={generate.request}
            label={t("Common:GenerateNewKey")}
            isLoading={generate.isPending}
            isDisabled={busy}
          />
          <div className={styles.buttonsSeparator}>{t("Common:Or")}</div>
          <Button
            primary
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
              onClick={recover.request}
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
