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
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getBrandName } from "@docspace/shared/constants/brands";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import config from "PACKAGE_FILE";

import EditorsIcon from "PUBLIC_DIR/images/icons/16/docs-connect.editors.react.svg";
import CollaborationIcon from "PUBLIC_DIR/images/icons/16/catalog.user.react.svg";
import IntegrationIcon from "PUBLIC_DIR/images/icons/16/docs-connect.automation-api.react.svg";
import FormatsIcon from "PUBLIC_DIR/images/icons/16/file.react.svg";
import RebrandingIcon from "PUBLIC_DIR/images/icons/16/docs-connect.rebranding.react.svg";
import TenantsKeysIcon from "PUBLIC_DIR/images/icons/16/catalog.devtools-oauth.react.svg";
import CloudIcon from "PUBLIC_DIR/images/icons/16/cloud.react.svg";
import AutoUpdatesIcon from "PUBLIC_DIR/images/icons/16/auto-update.react.svg";
import PluginsIcon from "PUBLIC_DIR/images/icons/16/catalog.devtools-plugin-sdk.react.svg";

import { DOCS_CONNECT_ROUTE } from "../../developer-tools/DocsConnect/constants";

import styles from "./DocsConnectGetStartedModal.module.scss";

interface DocsConnectGetStartedModalProps {
  visible: boolean;
  onClose: () => void;
  startTrial?: () => Promise<void>;
}

const DocsConnectGetStartedModal = ({
  visible,
  onClose,
  startTrial,
}: DocsConnectGetStartedModalProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const productName = getBrandName("OrganizationName");

  const features = [
    {
      Icon: EditorsIcon,
      title: t("DocsConnect:FourEditorsTitle"),
      description: t("DocsConnect:FourEditorsDescription"),
    },
    {
      Icon: CollaborationIcon,
      title: t("DocsConnect:RealtimeCollaborationTitle"),
      description: t("DocsConnect:RealtimeCollaborationDescription"),
    },
    {
      Icon: IntegrationIcon,
      title: t("DocsConnect:DropInIntegrationTitle"),
      description: t("DocsConnect:DropInIntegrationDescription"),
    },
  ];

  const chips = [
    { Icon: FormatsIcon, label: t("DocsConnect:ChipFormats") },
    { Icon: RebrandingIcon, label: t("DocsConnect:ChipWhiteLabel") },
    { Icon: IntegrationIcon, label: t("DocsConnect:ChipAutomationApi") },
    { Icon: TenantsKeysIcon, label: t("DocsConnect:ChipTenantsKeys") },
    { Icon: CloudIcon, label: t("DocsConnect:ChipCloudHosted") },
    { Icon: AutoUpdatesIcon, label: t("DocsConnect:ChipAutoUpdates") },
    { Icon: PluginsIcon, label: t("DocsConnect:ChipPlugins") },
  ];

  const onStartTrial = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await startTrial?.();
      onClose();
      window.location.href = combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        DOCS_CONNECT_ROUTE,
      );
    } catch (error) {
      toastr.error(error as Error);
      setSubmitting(false);
    }
  };

  return (
    <ModalDialog
      className={styles.dialog}
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      isHuge
      autoMaxHeight
    >
      <ModalDialog.Header>{t("DocsConnect:DocsConnect")}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.body}>
          <div className={styles.intro}>
            <Text as="h3" className={styles.subtitle}>
              {t("DocsConnect:GetStartedTitle", { productName })}
            </Text>
            <Text as="p" className={styles.description}>
              {t("DocsConnect:GetStartedDescription")}
            </Text>
          </div>

          <div className={styles.cards}>
            {features.map(({ Icon, title, description }) => (
              <div key={title} className={styles.card}>
                <span className={styles.cardIcon} aria-hidden="true">
                  <Icon />
                </span>
                <Text as="p" className={styles.cardTitle}>
                  {title}
                </Text>
                <Text as="p" className={styles.cardDescription}>
                  {description}
                </Text>
              </div>
            ))}
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerLabel}>{t("DocsConnect:Plus")}</span>
          </div>

          <div className={styles.chips}>
            {chips.map(({ Icon, label }) => (
              <span key={label} className={styles.chip}>
                <Icon className={styles.chipIcon} aria-hidden="true" />
                {label}
              </span>
            ))}
            <span className={styles.andMore}>{t("Common:AndMuchMore")}</span>
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("DocsConnect:StartFreeTrial")}
          onClick={onStartTrial}
          isLoading={submitting}
          isDisabled={submitting}
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={onClose}
          isDisabled={submitting}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  startTrial: docsConnectStore.startTrial,
}))(observer(DocsConnectGetStartedModal));
