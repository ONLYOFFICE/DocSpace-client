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
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import Security12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/security.react.svg?url";
import Lock12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/lock.react.svg?url";

import styles from "./EncryptedItemIcon.module.scss";

// Pure presentational badge — composes with any base icon (RoomIcon, file
// icon, custom) so consumers don't have to duplicate the badge positioning
// logic. The room-vs-file padding offset is handled internally so callers
// only pass `isRoomIcon` for layout adjustments.

export type EncryptedItemIconBadgeProps = {
  /** File is in encrypted form on the server (DSE3). */
  encrypted: boolean;
  /** Current user has at least one configured encryption envelope. */
  hasEncryptionKeys: boolean;
  /** Layout differs slightly for room thumbnails vs file icons. */
  isRoomIcon?: boolean;
};

export const EncryptedItemIconBadge: React.FC<EncryptedItemIconBadgeProps> = ({
  encrypted,
  hasEncryptionKeys,
  isRoomIcon = false,
}) => {
  const { t } = useTranslation(["Common"]);
  if (!encrypted) return null;

  const showNoAccess = !hasEncryptionKeys;
  const src = showNoAccess ? Lock12ReactSvgUrl : Security12ReactSvgUrl;
  const title = showNoAccess
    ? t("Common:NoAccessToEncryptedFile")
    : t("Common:EncryptedFile");

  return (
    <ReactSVG
      className={classNames(styles.encryptedFileIcon, {
        [styles.noAccessIcon]: showNoAccess,
        [styles.isFileIcon]: !isRoomIcon,
      })}
      src={src}
      title={title}
    />
  );
};

export type EncryptedItemIconWrapperProps = {
  encrypted?: boolean;
  hasEncryptionKeys?: boolean;
  isRoom?: boolean;
  children: React.ReactNode;
};

/**
 * Wrap a base icon so the encrypted badge is positioned correctly relative
 * to the icon container. Use this when consumers don't need fine-grained
 * control over the badge placement.
 */
export const EncryptedItemIconWrapper: React.FC<
  EncryptedItemIconWrapperProps
> = ({ encrypted = false, hasEncryptionKeys = false, isRoom = false, children }) => {
  const showBadge = !!encrypted;
  return (
    <div
      className={classNames(styles.iconWrapper, {
        [styles.isRoom]: isRoom,
        [styles.hasEncryptedBadge]: showBadge,
      })}
    >
      {children}
      {showBadge ? (
        <EncryptedItemIconBadge
          encrypted={encrypted}
          hasEncryptionKeys={hasEncryptionKeys}
          isRoomIcon={isRoom}
        />
      ) : null}
    </div>
  );
};
