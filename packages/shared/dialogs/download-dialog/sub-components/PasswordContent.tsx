/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import InfoSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { Text } from "../../../components/text";
import PublicRoomBar from "../../../components/public-room-bar";

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
