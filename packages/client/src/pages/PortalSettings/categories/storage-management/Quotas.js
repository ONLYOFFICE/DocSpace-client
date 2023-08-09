import React from "react";
import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";

import Text from "@docspace/components/text";

import { StyledBaseQuotaComponent } from "./StyledComponent";

import QuotaPerRoomComponent from "./sub-components/QuotaPerRoom";
import QuotaPerUserComponent from "./sub-components/QuotaPerUser";
import MobileQuotasComponent from "./sub-components/MobileQuotas";

const QuotasComponent = (props) => {
  const { t } = useTranslation("Settings");

  return (
    <StyledBaseQuotaComponent>
      <div className="quotas_label">
        <Text fontSize="16px" fontWeight={700}>
          {t("Quotas")}
        </Text>
        <Text>{t("QuotasDescription")}</Text>
      </div>

      {isMobileOnly ? (
        <MobileQuotasComponent />
      ) : (
        <>
          <QuotaPerRoomComponent />
          <QuotaPerUserComponent />
        </>
      )}
    </StyledBaseQuotaComponent>
  );
};

export default QuotasComponent;
