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
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";

import { useEncryption } from "@docspace/shared/context/encryption";
import { getPublicKeyFingerprint } from "@docspace/shared/services/encryption/identity";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";

import styles from "./KeysManagement.module.scss";

type KeyItemProps = {
  keyData: TEncryptionKeyPair;
  onDelete: (keyData: TEncryptionKeyPair) => void;
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
  const { t } = useTranslation(["Common", "People"]);
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
    onDelete(keyData);
  }, [onDelete, keyData]);

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
      <div className={styles.keyItemContent}>
        <div className={styles.detailsGrid} data-testid="key_details">
          <Text fontSize="13px" className={styles.detailsLabel}>
            {t("People:UserStatus")}
          </Text>
          <div className={styles.statusRow}>
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
                iconName={PencilReactSvgUrl}
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
          {createdDate ? (
            <>
              <Text fontSize="13px" className={styles.detailsLabel}>
                {t("Common:KeyCreatedOn")}
              </Text>
              <Text fontSize="13px">{createdDate}</Text>
            </>
          ) : null}
          <Text fontSize="13px" className={styles.detailsLabel}>
            {t("Common:KeyFingerprint")}
          </Text>
          <Text fontSize="13px" className={styles.monoValue}>
            {fingerprint || "..."}
          </Text>
          {keyData.id ? (
            <>
              <Text fontSize="13px" className={styles.detailsLabel}>
                {t("Common:KeyId")}
              </Text>
              <Text fontSize="13px" className={styles.monoValue}>
                {keyData.id}
              </Text>
            </>
          ) : null}
          <Text fontSize="13px" className={styles.detailsLabel}>
            {t("Common:Algorithm")}
          </Text>
          <Text fontSize="13px">X25519</Text>
        </div>
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
  onDelete: (keyData: TEncryptionKeyPair) => void;
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
