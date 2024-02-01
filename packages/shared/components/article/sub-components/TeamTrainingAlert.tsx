import React from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import { RectangleSkeleton } from "../../../skeletons";
import { ArticleAlerts } from "../../../enums";
import AlertComponent from "../../alert";

import { ArticleTeamTrainingAlertProps } from "../Article.types";

const ArticleTeamTrainingAlert = ({
  bookTrainingEmail,
  removeAlertFromArticleAlertsData,
}: ArticleTeamTrainingAlertProps) => {
  const { t, ready } = useTranslation("Common");
  const theme = useTheme();

  const isShowLoader = !ready;

  const onClose = () =>
    removeAlertFromArticleAlertsData?.(ArticleAlerts.TeamTraining);

  return isShowLoader ? (
    <RectangleSkeleton width="210px" height="88px" />
  ) : (
    <AlertComponent
      titleColor={theme.catalog.teamTrainingAlert.titleColor}
      linkColor={theme.catalog.teamTrainingAlert.linkColor}
      borderColor={theme.catalog.teamTrainingAlert.borderColor}
      title={t("Common:UseLikePro")}
      description={t("Common:BookTeamTraining")}
      link={`mailto:${bookTrainingEmail}`}
      linkTitle={t("Common:BookNow")}
      onCloseClick={onClose}
      needCloseIcon
    />
  );
};

export default ArticleTeamTrainingAlert;
