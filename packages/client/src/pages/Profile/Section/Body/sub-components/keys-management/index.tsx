// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useState, useCallback, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

import {
  generateRSAKeyPair,
  serializeKeyPair,
  exportKeyToFile,
  importKeyFromFile,
  getKeyStatus,
  getPublicKeyFingerprint,
} from "@docspace/shared/services/encryption/keyManagement";
import { SecretStorageService } from "@docspace/shared/services/encryption/secretStorage";
import type {
  SerializedKeyPair,
  KeyStatus,
} from "@docspace/shared/services/encryption/types";
import { setEncryptionKeys } from "@docspace/shared/api/privacy";

import { KeyStatusDisplay } from "./KeyStatusDisplay";
import { PassphraseModal } from "./PassphraseModal";
import { ConfirmationModal } from "./ConfirmationModal";

import styles from "./keys-management.module.scss";

type KeysManagementProps = {
  encryptionKeys?: SerializedKeyPair | null;
  setUserEncryptionKeys?: (keys: SerializedKeyPair[]) => void;
};

const KeysManagement = ({
  encryptionKeys,
  setUserEncryptionKeys,
}: KeysManagementProps) => {
  const { t } = useTranslation(["Common"]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [showConfirmReplace, setShowConfirmReplace] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "generate" | "import" | null
  >(null);
  const [importedKeyData, setImportedKeyData] =
    useState<SerializedKeyPair | null>(null);
  const [keyStatus, setKeyStatus] = useState<KeyStatus>({ hasKey: false });

  useEffect(() => {
    const updateStatus = async () => {
      const status = await getKeyStatus(encryptionKeys || null);
      setKeyStatus(status);
    };
    updateStatus();
  }, [encryptionKeys]);

  const handleGenerateKey = useCallback(
    async (passphrase: string) => {
      setIsGenerating(true);
      try {
        const keyPair = await generateRSAKeyPair();
        const serialized = await serializeKeyPair(keyPair, passphrase);

        await setEncryptionKeys({
          publicKey: serialized.publicKey,
          privateKeyEnc: serialized.privateKeyEnc,
        });

        await SecretStorageService.cacheDecryptedKey(keyPair.privateKey);

        setUserEncryptionKeys?.([serialized]);
        toastr.success(t("Common:EncryptionKeyGenerated"));
      } catch (error) {
        toastr.error(t("Common:EncryptionError"));
        console.error("Key generation failed:", error);
      } finally {
        setIsGenerating(false);
        setShowPassphraseModal(false);
        setPendingAction(null);
      }
    },
    [t, setUserEncryptionKeys],
  );

  const handleExportKey = useCallback(async () => {
    if (!encryptionKeys) return;

    setIsExporting(true);

    try {
      const blob = exportKeyToFile(encryptionKeys);
      const url = URL.createObjectURL(blob);
      const fingerprint = await getPublicKeyFingerprint(
        encryptionKeys.publicKey,
      );
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
    } finally {
      setIsExporting(false);
    }
  }, [encryptionKeys, t]);

  const handleImportFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImporting(true);

      try {
        const keyData = await importKeyFromFile(file);
        setImportedKeyData(keyData);

        if (keyStatus.hasKey) {
          setPendingAction("import");
          setShowConfirmReplace(true);
        } else {
          await setEncryptionKeys({
            publicKey: keyData.publicKey,
            privateKeyEnc: keyData.privateKeyEnc,
          });
          setUserEncryptionKeys?.([keyData]);
          toastr.success(t("Common:EncryptionKeyImported"));
        }
      } catch (error) {
        toastr.error(
          error instanceof Error ? error.message : t("Common:EncryptionError"),
        );
        console.error("Key import failed:", error);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [keyStatus.hasKey, t, setUserEncryptionKeys],
  );

  const handleConfirmReplace = useCallback(async () => {
    if (pendingAction === "import" && importedKeyData) {
      try {
        await setEncryptionKeys({
          publicKey: importedKeyData.publicKey,
          privateKeyEnc: importedKeyData.privateKeyEnc,
          update: true,
        });
        setUserEncryptionKeys?.([importedKeyData]);
        toastr.success(t("Common:EncryptionKeyImported"));
      } catch (error) {
        toastr.error(t("Common:EncryptionError"));
        console.error("Key replacement failed:", error);
      } finally {
        setShowConfirmReplace(false);
        setImportedKeyData(null);
        setPendingAction(null);
      }
    } else if (pendingAction === "generate") {
      setShowConfirmReplace(false);
      setShowPassphraseModal(true);
    }
  }, [pendingAction, importedKeyData, t, setUserEncryptionKeys]);

  const requestGenerateKey = useCallback(() => {
    if (keyStatus.hasKey) {
      setPendingAction("generate");
      setShowConfirmReplace(true);
    } else {
      setShowPassphraseModal(true);
      setPendingAction("generate");
    }
  }, [keyStatus.hasKey]);

  return (
    <div className={styles.sectionBody}>
      <KeyStatusDisplay status={keyStatus} />
      <div className={styles.contentBody}>
        <div className={styles.inputGroup}>
          <Button
            size={ButtonSize.small}
            onClick={requestGenerateKey}
            label={t("Common:GenerateNewKey")}
            isLoading={isGenerating}
            isDisabled={isGenerating || isImporting}
          />
          <div className={styles.buttonsSeparator}>{t("Common:Or")}</div>
          <Button
            primary
            size={ButtonSize.small}
            onClick={() => fileInputRef.current?.click()}
            label={t("Common:ImportKey")}
            isLoading={isImporting}
            isDisabled={isGenerating || isImporting}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
          {keyStatus.hasKey && (
            <Button
              size={ButtonSize.small}
              onClick={handleExportKey}
              label={t("Common:ExportKey")}
              isLoading={isExporting}
              isDisabled={isGenerating || isImporting || isExporting}
            />
          )}
        </div>
      </div>
      <PassphraseModal
        visible={showPassphraseModal}
        onSubmit={handleGenerateKey}
        onCancel={() => {
          setShowPassphraseModal(false);
          setPendingAction(null);
        }}
        isNew={!keyStatus.hasKey || pendingAction === "generate"}
        isLoading={isGenerating}
      />
      <ConfirmationModal
        visible={showConfirmReplace}
        title={t("Common:ReplaceKey")}
        message={t("Common:ReplaceKeyWarning")}
        onConfirm={handleConfirmReplace}
        onCancel={() => {
          setShowConfirmReplace(false);
          setPendingAction(null);
          setImportedKeyData(null);
        }}
      />
    </div>
  );
};

export default inject(({ userStore }: TStore) => {
  const { encryptionKeys, setUserEncryptionKeys } = userStore;
  const firstKey =
    encryptionKeys && encryptionKeys.length > 0 ? encryptionKeys[0] : null;
  return {
    encryptionKeys: firstKey,
    setUserEncryptionKeys,
  };
})(observer(KeysManagement));
