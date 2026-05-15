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

"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { parseToDateTime, formatDateLocalized } from "@docspace/ui-kit/utils/date";
import { useRouter } from "next/navigation";

import { LoaderWrapper } from "@docspace/ui-kit/components/loader-wrapper";
import { StandalonePage } from "@docspace/shared/pages/Payments/Standalone";
import { toastr } from "@docspace/ui-kit/components/toast";
import { setLicense, acceptLicense } from "@docspace/shared/api/settings";

import { useEndAnimation } from "@/hooks/useEndAnimation";
import { getIsLicenseDateExpired, getPaymentDate, getDaysLeft } from "@/lib";
import { TLicenseQuota } from "@docspace/shared/api/portal/types";
import { TFilesSettings } from "@docspace/shared/api/files/types";
import styles from "./payments.module.scss";

const PaymentsPage = ({
  isTrial,
  salesEmail,
  isDeveloper,
  buyUrl,
  dueDate,
  isEnterprise,
  logoText,
  docspaceFaqUrl,
  licenseQuota,
  filesSettings,
  isLifetimeLicense,
  isGracePeriod,
  isNotPaidPeriod,
  gracePeriodEndDate,
  delayDaysCount,
  feedbackAndSupportUrl,
}: {
  isTrial: boolean;
  salesEmail: string;
  isDeveloper: boolean;
  buyUrl: string;
  dueDate: Date | string;
  isEnterprise: boolean;
  logoText: string;
  docspaceFaqUrl: string;
  licenseQuota: TLicenseQuota;
  filesSettings: TFilesSettings;
  isLifetimeLicense: boolean;
  isGracePeriod: boolean;
  isNotPaidPeriod: boolean;
  gracePeriodEndDate: Date;
  delayDaysCount: string;
  feedbackAndSupportUrl: string;
}) => {
  const { t } = useTranslation("Common");
  const router = useRouter();
  const isLoading = useEndAnimation();

  const [isLicenseDateExpired, setIsLicenseDateExpired] = useState(false);
  const [paymentDate, setPaymentDate] = useState("");
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isLicenseCorrect, setIsLicenseCorrect] = useState(false);

  const shouldOpenEditorInNewTab = () => {
    if (typeof window === "undefined")
      return !filesSettings.openEditorInSameTab;

    if (
      window.navigator.userAgent.includes("ZoomWebKit") ||
      window.navigator.userAgent.includes("ZoomApps")
    )
      return false;

    return !filesSettings.openEditorInSameTab;
  };

  const setPaymentsLicense = async (
    confirmKey: string | null,
    data: FormData,
  ) => {
    try {
      const message = await setLicense(confirmKey, data);
      setIsLicenseCorrect(true);

      toastr.success(message);
    } catch (error) {
      toastr.error(error!);
      setIsLicenseCorrect(false);
    }
  };

  const acceptPaymentsLicense = async () => {
    try {
      const message = await acceptLicense();

      if (message) {
        toastr.error(message);
        return;
      }

      toastr.success(t("ActivateLicenseActivated"));
      localStorage.removeItem("enterpriseAlertClose");

      router.refresh();
    } catch (error) {
      toastr.error(error!);
    }
  };

  useEffect(() => {
    const timezone = typeof window !== "undefined" ? window.timezone : "UTC";
    setIsLicenseDateExpired(getIsLicenseDateExpired(dueDate, timezone));
    setPaymentDate(getPaymentDate(dueDate, timezone));
    setTrialDaysLeft(getDaysLeft(dueDate));
  }, [dueDate]);

  return (
    <div className={styles.wrapper}>
      <LoaderWrapper isLoading={isLoading}>
        <StandalonePage
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
          logoText={logoText}
          docspaceFaqUrl={docspaceFaqUrl}
          licenseQuota={licenseQuota}
          openOnNewPage={shouldOpenEditorInNewTab()}
          isLifetimeLicense={isLifetimeLicense}
          isGracePeriod={isGracePeriod}
          isNotPaidPeriod={isNotPaidPeriod}
          gracePeriodEndDate={formatDateLocalized(
            parseToDateTime(gracePeriodEndDate)?.setZone(window.timezone),
            "DATE_MED",
          )}
          delayDaysCount={delayDaysCount}
          feedbackAndSupportUrl={feedbackAndSupportUrl}
        />
      </LoaderWrapper>
    </div>
  );
};

export default PaymentsPage;
