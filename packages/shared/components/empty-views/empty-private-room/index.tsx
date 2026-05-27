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
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import EmptyPrivateRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.private.room.light.svg";
import EmptyPrivateRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.private.room.dark.svg";
import UploadDeviceIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";
import CreateNewFolderIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import SecurityShieldIcon from "PUBLIC_DIR/images/icons/16/security.react.svg";

import styles from "./EmptyPrivateRoomView.module.scss";

export type EmptyPrivateRoomViewProps = {
  /**
   * Whether the user has Create permission. When false, action buttons are
   * hidden (read-only members see the benefits list only).
   */
  canCreate?: boolean;
  /** Invoked when the user clicks "New folder". */
  onCreateFolder?: () => void;
  /** Invoked when the user clicks "Upload from device". */
  onUploadFiles?: () => void;
};

export const EmptyPrivateRoomView: React.FC<EmptyPrivateRoomViewProps> = ({
  canCreate = false,
  onCreateFolder,
  onUploadFiles,
}) => {
  // Keys live in Common (root /public/locales) so the SDK can load them. The
  // main client also imports this component and resolves the same Common
  // namespace, so there's a single source of truth across both consumers.
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const items = [
    t("Common:PrivateRoomEmptyBenefitE2EE"),
    t("Common:PrivateRoomEmptyBenefitAEAD"),
    t("Common:PrivateRoomEmptyBenefitHPKE"),
    t("Common:PrivateRoomEmptyBenefitKDF"),
  ];

  return (
    <div className={styles.wrapper} data-testid="empty-private-room-view">
      <div className={styles.icon}>
        {isBase ? <EmptyPrivateRoomLightIcon /> : <EmptyPrivateRoomDarkIcon />}
      </div>
      <h3 className={styles.title}>{t("Common:PrivateRoomEmptyTitle")}</h3>
      <ul className={styles.list}>
        {items.map((text) => (
          <li key={text} className={styles.listItem}>
            <SecurityShieldIcon />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {canCreate ? (
        <div className={styles.actions}>
          {onCreateFolder ? (
            <button
              type="button"
              className={styles.actionItem}
              onClick={onCreateFolder}
            >
              <CreateNewFolderIcon />
              <span className={styles.actionBody}>
                <span className={styles.actionTitle}>
                  {t("Common:NewFolder")}
                </span>
                <span className={styles.actionDescription}>
                  {t("Common:PrivateRoomEmptyCreateFolderDescription")}
                </span>
              </span>
            </button>
          ) : null}
          {onUploadFiles ? (
            <button
              type="button"
              className={styles.actionItem}
              onClick={onUploadFiles}
            >
              <UploadDeviceIcon />
              <span className={styles.actionBody}>
                <span className={styles.actionTitle}>
                  {t("Common:PrivateRoomEmptyUploadTitle")}
                </span>
                <span className={styles.actionDescription}>
                  {t("Common:PrivateRoomEmptyUploadDescription")}
                </span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default EmptyPrivateRoomView;
