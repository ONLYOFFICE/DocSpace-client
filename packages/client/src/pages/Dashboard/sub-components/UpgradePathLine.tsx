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

import { useRef, useState } from "react";
import { observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { UpgradePathDialog } from "@docspace/shared/dialogs/upgrade-path-dialog";
import {
  DEVELOPER_TRIAL_PATH,
  ENTERPRISE_TRIAL_PATH,
  getUpgradeTrialUrl,
} from "@docspace/shared/dialogs/upgrade-path-dialog/UpgradePathDialog.constants";

import { useStores } from "SRC_DIR/store/useStore";

import styles from "../Dashboard.module.scss";

const UpgradePathLine = () => {
  const { t } = useTranslation(["Common"]);
  const { paymentStore, settingsStore } = useStores();
  const { salesEmail, getSettingsPayment } = paymentStore;
  const {
    demoOrderUrl = "",
    feedbackAndSupportUrl = "",
    siteDomain = "",
  } = settingsStore;

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const isPaymentSettingsRequested = useRef(false);

  const openDialog = () => {
    if (!salesEmail && !isPaymentSettingsRequested.current) {
      isPaymentSettingsRequested.current = true;
      getSettingsPayment();
    }
    setIsDialogVisible(true);
  };

  const closeDialog = () => setIsDialogVisible(false);

  const openTrial = (path: string) =>
    window.open(getUpgradeTrialUrl(siteDomain, path), "_blank", "noopener");

  const startEnterpriseTrial = siteDomain
    ? () => openTrial(ENTERPRISE_TRIAL_PATH)
    : undefined;

  const startDeveloperTrial = siteDomain
    ? () => openTrial(DEVELOPER_TRIAL_PATH)
    : undefined;

  return (
    <>
      <div className={styles.planSubline}>
        <Text as="span" className={styles.planSublineText}>
          <Trans
            t={t}
            ns="Common"
            i18nKey="UnlockMoreWithSolutions"
            values={{
              enterprise: t("Common:EnterpriseLicense"),
              developer: t("Common:DeveloperLicense"),
            }}
            components={{
              1: (
                <Link
                  className={styles.planLink}
                  color="accent"
                  type={LinkType.page}
                  onClick={openDialog}
                  isHovered
                  dataTestId="dashboard-open-upgrade-path"
                />
              ),
            }}
          />
        </Text>
      </div>

      <UpgradePathDialog
        visible={isDialogVisible}
        onClose={closeDialog}
        salesEmail={salesEmail}
        demoOrderUrl={demoOrderUrl}
        feedbackAndSupportUrl={feedbackAndSupportUrl}
        onStartEnterpriseTrial={startEnterpriseTrial}
        onStartDeveloperTrial={startDeveloperTrial}
      />
    </>
  );
};

export default observer(UpgradePathLine);
