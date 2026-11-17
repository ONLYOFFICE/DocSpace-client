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

import { useCallback, useId } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { getEncryptionKeys } from "@docspace/shared/api/privacy";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import { useEncryption } from "@docspace/shared/context/encryption";
import { activateAsButton } from "@docspace/shared/dialogs/key-dialog-keys";
import { useRecoverKeyFlow } from "@docspace/shared/dialogs/key-recovery";

import LockedLightIcon from "PUBLIC_DIR/images/emptyview/private.room.locked.light.svg";
import LockedDarkIcon from "PUBLIC_DIR/images/emptyview/private.room.locked.dark.svg";

import {
  getOpenRoomId,
  roomUnlockRequest,
} from "SRC_DIR/helpers/roomUnlockRequest";

import styles from "./PrivateRoomLockedBlock.module.scss";

type PrivateRoomLockedBlockProps = {
  /** The open folder is a private room or lies inside one. */
  isPrivate: boolean;
  /** The room the open folder belongs to. */
  roomId: number | string | null | undefined;
  syncEncryptedRoom?: () => void;
  userId?: string;
  encryptionKeys?: TEncryptionKeyPair[] | null;
  setUserEncryptionKeys?: (keys: TEncryptionKeyPair[]) => void;
};

/**
 * The block above the file list of a private room while the user's key is
 * locked: it says why the file names are opaque, unlocks the key and leads
 * to the recovery phrase. It waits for the unlock request the room raises on
 * entry, so it is not shown under that dialog or on a device that unlocks
 * without one.
 * Spec: private-rooms/key-management, "A locked key is reported by a block in a private room"
 */
const PrivateRoomLockedBlock = ({
  isPrivate,
  roomId,
  syncEncryptedRoom,
  userId,
  encryptionKeys,
  setUserEncryptionKeys,
}: PrivateRoomLockedBlockProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const navigate = useNavigate();
  const titleId = useId();
  const { isUnlocked, hasConfiguredKey, keysLoaded, requireIdentity } =
    useEncryption();

  const refreshKeysFromServer = useCallback(async () => {
    try {
      const fresh = await getEncryptionKeys();
      setUserEncryptionKeys?.(fresh ?? []);
    } catch (e) {
      console.error("Failed to refresh keys:", e);
    }
  }, [setUserEncryptionKeys]);

  const onRecovered = useCallback(
    (recovered: unknown) => {
      if (recovered) syncEncryptedRoom?.();
    },
    [syncEncryptedRoom],
  );

  const recover = useRecoverKeyFlow({
    userId,
    encryptionKeys,
    refreshKeysFromServer,
    onClosed: onRecovered,
  });

  if (!isPrivate || !keysLoaded || !hasConfiguredKey || isUnlocked)
    return recover.modals;
  if (roomId == null || roomUnlockRequest.settledRoomId !== roomId)
    return recover.modals;

  const onUnlock = () => {
    void requireIdentity().then((identity) => {
      if (identity) syncEncryptedRoom?.();
    });
  };

  const onForgotPassphrase = () => {
    if (recover.available) {
      recover.request();
      return;
    }
    navigate("/profile/keys-management");
  };

  return (
    <>
      <section
        className={styles.block}
        aria-labelledby={titleId}
        data-testid="private_room_locked_block"
      >
        <div className={styles.illustration} aria-hidden="true">
          {isBase ? <LockedLightIcon /> : <LockedDarkIcon />}
        </div>
        <div className={styles.body}>
          <Text
            as="h2"
            id={titleId}
            fontSize="16px"
            fontWeight={700}
          >
            {t("Common:PrivateRoomLockedBarTitle")}
          </Text>
          <Text fontSize="13px" className={styles.text}>
            {t("Common:PrivateRoomLockedBarText")}
          </Text>
          <div className={styles.actions}>
            <Button
              primary
              size={ButtonSize.small}
              label={t("Common:UnlockKey")}
              onClick={onUnlock}
              testId="private_room_locked_block_unlock"
            />
            <Link
              type={LinkType.action}
              fontSize="13px"
              fontWeight={600}
              isHovered
              onClick={onForgotPassphrase}
              role="button"
              tabIndex={0}
              onKeyDown={activateAsButton}
              dataTestId="private_room_locked_block_forgot"
            >
              {t("Common:ForgotPassphrase")}
            </Link>
          </div>
        </div>
      </section>
      {recover.modals}
    </>
  );
};

export default inject(
  ({ selectedFolderStore, filesStore, treeFoldersStore, userStore }: TStore) => ({
    // A folder inside a private room is not private itself; its room is.
    isPrivate: !!treeFoldersStore.isPrivacyFolder,
    roomId: getOpenRoomId(selectedFolderStore),
    syncEncryptedRoom: filesStore.syncEncryptedRoom,
    userId: userStore.user?.id ? String(userStore.user.id) : undefined,
    encryptionKeys: userStore.encryptionKeys,
    setUserEncryptionKeys: userStore.setUserEncryptionKeys,
  }),
)(observer(PrivateRoomLockedBlock));
