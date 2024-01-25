import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Text } from "@docspace/shared/components/text";

const StyledWrapper = styled.div`
  cursor: pointer;

  .tariff-bar-text:hover {
    opacity: 0.85;
  }

  .tariff-bar-text:active {
    filter: brightness(0.9);
  }
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
  const orange = "#F97A0B";
  const red = "#F2665A";

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
        return { label: t("Common:TryBusiness"), color: orange };
      if (isGracePeriod) return { label: t("Common:LatePayment"), color: red };
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
          return { label: t("Common:TrialExpired"), color: orange };
        return {
          label: t("Common:TrialDaysLeft", { count: trialDaysLeft }),
          color: orange,
        };
      } else {
        if (isLicenseDateExpired)
          return {
            label: t("Common:SubscriptionExpiredTitle"),
            color: red,
          };
        return {
          label: t("Common:SubscriptionIsExpiring", { date: paymentDate }),
          color: orange,
        };
      }
    }
  };

  const tariffBar = !standalone ? getSaasBar() : getEnterpriseBar();

  if (!tariffBar) return <></>;
  return (
    <StyledWrapper>
      <Text
        className="tariff-bar-text"
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
