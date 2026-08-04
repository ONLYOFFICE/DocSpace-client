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
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import WarningComponent from "@docspace/ui-kit/components/navigation/sub-components/WarningComponent";
import { Link } from "@docspace/ui-kit/components/link";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { formatCurrencyValue } from "@docspace/ui-kit/billing/utils/common";
import { BACKUP_SERVICE } from "@docspace/ui-kit/billing/constants";

import ClientSimpleTopUpDialog from "SRC_DIR/components/EmptyContainer/sub-components/EmptyViewContainer/ClientSimpleTopUpDialog";
import { PAYMENT_ROUTES } from "SRC_DIR/pages/PortalSettings/categories/payments/utils";

type InjectedProps = {
  isPayer?: boolean;
  isPayerInfoLoaded?: boolean;
  isBackupPaid?: boolean;
  backupsCount?: number;
  maxFreeBackups?: number;
  isInited?: boolean;
  isNotPaidPeriod?: boolean;
  isCardLinkedToPortal?: boolean;
  backupServicePrice?: number;
  walletCodeCurrency?: string;
  language?: string;
};

const Warning = ({
  isPayer,
  isPayerInfoLoaded,
  isBackupPaid,
  backupsCount = 0,
  maxFreeBackups = 0,
  isInited,
  isNotPaidPeriod,
  isCardLinkedToPortal,
  backupServicePrice = 0,
  walletCodeCurrency = "",
  language = "en",
}: InjectedProps) => {
  const { t, ready } = useTranslation(["Common", "Payments"]);
  const { pathname } = useLocation();
  const [warningText, setWarningText] = React.useState<React.ReactNode>("");
  const [isTopUpVisible, setIsTopUpVisible] = React.useState(false);

  const onClickBackupServiceUrl = () => {
    window.DocSpace.navigate(PAYMENT_ROUTES.backup);
  };

  const onClickTopUpAndActivate = () => {
    setIsTopUpVisible(true);
  };

  const onClickLearnMore = () => {
    const servicePageUrl = combineUrl(
      "/portal-settings",
      "payments",
      "/payment-method",
    );

    window.DocSpace.navigate(servicePageUrl);
  };

  const isBackupRoute =
    typeof pathname === "string" && pathname.includes("portal-settings/backup");

  const isPaymentsServiceRoute =
    typeof pathname === "string" &&
    pathname.includes("portal-settings/payments/services/");

  const isPortalPaymentsRoute =
    typeof pathname === "string" &&
    pathname.includes("portal-settings/payments/portal-payments");

  const isWalletRoute =
    typeof pathname === "string" &&
    pathname.includes("portal-settings/payments/wallet");

  React.useEffect(() => {
    if (!isBackupPaid || isNotPaidPeriod) return;
    if (!isBackupRoute || !isInited) return;
    if (!ready) return;

    const priceComponents = {
      1: (
        <Link
          key="backup-service-details-link"
          tag="a"
          onClick={onClickBackupServiceUrl}
          color="accent"
        />
      ),
    };

    const priceValues = {
      value: backupsCount >= maxFreeBackups ? maxFreeBackups : backupsCount,
      maxValue: maxFreeBackups,
      currency: formatCurrencyValue(
        language,
        backupServicePrice,
        walletCodeCurrency,
        2,
      ),
    };

    if (backupServicePrice <= 0) {
      setWarningText("");
      return;
    }

    if (!isCardLinkedToPortal) {
      setWarningText(
        <Trans
          t={t}
          i18nKey="AdditionalBackupsPriceWithActivation"
          ns="Common"
          values={priceValues}
          components={{
            1: (
              <Link
                key="backup-top-up-link"
                tag="a"
                onClick={onClickTopUpAndActivate}
                color="accent"
              />
            ),
          }}
        />,
      );
      return;
    }

    setWarningText(
      maxFreeBackups > 0 ? (
        <Trans
          t={t}
          i18nKey="FreeBackupsPerMonthWithPrice"
          ns="Common"
          values={priceValues}
          components={priceComponents}
        />
      ) : (
        <Trans
          t={t}
          i18nKey="AdditionalBackupsPrice"
          ns="Common"
          values={priceValues}
          components={priceComponents}
        />
      ),
    );
  }, [
    ready,
    backupsCount,
    isInited,
    isBackupPaid,
    isNotPaidPeriod,
    backupServicePrice,
    maxFreeBackups,
    walletCodeCurrency,
    language,
    isCardLinkedToPortal,
  ]);

  React.useEffect(() => {
    if (warningText) setWarningText("");
  }, [isBackupRoute]);

  if (
    (isPortalPaymentsRoute || isWalletRoute || isPaymentsServiceRoute) &&
    !isPayer &&
    isCardLinkedToPortal
  ) {
    if (!isPayerInfoLoaded) return null;

    return (
      <WarningComponent
        title={
          <Trans
            t={t}
            i18nKey="OnlyPayerCanManageSection"
            ns="Common"
            components={{
              1: (
                <Link
                  key="learn-more-link"
                  tag="a"
                  color="accent"
                  onClick={onClickLearnMore}
                />
              ),
            }}
          />
        }
      />
    );
  }

  if (!isBackupPaid || !isBackupRoute || !warningText) return null;

  return (
    <>
      <WarningComponent title={warningText} />
      {isTopUpVisible ? (
        <ClientSimpleTopUpDialog
          visible={isTopUpVisible}
          onClose={() => setIsTopUpVisible(false)}
          service={BACKUP_SERVICE}
          language={language}
        />
      ) : null}
    </>
  );
};

export default inject(
  ({
    paymentStore,
    currentTariffStatusStore,
    currentQuotaStore,
    backup,
    authStore,
  }: TStore) => {
    const {
      isPayer,
      isCardLinkedToPortal,
      backupServicePrice,
      walletCodeCurrency,
    } = paymentStore;
    const { isNotPaidPeriod, isPayerInfoLoaded } = currentTariffStatusStore;
    const { isBackupPaid, maxFreeBackups } = currentQuotaStore;
    const { backupsCount, isInited } = backup;
    return {
      isPayer,
      isPayerInfoLoaded,
      isBackupPaid,
      backupsCount,
      isInited,
          maxFreeBackups,
      isNotPaidPeriod,
      isCardLinkedToPortal,
      backupServicePrice,
      walletCodeCurrency,
      language: authStore.language,
    };
  },
)(observer(Warning));

