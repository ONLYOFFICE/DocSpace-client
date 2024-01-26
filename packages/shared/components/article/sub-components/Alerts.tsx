import React, { useEffect } from "react";

import { ArticleAlerts } from "../../../enums";

import ArticleTeamTrainingAlert from "./TeamTrainingAlert";
import ArticleSubmitToFormGalleryAlert from "./SubmitToFormGalleryAlert";
import ArticlePaymentAlert from "./PaymentAlert";
import ArticleEnterpriseAlert from "./EnterpriseAlert";

import { ArticleAlertsProps } from "../Article.types";
import { StyledArticleAlertsComponent } from "../Article.styled";

const ArticleAlertsComponent = ({
  articleAlertsData,
  incrementIndexOfArticleAlertsData,
  showText,
  isNonProfit,
  isGracePeriod,
  isFreeTariff,
  isPaymentPageAvailable,
  isTeamTrainingAlertAvailable,
  isSubmitToGalleryAlertAvailable,
  isLicenseExpiring,
  isLicenseDateExpired,
  isEnterprise,
  isTrial,
  standalone,
  currentTariffPlanTitle,
  toggleArticleOpen,
  bookTrainingEmail,
  removeAlertFromArticleAlertsData,
  setSubmitToGalleryDialogVisible,
  paymentDate,
  trialDaysLeft,
}: ArticleAlertsProps) => {
  const currentAlert = articleAlertsData?.current;
  const availableAlerts = articleAlertsData?.available;

  useEffect(() => {
    incrementIndexOfArticleAlertsData?.();
  }, [incrementIndexOfArticleAlertsData]);

  const paymentsAlertsComponent = () => {
    if (!standalone) {
      return (
        isPaymentPageAvailable &&
        !isNonProfit &&
        (isFreeTariff || isGracePeriod) &&
        showText && (
          <ArticlePaymentAlert
            isFreeTariff={isFreeTariff}
            currentTariffPlanTitle={currentTariffPlanTitle}
            toggleArticleOpen={toggleArticleOpen}
          />
        )
      );
    }

    const isVisibleStandaloneAlert =
      isTrial || isLicenseExpiring || isLicenseDateExpired;

    return (
      isPaymentPageAvailable &&
      isEnterprise &&
      isVisibleStandaloneAlert &&
      showText && (
        <ArticleEnterpriseAlert
          toggleArticleOpen={toggleArticleOpen}
          isLicenseDateExpired={isLicenseDateExpired}
          trialDaysLeft={trialDaysLeft}
          isTrial={isTrial}
          paymentDate={paymentDate}
          isEnterprise={isEnterprise}
        />
      )
    );
  };

  return (
    <StyledArticleAlertsComponent>
      {paymentsAlertsComponent()}

      {isTeamTrainingAlertAvailable &&
        showText &&
        availableAlerts?.includes(ArticleAlerts.TeamTraining) &&
        currentAlert === ArticleAlerts.TeamTraining && (
          <ArticleTeamTrainingAlert
            bookTrainingEmail={bookTrainingEmail}
            removeAlertFromArticleAlertsData={removeAlertFromArticleAlertsData}
          />
        )}

      {isSubmitToGalleryAlertAvailable &&
        showText &&
        availableAlerts?.includes(ArticleAlerts.SubmitToFormGallery) &&
        currentAlert === ArticleAlerts.SubmitToFormGallery && (
          <ArticleSubmitToFormGalleryAlert
            setSubmitToGalleryDialogVisible={setSubmitToGalleryDialogVisible}
            removeAlertFromArticleAlertsData={removeAlertFromArticleAlertsData}
          />
        )}
    </StyledArticleAlertsComponent>
  );
};

export default ArticleAlertsComponent;
