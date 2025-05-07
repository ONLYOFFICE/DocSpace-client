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

import { globalColors } from "@docspace/shared/themes";

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
  isEnterprise,
  isTrial,
  isLicenseExpiring,
  isLicenseDateExpired,
  trialDaysLeft,
  paymentDate,
) => {
  if (
    isPaymentPageAvailable &&
    isEnterprise &&
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
