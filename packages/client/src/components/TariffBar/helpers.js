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

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

const ORANGE = globalColors.mainOrange;
const RED = globalColors.mainRed;

export const getSaasBar = (
  t,
  isPaymentPageAvailable,
  isNonProfit,
  isFreeTariff,
  isGracePeriod,
) => {
  if (isPaymentPageAvailable) {
    if (isFreeTariff && !isNonProfit)
      return { label: t("Common:TryBusiness"), color: ORANGE };
    if (isGracePeriod) return { label: t("Common:LatePayment"), color: RED };
  }
};

export const getEnterpriseBar = (
  t,
  isPaymentPageAvailable,
  isTrial,
  isLicenseExpiring,
  isLicenseDateExpired,
  trialDaysLeft,
  paymentDate,
  isGracePeriod,
  isLifetimeLicense,
  isCommunity,
) => {
  if (
    isPaymentPageAvailable &&
    !isCommunity &&
    (isTrial || isLicenseExpiring || isLicenseDateExpired)
  ) {
    if (isTrial) {
      if (isLicenseDateExpired)
        return { label: t("Common:TrialExpired"), color: ORANGE };
      return {
        label: t("Common:TrialDaysLeft", { count: trialDaysLeft }),
        color: ORANGE,
      };
    }

    if (!isLifetimeLicense && isLicenseExpiring)
      return {
        label: t("Common:LicenseExpiresOn", { date: paymentDate }),
        color: ORANGE,
      };

    if (!isLifetimeLicense && isGracePeriod)
      return {
        label: t("Common:LicenseExpired", { date: paymentDate }),
        color: RED,
      };

    if (isLicenseDateExpired)
      return {
        label: t("Common:SubscriptionExpiredTitle"),
        color: RED,
      };

    return {
      label: t("Common:SubscriptionIsExpiring", { date: paymentDate }),
      color: ORANGE,
    };
  }
};

export const checkBar = () => {
  const el = document.getElementById("tariff-bar-text");
  el?.classList?.remove("hidden");
  if (el?.offsetWidth < el?.scrollWidth) {
    el?.classList?.add("hidden");
  }
};
