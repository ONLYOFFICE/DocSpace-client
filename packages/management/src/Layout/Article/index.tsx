import React from "react";
import { inject, observer } from "mobx-react";

import { UserStore } from "@docspace/shared/store/UserStore";
import { BannerStore } from "@docspace/shared/store/BannerStore";

import Article from "@docspace/shared/components/article";

import ArticleHeaderContent from "./Header";
import ArticleBodyContent from "./Body";

const ArticleWrapper = ({
  email,
  displayName,
  languageBaseName,
  isBurgerLoading,
  whiteLabelLogoUrls,
  zendeskKey,
  isMobileArticle,
  showProgress,
  showText,
  setShowText,
  articleOpen,
  setIsMobileArticle,
  toggleShowText,
  toggleArticleOpen,

  currentColorScheme,
  setArticleOpen,
  withSendAgain,
  mainBarVisible,
  isBannerVisible,

  isLiveChatAvailable,

  currentDeviceType,

  isAdmin,
}) => {
  return (
    <Article
      showProgress={showProgress}
      chatDisplayName={displayName}
      zendeskEmail={email}
      languageBaseName={languageBaseName}
      isBurgerLoading={isBurgerLoading}
      whiteLabelLogoUrls={whiteLabelLogoUrls}
      zendeskKey={zendeskKey}
      isMobileArticle={isMobileArticle}
      showText={showText}
      setShowText={setShowText}
      articleOpen={articleOpen}
      setIsMobileArticle={setIsMobileArticle}
      toggleShowText={toggleShowText}
      toggleArticleOpen={toggleArticleOpen}
      currentColorScheme={currentColorScheme}
      setArticleOpen={setArticleOpen}
      withSendAgain={withSendAgain}
      mainBarVisible={mainBarVisible}
      isBannerVisible={isBannerVisible}
      isLiveChatAvailable={isLiveChatAvailable}
      currentDeviceType={currentDeviceType}
      isAdmin={isAdmin}
      hideProfileBlock
      hideAppsBlock
      withCustomArticleHeader
      hideAlerts
    >
      <Article.Header>
        <ArticleHeaderContent />
      </Article.Header>

      <Article.Body>
        <ArticleBodyContent />
      </Article.Body>
    </Article>
  );
};

export default inject(
  ({
    authStore,
    uploadDataStore,
    userStore,
    bannerStore,
    settingsStore,
  }: {
    authStore: any;
    uploadDataStore: any;
    userStore: UserStore;
    bannerStore: BannerStore;
    settingsStore: any;
  }) => {
    const { languageBaseName, isLiveChatAvailable } = authStore;

    const { withSendAgain, user } = userStore;

    const { isBannerVisible } = bannerStore;

    const isAdmin = user?.isAdmin;

    const { zendeskKey, isMobileArticle } = settingsStore;

    const email = user?.email;
    const displayName = user?.displayName;

    const { primaryProgressDataStore, secondaryProgressDataStore } =
      uploadDataStore;

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
      isBurgerLoading,
      whiteLabelLogoUrls,
      currentDeviceType,
    } = settingsStore;

    return {
      email,
      displayName,
      languageBaseName,
      isBurgerLoading,
      whiteLabelLogoUrls,
      zendeskKey,
      isMobileArticle,
      showProgress,
      showText,
      setShowText,
      articleOpen,
      setIsMobileArticle,
      toggleShowText,
      toggleArticleOpen,

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
)(observer(ArticleWrapper));
