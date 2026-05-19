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

"use client";

import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Link } from "@docspace/ui-kit/components/link";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { EncryptionStatus } from "@docspace/shared/enums";
import type { TPortals } from "@docspace/shared/api/management/types";

import { EncryptWarningDialog } from "./EncryptWarningDialog";
import styles from "./encrypt-data.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type EncryptDataPageProps = {
  portals: TPortals[];
  encryptionBlockHelpUrl: string;
  isNotify: boolean;
  status: number;
};

const EncryptDataPage = ({
  portals,
  encryptionBlockHelpUrl,
  isNotify,
  status,
}: EncryptDataPageProps) => {
  const { t } = useTranslation(["Management", "Common"]);
  const { currentColorScheme } = useTheme();
  const [encryptWarningDialogVisible, setEncryptWarningDialogVisible] =
    useState(false);
  const [isNotifyChecked, setIsNotifyChecked] = useState(isNotify);

  const isDisabled = portals.length <= 1;

  return (
    <>
      {encryptWarningDialogVisible ? (
        <EncryptWarningDialog
          encryptWarningDialogVisible={encryptWarningDialogVisible}
          setEncryptWarningDialogVisible={setEncryptWarningDialogVisible}
          isNotifyChecked={isNotifyChecked}
          status={status}
        />
      ) : null}
      <div
        className={classNames(styles.wrapper, {
          [styles.disabled]: isDisabled,
        })}
        data-testid="encrypt-data-page"
      >
        <div className={styles.header}>
          <Text fontSize="16px" fontWeight={700}>
            {t("EncryptData")}
          </Text>
          {status === EncryptionStatus.Encrypted ? (
            <div className={styles.badge}>
              <Text fontSize="14px" fontWeight={600}>
                {t("StorageEncrypted")}
              </Text>
            </div>
          ) : null}
        </div>
        <Text>
          {t("EncryptDataDescription", {
            organizationName: getBrandName("OrganizationName"),
          })}
        </Text>
        <div className={styles.wrapperBlock}>
          <Text fontSize="16px" fontWeight={700}>
            {t("Common:Warning")}!
          </Text>
          <Text className={styles.description}>
            {t("EncryptDataWarningDescription")}
          </Text>
          {encryptionBlockHelpUrl ? (
            <Text>
              <Trans
                t={t}
                i18nKey="MoreDetails"
                ns="Management"
                values={{ link: t("Common:HelpCenter") }}
                components={{
                  1: (
                    <Link
                      key="more-details-link"
                      className="link"
                      color={currentColorScheme?.main?.accent ?? undefined}
                      href={encryptionBlockHelpUrl}
                    />
                  ),
                }}
              />
            </Text>
          ) : null}
          <Checkbox
            className={styles.checkbox}
            label={t("NotifyUsers")}
            onChange={() => setIsNotifyChecked(!isNotifyChecked)}
            isChecked={isNotifyChecked}
            isDisabled={isDisabled}
          />
          <Button
            primary
            label={
              status === EncryptionStatus.Encrypted
                ? t("DecryptStorage")
                : t("EncryptStorage")
            }
            size={ButtonSize.normal}
            onClick={() => setEncryptWarningDialogVisible(true)}
            isDisabled={isDisabled}
          />
        </div>
      </div>
    </>
  );
};

export default EncryptDataPage;
