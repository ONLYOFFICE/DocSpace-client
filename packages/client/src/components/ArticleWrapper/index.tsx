import { inject, observer } from "mobx-react";

import Article from "@docspace/shared/components/article";
import { ArticleProps } from "@docspace/shared/components/article/Article.types";

const ArticleWrapper = (props: ArticleProps) => {
  return <Article {...props} />;
};

export default inject(
  ({ auth, uploadDataStore, profileActionsStore, dialogsStore }: any) => {
    const {
      settingsStore,
      userStore,
      isLiveChatAvailable,
      bannerStore,
      currentQuotaStore,

      isPaymentPageAvailable,
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
      isBurgerLoading,
      whiteLabelLogoUrls,
    } = settingsStore;

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

      showText,
      isNonProfit,
      isGracePeriod,
      isFreeTariff,
      isPaymentPageAvailable,
      isLicenseExpiring,

      standalone,

      setShowText,
      articleOpen,
      setIsMobileArticle,
      toggleShowText,

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
