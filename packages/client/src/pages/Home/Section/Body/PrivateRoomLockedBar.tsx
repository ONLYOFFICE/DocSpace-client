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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import PublicRoomBar from "@onlyoffice/apps-ui-kit/components/public-room-bar";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";
import { useEncryption } from "@docspace/shared/context/encryption";

import {
  getOpenRoomId,
  roomUnlockRequest,
} from "SRC_DIR/helpers/roomUnlockRequest";

import styles from "./PrivateRoomLockedBar.module.scss";

type PrivateRoomLockedBarProps = {
  /** The open folder is a private room or lies inside one. */
  isPrivate: boolean;
  /** The room the open folder belongs to. */
  roomId: number | string | null | undefined;
  syncEncryptedRoom?: () => void;
};

/**
 * The bar at the top of a private room while the user's key is locked: it
 * says why the file names are opaque and unlocks the key. It waits for the
 * unlock request the room raises on entry, so it is not shown under that
 * dialog or on a device that unlocks without one.
 * Spec: private-rooms/key-management, "A locked key is shown in a private room"
 */
const PrivateRoomLockedBar = ({
  isPrivate,
  roomId,
  syncEncryptedRoom,
}: PrivateRoomLockedBarProps) => {
  const { t } = useTranslation(["Common"]);
  const { isUnlocked, hasConfiguredKey, keysLoaded, requireIdentity } =
    useEncryption();

  if (!isPrivate || !keysLoaded || !hasConfiguredKey || isUnlocked) return null;
  if (roomId == null || roomUnlockRequest.settledRoomId !== roomId)
    return null;

  const onUnlock = () => {
    void requireIdentity().then((identity) => {
      if (identity) syncEncryptedRoom?.();
    });
  };

  return (
    <PublicRoomBar
      headerText={t("Common:PrivateRoomLockedBarTitle")}
      bodyText={
        <>
          {t("Common:PrivateRoomLockedBarText")}{" "}
          <Link
            type={LinkType.action}
            isHovered
            fontWeight={600}
            onClick={onUnlock}
            dataTestId="private_room_locked_bar_unlock"
          >
            {t("Common:UnlockKey")}
          </Link>
        </>
      }
      iconName={InfoReactSvgUrl}
      barIsVisible
      live
      className={styles.bar}
      dataTestId="private_room_locked_bar"
    />
  );
};

export default inject(
  ({ selectedFolderStore, filesStore, treeFoldersStore }: TStore) => ({
    // A folder inside a private room is not private itself; its room is.
    isPrivate: !!treeFoldersStore.isPrivacyFolder,
    roomId: getOpenRoomId(selectedFolderStore),
    syncEncryptedRoom: filesStore.syncEncryptedRoom,
  }),
)(observer(PrivateRoomLockedBar));
