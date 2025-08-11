// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "../../../../components/text";
import { Link, LinkTarget } from "../../../../components/link";

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
