import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { combineUrl } from "@docspace/common/utils";
import { Text } from "@docspace/shared/components/text";

const StyledWrapper = styled.div`
  cursor: pointer;
`;

const PROXY_BASE_URL = combineUrl(
  window.DocSpaceConfig?.proxy?.url,
  "/portal-settings"
);

const TariffBar = ({
  isEnterprise,
  isNonProfit,
  isGracePeriod,
  isFreeTariff,
  isPaymentPageAvailable,
  isLicenseExpiring,
  isLicenseDateExpired,
  isTrial,
  standalone,
  paymentDate,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("Common");

  const onClick = () => {
    const paymentPageUrl = combineUrl(
      PROXY_BASE_URL,
      "/payments/portal-payments"
    );
    navigate(paymentPageUrl);
  };

  const getSaasBar = () => {
    if (
      isPaymentPageAvailable &&
      !isNonProfit &&
      (isFreeTariff || isGracePeriod)
    ) {
      if (isFreeTariff)
        return { label: t("Common:TryBusiness"), color: "#ED7309" };
      if (isGracePeriod)
        return { label: t("Common:LatePayment"), color: "#F24724" };
    }
  };

  const getEnterpriseBar = () => {
    if (
      isPaymentPageAvailable &&
      isEnterprise &&
      (isTrial || isLicenseExpiring || isLicenseDateExpired)
    ) {
      if (isTrial) {
        if (isLicenseDateExpired)
          return { label: t("Common:TrialExpired"), color: "#ED7309" };
        return {
          label: t("Common:TrialDaysLeft", { count: trialDaysLeft }),
          color: "#ED7309",
        };
      } else {
        if (isLicenseDateExpired)
          return { label: t("Common:SubscriptionExpired"), color: "#F24724" };
        return {
          label: t("Common:SubscriptionIsExpiring", { date: paymentDate }),
          color: "#ED7309",
        };
      }
    }
  };

  const tariffBar = !standalone ? getSaasBar() : getEnterpriseBar();

  if (!tariffBar) return <></>;
  return (
    <StyledWrapper>
      <Text
        as="div"
        fontSize="12px"
        fontWeight={600}
        lineHeight="16px"
        color={tariffBar.color}
        onClick={onClick}
        truncate={true}
      >
        {tariffBar.label}
      </Text>
    </StyledWrapper>
  );
};

export default inject(({ auth }) => {
  const {
    settingsStore,
    currentQuotaStore,
    isPaymentPageAvailable,
    currentTariffStatusStore,
    isEnterprise,
  } = auth;
  const { isFreeTariff, isNonProfit, isTrial } = currentQuotaStore;
  const {
    isGracePeriod,
    isLicenseExpiring,
    isLicenseDateExpired,
    paymentDate,
  } = currentTariffStatusStore;
  const { standalone } = settingsStore;

  return {
    isEnterprise,
    isNonProfit,
    isGracePeriod,
    isFreeTariff,
    isPaymentPageAvailable,
    isLicenseExpiring,
    isLicenseDateExpired,
    isTrial,
    standalone,
    paymentDate,
  };
})(observer(TariffBar));
