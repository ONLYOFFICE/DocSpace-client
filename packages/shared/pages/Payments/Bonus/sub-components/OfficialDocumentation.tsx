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
import { useTranslation } from "react-i18next";

import DockerSvgUrl from "PUBLIC_DIR/images/upgrade.docker.svg?url";
import LinuxSvgUrl from "PUBLIC_DIR/images/upgrade.linux.svg?url";
import WindowsSvgUrl from "PUBLIC_DIR/images/upgrade.windows.svg?url";
import ArrowUpRightReactSvgUrl from "PUBLIC_DIR/images/icons/12/arrow.up-right.react.svg?url";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Link, LinkTarget } from "@onlyoffice/apps-ui-kit/components/link";

import styles from "../Bonus.module.scss";

export const OfficialDocumentation = ({
  organizationName,
  license,
  enterpriseInstallScriptUrl,
  enterpriseInstallWindowsUrl,
}: {
  organizationName: string;
  license: string;
  enterpriseInstallScriptUrl: string;
  enterpriseInstallWindowsUrl: string;
}) => {
  const { t } = useTranslation("Common");

  const deployments = [
    {
      id: "docker",
      icon: DockerSvgUrl,
      label: t("Common:UpgradeDockerInstructions"),
      href: enterpriseInstallScriptUrl,
    },
    {
      id: "linux",
      icon: LinuxSvgUrl,
      label: t("Common:UpgradeLinuxInstructions"),
      href: enterpriseInstallScriptUrl,
    },
    {
      id: "windows",
      icon: WindowsSvgUrl,
      label: t("Common:UpgradeWindowsInstructions"),
      href: enterpriseInstallWindowsUrl,
    },
  ];

  return (
    <div className={styles.trialCard} data-testid="bonus-official-documentation">
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("Common:UpgradeTrialInstructionTitle", {
          organizationName,
          license,
        })}
      </Text>
      <Text
        fontSize="13px"
        lineHeight="20px"
        className={styles.chooseDeployment}
      >
        {t("Common:UpgradeChooseDeployment")}
      </Text>
      <div className={styles.deployments}>
        {deployments.map((deployment) => (
          <div key={deployment.id} className={styles.deployment}>
            <img
              src={deployment.icon}
              alt=""
              className={styles.deploymentIcon}
            />
            <Text
              fontSize="13px"
              fontWeight={600}
              lineHeight="20px"
              className={styles.deploymentLabel}
            >
              {deployment.label}
            </Text>
            <div className={styles.readNow}>
              <Link
                tag="a"
                fontSize="13px"
                fontWeight={600}
                href={deployment.href}
                target={LinkTarget.blank}
                color="accent"
                textDecoration="underline"
                dataTestId={`enterprise_install_script_${deployment.id}_link`}
              >
                {t("Common:UpgradeToProBannerInstructionReadNow")}
              </Link>
              <ReactSVG
                src={ArrowUpRightReactSvgUrl}
                className={styles.readNowIcon}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
