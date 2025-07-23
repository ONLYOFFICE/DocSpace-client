// (c) Copyright Ascensio System SIA 2009-2025
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
import { useLocation, Outlet } from "react-router";
import { withTranslation } from "react-i18next";

import Article from "@docspace/shared/components/article";
import {
  updateTempContent,
  showLoader,
  hideLoader,
} from "@docspace/shared/utils/common";
import { regDesktop } from "@docspace/shared/utils/desktop";

import { toastr } from "@docspace/shared/components/toast";

import FilesPanels from "./components/FilesPanels";
import GlobalEvents from "./components/GlobalEvents";
import {
  ArticleBodyContent,
  ArticleHeaderContent,
  ArticleMainButtonContent,
} from "./components/Article";
import ArticleWrapper from "./components/ArticleWrapper";

const ClientArticle = React.memo(
  ({ withMainButton, showArticleLoader, isInfoPanelVisible }) => {
    return (
      <ArticleWrapper
        isInfoPanelVisible={isInfoPanelVisible}
        withMainButton={withMainButton}
        showArticleLoader={showArticleLoader}
      >
        <Article.Header>
          <ArticleHeaderContent />
        </Article.Header>

        <Article.MainButton>
          <ArticleMainButtonContent />
        </Article.MainButton>

        <Article.Body>
          <ArticleBodyContent />
        </Article.Body>
      </ArticleWrapper>
    );
  },
);

ClientArticle.displayName = "ClientArticle";

const ClientContent = (props) => {
  const {
    loadClientInfo,
    setIsLoaded,
    isAuthenticated,
    user,
    isEncryption,
    encryptionKeys,
    setEncryptionKeys,
    isLoaded,
    isDesktop,
    showMenu,
    isFrame,
    isInfoPanelVisible,
    withMainButton,
    t,

    isLoading,
    setIsFilterLoading,
    setIsHeaderLoading,
    isDesktopClientInit,
    setIsDesktopClientInit,
    showArticleLoader,
  } = props;

  const location = useLocation();

  const isEditor = location.pathname.indexOf("doceditor") !== -1;
  const isFormGallery = location.pathname.split("/").includes("form-gallery");

  React.useEffect(() => {
    loadClientInfo()
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsLoaded(true);
        updateTempContent();
      });
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && !isDesktopClientInit && isDesktop && isLoaded) {
      setIsDesktopClientInit(true);
      regDesktop(
        user,
        isEncryption,
        encryptionKeys,
        setEncryptionKeys,
        isEditor,
        null,
        t,
      );
      //   console.log(
      //     "%c%s",
      //     "color: green; font: 1.2em bold;",
      //     "Current keys is: ",
      //     encryptionKeys
      //   );
    }
  }, [
    t,
    isAuthenticated,
    user,
    isEncryption,
    encryptionKeys,
    setEncryptionKeys,
    isLoaded,
    isDesktop,
  ]);

  React.useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);

  return (
    <>
      <FilesPanels />
      <GlobalEvents />
      {!isFormGallery ? (
        isFrame ? (
          showMenu && (
            <ClientArticle
              isInfoPanelVisible={isInfoPanelVisible}
              withMainButton={withMainButton}
              setIsHeaderLoading={setIsHeaderLoading}
              setIsFilterLoading={setIsFilterLoading}
              showArticleLoader={showArticleLoader}
            />
          )
        ) : (
          <ClientArticle
            isInfoPanelVisible={isInfoPanelVisible}
            withMainButton={withMainButton}
            setIsHeaderLoading={setIsHeaderLoading}
            setIsFilterLoading={setIsFilterLoading}
            showArticleLoader={showArticleLoader}
          />
        )
      ) : null}
      <Outlet />
    </>
  );
};

export const Client = inject(
  ({
    authStore,
    clientLoadingStore,
    filesStore,
    pluginStore,
    userStore,
    settingsStore,
    infoPanelStore,
  }) => {
    const {
      frameConfig,
      isFrame,
      isDesktopClient,
      encryptionKeys,
      setEncryptionKeys,
      isEncryptionSupport,
      enablePlugins,
      isDesktopClientInit,
      setIsDesktopClientInit,
    } = settingsStore;

    if (!userStore.user) return;

    // const { isVisitor } = userStore.user;

    const {
      isLoading,
      setIsSectionFilterLoading,
      setIsSectionHeaderLoading,
      showArticleLoader,
    } = clientLoadingStore;

    const withMainButton = true; // !isVisitor; // Allways true for any type of users

    const { isInit: isInitPlugins, initPlugins } = pluginStore;

    const { isVisible } = infoPanelStore;
    const isProfile = window.location.pathname.includes("/profile");

    return {
      isDesktop: isDesktopClient,
      isDesktopClientInit,
      setIsDesktopClientInit,
      isFrame,
      showMenu: frameConfig?.showMenu,
      user: userStore.user,
      isAuthenticated: authStore.isAuthenticated,
      encryptionKeys,
      isEncryption: isEncryptionSupport,
      isLoaded: authStore.isLoaded && clientLoadingStore.isLoaded,
      setIsLoaded: clientLoadingStore.setIsLoaded,
      withMainButton,
      isInfoPanelVisible: isVisible && !isProfile,
      setIsFilterLoading: setIsSectionFilterLoading,
      setIsHeaderLoading: setIsSectionHeaderLoading,
      isLoading,
      setEncryptionKeys,
      showArticleLoader,
      loadClientInfo: async () => {
        const actions = [];
        actions.push(filesStore.initFiles());

        if (enablePlugins && !isInitPlugins) actions.push(initPlugins());
        await Promise.all(actions);
      },
    };
  },
)(withTranslation("Common")(observer(ClientContent)));
