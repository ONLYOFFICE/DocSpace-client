import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import ArticleTeamTrainingAlert from "./article-team-training";
import ArticleSubmitToFormGalleryAlert from "./article-submit-to-form-gallery";
import { StyledArticleAlertsComponent } from "../styled-article";
import { ARTICLE_ALERTS } from "@docspace/client/src/helpers/constants";

const ArticleAlerts = ({
  articleAlertsData,
  incrementIndexOfArticleAlertsData,

  showText,
  isTeamTrainingAlertAvailable,
  isSubmitToGalleryAlertAvailable,
}) => {
  const currentAlert = articleAlertsData.current;
  const availableAlerts = articleAlertsData.available;

  useEffect(() => {
    incrementIndexOfArticleAlertsData();
  }, []);

  return (
    <StyledArticleAlertsComponent>
      {isTeamTrainingAlertAvailable &&
        showText &&
        availableAlerts.includes(ARTICLE_ALERTS.TeamTraining) &&
        currentAlert === ARTICLE_ALERTS.TeamTraining && (
          <ArticleTeamTrainingAlert />
        )}

      {isSubmitToGalleryAlertAvailable &&
        showText &&
        availableAlerts.includes(ARTICLE_ALERTS.SubmitToFormGallery) &&
        currentAlert === ARTICLE_ALERTS.SubmitToFormGallery && (
          <ArticleSubmitToFormGalleryAlert />
        )}
    </StyledArticleAlertsComponent>
  );
};

export default inject(({ auth }) => {
  const {
    settingsStore,
    isTeamTrainingAlertAvailable,
    isSubmitToGalleryAlertAvailable,
  } = auth;
  const { showText, articleAlertsData, incrementIndexOfArticleAlertsData } =
    settingsStore;

  return {
    articleAlertsData,
    incrementIndexOfArticleAlertsData,
    showText,
    isTeamTrainingAlertAvailable,
    isSubmitToGalleryAlertAvailable,
  };
})(observer(ArticleAlerts));
