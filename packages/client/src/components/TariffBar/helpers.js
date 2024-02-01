const ORANGE = "#F97A0B";
const RED = "#F2665A";

export const getSaasBar = (
  t,
  isPaymentPageAvailable,
  isNonProfit,
  isFreeTariff,
  isGracePeriod
) => {
  if (
    isPaymentPageAvailable &&
    !isNonProfit &&
    (isFreeTariff || isGracePeriod)
  ) {
    if (isFreeTariff) return { label: t("Common:TryBusiness"), color: ORANGE };
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
  paymentDate
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
    } else {
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
  }
};

export const checkBar = () => {
  const el = document.getElementById("tariff-bar-text");
  el?.classList?.remove("hidden");
  if (el?.offsetWidth < el?.scrollWidth) {
    el?.classList?.add("hidden");
  }
};
