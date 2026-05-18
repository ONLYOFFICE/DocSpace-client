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

import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Badge } from "@docspace/ui-kit/components/badge";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { LANGUAGE } from "@docspace/ui-kit/constants";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { useEncryption } from "@docspace/shared/context/encryption";
import { getPublicKeyFingerprint } from "@docspace/shared/services/encryption/identity";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import styles from "./KeysManagement.module.scss";

type KeyItemProps = {
  keyData: TEncryptionKeyPair;
  onDelete: (keyId: string) => void;
  onExport: (keyData: TEncryptionKeyPair) => void;
  onRotate: (keyData: TEncryptionKeyPair) => void;
  onSelectActive: (keyId: string) => void;
  isDeleting: boolean;
  deletingKeyId: string | null;
  isCurrentDevice: boolean;
  canSwitchActive: boolean;
};

const KeyItem: React.FC<KeyItemProps> = ({
  keyData,
  onDelete,
  onExport,
  onRotate,
  onSelectActive,
  isDeleting,
  deletingKeyId,
  isCurrentDevice,
  canSwitchActive,
}) => {
  const { t } = useTranslation(["Common"]);
  const [fingerprint, setFingerprint] = useState<string>("");

  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const fp = await getPublicKeyFingerprint(keyData.publicKey);
        setFingerprint(fp);
      } catch (error) {
        console.error("Failed to get fingerprint:", error);
        setFingerprint("...");
      }
    };
    loadFingerprint();
  }, [keyData.publicKey]);

  const handleDelete = useCallback(() => {
    onDelete(keyData.id);
  }, [onDelete, keyData.id]);

  const handleExport = useCallback(() => {
    onExport(keyData);
  }, [onExport, keyData]);

  const handleRotate = useCallback(() => {
    onRotate(keyData);
  }, [onRotate, keyData]);

  const handleSelectActive = useCallback(() => {
    onSelectActive(keyData.id);
  }, [onSelectActive, keyData.id]);

  const isCurrentlyDeleting = isDeleting && deletingKeyId === keyData.id;
  const locale = getCookie(LANGUAGE) || "";
  const createdDate = keyData.date
    ? getCorrectDate(locale, keyData.date)
    : null;

  return (
    <div className={styles.keyItem}>
      <div className={styles.keyItemHeader}>
        <div className={styles.keyItemBadges}>
          <Badge
            label={t("Common:Active")}
            backgroundColor={globalColors.secondGreen}
            maxWidth="none"
          />
          {isCurrentDevice ? (
            <Badge
              label={t("Common:ThisDevice")}
              backgroundColor={globalColors.lightBlueMain}
              maxWidth="none"
            />
          ) : canSwitchActive ? (
            <Button
              size={ButtonSize.extraSmall}
              label={t("Common:UseOnThisDevice")}
              onClick={handleSelectActive}
              isDisabled={isDeleting}
            />
          ) : null}
        </div>
        <div className={styles.keyItemActions}>
          <IconButton
            className={styles.actionButton}
            iconName={RefreshReactSvgUrl}
            size={16}
            onClick={handleRotate}
            isDisabled={isDeleting}
            title={t("Common:ChangePassphrase")}
          />
          <IconButton
            className={styles.actionButton}
            iconName={DownloadReactSvgUrl}
            size={16}
            onClick={handleExport}
            isDisabled={isDeleting}
            title={t("Common:ExportKey")}
          />
          <IconButton
            className={styles.actionButton}
            iconName={TrashReactSvgUrl}
            size={16}
            onClick={handleDelete}
            isDisabled={isDeleting}
            title={t("Common:Delete")}
          />
        </div>
      </div>
      <div className={styles.keyItemContent}>
        <div className={styles.keyInfo}>
          <Text fontSize="13px" fontWeight={600}>
            {t("Common:KeyFingerprint")}:
          </Text>
          <Text fontSize="13px" className={styles.fingerprint}>
            {fingerprint || "..."}
          </Text>
        </div>
        {createdDate && (
          <div className={styles.keyInfo}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:KeyCreatedOn")}:
            </Text>
            <Text fontSize="13px">{createdDate}</Text>
          </div>
        )}
        <div className={styles.keyInfo}>
          <Text fontSize="13px" fontWeight={600}>
            {t("Common:Algorithm")}:
          </Text>
          <Text fontSize="13px">ECDH P-256</Text>
        </div>
        {keyData.id && (
          <div className={styles.keyInfo}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:KeyId")}:
            </Text>
            <Text fontSize="13px" className={styles.keyIdText}>
              {keyData.id.slice(0, 8)}...
            </Text>
          </div>
        )}
      </div>
      {isCurrentlyDeleting && (
        <div className={styles.keyItemOverlay}>
          <Text fontSize="13px">{t("Common:Deleting")}...</Text>
        </div>
      )}
    </div>
  );
};

type KeysListProps = {
  keys: TEncryptionKeyPair[];
  onDelete: (keyId: string) => void;
  onExport: (keyData: TEncryptionKeyPair) => void;
  onRotate: (keyData: TEncryptionKeyPair) => void;
  onSelectActive: (keyId: string) => void;
  isDeleting: boolean;
  deletingKeyId: string | null;
};

export const KeysList: React.FC<KeysListProps> = ({
  keys,
  onDelete,
  onExport,
  onRotate,
  onSelectActive,
  isDeleting,
  deletingKeyId,
}) => {
  const { t } = useTranslation(["Common"]);
  const { publicKey: currentPublicKey } = useEncryption();

  if (!keys || keys.length === 0) {
    return (
      <div className={styles.noKeys}>
        <Badge
          label={t("Common:NoKey")}
          backgroundColor={globalColors.mainOrange}
          maxWidth="none"
        />
        <Text fontSize="13px" color={globalColors.gray}>
          {t("Common:NoEncryptionKey")}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.keysList}>
      <Text fontSize="14px" fontWeight={600} className={styles.keysListTitle}>
        {t("Common:EncryptionKeys")} ({keys.length})
      </Text>
      <div className={styles.keysListItems}>
        {keys.map((key) => (
          <KeyItem
            key={key.id}
            keyData={key}
            onDelete={onDelete}
            onExport={onExport}
            onRotate={onRotate}
            onSelectActive={onSelectActive}
            isDeleting={isDeleting}
            deletingKeyId={deletingKeyId}
            isCurrentDevice={
              !!currentPublicKey && key.publicKey === currentPublicKey
            }
            canSwitchActive={keys.length > 1}
          />
        ))}
      </div>
    </div>
  );
};
