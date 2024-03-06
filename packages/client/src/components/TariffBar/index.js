import { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Text } from "@docspace/shared/components/text";
import { getSaasBar, getEnterpriseBar, checkBar } from "./helpers";

const StyledWrapper = styled.div`
  display: grid;
  cursor: pointer;

  #tariff-bar-text:hover {
    opacity: 0.85;
  }

  #tariff-bar-text:active {
    filter: brightness(0.9);
  }

  .hidden {
    visibility: hidden;
  }
`;

const PROXY_BASE_URL = combineUrl(
  window.DocSpaceConfig?.proxy?.url,
  "/portal-settings",
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
  trialDaysLeft,
  title,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("Common");

  const onClick = () => {
    const paymentPageUrl = combineUrl(
      PROXY_BASE_URL,
      "/payments/portal-payments",
    );
    navigate(paymentPageUrl);
  };

  useEffect(() => {
    checkBar();
  }, []);

  useEffect(() => {
    checkBar();
  }, [title]);

  const tariffBar = !standalone
    ? getSaasBar(
        t,
        isPaymentPageAvailable,
        isNonProfit,
        isFreeTariff,
        isGracePeriod,
      )
    : getEnterpriseBar(
        t,
        isPaymentPageAvailable,
        isEnterprise,
        isTrial,
        isLicenseExpiring,
        isLicenseDateExpired,
        trialDaysLeft,
        paymentDate,
      );

  if (!tariffBar) return <></>;
  return (
    <StyledWrapper>
      <Text
        id="tariff-bar-text"
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

export default inject(
  ({
    authStore,
    settingsStore,
    currentQuotaStore,
    currentTariffStatusStore,
  }) => {
    const {
      isPaymentPageAvailable,

      isEnterprise,
    } = authStore;
    const { isFreeTariff, isNonProfit, isTrial } = currentQuotaStore;
    const {
      isGracePeriod,
      isLicenseExpiring,
      isLicenseDateExpired,
      paymentDate,
      trialDaysLeft,
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
      trialDaysLeft,
    };
  },
)(observer(TariffBar));
