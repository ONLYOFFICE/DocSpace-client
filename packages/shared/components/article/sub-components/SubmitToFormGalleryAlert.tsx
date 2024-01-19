import React from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import { RectangleSkeleton } from "../../../skeletons";
import { ArticleAlerts } from "../../../enums";
import AlertComponent from "../../alert";

import { ArticleSubmitToFormGalleryAlertProps } from "../Article.types";

const ArticleSubmitToFormGalleryAlert = ({
  setSubmitToGalleryDialogVisible,
  removeAlertFromArticleAlertsData,
}: ArticleSubmitToFormGalleryAlertProps) => {
  const { t, ready } = useTranslation(["Common", "FormGallery"]);
  const theme = useTheme();

  const onSubmitToFormGallery = () => setSubmitToGalleryDialogVisible(true);
  const onClose = () =>
    removeAlertFromArticleAlertsData(ArticleAlerts.SubmitToFormGallery);

  return !ready ? (
    <RectangleSkeleton width="210px" height="112px" />
  ) : (
    <AlertComponent
      titleColor={theme.catalog.teamTrainingAlert.titleColor}
      linkColor={theme.catalog.teamTrainingAlert.linkColor}
      borderColor={theme.catalog.teamTrainingAlert.borderColor}
      title={t("FormGallery:SubmitToGalleryBlockHeader")}
      description={t("FormGallery:SubmitToGalleryBlockBody")}
      linkTitle={t("Common:SubmitToFormGallery")}
      onLinkClick={onSubmitToFormGallery}
      onCloseClick={onClose}
      needCloseIcon
    />
  );
};

export default ArticleSubmitToFormGalleryAlert;

// export default inject(({ auth, dialogsStore }) => {
//   const { theme, removeAlertFromArticleAlertsData } = auth.settingsStore;
//   const { setSubmitToGalleryDialogVisible } = dialogsStore;

//   return {
//     theme,
//     removeAlertFromArticleAlertsData,
//     setSubmitToGalleryDialogVisible,
//   };
// })(observer(ArticleSubmitToFormGalleryAlert));
