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

import React, { useEffect } from "react";

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { PaymentsStandaloneLoader } from "@docspace/shared/skeletons/payments";
import { StandalonePage as StandalonePageComponent } from "@docspace/shared/pages/Payments/Standalone";

const StandalonePage = (props) => {
  const {
    isInitPaymentPage,
    isLoadedTariffStatus,
    isLoadedCurrentQuota,
    isTrial,
    isUpdatingBasicSettings,
    setPaymentsLicense,
    acceptPaymentsLicense,
    isLicenseCorrect,
    trialDaysLeft,
    paymentDate,
    isLicenseDateExpired,
    isDeveloper,
    buyUrl,
    salesEmail,
    isEnterprise,
    showPortalSettingsLoader,
    docspaceFaqUrl,
    licenseQuota,
    openOnNewPage,
    logoText,
    isLifetimeLicense,
    isGracePeriod,
    isNotPaidPeriod,
    gracePeriodEndDate,
    delayDaysCount,
    feedbackAndSupportUrl,
  } = props;

  const { t, ready } = useTranslation("Common");

  useEffect(() => {
    setDocumentTitle(t("Common:PaymentsTitle"));
  }, [ready]);

  if (
    (!isInitPaymentPage ||
      !isLoadedTariffStatus ||
      !isLoadedCurrentQuota ||
      !ready ||
      isUpdatingBasicSettings) &&
    showPortalSettingsLoader
  )
    return <PaymentsStandaloneLoader isEnterprise={!isTrial} />;

  return (
    <StandalonePageComponent
      isTrial={isTrial}
      setPaymentsLicense={setPaymentsLicense}
      acceptPaymentsLicense={acceptPaymentsLicense}
      isLicenseCorrect={isLicenseCorrect}
      salesEmail={salesEmail}
      isLicenseDateExpired={isLicenseDateExpired}
      isDeveloper={isDeveloper}
      buyUrl={buyUrl}
      trialDaysLeft={trialDaysLeft}
      paymentDate={paymentDate}
      isEnterprise={isEnterprise}
      docspaceFaqUrl={docspaceFaqUrl}
      licenseQuota={licenseQuota}
      openOnNewPage={openOnNewPage}
      logoText={logoText}
      isLifetimeLicense={isLifetimeLicense}
      isGracePeriod={isGracePeriod}
      isNotPaidPeriod={isNotPaidPeriod}
      gracePeriodEndDate={gracePeriodEndDate}
      delayDaysCount={delayDaysCount}
      feedbackAndSupportUrl={feedbackAndSupportUrl}
    />
  );
};

export default inject(
  ({
    currentQuotaStore,
    paymentStore,
    currentTariffStatusStore,
    clientLoadingStore,
    settingsStore,
    filesSettingsStore,
  }) => {
    const {
      isInitPaymentPage,
      isUpdatingBasicSettings,
      setPaymentsLicense,
      acceptPaymentsLicense,
      isLicenseCorrect,
      buyUrl,
      salesEmail,
      licenseQuota,
    } = paymentStore;
    const {
      isLoaded: isLoadedCurrentQuota,
      isTrial,
      isLifetimeLicense,
    } = currentQuotaStore;
    const {
      isLoaded: isLoadedTariffStatus,
      trialDaysLeft,
      paymentDate,
      isLicenseDateExpired,
      isDeveloper,
      isGracePeriod,
      isEnterprise,
      isNotPaidPeriod,
      gracePeriodEndDate,
      delayDaysCount,
    } = currentTariffStatusStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    const { docspaceFaqUrl, logoText, feedbackAndSupportUrl } = settingsStore;

    const { openOnNewPage } = filesSettingsStore;

    return {
      isTrial,
      isInitPaymentPage,
      isLoadedTariffStatus,
      isLoadedCurrentQuota,
      isUpdatingBasicSettings,
      setPaymentsLicense,
      acceptPaymentsLicense,
      isLicenseCorrect,
      trialDaysLeft,
      paymentDate,
      isLicenseDateExpired,
      isDeveloper,
      buyUrl,
      salesEmail,
      isEnterprise,
      showPortalSettingsLoader,
      docspaceFaqUrl,
      licenseQuota,
      openOnNewPage,
      logoText,
      isLifetimeLicense,
      isGracePeriod,
      isNotPaidPeriod,
      gracePeriodEndDate,
      delayDaysCount,
      feedbackAndSupportUrl,
    };
  },
)(observer(StandalonePage));
