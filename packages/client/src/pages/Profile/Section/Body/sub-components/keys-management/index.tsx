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

import React, { useState, useCallback, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

import {
  generateRSAKeyPair,
  serializeKeyPair,
  exportKeyToFile,
  importKeyFromFile,
  getPublicKeyFingerprint,
} from "@docspace/shared/services/encryption/keyManagement";
import { SecretStorageService } from "@docspace/shared/services/encryption/secretStorage";
import type { SerializedKeyPair } from "@docspace/shared/services/encryption/types";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import {
  setEncryptionKeys,
  deleteEncryptionKey,
} from "@docspace/shared/api/privacy";

import { KeysList } from "./KeysList";
import { PassphraseModal } from "./PassphraseModal";
import { ConfirmationModal } from "./ConfirmationModal";

import styles from "./keys-management.module.scss";

type KeysManagementProps = {
  encryptionKeys?: TEncryptionKeyPair[] | null;
  setUserEncryptionKeys?: (keys: TEncryptionKeyPair[]) => void;
};

const KeysManagement = ({
  encryptionKeys,
  setUserEncryptionKeys,
}: KeysManagementProps) => {
  const { t } = useTranslation(["Common"]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [showConfirmReplace, setShowConfirmReplace] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "generate" | "import" | null
  >(null);
  const [pendingDeleteKeyId, setPendingDeleteKeyId] = useState<string | null>(
    null,
  );
  const [importedKeyData, setImportedKeyData] =
    useState<SerializedKeyPair | null>(null);

  const hasKeys = encryptionKeys && encryptionKeys.length > 0;

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

        const existingKeys = encryptionKeys || [];
        const newKey: TEncryptionKeyPair = {
          id: crypto.randomUUID(),
          publicKey: serialized.publicKey,
          privateKeyEnc: serialized.privateKeyEnc,
          userId: "",
          date: new Date().toISOString(),
        };
        setUserEncryptionKeys?.([...existingKeys, newKey]);
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
    [t, setUserEncryptionKeys, encryptionKeys],
  );

  const handleExportSingleKey = useCallback(
    async (keyData: TEncryptionKeyPair) => {
      try {
        const blob = exportKeyToFile({
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

  const handleImportFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImporting(true);

      try {
        const keyData = await importKeyFromFile(file);
        setImportedKeyData(keyData);

        if (hasKeys) {
          setPendingAction("import");
          setShowConfirmReplace(true);
        } else {
          await setEncryptionKeys({
            publicKey: keyData.publicKey,
            privateKeyEnc: keyData.privateKeyEnc,
          });
          const newKey: TEncryptionKeyPair = {
            id: crypto.randomUUID(),
            publicKey: keyData.publicKey,
            privateKeyEnc: keyData.privateKeyEnc,
            userId: "",
            date: new Date().toISOString(),
          };
          setUserEncryptionKeys?.([newKey]);
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
    [hasKeys, t, setUserEncryptionKeys],
  );

  const handleConfirmReplace = useCallback(async () => {
    if (pendingAction === "import" && importedKeyData) {
      try {
        await setEncryptionKeys({
          publicKey: importedKeyData.publicKey,
          privateKeyEnc: importedKeyData.privateKeyEnc,
          update: true,
        });
        const newKey: TEncryptionKeyPair = {
          id: crypto.randomUUID(),
          publicKey: importedKeyData.publicKey,
          privateKeyEnc: importedKeyData.privateKeyEnc,
          userId: "",
          date: new Date().toISOString(),
        };
        setUserEncryptionKeys?.([newKey]);
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
    if (hasKeys) {
      setPendingAction("generate");
      setShowConfirmReplace(true);
    } else {
      setShowPassphraseModal(true);
      setPendingAction("generate");
    }
  }, [hasKeys]);

  const handleDeleteKeyRequest = useCallback((keyId: string) => {
    setPendingDeleteKeyId(keyId);
    setShowConfirmDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteKeyId) return;

    setIsDeleting(true);
    setDeletingKeyId(pendingDeleteKeyId);
    setShowConfirmDelete(false);

    try {
      await deleteEncryptionKey(pendingDeleteKeyId);
      // Filter out the deleted key from local state instead of using API response
      // (backend may auto-generate new keys which we don't want)
      const remainingKeys = (encryptionKeys || []).filter(
        (key) => key.id !== pendingDeleteKeyId,
      );
      setUserEncryptionKeys?.(remainingKeys);
      SecretStorageService.clearCache();
      toastr.success(t("Common:EncryptionKeyDeleted"));
    } catch (error) {
      toastr.error(t("Common:EncryptionError"));
      console.error("Key deletion failed:", error);
    } finally {
      setIsDeleting(false);
      setDeletingKeyId(null);
      setPendingDeleteKeyId(null);
    }
  }, [pendingDeleteKeyId, t, setUserEncryptionKeys, encryptionKeys]);

  return (
    <div className={styles.sectionBody}>
      <KeysList
        keys={encryptionKeys || []}
        onDelete={handleDeleteKeyRequest}
        onExport={handleExportSingleKey}
        isDeleting={isDeleting}
        deletingKeyId={deletingKeyId}
      />
      <div className={styles.contentBody}>
        <div className={styles.inputGroup}>
          <Button
            size={ButtonSize.small}
            onClick={requestGenerateKey}
            label={t("Common:GenerateNewKey")}
            isLoading={isGenerating}
            isDisabled={isGenerating || isImporting || isDeleting}
          />
          <div className={styles.buttonsSeparator}>{t("Common:Or")}</div>
          <Button
            primary
            size={ButtonSize.small}
            onClick={() => fileInputRef.current?.click()}
            label={t("Common:ImportKey")}
            isLoading={isImporting}
            isDisabled={isGenerating || isImporting || isDeleting}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
        </div>
      </div>
      <PassphraseModal
        visible={showPassphraseModal}
        onSubmit={handleGenerateKey}
        onCancel={() => {
          setShowPassphraseModal(false);
          setPendingAction(null);
        }}
        isNew={!hasKeys || pendingAction === "generate"}
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
      <ConfirmationModal
        visible={showConfirmDelete}
        title={t("Common:DeleteKey")}
        message={t("Common:DeleteKeyWarning")}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirmDelete(false);
          setPendingDeleteKeyId(null);
        }}
      />
    </div>
  );
};

export default inject(({ userStore }: TStore) => {
  const { encryptionKeys, setUserEncryptionKeys } = userStore;
  return {
    encryptionKeys,
    setUserEncryptionKeys,
  };
})(observer(KeysManagement));
