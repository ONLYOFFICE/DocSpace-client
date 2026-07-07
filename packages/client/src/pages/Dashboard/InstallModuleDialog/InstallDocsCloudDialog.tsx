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

// (c) Copyright Ascensio System SIA 2009-2026
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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import CatalogDocumentsIcon from "@docspace/ui-kit/assets/icons/16/catalog.documents.react.svg";
import CatalogFolderIcon from "@docspace/ui-kit/assets/icons/16/catalog.folder.react.svg";
import PeopleIcon from "@docspace/ui-kit/assets/icons/16/people.react.svg";
import CollabRoomLightIllustration from "PUBLIC_DIR/images/emptyview/empty.collaboration.room.light.svg";
import CollabRoomDarkIllustration from "PUBLIC_DIR/images/emptyview/empty.collaboration.room.dark.svg";

import { installDocsCloudModule } from "../installFlow";
import { InstallModuleDialog, type InstallStep } from "./InstallModuleDialog";
import styles from "./InstallModuleDialog.module.scss";

type InstallDocsCloudDialogProps = {
  visible: boolean;
  onClose: () => void;
  onInstalled: () => void;
  installDocsCloud?: () => Promise<void>;
  uninstallDocsCloud?: () => Promise<void>;
};

const InstallDocsCloudDialogComponent = ({
  visible,
  onClose,
  onInstalled,
  installDocsCloud,
  uninstallDocsCloud,
}: InstallDocsCloudDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const steps: InstallStep[] = [
    {
      id: "check-requirements",
      label: t("Common:DashboardInstallStepCheckRequirements"),
      description: t("Common:DashboardInstallStepCheckRequirementsDescription"),
    },
    {
      id: "connect-cloud",
      label: t("Common:DashboardInstallStepConnectCloud"),
      description: t("Common:DashboardInstallStepConnectCloudDescription"),
    },
    {
      id: "configure-editor",
      label: t("Common:DashboardInstallStepConfigureEditor"),
      description: t("Common:DashboardInstallStepConfigureEditorDescription"),
    },
    {
      id: "activate-features",
      label: t("Common:DashboardInstallStepActivateFeatures"),
      description: t("Common:DashboardInstallStepActivateFeaturesDescription"),
    },
  ];

  const handleInstall = React.useCallback(
    async (onStep: (id: string) => void, signal: AbortSignal) => {
      await installDocsCloudModule(onStep, signal);
      await installDocsCloud?.();
    },
    [installDocsCloud],
  );

  const handleCleanup = React.useCallback(async () => {
    await uninstallDocsCloud?.();
  }, [uninstallDocsCloud]);

  const bullets = [
    {
      Icon: CatalogDocumentsIcon,
      title: t("Common:DashboardInstallDocsCloudBullet1"),
      description: t("Common:DashboardInstallDocsCloudBullet1Description"),
    },
    {
      Icon: PeopleIcon,
      title: t("Common:DashboardInstallDocsCloudBullet2"),
      description: t("Common:DashboardInstallDocsCloudBullet2Description"),
    },
    {
      Icon: CatalogFolderIcon,
      title: t("Common:DashboardInstallDocsCloudBullet3"),
      description: t("Common:DashboardInstallDocsCloudBullet3Description"),
    },
  ];

  const confirmBody = (
    <div className={styles.confirmBody}>
      <div className={styles.heroIllustration} aria-hidden="true">
        {isBase ? (
          <CollabRoomLightIllustration />
        ) : (
          <CollabRoomDarkIllustration />
        )}
      </div>
      <Text as="p" className={styles.confirmText}>
        {t("Common:DashboardInstallDocsCloudConfirmIntro")}
      </Text>
      <ul className={styles.bulletList}>
        {bullets.map(({ Icon, title, description }) => (
          <li key={title} className={styles.bulletItem}>
            <span className={styles.bulletIconWrap} aria-hidden="true">
              <Icon className={styles.bulletIcon} />
            </span>
            <div className={styles.bulletTexts}>
              <Text as="span" className={styles.bulletTitle}>
                {title}
              </Text>
              <Text as="span" className={styles.bulletDescription}>
                {description}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <InstallModuleDialog
      visible={visible}
      onClose={onClose}
      onInstalled={onInstalled}
      moduleTitle={t("Common:DocsCloud")}
      confirmBody={confirmBody}
      doneHint={t("Common:DashboardInstallDocsCloudDoneHint")}
      steps={steps}
      onInstall={handleInstall}
      onCleanup={handleCleanup}
    />
  );
};

export const InstallDocsCloudDialog = inject<TStore>(({ appsStore }) => ({
  installDocsCloud: appsStore.installDocsCloud,
  uninstallDocsCloud: appsStore.uninstallDocsCloud,
}))(observer(InstallDocsCloudDialogComponent));

export default InstallDocsCloudDialog;
