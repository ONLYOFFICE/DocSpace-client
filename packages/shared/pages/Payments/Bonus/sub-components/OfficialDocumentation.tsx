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
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";

import styles from "../Bonus.module.scss";

export const OfficialDocumentation = ({
  dataBackupUrl,
  enterpriseInstallScriptUrl,
  enterpriseInstallWindowsUrl,
}: {
  dataBackupUrl: string;
  enterpriseInstallScriptUrl: string;
  enterpriseInstallWindowsUrl: string;
}) => {
  const { t } = useTranslation("Common");

  return (
    <div className={styles.bonus}>
      <div className={styles.officialDocumentation}>
        —
        <Text fontWeight={600}>
          {t("UpgradeToProBannerInstructionItemDocker")}{" "}
          <Link
            tag="a"
            fontSize="13px"
            fontWeight="600"
            href={enterpriseInstallScriptUrl}
            target={LinkTarget.blank}
            color="accent"
            dataTestId="enterprise_install_script_docker_link"
          >
            {t("UpgradeToProBannerInstructionReadNow")}
          </Link>
        </Text>
        —
        <Text fontWeight={600}>
          {t("UpgradeToProBannerInstructionItemLinux")}{" "}
          <Link
            tag="a"
            fontSize="13px"
            fontWeight="600"
            href={enterpriseInstallScriptUrl}
            target={LinkTarget.blank}
            color="accent"
            dataTestId="enterprise_install_script_linux_link"
          >
            {t("UpgradeToProBannerInstructionReadNow")}
          </Link>
        </Text>
        —
        <Text fontWeight={600}>
          {t("UpgradeToProBannerInstructionItemWindows")}{" "}
          <Link
            tag="a"
            fontSize="13px"
            fontWeight="600"
            href={enterpriseInstallWindowsUrl}
            target={LinkTarget.blank}
            color="accent"
            dataTestId="enterprise_install_script_windows_link"
          >
            {t("UpgradeToProBannerInstructionReadNow")}
          </Link>
        </Text>
      </div>

      <Text className={styles.upgradeInfo}>
        <Trans i18nKey="UpgradeToProBannerInstructionNote" ns="Common" t={t}>
          Please note that the editors will be unavailable during the upgrade.
          We also recommend to
          <Link
            tag="a"
            fontWeight="600"
            href={dataBackupUrl}
            target={LinkTarget.blank}
            color="accent"
            dataTestId="data_backup_link"
          >
            backup your data
          </Link>
          before you start.
        </Trans>
      </Text>
    </div>
  );
};
