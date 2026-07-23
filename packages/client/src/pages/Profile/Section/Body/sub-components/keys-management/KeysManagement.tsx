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

import { useCallback, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useEncryption } from "@docspace/shared/context/encryption";
import { setActiveKeyId } from "@docspace/shared/services/encryption/active-key-preference";
import {
  forgetDeviceUnlock,
  hasDeviceUnlock,
} from "@docspace/shared/services/encryption/device-unlock-store";
import {
  enrollPasskeyUnlock,
  hasPasskeyUnlock,
  isPasskeyUnlockAvailable,
  removePasskeyUnlock,
} from "@docspace/shared/services/encryption/passkey-unlock";
import { getBrandName } from "@docspace/shared/constants/brands";
import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import { getEncryptionKeys } from "@docspace/shared/api/privacy";

import { AutoLockSetting } from "./AutoLockSetting";
import { KeysList } from "./KeysList";
import { useGenerateKeyFlow } from "@docspace/shared/dialogs/key-generation";
import { useRecoverKeyFlow } from "@docspace/shared/dialogs/key-recovery";
import { useImportKeyFlow } from "./flows/useImportKeyFlow";
import { useDeleteKeyFlow } from "./flows/useDeleteKeyFlow";
import { useExportKeyFlow } from "./flows/useExportKeyFlow";
import { useRotatePassphraseFlow } from "./flows/useRotatePassphraseFlow";
import { useResetKeysFlow } from "./flows/useResetKeysFlow";
import { useRotateIdentityForRooms } from "./flows/useRotateIdentityForRooms";

import styles from "./KeysManagement.module.scss";

type KeysManagementProps = {
  encryptionKeys?: TEncryptionKeyPair[] | null;
  setUserEncryptionKeys?: (keys: TEncryptionKeyPair[]) => void;
  userId?: string;
  userEmail?: string;
};

