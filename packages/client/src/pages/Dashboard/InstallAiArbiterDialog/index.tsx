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

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import CheckIcon from "@docspace/ui-kit/assets/check.react.svg";
import DangerIcon from "@docspace/ui-kit/assets/danger.toast.react.svg";
import CatalogAiArbiterIcon from "@docspace/ui-kit/assets/icons/16/catalog.ai-arbiter.react.svg";
import AiAgentsLightIllustration from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import AiAgentsDarkIllustration from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";

import styles from "../InstallModuleDialog/InstallModuleDialog.module.scss";

type InstallAiArbiterDialogProps = {
  visible: boolean;
  onClose: () => void;
  onInstalled: () => void;
  installAiArbiter?: () => Promise<void>;
};

type Phase = "confirm" | "done" | "failed";

const InstallAiArbiterDialogComponent = ({
  visible,
  onClose,
  onInstalled,
  installAiArbiter,
}: InstallAiArbiterDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const [phase, setPhase] = React.useState<Phase>("confirm");
  const [isPending, setIsPending] = React.useState(false);

  const handleInstallClick = React.useCallback(async () => {
    setIsPending(true);
    try {
      await installAiArbiter?.();
      setPhase("done");
    } catch (err) {
      console.error("AI Arbiter install failed", err);
      setPhase("failed");
      toastr.error(t("Common:DashboardInstallFailed"));
    } finally {
      setIsPending(false);
    }
  }, [installAiArbiter, t]);

  React.useEffect(() => {
    if (!visible) {
      setPhase("confirm");
      setIsPending(false);
    }
  }, [visible]);

  const moduleTitle = t("Common:DashboardAIArbiterTitle");

  const confirmBullets: {
    icon: typeof CatalogAiArbiterIcon;
    title: string;
    description: string;
  }[] = [
    {
      icon: CatalogAiArbiterIcon,
      title: t("Common:DashboardArbiterInstallBulletAI"),
      description: t("Common:DashboardArbiterInstallBulletAIDescription"),
    },
  ];

  const renderConfirmBody = () => (
    <div className={styles.confirmBody}>
      <div className={styles.heroIllustration} aria-hidden="true">
        {isBase ? (
          <AiAgentsLightIllustration />
        ) : (
          <AiAgentsDarkIllustration />
        )}
      </div>

      <Text as="p" className={styles.confirmText}>
        {t("Common:DashboardArbiterInstallConfirmIntro")}
      </Text>

      <ul className={styles.bulletList}>
        {confirmBullets.map(({ icon: Icon, title, description }) => (
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

  const renderDoneBody = () => (
    <div className={styles.doneBody}>
      <div
        className={styles.heroBadge}
        data-status="success"
        aria-hidden="true"
      >
        <CheckIcon />
      </div>
      <div className={styles.heroText}>
        <Text as="p" className={styles.confirmText}>
          {t("Common:DashboardInstallDoneHint")}
        </Text>
      </div>
    </div>
  );

  const renderFailedBody = () => (
    <div className={styles.failedBody}>
      <div className={styles.heroBadge} data-status="error" aria-hidden="true">
        <DangerIcon />
      </div>
      <Text as="p" className={styles.error}>
        {t("Common:DashboardInstallFailed")}
      </Text>
    </div>
  );

  const renderFooter = () => {
    if (phase === "confirm") {
      return (
        <>
          <Button
            primary
            scale
            size={ButtonSize.normal}
            label={t("Common:Install")}
            onClick={handleInstallClick}
            isDisabled={isPending}
          />
          <Button
            scale
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            onClick={onClose}
            isDisabled={isPending}
          />
        </>
      );
    }
    if (phase === "done") {
      return (
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:Open")}
          onClick={onInstalled}
        />
      );
    }
    return (
      <Button
        primary
        scale
        size={ButtonSize.normal}
        label={t("Common:CloseButton")}
        onClick={onClose}
      />
    );
  };

  const getHeader = () => {
    if (phase === "confirm")
      return t("Common:DashboardInstallConfirmTitle", { module: moduleTitle });
    if (phase === "done")
      return t("Common:DashboardInstallDoneTitle", { module: moduleTitle });
    return t("Common:DashboardInstallTitle", { module: moduleTitle });
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      isLarge
      autoMaxHeight
    >
      <ModalDialog.Header>{getHeader()}</ModalDialog.Header>
      <ModalDialog.Body>
        {phase === "confirm" ? renderConfirmBody() : null}
        {phase === "done" ? renderDoneBody() : null}
        {phase === "failed" ? renderFailedBody() : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>{renderFooter()}</ModalDialog.Footer>
    </ModalDialog>
  );
};

export const InstallAiArbiterDialog = inject<TStore>(({ appsStore }) => ({
  installAiArbiter: appsStore.installAiArbiter,
}))(observer(InstallAiArbiterDialogComponent));

export default InstallAiArbiterDialog;
