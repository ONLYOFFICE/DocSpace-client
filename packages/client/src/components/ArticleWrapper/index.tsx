import { inject, observer } from "mobx-react";

import Article from "@docspace/shared/components/article";
import { ArticleProps } from "@docspace/shared/components/article/Article.types";

const ArticleWrapper = (props: ArticleProps) => {
  return <Article {...props} />;
};

export default inject(
  ({
    auth,
    uploadDataStore,
    profileActionsStore,
    dialogsStore,
    userStore,
    bannerStore,
  }: any) => {
    const {
      settingsStore,

      isLiveChatAvailable,

      currentQuotaStore,

      isPaymentPageAvailable,
      isTeamTrainingAlertAvailable,
      isSubmitToGalleryAlertAvailable,
      currentTariffStatusStore,
      isEnterprise,
    } = auth;

    const { getActions, getUserRole, onProfileClick } = profileActionsStore;

    const { withSendAgain, user } = userStore;

    const { isBannerVisible } = bannerStore;

    const { primaryProgressDataStore, secondaryProgressDataStore } =
      uploadDataStore;

    const { email, displayName } = user;

    const isAdmin = user?.isAdmin;

    const { visible: primaryProgressDataVisible } = primaryProgressDataStore;
    const { visible: secondaryProgressDataStoreVisible } =
      secondaryProgressDataStore;

    const showProgress =
      primaryProgressDataVisible || secondaryProgressDataStoreVisible;

    const {
      showText,
      setShowText,
      articleOpen,
      setIsMobileArticle,
      toggleShowText,
      toggleArticleOpen,
      currentColorScheme,
      setArticleOpen,
      mainBarVisible,
      zendeskKey,
      isMobileArticle,

      currentDeviceType,
      standalone,
      articleAlertsData,
      incrementIndexOfArticleAlertsData,
      isBurgerLoading,
      whiteLabelLogoUrls,
      removeAlertFromArticleAlertsData,
      bookTrainingEmail,
    } = settingsStore;

    const { setSubmitToGalleryDialogVisible } = dialogsStore;

    const { isFreeTariff, isNonProfit, isTrial, currentTariffPlanTitle } =
      currentQuotaStore;
    const {
      isGracePeriod,
      isLicenseExpiring,
      isLicenseDateExpired,
      trialDaysLeft,
      paymentDate,
    } = currentTariffStatusStore;

    return {
      bookTrainingEmail,
      onProfileClick,
      user,
      getUserRole,
      getActions,

      currentTariffPlanTitle,
      email,
      displayName,

      zendeskKey,
      isMobileArticle,
      showProgress,

      isBurgerLoading,
      whiteLabelLogoUrls,
      isEnterprise,
      isTrial,
      isLicenseDateExpired,
      trialDaysLeft,
      paymentDate,

      toggleArticleOpen,

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

      standalone,

      setShowText,
      articleOpen,
      setIsMobileArticle,
      toggleShowText,

      removeAlertFromArticleAlertsData,
      setSubmitToGalleryDialogVisible,

      currentColorScheme,
      setArticleOpen,
      withSendAgain,
      mainBarVisible,
      isBannerVisible,

      isLiveChatAvailable,

      currentDeviceType,

      isAdmin,
    };
  }
)(observer(Article));
