// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
      isLiveChatAvailable={isLiveChatAvailable}
      currentDeviceType={currentDeviceType}
      isAdmin={isAdmin}
      hideProfileBlock
      hideAppsBlock
      withCustomArticleHeader
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
      currentDeviceType,
    } = settingsStore;

    return {
      email,
      displayName,
      languageBaseName,
      isBurgerLoading,
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

      isLiveChatAvailable,

      currentDeviceType,

      isAdmin,
    };
  }
)(observer(ArticleWrapper));
