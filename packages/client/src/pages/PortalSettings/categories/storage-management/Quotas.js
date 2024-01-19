import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { isMobile } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";

import { StyledBaseQuotaComponent, StyledMainTitle } from "./StyledComponent";

import QuotaPerRoomComponent from "./sub-components/QuotaPerRoom";
import QuotaPerUserComponent from "./sub-components/QuotaPerUser";
import MobileQuotasComponent from "./sub-components/MobileQuotas";

const QuotasComponent = (props) => {
  const { t } = useTranslation("Settings");

  const { isStatisticsAvailable } = props;

  return (
    <StyledBaseQuotaComponent>
      <div className="title-container">
        <StyledMainTitle fontSize="16px" fontWeight={700}>
          {t("Quotas")}
        </StyledMainTitle>

        {!isStatisticsAvailable && (
          <Badge
            backgroundColor="#EDC409"
            label={t("Common:Paid")}
            className="paid-badge"
            isPaidBadge
          />
        )}
      </div>
      <Text className="quotas_description">{t("QuotasDescription")}</Text>

      {isMobile() ? (
        <MobileQuotasComponent isDisabled={!isStatisticsAvailable} />
      ) : (
        <>
          <QuotaPerRoomComponent isDisabled={!isStatisticsAvailable} />
          <QuotaPerUserComponent />
        </>
      )}
    </StyledBaseQuotaComponent>
  );
};

export default inject(({ auth }) => {
  const { currentQuotaStore } = auth;
  const { isStatisticsAvailable } = currentQuotaStore;

  return {
    isStatisticsAvailable,
  };
})(observer(QuotasComponent));
