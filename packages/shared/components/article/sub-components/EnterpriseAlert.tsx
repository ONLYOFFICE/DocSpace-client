import React, { useState } from "react";
import { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { combineUrl } from "../../../utils/combineUrl";
import { RectangleSkeleton } from "../../../skeletons";

import AlertComponent from "../../alert";

import { ArticleEnterpriseAlertProps } from "../Article.types";

const PROXY_BASE_URL = combineUrl(
  window.DocSpaceConfig?.proxy?.url,
  "/portal-settings",
);

const ArticleEnterpriseAlert = ({
  toggleArticleOpen,
  isLicenseDateExpired,
  trialDaysLeft,
  isTrial,
  paymentDate,
  isEnterprise,
}: ArticleEnterpriseAlertProps) => {
  const theme = useTheme();

  const { t, ready } = useTranslation("Common");

  const navigate = useNavigate();

  const [isClose, setIsClose] = useState<string | boolean | null>(
    localStorage.getItem("enterpriseAlertClose"),
  );

  const onCloseClick = () => {
    localStorage.setItem("enterpriseAlertClose", "true");
    setIsClose(true);
  };

  const onAlertClick = () => {
    const paymentPageUrl = combineUrl(
      PROXY_BASE_URL,
      "/payments/portal-payments",
    );
    navigate(paymentPageUrl);
    toggleArticleOpen?.();
  };

  const titleFunction = () => {
    if (isTrial) {
      if (isLicenseDateExpired) return t("Common:TrialExpired");
      return t("Common:TrialDaysLeft", { count: trialDaysLeft });
    }

    return t("TariffEnterprise");
  };

  const descriptionFunction = () => {
    if (isLicenseDateExpired) {
      if (isTrial) return;

      return t("Common:SubscriptionExpired");
    }

    return t("Common:SubscriptionIsExpiring", { date: paymentDate });
  };

  const title = titleFunction();

  const additionalDescription = t("Common:RenewSubscription");

  const description = descriptionFunction();

  const color = isLicenseDateExpired
    ? theme.catalog.paymentAlert.warningColor
    : theme.catalog.paymentAlert.color;

  const isShowLoader = !ready;

  if (isEnterprise && isClose) return null;

  return isShowLoader ? (
    <RectangleSkeleton width="210px" height="88px" />
  ) : (
    <AlertComponent
      id="document_catalog-payment-alert"
      borderColor={color}
      titleColor={color}
      onAlertClick={onAlertClick}
      onCloseClick={onCloseClick}
      title={title}
      titleFontSize="11px"
      description={description}
      additionalDescription={additionalDescription}
      needArrowIcon={isTrial}
      needCloseIcon={!isTrial}
    />
  );
};

export default ArticleEnterpriseAlert;
