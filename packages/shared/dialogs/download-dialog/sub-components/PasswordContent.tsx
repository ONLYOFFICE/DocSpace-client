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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import InfoSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";

import styles from "../DownloadDialog.module.scss";
import { ProtectedFileCategoryType } from "../DownloadDialog.enums";
import type {
  PasswordContentProps,
  TDownloadedFile,
} from "../DownloadDialog.types";
import { PasswordRow } from "./PasswordRow";

export const PasswordContent = (props: PasswordContentProps) => {
  const {
    getItemIcon,
    sortedDownloadFiles,
    resetDownloadedFileFormat,
    discardDownloadedFile,
    updateDownloadedFilePassword,
  } = props;
  const { t } = useTranslation(["Common"]);

  const [barIsVisible, setBarIsVisible] = useState(true);

  const onClose = () => {
    setBarIsVisible(false);
  };

  const { original, other, remove, password } = sortedDownloadFiles;

  const passwordRow = (
    items: TDownloadedFile[],
    text: string,
    type: ProtectedFileCategoryType,
    className?: string,
  ) => {
    return (
      <div className={styles.passwordRowWrapper}>
        <div className={classNames(styles.passwordInfoText, className)}>
          <Text fontWeight={600} fontSize="14px">
            {text}
          </Text>
        </div>
        <div>
          {items.map((item) => {
            return (
              <PasswordRow
                key={item.id}
                item={item}
                type={type}
                getItemIcon={getItemIcon}
                resetDownloadedFileFormat={resetDownloadedFileFormat}
                discardDownloadedFile={discardDownloadedFile}
                updateDownloadedFilePassword={updateDownloadedFilePassword}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.downloadDialogPasswordContent}
      data-testid="password-content"
    >
      {barIsVisible ? (
        <PublicRoomBar
          headerText={t("Common:ProtectedFiles")}
          bodyText={t("Common:FileProtectionMessage")}
          iconName={InfoSvgUrl}
          onClose={onClose}
        />
      ) : null}
      {other && other?.length > 0
        ? passwordRow(
            other,
            t("Common:PasswordRequired"),
            ProtectedFileCategoryType.Other,
            styles.warningColor,
          )
        : null}
      {original && original?.length > 0
        ? passwordRow(
            original,
            t("Common:DownloadOriginalFormat"),
            ProtectedFileCategoryType.Original,
          )
        : null}
      {password && password?.length > 0
        ? passwordRow(
            password,
            t("Common:PasswordEntered"),
            ProtectedFileCategoryType.Password,
          )
        : null}
      {remove && remove?.length > 0
        ? passwordRow(
            remove,
            t("Common:RemovedFromList"),
            ProtectedFileCategoryType.Remove,
          )
        : null}
    </div>
  );
};
