import React, { useEffect } from "react";

import { ArticleAlerts } from "../../../enums";

import ArticleTeamTrainingAlert from "./TeamTrainingAlert";
import ArticleSubmitToFormGalleryAlert from "./SubmitToFormGalleryAlert";

import { ArticleAlertsProps } from "../Article.types";
import { StyledArticleAlertsComponent } from "../Article.styled";

const ArticleAlertsComponent = ({
  articleAlertsData,
  incrementIndexOfArticleAlertsData,
  showText,
  isTeamTrainingAlertAvailable,
  isSubmitToGalleryAlertAvailable,
  bookTrainingEmail,
  removeAlertFromArticleAlertsData,
  setSubmitToGalleryDialogVisible,
}: ArticleAlertsProps) => {
  const currentAlert = articleAlertsData?.current;
  const availableAlerts = articleAlertsData?.available;

  useEffect(() => {
    incrementIndexOfArticleAlertsData?.();
  }, [incrementIndexOfArticleAlertsData]);

  return (
    <StyledArticleAlertsComponent>
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
