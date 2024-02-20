import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { StyledBaseQuotaComponent } from "../StyledComponent";
import MobileCategoryWrapper from "../../../components/MobileCategoryWrapper";

const MobileQuotasComponent = ({ isDisabled }) => {
  const { t } = useTranslation("Settings");
  const navigate = useNavigate();

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <StyledBaseQuotaComponent>
      <MobileCategoryWrapper
        title={t("QuotaPerRoom")}
        onClickLink={onClickLink}
        url="portal-settings/management/disk-space/quota-per-room"
        subtitle={t("SetDefaultRoomQuota")}
        isDisabled={isDisabled}
      />
      <MobileCategoryWrapper
        title={t("QuotaPerUser")}
        onClickLink={onClickLink}
        url="/portal-settings/management/disk-space/quota-per-user"
        subtitle={t("SetDefaultUserQuota")}
        isDisabled={isDisabled}
      />
    </StyledBaseQuotaComponent>
  );
};

export default MobileQuotasComponent;