const KeysManagement = ({
  encryptionKeys,
  setUserEncryptionKeys,
  userId,
  userEmail,
}: KeysManagementProps) => {
  const { t } = useTranslation(["Common"]);
  const { isUnlocked, lock, getIdentity, requireIdentity, publicKey } =
    useEncryption();
  const [deviceRemembered, setDeviceRemembered] = useState(false);
  const [passkeyPlatformOk, setPasskeyPlatformOk] = useState(false);
  const [passkeyEnrolled, setPasskeyEnrolled] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);

  const hasKeys = !!encryptionKeys && encryptionKeys.length > 0;

  useEffect(() => {
    if (!userId) {
      setDeviceRemembered(false);
      return undefined;
    }
    let cancelled = false;
    void hasDeviceUnlock(userId).then((remembered) => {
      if (!cancelled) setDeviceRemembered(remembered);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, isUnlocked]);

  const handleForgetDevice = useCallback(() => {
    if (!userId) return;
    void forgetDeviceUnlock(userId).then(() => {
      setDeviceRemembered(false);
      toastr.success(t("Common:DeviceUnlockForgotten"));
    });
  }, [userId, t]);

  useEffect(() => {
    let cancelled = false;
    void isPasskeyUnlockAvailable().then((ok) => {
      if (!cancelled) setPasskeyPlatformOk(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setPasskeyEnrolled(false);
      return undefined;
    }
    let cancelled = false;
    void hasPasskeyUnlock(userId, publicKey ?? undefined).then((enrolled) => {
      if (!cancelled) setPasskeyEnrolled(enrolled);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, isUnlocked, publicKey]);

  const handleEnrollPasskey = useCallback(async () => {
    if (!userId || !publicKey) return;
    let identity = getIdentity();
    if (!identity) identity = await requireIdentity();
    if (!identity) return;
    setPasskeyBusy(true);
    try {
      const result = await enrollPasskeyUnlock(userId, publicKey, identity, {
        rpName: getBrandName("ProductName"),
        userName: userEmail || userId,
      });
      if (result === "ok") {
        setPasskeyEnrolled(true);
        toastr.success(t("Common:PasskeyEnabled"));
      } else if (result === "failed") {
        toastr.error(t("Common:PasskeyEnrollFailed"));
      }
    } finally {
      setPasskeyBusy(false);
    }
  }, [userId, publicKey, userEmail, getIdentity, requireIdentity, t]);

  const handleRemovePasskey = useCallback(() => {
    if (!userId) return;
    setPasskeyBusy(true);
    void removePasskeyUnlock(userId)
      .then(() => {
        setPasskeyEnrolled(false);
        toastr.success(t("Common:PasskeyDisabled"));
      })
      .finally(() => setPasskeyBusy(false));
  }, [userId, t]);

  const refreshKeysFromServer = useCallback(async () => {
    try {
      const fresh = await getEncryptionKeys();
      setUserEncryptionKeys?.(fresh ?? []);
    } catch (error) {
      console.error("Failed to refresh keys:", error);
    }
  }, [setUserEncryptionKeys]);

  const { rotationProgress, rotateForAllRooms } = useRotateIdentityForRooms();

  const handleBeforeNewKeyActive = useCallback(
    async (
      oldIdentity: IdentityKeyPair | null,
      newIdentity: IdentityKeyPair,
      currentUserId: string,
      newPublicKeyId: string,
    ) => {
      if (!oldIdentity) {
        if (hasKeys) toastr.warning(t("Common:EncryptionRewrapSkipped"));
        return;
      }
      await rotateForAllRooms(
        oldIdentity,
        newIdentity,
        currentUserId,
        newPublicKeyId,
      );
    },
    [hasKeys, rotateForAllRooms, t],
  );

  const generate = useGenerateKeyFlow({
    userId,
    accountLabel: userEmail,
    refreshKeysFromServer,
    onBeforeNewKeyActive: handleBeforeNewKeyActive,
  });
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

  const isRotating = rotationProgress !== null;

  const busy =
    generate.isPending ||
    importFlow.isPending ||
    remove.isPending ||
    exportFlow.isPending ||
    rotate.isPending ||
    recover.isPending ||
    reset.isPending ||
    isRotating;

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
          {importFlow.fileInput}
        </div>
        <div className={styles.secondaryActions}>
          <Link
            type={LinkType.action}
            fontWeight="600"
            fontSize="13px"
            isHovered
            onClick={() => {
              if (!busy) importFlow.request();
            }}
            dataTestId="import_key_link"
          >
            {t("Common:ImportKey")}
          </Link>
          {recover.available ? (
            <Link
              type={LinkType.action}
              fontWeight="600"
              fontSize="13px"
              isHovered
              onClick={() => {
                if (!busy) recover.request();
              }}
              dataTestId="use_recovery_phrase_link"
            >
              {t("Common:UseRecoveryPhrase")}
            </Link>
          ) : null}
        </div>
        {isRotating && rotationProgress ? (
          <div className={styles.rotationProgress} role="status">
            <span>
              {t("Common:ReEncryptingFiles")} (
              {rotationProgress.roomsDone}/{rotationProgress.roomsTotal})
            </span>
          </div>
        ) : null}
      </div>
      {hasKeys ? (
        <div className={styles.deviceSection}>
          <Text fontSize="14px" fontWeight={600}>
            {t("Common:ThisDevice")}
          </Text>
          <AutoLockSetting />
          {passkeyPlatformOk || passkeyEnrolled ? (
            <div className={styles.deviceRow}>
              <ToggleButton
                label={t("Common:PasskeyUnlockLabel")}
                isChecked={passkeyEnrolled}
                isLoading={passkeyBusy}
                isDisabled={busy || (!passkeyEnrolled && !isUnlocked)}
                onChange={() => {
                  if (passkeyEnrolled) handleRemovePasskey();
                  else void handleEnrollPasskey();
                }}
                dataTestId="passkey_unlock_toggle"
              />
            </div>
          ) : null}
          {deviceRemembered ? (
            <div className={styles.deviceRow}>
              <Text fontSize="13px">{t("Common:RememberDeviceLabel")}</Text>
              <Link
                type={LinkType.action}
                fontWeight="600"
                fontSize="13px"
                isHovered
                onClick={() => {
                  if (!busy) handleForgetDevice();
                }}
                dataTestId="forget_device_link"
              >
                {t("Common:ForgetDeviceButton")}
              </Link>
            </div>
          ) : null}
          {isUnlocked ? (
            <div className={styles.deviceRow}>
              <Link
                type={LinkType.action}
                fontWeight="600"
                fontSize="13px"
                isHovered
                onClick={() => {
                  if (busy) return;
                  lock();
                  setDeviceRemembered(false);
                  toastr.success(t("Common:EncryptionLocked"));
                }}
                dataTestId="lock_now_link"
              >
                {t("Common:LockNow")}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
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
    userEmail: user?.email,
  };
})(observer(KeysManagement));
