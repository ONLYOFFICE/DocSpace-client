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

"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import { LoaderWrapper } from "@docspace/shared/components/loader-wrapper";
import { StandalonePage } from "@docspace/shared/pages/Payments/Standalone";
import { toastr } from "@docspace/shared/components/toast";
import { setLicense, acceptLicense } from "@docspace/shared/api/settings";

import { useEndAnimation } from "@/hooks/useEndAnimation";
import { getIsLicenseDateExpired, getPaymentDate, getDaysLeft } from "@/lib";

const PaymentsPage = ({
  isTrial,
  salesEmail,
  isDeveloper,
  buyUrl,
  dueDate,
  isEnterprise,
  logoText,
}: {
  isTrial: boolean;
  salesEmail: string;
  isDeveloper: boolean;
  buyUrl: string;
  dueDate: Date | string;
  isEnterprise: boolean;
  logoText: string;
}) => {
  const { t } = useTranslation("Common");
  const router = useRouter();
  const isLoading = useEndAnimation();

  const [isLicenseDateExpired, setIsLicenseDateExpired] = useState(false);
  const [paymentDate, setPaymentDate] = useState("");
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isLicenseCorrect, setIsLicenseCorrect] = useState(false);

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
    setIsLicenseDateExpired(getIsLicenseDateExpired(dueDate, window.timezone));
    setPaymentDate(getPaymentDate(dueDate, window.timezone));
    setTrialDaysLeft(getDaysLeft(dueDate));
  }, [dueDate]);

  return (
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
      />
    </LoaderWrapper>
  );
};

export default PaymentsPage;
