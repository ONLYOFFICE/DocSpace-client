import React from "react";
import { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

import { combineUrl } from "../../../utils/combineUrl";
import { RectangleSkeleton } from "../../../skeletons";

import AlertComponent from "../../alert";
import { ArticlePaymentAlertProps } from "../Article.types";

const PROXY_BASE_URL = combineUrl(
  window.DocSpaceConfig?.proxy?.url,
  "/portal-settings",
);

const ArticlePaymentAlert = ({
  isFreeTariff,
  currentTariffPlanTitle,
  toggleArticleOpen,
}: ArticlePaymentAlertProps) => {
  const { t, ready } = useTranslation("Common");
  const theme = useTheme();

  const navigate = useNavigate();

  const onClick = () => {
    const paymentPageUrl = combineUrl(
      PROXY_BASE_URL,
      "/payments/portal-payments",
    );
    navigate(paymentPageUrl);
    toggleArticleOpen?.();
  };

  const title = isFreeTariff ? (
    <Trans t={t} i18nKey="FreeStartupPlan" ns="Common">
      {{ planName: currentTariffPlanTitle }}
    </Trans>
  ) : (
    t("Common:LatePayment")
  );

  const description = isFreeTariff
    ? t("Common:GetMoreOptions")
    : t("Common:PayBeforeTheEndGracePeriod");

  const additionalDescription = isFreeTariff
    ? t("Common:ActivatePremiumFeatures")
    : t("Common:GracePeriodActivated");

  const color = isFreeTariff
    ? theme.catalog.paymentAlert.color
    : theme.catalog.paymentAlert.warningColor;

  const isShowLoader = !ready;

  return isShowLoader ? (
    <RectangleSkeleton width="210px" height="88px" />
  ) : (
    <AlertComponent
      id="document_catalog-payment-alert"
      borderColor={color}
      titleColor={color}
      onAlertClick={onClick}
      title={title}
      titleFontSize="11px"
      description={description}
      additionalDescription={additionalDescription}
      needArrowIcon
    />
  );
};

export default ArticlePaymentAlert;
