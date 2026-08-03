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

import CatalogRoomsIcon from "@docspace/ui-kit/assets/icons/16/catalog.rooms.react.svg";
import PeopleIcon from "@docspace/ui-kit/assets/icons/16/people.react.svg";
import TemplateIcon from "@docspace/ui-kit/assets/icons/16/catalog.documents.react.svg";
import FormRoomLightIllustration from "PUBLIC_DIR/images/emptyview/empty.form.room.light.svg";
import FormRoomDarkIllustration from "PUBLIC_DIR/images/emptyview/empty.form.room.dark.svg";

import {
  AI_FORMS_INSTALL_STEPS,
  installAiFormsModule,
  type AiFormsInstallStepId,
  type LibraryUploadProgress,
} from "../installFlow";
import { InstallModuleDialog, type InstallStep } from "./InstallModuleDialog";
import styles from "./InstallModuleDialog.module.scss";

type InstallAiFormsDialogProps = {
  visible: boolean;
  onClose: () => void;
  onInstalled: () => void;
  installAiForms?: (roomId: number, libraryId?: number) => Promise<void>;
  uninstallAiForms?: () => Promise<void>;
  skipConfirm?: boolean;
};

const InstallAiFormsDialogComponent = ({
  visible,
  onClose,
  onInstalled,
  installAiForms,
  uninstallAiForms,
  skipConfirm = false,
}: InstallAiFormsDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const [libraryProgress, setLibraryProgress] =
    React.useState<LibraryUploadProgress | null>(null);

  const steps: InstallStep[] = React.useMemo(
    () =>
      AI_FORMS_INSTALL_STEPS.map((id) => {
        const labels: Record<AiFormsInstallStepId, string> = {
          "create-room": t("Common:DashboardInstallStepCreateRoom"),
          "invite-everyone": t("Common:DashboardInstallStepInviteEveryone"),
          "create-blank-form": t("Common:DashboardInstallStepCreateBlankForm"),
          "upload-library": t("Common:DashboardInstallStepUploadLibrary"),
        };
        const descriptions: Record<AiFormsInstallStepId, string> = {
          "create-room": t("Common:DashboardInstallStepCreateRoomDescription"),
          "invite-everyone": t(
            "Common:DashboardInstallStepInviteEveryoneDescription",
          ),
          "create-blank-form": t(
            "Common:DashboardInstallStepCreateBlankFormDescription",
          ),
          "upload-library": t(
            "Common:DashboardInstallStepUploadLibraryDescription",
          ),
        };
        let description = descriptions[id];
        if (id === "upload-library" && libraryProgress?.total) {
          const percent = Math.min(
            100,
            Math.floor(
              (libraryProgress.uploaded / libraryProgress.total) * 100,
            ),
          );
          description = t("Common:DashboardInstallStepUploadLibraryProgress", {
            percent,
          });
        }
        return { id, label: labels[id], description };
      }),
    [libraryProgress, t],
  );

  const handleInstall = React.useCallback(
    async (onStep: (id: string) => void, signal: AbortSignal) => {
      setLibraryProgress(null);
      const { roomId, libraryId } = await installAiFormsModule(
        onStep,
        (progress) => setLibraryProgress(progress),
        signal,
      );
      await installAiForms?.(roomId, libraryId);
    },
    [installAiForms],
  );

  const handleCleanup = React.useCallback(async () => {
    await uninstallAiForms?.();
  }, [uninstallAiForms]);

  React.useEffect(() => {
    if (!visible) setLibraryProgress(null);
  }, [visible]);

  const bullets = [
    {
      Icon: CatalogRoomsIcon,
      title: t("Common:DashboardInstallBulletCreateRoom"),
      description: t("Common:DashboardInstallBulletCreateRoomDescription"),
    },
    {
      Icon: PeopleIcon,
      title: t("Common:DashboardInstallBulletInvite"),
      description: t("Common:DashboardInstallBulletInviteDescription"),
    },
    {
      Icon: TemplateIcon,
      title: t("Common:DashboardInstallBulletStarter"),
      description: t("Common:DashboardInstallBulletStarterDescription"),
    },
  ];

  const confirmBody = (
    <div className={styles.confirmBody}>
      <div className={styles.heroIllustration} aria-hidden="true">
        {isBase ? <FormRoomLightIllustration /> : <FormRoomDarkIllustration />}
      </div>
      <Text as="p" className={styles.confirmText}>
        {t("Common:DashboardInstallConfirmIntro")}
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
      moduleTitle={t("Common:DashboardFormsTitle")}
      confirmBody={confirmBody}
      doneHint={t("Common:DashboardInstallDoneHint")}
      steps={steps}
      onInstall={handleInstall}
      onCleanup={handleCleanup}
      skipConfirm={skipConfirm}
    />
  );
};

export const InstallAiFormsDialog = inject<TStore>(({ appsStore }) => ({
  installAiForms: appsStore.installAiForms,
  uninstallAiForms: appsStore.uninstallAiForms,
}))(observer(InstallAiFormsDialogComponent));

export default InstallAiFormsDialog;
